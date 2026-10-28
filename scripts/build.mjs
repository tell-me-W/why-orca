import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs');
const site = JSON.parse(await readFile(path.join(root, 'site.json'), 'utf8'));
const template = await readFile(path.join(root, 'templates/page.html'), 'utf8');
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, entity => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&nbsp;':' '}[entity])).replace(/\s+/g,' ').trim();
const search = [];
const slugs = new Set();
await mkdir(out, { recursive: true });

for (const [index, page] of site.pages.entries()) {
  if (!/^[a-z][a-z0-9-]*$/.test(page.slug) || slugs.has(page.slug)) throw new Error(`Invalid or duplicate slug: ${page.slug}`);
  slugs.add(page.slug);
  const content = await readFile(path.join(root, 'content', `${page.slug}.html`), 'utf8');
  const headings = [...content.matchAll(/<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(match => ({level:match[1], id:match[2], title:plain(match[3]), start:match.index, end:match.index+match[0].length}));
  const headingCount = (content.match(/<h[23]\b/g)||[]).length;
  if (headings.length !== headingCount) throw new Error(`Every h2/h3 needs a quoted id: ${page.slug}`);
  const ids = new Set();
  for(const heading of headings){if(ids.has(heading.id))throw new Error(`Duplicate heading id ${page.slug}#${heading.id}`);ids.add(heading.id);}
  const navigation = `<ol class="book-nav">${site.pages.map((item, i) => `<li><a href="${item.slug}.html"${item.slug===page.slug?' aria-current="page"':''}><span class="nav-number">${i===0?'':i}</span><span>${escape(item.nav)}</span></a></li>`).join('')}</ol>`;
  const toc = `<ul class="toc-list">${headings.map(heading => `<li class="toc-level-${heading.level}"><a href="#${escape(heading.id)}">${escape(heading.title)}</a></li>`).join('')}</ul>`;
  const prev = site.pages[index-1]; const next = site.pages[index+1];
  const pagination = `${prev?`<a class="page-prev" href="${prev.slug}.html"><span>이전 장</span><strong>← ${escape(prev.nav)}</strong></a>`:'<span></span>'}${next?`<a class="page-next" href="${next.slug}.html"><span>다음 장</span><strong>${escape(next.nav)} →</strong></a>`:'<a class="page-next" href="index.html"><span>처음으로</span><strong>강의 안내 →</strong></a>'}`;
  const values = { title:escape(page.title), description:escape(page.description), chapter:escape(page.chapter), duration:escape(page.duration), updated:escape(site.updated), content, navigation, toc, pagination };
  const html = template.replace(/\{\{(\w+)\}\}/g, (_,key) => {if(!(key in values))throw new Error(`Unknown template key ${key}`); return values[key];});
  await writeFile(path.join(out, `${page.slug}.html`), html);
  search.push({page:page.title,title:page.title,url:`${page.slug}.html`,text:plain(content.slice(0,headings[0]?.start)),intro:page.description});
  headings.forEach((heading, i) => search.push({page:page.title,title:heading.title,url:`${page.slug}.html#${heading.id}`,text:plain(content.slice(heading.end, headings[i+1]?.start)),intro:page.description}));
}
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
await writeFile(path.join(out,'assets/search-index.js'),`window.ORCA_SEARCH_INDEX = ${JSON.stringify(search).replace(/</g,'\\u003c')};\n`);
await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Built ${site.pages.length} pages and ${search.length} search sections in docs/.`);
