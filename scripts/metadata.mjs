import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function generateMetadata(root, output, jobs) {
  const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
  const base = new URL(config.baseUrl);
  if (base.protocol !== 'https:' || !base.pathname.endsWith('/') || base.search || base.hash) throw new Error('baseUrl must be an HTTPS URL ending in / without query or fragment');
  if (typeof config.indexable !== 'boolean') throw new Error('indexable must be a boolean');
  const url = relative => new URL(relative, base).href;
  const org = { '@type': 'Organization', '@id': url('#organization'), name: 'SOPliance', legalName: 'SOPliance, Inc.', url: base.href, email: 'info@sopliance.com', logo: url('assets/logo-header.png'), sameAs: ['https://www.linkedin.com/company/sopliance-inc'] };
  const website = { '@type': 'WebSite', '@id': url('#website'), url: base.href, name: 'SOPliance', inLanguage: 'en', publisher: { '@id': org['@id'] } };
  const services = [
    ['staffing', 'Staffing solutions', 'Staff augmentation, recruitment and placement, and project-based talent.'],
    ['printer-service', 'Printer repair and service', 'Printer troubleshooting, repairs, maintenance, and workplace printing support.'],
    ['fiber', 'Fiber optic and cabling', 'Fiber optic cabling, structured network cabling, and workplace connectivity.'],
    ['desktop-service', 'Desktop and workplace IT', 'Desktop troubleshooting, device setup and deployment, and on-site technical support.']
  ].map(([id, name, description]) => ({ '@type': 'Service', '@id': url(`#${id}`), name, description, provider: { '@id': org['@id'] }, url: url('index.html#services') }));
  const positions = { '@type': 'ItemList', '@id': url('joinus.html#positions'), name: 'Available positions', numberOfItems: jobs.length, itemListElement: jobs.map((job, index) => ({ '@type': 'ListItem', position: index + 1, name: job.title, url: url(job.url) })) };
  const pages = [
    { file: 'index.html', canonical: base.href, type: 'WebPage', name: 'SOPliance | People. Technology. One step beyond.', description: 'Staffing, printer repair, fiber optic cabling, and desktop support for organizations.' },
    { file: 'joinus.html', canonical: url('joinus.html'), type: 'CollectionPage', name: 'Careers | SOPliance', description: 'Available positions at SOPliance. Applications are linked to a specific listed position.' }
  ];
  const all = [org, website, ...services, positions];
  const markdown = [];
  const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
  const decode = text => text.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
  const clean = html => decode(html.replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  for (const page of pages) {
    const webpage = { '@type': page.type, '@id': `${page.canonical}#webpage`, url: page.canonical, name: page.name, description: page.description, inLanguage: 'en', isPartOf: { '@id': website['@id'] }, about: { '@id': org['@id'] }, ...(page.file === 'joinus.html' ? { mainEntity: { '@id': positions['@id'] } } : {}) };
    all.push(webpage);
    const graph = { '@context': 'https://schema.org', '@graph': [org, website, webpage, ...(page.file === 'index.html' ? services : [positions])] };
    let html = await readFile(path.join(output, page.file), 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main) throw new Error(`Missing main content in ${page.file}`);
    let text = main.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<[^>]+aria-hidden="true"[^>]*>[\s\S]*?<\/[^>]+>/g, '')
      .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => `\n\n${'#'.repeat(Number(level))} ${clean(content)}\n\n`)
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => `[${clean(content)}](${new URL(decode(href), page.canonical).href})`)
      .replace(/<br\s*\/?\s*>/gi, ' ')
      .replace(/<li\b[^>]*>/gi, '\n- ')
      .replace(/<\/(?:p|div|section|article|aside|ul)>/gi, '\n\n');
    text = clean(text);
    if (page.file === 'joinus.html') {
      text = text.replace('Checking opportunities…', `${jobs.length} available positions`).replace('Loading available positions…', jobs.length ? 'See the position descriptions below.' : 'No positions are currently published.');
      text += '\n\n## Published position descriptions\n\n' + (jobs.length ? jobs.map(job => `- [${job.title}](${url(job.url)}) (${job.format})`).join('\n') : 'No positions are currently published.');
    }
    const md = `Source: ${page.canonical}\n\n${text}\n`;
    await writeFile(path.join(output, `${page.file}.md`), md);
    markdown.push(md);
    const metadata = `<link rel="canonical" href="${page.canonical}">\n<link rel="describedby" href="${url('llms.txt')}" type="text/plain">\n<link rel="alternate" type="text/markdown" href="${url(`${page.file}.md`)}">\n<script type="application/ld+json">${JSON.stringify(graph).replaceAll('<', '\\u003c')}</script>\n`;
    html = html.replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${config.indexable ? 'index, follow' : 'noindex, nofollow'}">`).replace('</head>', `${metadata}</head>`);
    await writeFile(path.join(output, page.file), html);
  }
  await writeFile(path.join(output, 'structured-data.json'), JSON.stringify({ '@context': 'https://schema.org', '@graph': all }, null, 2) + '\n');
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page => `  <url><loc>${escapeXml(page.canonical)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(path.join(output, 'robots.txt'), `# Crawling rules take effect only when served at the host root /robots.txt.\n# Preview indexing is disabled by the HTML noindex meta tag.\nUser-agent: *\nAllow: /\n\nSitemap: ${url('sitemap.xml')}\n`);
  await writeFile(path.join(output, 'llms.txt'), `# SOPliance\n\n> SOPliance provides staffing and hands-on technical services for organizations.\n\nServices include staff augmentation, recruitment and placement, project-based talent, printer repair, fiber optic cabling, and desktop support. Contact: info@sopliance.com. This is the website preview; published pages and position descriptions are the source for current information.\n\n## Pages\n\n- [Home and services](${url('index.html.md')}): Company overview, staffing, and technical services.\n- [Careers](${url('joinus.html.md')}): Published positions and role-specific application information.\n\n## Reference files\n\n- [Expanded site content](${url('llms-full.txt')}): Combined text from both public pages and links to current position descriptions.\n- [Organization and service data](${url('structured-data.json')}): Schema.org JSON-LD.\n- [Positions](${url('jobs.json')}): Current job document titles and relative URLs.\n- [Sitemap](${url('sitemap.xml')}): Canonical HTML page URLs.\n`);
  await writeFile(path.join(output, 'llms-full.txt'), `# SOPliance — expanded site content\n\nContact: info@sopliance.com\n\n${markdown.join('\n---\n\n')}`);
}
