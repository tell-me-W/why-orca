import http from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs');
const args=process.argv.slice(2);
const value=(flag,fallback)=>{const i=args.indexOf(flag);if(i===-1)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(`Missing ${flag} value`);return args[i+1];};
const port=Number(value('--port','4173'));
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Port must be 1–65535');
const base='/'+value('--base','').split('/').filter(Boolean).join('/')+'/';
const prefix=base==='//'?'/':base;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(prefix!=='/' && pathname===prefix.slice(0,-1)){res.writeHead(302,{Location:prefix});res.end();return;}
    if(!pathname.startsWith(prefix)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found');return;}
    const relative=pathname.slice(prefix.length)||'index.html';
    const file=path.resolve(docs,relative);
    if(!file.startsWith(docs+path.sep)||(await stat(file)).isDirectory()){res.writeHead(404);res.end('Page not found');return;}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Orca notes: http://127.0.0.1:${port}${prefix}\nStop with Ctrl+C.`));
