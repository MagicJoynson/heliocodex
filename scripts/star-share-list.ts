// Prints the named stars, with what their link-preview card shows, as JSON. Used by scripts/build-star-share-images.py.
import { properStars } from '../src/lib/sky/starlist';
import { LY_PER_PC, round2, tint } from '../src/lib/sky/star';
const out = properStars().map((s) => ({
  slug: s.slug, name: s.name, constellation: s.constellation, ly: round2(s.distPc * LY_PER_PC), lum: s.lumSun,
  rgb: s.bv === null ? [236, 231, 220] : tint(s.bv),
}));
process.stdout.write(JSON.stringify(out));
