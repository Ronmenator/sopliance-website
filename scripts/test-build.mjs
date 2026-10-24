import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const fixture = await mkdtemp(path.join(tmpdir(), 'sopliance-jobs-test-'));
try {
  for (const dir of ['scripts', 'positions', 'assets']) await mkdir(path.join(fixture, dir));
  await copyFile('scripts/build.mjs', path.join(fixture, 'scripts/build.mjs'));
  for (const file of ['index.html', 'joinus.html', 'styles.css', 'site.js', '.nojekyll']) await copyFile(file, path.join(fixture, file));
  for (let i = 1; i <= 55; i++) await writeFile(path.join(fixture, 'positions', `Support Technician ${i}.txt`), `Test description ${i}`);
  const special = 'Fiber & Desktop_Engineer #1.md';
  await writeFile(path.join(fixture, 'positions', special), 'Test description');
  await writeFile(path.join(fixture, 'positions', 'README.md'), 'Instructions');
  await writeFile(path.join(fixture, 'positions', '_draft.md'), 'Draft');
  await writeFile(path.join(fixture, 'positions', 'ignore.exe'), 'Excluded');
  const build = () => execFileSync(process.execPath, [path.join(fixture, 'scripts/build.mjs')], { stdio: 'pipe' });
  build();
  let jobs = JSON.parse(await readFile(path.join(fixture, 'dist/jobs.json'), 'utf8'));
  assert.equal(jobs.length, 56);
  assert.equal(jobs[0].title, 'Fiber & Desktop Engineer #1');
  assert.equal(jobs[0].url, `positions/${encodeURIComponent(special)}`);
  assert.equal(await readFile(path.join(fixture, 'dist/positions', special), 'utf8'), 'Test description');
  assert(jobs.findIndex(j => j.title === 'Support Technician 2') < jobs.findIndex(j => j.title === 'Support Technician 10'));
  await rm(path.join(fixture, 'positions', special));
  build();
  jobs = JSON.parse(await readFile(path.join(fixture, 'dist/jobs.json'), 'utf8'));
  assert.equal(jobs.length, 55);
  await assert.rejects(access(path.join(fixture, 'dist/positions', special)));
  for (let i = 1; i <= 55; i++) await rm(path.join(fixture, 'positions', `Support Technician ${i}.txt`));
  build();
  assert.deepEqual(JSON.parse(await readFile(path.join(fixture, 'dist/jobs.json'), 'utf8')), []);
  console.log('Passed: 56 jobs, title formatting, encoded links, document copy, sorting, exclusions, removal, and empty list.');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
