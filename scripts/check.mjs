import { readFile, readdir, stat, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const docs=path.join(root,'docs');
const site=JSON.parse(await readFile(path.join(root,'site.json'),'utf8'));
const errors=[];const pages=new Map();let links=0;
for(const page of site.pages){
  const name=`${page.slug}.html`;const html=await readFile(path.join(docs,name),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push(`${name}: duplicate id`);
  if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`${name}: expected one h1`);
  if(!html.includes('lang="ko"'))errors.push(`${name}: missing Korean language`);
  if(/\{\{\w+\}\}/.test(html))errors.push(`${name}: unresolved template field`);
  if(!html.includes('aria-current="page"'))errors.push(`${name}: missing current navigation`);
  for(const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)){
    for(const tag of ['th','td']){
      const opens=(row[1].match(new RegExp(`<${tag}\\b[^>]*>`,'g'))||[]).length;
      const closes=(row[1].match(new RegExp(`</${tag}>`,'g'))||[]).length;
      if(opens!==closes)errors.push(`${name}: unbalanced ${tag} cells in table row`);
    }
  }
  pages.set(name,{html,ids:new Set(ids)});
}
for(const [name,page] of pages){
  for(const match of page.html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const target=match[1];if(/^(?:https?:|mailto:|data:)/.test(target))continue;
    links++;
    if(target.startsWith('/')){errors.push(`${name}: root-relative URL ${target}`);continue;}
    const [location,hash]=target.split('#');const file=(location||name).split('?')[0];
    const resolved=path.resolve(docs,file);
    if(!resolved.startsWith(docs+path.sep)){errors.push(`${name}: path outside docs ${target}`);continue;}
    try{const info=await stat(resolved);if(!info.isFile())errors.push(`${name}: not a file ${target}`);}catch{errors.push(`${name}: missing ${target}`);continue;}
    if(hash && pages.has(file) && !pages.get(file).ids.has(decodeURIComponent(hash)))errors.push(`${name}: missing anchor ${target}`);
  }
}
await access(path.join(docs,'.nojekyll')).catch(()=>errors.push('Missing docs/.nojekyll'));
await access(path.join(root,'.github/workflows')).then(()=>errors.push('Custom Actions workflows must not be added'),()=>{});
const outputs=(await readdir(docs)).filter(name=>name.endsWith('.html'));
for(const output of outputs){if(!pages.has(output))errors.push(`Unlisted generated page: ${output}`);}
const index=await readFile(path.join(docs,'assets/search-index.js'),'utf8');
const entries=JSON.parse(index.replace(/^window\.ORCA_SEARCH_INDEX = /,'').replace(/;\s*$/,''));
for(const entry of entries){const[file,id]=entry.url.split('#');if(!pages.has(file)||(id&&!pages.get(file).ids.has(id)))errors.push(`Broken search result: ${entry.url}`);}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else{console.log(`PASS: ${pages.size} pages, ${links} relative links, ${entries.length} search entries, unique anchors and branch-publish files.`);}
