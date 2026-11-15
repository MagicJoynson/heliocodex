// Fetches every outside link in the site's content and data once and lists the ones that do not answer.
// Run by hand: npm run check:links. It is slow and talks to other people's servers, so it is not part of the build.
// Needs network access. A result of 403, 405, 429 or 503 usually means a site that refuses scripts (doi.org, ADS, the NASA NSSDC servers),
// and a timeout usually means a slow site: check those by hand. A 404 is the one to act on.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src/content', 'src/data', 'src/pages'];
const SKIP = [/\$\{/, /^https?:\/\/(localhost|127\.)/, /heliocodex\.com/, /fallinghippo\.com/, /w3\.org\/(2000|1999)/, /schema\.org/];
const found = new Map();
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(md|mdx|yaml|yml|json|ts|astro)$/.test(name)) continue;
    for (const m of readFileSync(p, 'utf8').matchAll(/https?:\/\/[^\s"'<>\]\\`]+/g)) {
      let url = m[0].replace(/[.,;:*]+$/, '');
      // a closing bracket belongs to the address only when it closes one the address opened
      while (url.endsWith(')') && (url.match(/\(/g) ?? []).length < (url.match(/\)/g) ?? []).length) url = url.slice(0, -1).replace(/[.,;:*]+$/, '');
      if (SKIP.some((r) => r.test(url))) continue;
      if (!found.has(url)) found.set(url, p);
    }
  }
};
ROOTS.forEach(walk);

const perHost = new Map();
const wait = async (host) => { while ((perHost.get(host) ?? 0) >= 2) await new Promise((r) => setTimeout(r, 200)); perHost.set(host, (perHost.get(host) ?? 0) + 1); };
const check = async (url) => {
  const host = new URL(url).host;
  await wait(host);
  try {
    for (const method of ['HEAD', 'GET']) {
      const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; link-check)' } });
      if (res.ok) return null;
      if (method === 'GET' || ![403, 404, 405, 501].includes(res.status)) return `${res.status}`;
    }
  } catch (e) { return String(e.cause?.code ?? e.message).slice(0, 60); }
  finally { perHost.set(host, perHost.get(host) - 1); }
  return null;
};

const urls = [...found.keys()];
const bad = [];
let next = 0, done = 0;
await Promise.all(Array.from({ length: 12 }, async () => {
  while (next < urls.length) {
    const url = urls[next++], why = await check(url);
    if (why) bad.push({ url, why, file: found.get(url) });
    if (++done % 100 === 0) console.error(`${done} of ${urls.length} checked`);
  }
}));
bad.sort((a, b) => a.why.localeCompare(b.why));
for (const b of bad) console.log(`${b.why}\t${b.url}\t${b.file}`);
console.log(`\n${urls.length} links checked, ${bad.length} did not answer.`);
