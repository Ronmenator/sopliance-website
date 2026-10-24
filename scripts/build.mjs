import { readdir, mkdir, copyFile, cp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateMetadata } from './metadata.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'positions'), { recursive: true });
for (const file of ['index.html', 'joinus.html', 'terms.html', 'privacy.html', 'cookies.html', 'styles.css', 'site.js', '.nojekyll']) {
  await copyFile(path.join(root, file), path.join(output, file));
}
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
const extensions = new Set(['.pdf', '.docx', '.doc', '.txt', '.md']);
const entries = await readdir(path.join(root, 'positions'), { withFileTypes: true });
const jobs = [];
for (const entry of entries) {
  const extension = path.extname(entry.name).toLowerCase();
  if (!entry.isFile() || !extensions.has(extension) || /^[._]/.test(entry.name) || /^readme\./i.test(entry.name)) continue;
  jobs.push({ title: path.basename(entry.name, path.extname(entry.name)).replaceAll('_', ' '), url: `positions/${encodeURIComponent(entry.name)}`, format: extension.slice(1).toUpperCase() });
  await copyFile(path.join(root, 'positions', entry.name), path.join(output, 'positions', entry.name));
}
jobs.sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true }));
await writeFile(path.join(output, 'jobs.json'), `${JSON.stringify(jobs, null, 2)}\n`);
await generateMetadata(root, output, jobs);
console.log(`Built site with ${jobs.length} available positions.`);
