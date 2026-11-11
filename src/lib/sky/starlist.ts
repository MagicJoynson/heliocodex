// Read at build time only: the stars that have a page of their own, with where each one is.
import { readFileSync } from 'node:fs';
import { type Star, slugOf, MODERN } from './star';

export interface PageStar extends Star { slug: string; name: string; dir: [number, number, number]; constellation: string }

let cache: PageStar[] | null = null;
export function pageStars(): PageStar[] {
  if (cache) return cache;
  const meta = JSON.parse(readFileSync('public/data/deep/stars-meta.json', 'utf8')) as { fields: string[]; stars: unknown[][] };
  const figures = JSON.parse(readFileSync('public/data/deep/constellations.json', 'utf8')) as { id: string; name: string }[];
  const bin = readFileSync('public/data/deep/stars.bin'), names = new Map(figures.map((f) => [f.id, f.name]));
  const seen = new Set<string>(), out: PageStar[] = [];
  for (const row of meta.stars) {
    const s = Object.fromEntries(meta.fields.map((f, i) => [f, row[i]])) as unknown as Star;
    if (!s.proper) continue;
    const slug = slugOf(s.proper);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const modern = MODERN[slug];
    if (modern) {
      // the same light seen from farther off means a brighter star
      const grow = (modern.pc / s.distPc) ** 2;
      s.lumSun *= grow; s.absMag -= 2.5 * Math.log10(grow); s.distPc = modern.pc;
    }
    // the star file's frame has y to the ecliptic pole; the sky sums want z there
    const x = bin.readFloatLE(s.index * 20), y = bin.readFloatLE(s.index * 20 + 4), z = bin.readFloatLE(s.index * 20 + 8), r = Math.hypot(x, y, z);
    out.push({ ...s, slug, name: s.proper, dir: [x / r, -z / r, y / r], constellation: names.get(s.con) ?? '' });
  }
  return (cache = out);
}

let whole: Buffer | null = null;
/** How far north (plus) or south (minus) of the sky's equator a star sits, in degrees. */
export function declination(index: number): number {
  whole ??= readFileSync('public/data/deep/stars.bin');
  const x = whole.readFloatLE(index * 20), y = whole.readFloatLE(index * 20 + 4), z = whole.readFloatLE(index * 20 + 8), tilt = (23.4392911 * Math.PI) / 180;
  // ecliptic (x, -z, y) turned about x by the tilt of the Earth's axis
  return (Math.asin((-z * Math.sin(tilt) + y * Math.cos(tilt)) / Math.hypot(x, y, z)) * 180) / Math.PI;
}
