// Handler integration checks with isolated SQLite and in-memory R2; no network or production writes.
import fs from 'node:fs';
import ts from 'typescript';
import { DatabaseSync } from 'node:sqlite';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('drizzle/0000_dear_ink.sql','utf8').replaceAll('--> statement-breakpoint',''));
class Statement { constructor(sql){this.sql=sql;this.args=[]} bind(...args){this.args=args;return this} async first(){return sqlite.prepare(this.sql).get(...this.args)||null} async all(){return {results:sqlite.prepare(this.sql).all(...this.args)}} async run(){const r=sqlite.prepare(this.sql).run(...this.args);return {meta:{changes:Number(r.changes)}}} }
const objects=new Map();globalThis.__amraTestEnv={ADMIN_EMAILS:'admin@example.com',DB:{prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}},BUCKET:{async put(key,stream){objects.set(key,await new Response(stream).arrayBuffer())},async get(key){return objects.has(key)?{body:objects.get(key)}:null},async delete(keys){for(const key of Array.isArray(keys)?keys:[keys])objects.delete(key)}}};
function moduleURL(source){return 'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64')}
const shared=moduleURL(fs.readFileSync('lib/submissions.ts','utf8').replace("import { env } from 'cloudflare:workers';","const env=globalThis.__amraTestEnv;"));
async function route(path){let source=fs.readFileSync(path,'utf8').replace(/from '\.+[^']*lib\/submissions'/g,"from '"+shared+"'");return import(moduleURL(source))}
const submissionRoute=await route('app/api/submissions/route.ts'),adminRoute=await route('app/api/admin/submissions/route.ts'),photoRoute=await route('app/api/admin/photos/[id]/route.ts');
async function fetch(url,options={}){const request=new Request(url,options),path=new URL(url).pathname;if(path==='/api/submissions')return submissionRoute.POST(request);if(path==='/api/admin/submissions')return options.method==='PATCH'?adminRoute.PATCH(request):adminRoute.GET(request);if(path.startsWith('/api/admin/photos/'))return photoRoute.GET(request,{params:Promise.resolve({id:path.split('/').at(-1)})});throw new Error('Unknown test endpoint')}

const base='http://127.0.0.1:4173',headers={Origin:base},admin={...headers,'oai-authenticated-user-id':'local-test-owner','oai-authenticated-user-email':'admin@example.com'},checks=[];
async function expect(r,status,label){if(r.status!==status)throw new Error(label+': '+r.status+' '+await r.text());checks.push(label);return r}
const get=(path,headers)=>fetch(base+path,{headers});
await expect(await get('/api/admin/submissions'),401,'Anonymous cannot read submissions');
await expect(await get('/api/admin/submissions',{...admin,'oai-authenticated-user-email':'outsider@example.com'}),403,'Other signed-in users cannot read submissions');
const photo=fs.readFileSync('public/assets/category-art-full.webp');
function form(bytes=photo){const d=new FormData();for(const [key,value] of Object.entries({title:'QA — Bronze sculpture',category:'art',brand:'QA studio',condition:'excellent',description:'Local integration test. Bronze sculpture in excellent condition.',provenance:'Synthetic test fixture',preference:'either',asking_price:'2500',currency:'AED',seller_name:'QA Test',email:'qa@example.com',phone:'+971500000000',location:'Dubai, UAE',language:'en',consent:'on',website:''}))d.set(key,value);d.append('photos',new Blob([bytes],{type:'image/webp'}),'piece.webp');return d}
await expect(await fetch(base+'/api/submissions',{method:'POST',headers:{Origin:'https://other.example'},body:form()}),403,'Cross-origin submission rejected');
await expect(await fetch(base+'/api/submissions',{method:'POST',headers,body:form(new TextEncoder().encode('<svg>not an image</svg>'))}),400,'Spoofed image rejected');
const saved=await(await expect(await fetch(base+'/api/submissions',{method:'POST',headers,body:form()}),201,'Submission and photograph saved')).json();
const list=await(await expect(await get('/api/admin/submissions',admin),200,'Owner can list submissions')).json();const item=list.items.find(p=>p.reference===saved.reference);if(!item)throw new Error('Missing saved submission');
const detail=await(await expect(await get('/api/admin/submissions?id='+item.id,admin),200,'Owner can read full submission')).json();const photoId=detail.photos[0].id;
await expect(await get('/api/admin/photos/'+photoId),401,'Photographs are private');
const image=await expect(await get('/api/admin/photos/'+photoId,admin),200,'Owner can view photograph');if(!Buffer.from(await image.arrayBuffer()).equals(photo))throw new Error('Photo bytes differ');
const patch={id:item.id,revision:detail.item.revision,status:'reviewing',notes:'QA note — agreed to review'};
const update=()=>fetch(base+'/api/admin/submissions',{method:'PATCH',headers:{...admin,'Content-Type':'application/json'},body:JSON.stringify(patch)});
await expect(await update(),200,'Status and team notes saved');await expect(await update(),409,'Stale edits cannot overwrite changes');
const reread=await(await get('/api/admin/submissions?id='+item.id,admin)).json();if(reread.item.notes!==patch.notes)throw new Error('Notes not persisted');
const sourceForm=form();sourceForm.delete('photos');sourceForm.set('preference','sourcing');sourceForm.set('condition','unspecified');sourceForm.set('title','Specific watch reference');
const sourceSaved=await(await expect(await fetch(base+'/api/submissions',{method:'POST',headers,body:sourceForm}),201,'Sourcing request saved without photos')).json();
const sourceList=await(await expect(await get('/api/admin/submissions?kind=sourcing',admin),200,'Owner can filter sourcing requests')).json();
if(sourceList.items.length!==1||sourceList.items[0].reference!==sourceSaved.reference)throw new Error('Sourcing filter mixed request types');
const sales=await(await get('/api/admin/submissions?kind=sale',admin)).json();if(sales.items.length!==1||sales.items[0].id!==item.id)throw new Error('Sale filter mixed request types');checks.push('Sale and sourcing requests remain separate');
const invalidSeller=form();invalidSeller.set('condition','unspecified');await expect(await fetch(base+'/api/submissions',{method:'POST',headers,body:invalidSeller}),400,'Seller condition remains required');
const noPhotoSeller=form();noPhotoSeller.delete('photos');await expect(await fetch(base+'/api/submissions',{method:'POST',headers,body:noPhotoSeller}),400,'Seller photographs remain required');
console.log(checks.map(c=>'PASS '+c).join('\n'));console.log('LOCAL_FIXTURE_ID='+item.id);
