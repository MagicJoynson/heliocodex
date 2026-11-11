/** Plain facts about one star, worked out from the few numbers the catalogue holds. */
export const LY_PER_PC = 3.26156;

export interface Star {
  index: number; proper: string; catalogue: string; hip: number | null; hd: number | null; con: string;
  spect: string | null; distPc: number; appMag: number; absMag: number; bv: number; lumSun: number;
}

export const slugOf = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Surface temperature from colour, in kelvin: the formula of Ballesteros (2012, EPL 97, 34008),
 * which treats the star as a perfect glowing body. Good to a few hundred degrees for ordinary
 * stars, worse for the very hottest and coolest.
 */
export const temperature = (bv: number) => 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));

/** The colour a star of this colour index looks, as red, green, blue. */
export function tint(bv: number): [number, number, number] {
  const t = Math.max(-0.3, Math.min(1.8, bv));
  if (t < 0.3) { const k = (t + 0.3) / 0.6; return [Math.round(185 + 55 * k), Math.round(205 + 35 * k), 255]; }
  if (t < 0.8) { const k = (t - 0.3) / 0.5; return [255, Math.round(244 - 14 * k), Math.round(236 - 46 * k)]; }
  const k = t - 0.8; return [255, Math.round(230 - 50 * k), Math.round(190 - 80 * k)];
}

const CLASSES: Record<string, string> = {
  O: 'a blue star, among the hottest there are', B: 'a blue-white star, far hotter than the Sun', A: 'a white star, hotter than the Sun',
  F: 'a yellow-white star, a little hotter than the Sun', G: 'a yellow star, much like the Sun in temperature', K: 'an orange star, cooler than the Sun', M: 'a red star, among the coolest',
};
/** What the letters of a spectral type say, in words. Empty when the type is missing or unusual. */
export function kind(given: string | null): { colour: string; stage: string } {
  const spect = (given ?? '').trim().replace(/^sd/, '');
  if (/^D/.test(spect.trim())) return { colour: 'a white dwarf', stage: 'It is the dead core of a star that was once like the Sun: about the size of the Earth, no longer making energy, and slowly cooling.' };
  const colour = CLASSES[spect.trim()[0]?.toUpperCase() ?? ''] ?? '';
  const m = /(Ia|Ib|III|II|IV|V)(?![IV])/.exec(spect.replace(/^[OBAFGKM][0-9.]*/, '')) ?? /(Ia|Ib|III|II|IV|V)/.exec(spect);
  const stage = !m ? '' : m[1] === 'Ia' || m[1] === 'Ib' ? 'It is a supergiant: a very heavy star, swollen to an enormous size and near the end of its life.'
    : m[1] === 'II' ? 'It is a bright giant: a star that has left the steady part of its life and swollen up.'
    : m[1] === 'III' ? 'It is a giant: a star that has used up the hydrogen in its core and swollen up.'
    : m[1] === 'IV' ? 'It is a subgiant: a star just beginning to leave the long, steady part of its life.'
    : 'It is in the long, steady part of its life, making helium from hydrogen in its core, as the Sun is.';
  return { colour, stage };
}

export const nf = (n: number, digits = 0) => n.toLocaleString('en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });
/** A figure rounded to two significant digits, so it does not claim more than is known. */
export function round2(n: number): string {
  if (n === 0) return '0';
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(n))) - 1), r = Math.round(n / p) * p;
  return nf(r, r < 10 ? (r < 1 ? 2 : 1) : 0);
}

/** How far to trust a distance measured by Hipparcos, which grows worse with distance. */
export function distanceNote(pc: number): string {
  if (pc < 60) return '';
  if (pc < 150) return 'At this distance the figure could be out by a tenth or so.';
  return 'Distances this great are hard to measure, and this one could be out by a fifth or more.';
}

/** A spectral type as the catalogue gives it, without the trailing dots, plus signs and colons that only mark its doubts. */
export const tidySpect = (spect: string | null) => (spect ?? '').replace(/[.+:\s]+$/, '').replace(/\s+/g, ' ');

const ORDINALS = ['', '', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
/** "the brightest", "the second brightest", "the 14th brightest". */
export const placing = (rank: number) => (rank === 1 ? 'the brightest' : rank <= 10 ? `the ${ORDINALS[rank]} brightest` : `the ${rank}th brightest`);

/**
 * Stars for which a newer, sourced distance replaces the catalogue's. The star list applies it, and scales
 * the star's brightness to match, so every page tells the same story.
 * Betelgeuse: Joyce et al. 2020, ApJ 902, 63: 168 pc, +27 and -15.
 */
export const MODERN: Record<string, { pc: number; by: string; url: string; note: string }> = {
  betelgeuse: {
    pc: 168, by: 'Joyce and others (2020)', url: 'https://arxiv.org/abs/2006.09837',
    note: 'Betelgeuse is hard to place, because the star is so swollen that its disc is wider than the tiny shift in the sky used to measure distance. This figure comes from a 2020 study of the way the star pulses, and could be anywhere from about 500 to 640 light years. The Hipparcos satellite put it at about 500.',
  },
};

/** Famous far stars whose distance is argued over, with no figure yet good enough to replace the catalogue's. Deneb: Schiller and Przybilla 2008, A&A 479, 849 (802 pc, give or take 66). */
export const DISTANCE_NOTES: Record<string, string> = {
  deneb: 'Deneb is one of the hardest bright stars to place. The satellite figure above is about 1,400 light years, but a 2008 study of its light put it at about 2,600. Nobody yet knows which is nearer the truth.',
};
