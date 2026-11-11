// Read at build time only: every star in the star file's list, with its name, its page and where it is.
import { readFileSync } from 'node:fs';
import { type Star, type PageStar, slugOf, nameOf, MODERN } from './star';

export type { PageStar };

let cache: PageStar[] | null = null;
/** Every star the site knows by more than a dot: all those the eye can see, and the fainter ones that have names. */
export function allStars(): PageStar[] {
  if (cache) return cache;
  const meta = JSON.parse(readFileSync('public/data/deep/stars-meta.json', 'utf8')) as { fields: string[]; stars: unknown[][] };
  const figures = JSON.parse(readFileSync('public/data/deep/constellations.json', 'utf8')) as { id: string; name: string }[];
  const bin = readFileSync('public/data/deep/stars.bin'), names = new Map(figures.map((f) => [f.id, f.name]));
  const seen = new Set<string>(['catalogue', 'in']), out: PageStar[] = [];
  for (const row of meta.stars) {
    const s = Object.fromEntries(meta.fields.map((f, i) => [f, row[i]])) as unknown as Star;
    const constellation = names.get(s.con) ?? '';
    let { name, numbered } = nameOf(s, constellation), slug = '';
    if (!numbered) {
      slug = slugOf(name);
      if (seen.has(slug)) {
        // two stars of a close pair can share a name by constellation: the fainter is told apart by its number, or as the companion
        const tag = s.hip ? `HIP ${s.hip}` : s.hd ? `HD ${s.hd}` : 'the fainter of a pair';
        name = `${name} (${tag})`; slug = slugOf(name);
        if (seen.has(slug)) slug = '';
      }
      if (slug) seen.add(slug);
    }
    const modern = s.proper ? MODERN[slug] : undefined;
    if (modern) {
      // the same light seen from farther off means a brighter star
      const grow = (modern.pc / s.distPc) ** 2;
      s.lumSun *= grow; s.absMag -= 2.5 * Math.log10(grow); s.distPc = modern.pc;
    }
    // the star file's frame has y to the ecliptic pole; the sky sums want z there
    const x = bin.readFloatLE(s.index * 20), y = bin.readFloatLE(s.index * 20 + 4), z = bin.readFloatLE(s.index * 20 + 8), r = Math.hypot(x, y, z);
    out.push({ ...s, slug, name, dir: [x / r, -z / r, y / r], constellation });
  }
  return (cache = out);
}
/** The stars with a page of their own: those with a name, or a name by constellation. */
export const pageStars = (): PageStar[] => allStars().filter((s) => s.slug);
/** The stars people have given a name of their own. */
export const properStars = (): PageStar[] => allStars().filter((s) => s.slug && s.proper);

let whole: Buffer | null = null;
/** How far north (plus) or south (minus) of the sky's equator a star sits, in degrees. */
export function declination(index: number): number {
  whole ??= readFileSync('public/data/deep/stars.bin');
  const x = whole.readFloatLE(index * 20), y = whole.readFloatLE(index * 20 + 4), z = whole.readFloatLE(index * 20 + 8), tilt = (23.4392911 * Math.PI) / 180;
  // ecliptic (x, -z, y) turned about x by the tilt of the Earth's axis
  return (Math.asin((-z * Math.sin(tilt) + y * Math.cos(tilt)) / Math.hypot(x, y, z)) * 180) / Math.PI;
}
