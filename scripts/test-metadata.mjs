import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('site.config.json', root), 'utf8'));
const base = new URL(config.baseUrl);
const read = file => readFile(new URL(`dist/${file}`, root), 'utf8');
for (const file of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt', 'structured-data.json', 'jobs.json', 'index.html.md', 'joinus.html.md']) assert((await read(file)).trim(), `Missing or empty ${file}`);
const graph = JSON.parse(await read('structured-data.json'));
assert.equal(graph['@context'], 'https://schema.org');
const ids = new Set(graph['@graph'].map(item => item['@id']));
assert.equal(ids.size, graph['@graph'].length, 'Duplicate JSON-LD IDs');
for (const node of graph['@graph']) {
  assert(node['@type'] && node['@id']);
  assert.notEqual(node['@type'], 'JobPosting', 'Do not invent job details from filenames');
  for (const property of ['publisher', 'provider', 'isPartOf', 'about', 'mainEntity']) {
    if (node[property]) assert(ids.has(node[property]['@id']), `Unresolved ${property} reference`);
  }
}
const jobs = JSON.parse(await read('jobs.json'));
assert.equal(graph['@graph'].find(item => item['@type'] === 'ItemList').numberOfItems, jobs.length);
const sitemap = await read('sitemap.xml');
assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), [base.href, new URL('joinus.html', base).href]);
for (const page of ['index.html', 'joinus.html']) {
  const html = await read(page);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
  assert(html.includes(`content="${config.indexable ? 'index, follow' : 'noindex, nofollow'}"`));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  assert(JSON.parse(blocks[0][1])['@graph'].some(item => ['WebPage', 'CollectionPage'].includes(item['@type'])));
  assert(html.includes(`href="${new URL(`${page}.md`, base).href}"`));
}
for (const file of ['llms.txt', 'llms-full.txt']) {
  const text = await read(file);
  assert(text.startsWith('# SOPliance'));
  assert(!text.includes('Loading available positions'), 'Stale loading text in LLM content');
  for (const match of text.matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
    if (!match[1].startsWith(base.href)) continue;
    const relative = decodeURIComponent(new URL(match[1]).pathname.slice(base.pathname.length));
    await access(new URL(`dist/${relative || 'index.html'}`, root));
  }
}
assert((await read('robots.txt')).includes(`Sitemap: ${new URL('sitemap.xml', base).href}`));
console.log('Passed: discovery files, sitemap URLs, JSON-LD graphs, canonical links, LLM references, careers count, and preview indexing.');
