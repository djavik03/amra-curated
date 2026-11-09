import { env } from 'cloudflare:workers';
export const statuses=['new','reviewing','contacted','buyout','consignment','completed','declined'] as const;
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function adminAllowed(request:Request){const id=request.headers.get('oai-authenticated-user-id');const email=request.headers.get('oai-authenticated-user-email')?.toLowerCase();const allowed=String(env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);return !!id&&!!email&&allowed.includes(email)}
export function adminError(request:Request){return json({error:'Access denied'},request.headers.get('oai-authenticated-user-id')?403:401)}
export function sameOrigin(request:Request){return request.headers.get('Origin')===new URL(request.url).origin}
export function database(){if(!env.DB)throw new Error('Database unavailable');return env.DB}
export function bucket(){if(!env.BUCKET)throw new Error('File storage unavailable');return env.BUCKET}
export async function boundedBody(request:Request,max:number){if(Number(request.headers.get('content-length'))>max)throw new Error('BODY_TOO_LARGE');const reader=request.body?.getReader();if(!reader)throw new Error('EMPTY_BODY');let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new Error('BODY_TOO_LARGE')}chunks.push(value)}const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}return body}
export function escapeHTML(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
