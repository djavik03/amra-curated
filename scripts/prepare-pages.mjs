import fs from 'node:fs';
for(const name of ['index','admin','cms']){const html=fs.readFileSync(new URL('../site/'+name+'.html',import.meta.url),'utf8');fs.writeFileSync(new URL('../lib/'+name+'-html.ts',import.meta.url),'export default '+JSON.stringify(html)+';\n')}
