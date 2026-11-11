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

/**
 * Surface temperature by spectral type, in kelvin, for the hotter classes: the mean values for stars in
 * the steady part of their lives from Pecaut and Mamajek (2013, ApJS 208, 9), in the table Eric Mamajek
 * keeps up to date. Giants and supergiants of these classes are within about a tenth of the same figures.
 */
const TYPE_KELVIN: Record<string, [number, number][]> = {
  O: [[3, 44900], [4, 42900], [5, 41400], [5.5, 40500], [6, 39500], [6.5, 38300], [7, 37100], [7.5, 36100], [8, 35100], [8.5, 34300], [9, 33300], [9.5, 31900]],
  B: [[0, 31400], [0.5, 29000], [1, 26000], [1.5, 24500], [2, 20600], [2.5, 18500], [3, 17000], [4, 16400], [5, 15700], [6, 14500], [7, 14000], [8, 12300], [9, 10700], [9.5, 10400]],
  A: [[0, 9700], [1, 9300], [2, 8800], [3, 8600], [4, 8250], [5, 8100], [6, 7910], [7, 7760], [8, 7590], [9, 7400]],
  F: [[0, 7220], [1, 7020], [2, 6820], [3, 6750], [4, 6670], [5, 6550], [6, 6350], [7, 6280], [8, 6180], [9, 6050]],
};
/** The temperature a spectral type of class O, B, A or F stands for, or null when it cannot be read. */
export function typeTemperature(spect: string | null): number | null {
  const m = /^([OBAF])(\d(?:\.\d)?)/.exec((spect ?? '').trim().replace(/^sd/, ''));
  if (!m) return null;
  const rows = TYPE_KELVIN[m[1]], n = Number(m[2]);
  return rows.reduce((best, row) => (Math.abs(row[0] - n) < Math.abs(best[0] - n) ? row : best))[1];
}

const ORDER = 'OBAFGKM';
/** The class of star a colour index belongs to, as a place in O B A F G K M. */
const classOfColour = (bv: number) => { const i = [-0.3, -0.02, 0.3, 0.58, 0.81, 1.4].findIndex((lim) => bv < lim); return i < 0 ? 6 : i; };
/**
 * What kind of star this is, in words, from its spectral type and its measured colour together.
 * The catalogue's type is not always the star's own: for a close pair it can be a blend, a guess
 * (marked with a colon) or the companion's. So the colour words come from the measured colour when
 * the type is marked as doubtful or joint, or when the two cannot both be right: the type is more than
 * one class cooler than the colour (dust between us and a star only ever reddens it), or a nearby
 * star's type is more than two classes hotter than its colour (more than dust could do close by).
 */
export function reading(spect: string | null, bv: number | null, distPc: number): { colour: string; stage: string; type: string; fromColour: boolean; trusted: boolean } {
  const given = (spect ?? '').trim(), plain = kind(spect), type = /comp/i.test(given) ? 'Composite: two stars measured as one' : tidySpect(spect);
  const letter = given.replace(/^sd/, '')[0]?.toUpperCase() ?? '', at = ORDER.indexOf(letter);
  if (bv === null || bv === undefined || Number.isNaN(bv) || /^D/.test(given)) return { ...plain, type, fromColour: false, trusted: at >= 0 && !/:|comp|\+/i.test(given) };
  const seen = classOfColour(bv), doubtful = /:|comp|\+/i.test(given), apart = at < 0 ? 0 : at - seen;
  const wrong = apart > 1 || (apart < -2 && distPc < 200);
  if (!doubtful && !wrong && at >= 0) return { ...plain, type, fromColour: false, trusted: true };
  // a blended or guessed type says nothing sure about the star's stage of life either
  const stage = /:|comp/i.test(given) || wrong ? '' : kind(given.split('+')[0]).stage;
  return { colour: CLASSES[ORDER[seen]], stage, type: wrong && !/comp/i.test(given) ? '' : type, fromColour: at >= 0 && at !== seen, trusted: false };
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

/** A star with the name it goes by here, where its page is, and where it is in the sky. */
export interface PageStar extends Star {
  /** The best name it has: its own name, else its name by constellation, else a catalogue number. */
  name: string;
  /** The last part of its own address under /stars/, or '' when it shares the catalogue page. */
  slug: string;
  dir: [number, number, number];
  constellation: string;
  /** Its place among the stars by brightness in our sky, counting each star system once. */
  rank?: number;
  /** For a star listed only as the second star of a named one: that star's name and page. */
  companionOf?: { name: string; href: string };
}

/** The best name a star has, and whether that name is only a catalogue number. */
export function nameOf(s: Star, constellation: string): { name: string; numbered: boolean } {
  if (s.proper) return { name: s.proper, numbered: false };
  if (s.catalogue) return { name: s.catalogue, numbered: false };
  if (s.hip) return { name: `HIP ${s.hip}`, numbered: true };
  if (s.hd) return { name: `HD ${s.hd}`, numbered: true };
  return { name: constellation ? `An unnamed star in ${constellation}` : 'An unnamed star', numbered: true };
}
/** Where a star's page is. */
export const starHref = (s: { slug: string; index: number }) => (s.slug ? `/stars/${s.slug}` : `/stars/catalogue?n=${s.index}`);

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const BAYER = /^(Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega)\b/;

/**
 * A star's whole page, as the words and marks that go inside its <article>. The pages built ahead
 * of time and the shared page for catalogue stars both use this, so every star is described the same way.
 */
export function starPage(star: PageStar): { html: string; description: string; rgb: string; byEye: boolean } {
  const ly = star.distPc * LY_PER_PC, hasColour = star.bv !== null && star.bv !== undefined && !Number.isNaN(star.bv);
  const kelvin = hasColour ? Math.round(temperature(star.bv) / 100) * 100 : 0, rgb = (hasColour ? tint(star.bv) : [236, 231, 220]).join(',');
  const { colour, stage, type: spect, trusted } = reading(star.spect, star.bv, star.distPc), modern = MODERN[star.slug];
  // For hot stars colour is a poor thermometer, and dust on the way reddens it, so where the catalogue's
  // type can be trusted and is O or B, or is hotter than the colour, the type gives the temperature.
  const given = (star.spect ?? '').trim().replace(/^sd/, ''), at = ORDER.indexOf(given[0]?.toUpperCase() ?? '');
  const fromType = trusted && (at <= 1 || !hasColour || classOfColour(star.bv) > at) ? typeTemperature(star.spect) : null;
  // a colour bluer than the type allows cannot be dust, so there the colour's own figure stands
  const byType = fromType !== null && (!hasColour || kelvin <= fromType) ? fromType : null;
  const typeK = byType ? Number(byType.toPrecision(2)) : 0, reddened = byType !== null && hasColour && kelvin < typeK * 0.8 && classOfColour(star.bv) > at;
  const doubt = modern?.note ?? DISTANCE_NOTES[star.slug] ?? distanceNote(star.distPc);
  const rank = star.rank ?? star.index + 1, byEye = star.appMag <= 6.5, onChart = star.appMag < 4.5, lum = star.lumSun, n = esc(star.name);
  const unnamed = !star.proper && !star.catalogue && !star.hip && !star.hd, called = unnamed ? 'This star' : n, it = unnamed ? 'this star' : n;
  const mate = star.companionOf ? `<a href="${star.companionOf.href}">${esc(star.companionOf.name)}</a>` : '';
  const lumText = lum >= 1.5 ? `${round2(lum)} times as much visible light as the Sun` : lum > 0.67 ? 'about as much visible light as the Sun' : lum >= 0.01 ? `${round2(lum * 100)} per cent of the Sun's visible light` : `one ${round2(1 / lum)}th of the Sun's visible light`;
  const lead = `${colour ? `${called} is ${colour}` : `${called} is a star`}${star.constellation ? `, in the constellation ${esc(star.constellation)}.` : '.'}`;
  const sight = !byEye ? 'It is too faint to see without a telescope.' : star.appMag <= 1.5 ? 'It is one of the brightest stars in the whole sky, easy to see even from a town.' : star.appMag <= 3.5 ? 'It is easy to see by eye on a clear night.' : star.appMag <= 5 ? 'It can be seen by eye away from bright lights.' : 'It can just be seen by eye from a really dark place.';
  const row = (title: string, body: string, small = false) => `<section class="row${small ? ' small' : ''}"><div class="hang"><h2>${title}</h2></div><div class="prose">${body}</div></section>`;
  const names: [string, string][] = [];
  if (star.proper) names.push(['Its own name', esc(star.proper)]);
  if (star.catalogue) names.push([BAYER.test(star.catalogue) ? 'By constellation (Bayer)' : /^\d/.test(star.catalogue) ? 'By constellation (Flamsteed)' : 'By constellation', esc(star.catalogue)]);
  if (star.hip) names.push(['Hipparcos catalogue', `HIP ${star.hip}`]);
  if (star.hd) names.push(['Henry Draper catalogue', `HD ${star.hd}`]);
  if (spect) names.push(['Spectral type', esc(spect)]);
  const whyNames = unnamed
    ? mate ? `<p>It has no name or number of its own in the data this site uses. It is listed there as a second star of ${mate}, right beside it in the sky and too close to tell apart by eye.</p>` : '<p>It has no name and no catalogue number in the data this site uses. Stars like that are usually the fainter one of a close pair, listed under the brighter star beside it.</p>'
    : !star.proper && !star.catalogue
      ? '<p>Nobody has given this star a name of its own. Like most stars it goes by its number in a catalogue: a long list in which astronomers have measured and numbered the stars one by one.</p>'
      : !star.proper
        ? `<p>It has no name of its own. ${BAYER.test(star.catalogue) ? 'Its name by constellation is a Greek letter and the constellation it is in, a way of naming begun by Johann Bayer in 1603.' : /^\d/.test(star.catalogue) ? 'Its name by constellation is a number and the constellation it is in, from the catalogue of John Flamsteed, the first Astronomer Royal.' : 'It goes by a name made from the constellation it is in.'}</p>`
        : '';
  const html = [
    `<header class="star-head"><div>
      <p class="label"><a href="/stars">Meet a star</a>${star.constellation ? ` / <a href="/stars/in/${slugOf(star.constellation)}">${esc(star.constellation)}</a>` : ''}</p>
      <h1${star.name.length > 14 ? ' class="long"' : ''}>${n}</h1>
      <p class="lead">${lead} ${stage}${mate ? ` It is listed as a companion of ${mate}, right beside it in the sky.` : ''}</p>
      <p class="star-links"><a href="/v2?go=star:${star.index}">Fly to it in 3D</a>${onChart ? `<a href="/sky?star=${star.index}">Find it on the sky map</a>` : ''}</p>
    </div>
    <figure class="star-face"><canvas aria-hidden="true"></canvas><figcaption>${hasColour ? 'A drawing in the star\'s own colour, worked out from its measured colour index. It is not a photograph.' : 'A drawing, not a photograph. This star\'s colour is not in the catalogue, so it is drawn plain white.'}</figcaption></figure></header>`,
    row('How far', `<p class="big"><span data-ly="${star.distPc < 60 ? ly : ''}">${round2(ly)}</span> light years</p>
      <p>The light you see from ${it} tonight set off <span data-left>about ${round2(ly)} years ago</span>. Everything we know about it is that much out of date.</p>${doubt ? `<p>${doubt}</p>` : ''}`),
    row('How bright', `<p class="big">${lum >= 1.5 ? `${round2(lum)} Suns` : lum > 0.67 ? 'About one Sun' : `${round2(lum)} of a Sun`}</p>
      <p>It gives out ${lumText}. ${unnamed ? '' : rank <= 20 ? `From the Earth it is ${placing(rank)} star in the night sky.` : rank <= 100 ? 'It is one of the hundred brightest stars in the night sky.' : ''} ${sight}</p>
      <p>Astronomers put its brightness in our sky at magnitude ${star.appMag.toFixed(2).replace('-', '−')}. Smaller numbers are brighter, and the faintest stars the eye can see are about 6.</p>`),
    byType
      ? row('How hot', `<p class="big">About ${nf(typeK)} K</p>
      <p>That is the temperature of its surface, worked out from its spectral type, ${spect}, with a standard table of how hot stars of each type are. It is a guide and not a measurement, and could be out by a tenth or so. ${reddened ? `Its colour alone would suggest only about ${nf(Number(kelvin.toPrecision(2)))} K. Dust lying between us and the star reddens its light, the way the air reddens the setting Sun, so for this star the type is the better guide.` : hasColour ? 'For stars as hot as this, colour is a poor thermometer, because most of their light is ultraviolet, so the type is the better guide.' : ''} The Sun's is 5,772 K. Hotter stars are bluer and cooler stars are redder, the same way a poker in a fire goes from red to white.</p>
      ${hasColour ? `<p class="swatches"><span><i style="background:rgb(${rgb})"></i>${unnamed ? 'This star' : n}${reddened ? ', as it looks through the dust' : ''}</span><span><i style="background:rgb(255,236,214)"></i>The Sun</span></p>` : ''}`)
      : hasColour
      ? row('How hot', `<p class="big">${star.bv < -0.05 ? `Hotter than ${nf(Math.floor(kelvin / 1000) * 1000)} K` : `About ${nf(kelvin)} K`}</p>
      <p>That is the temperature of its surface, worked out from its colour, so it is a guide and not a measurement. ${star.bv < -0.05 ? 'For stars as blue as this one, colour is a poor thermometer: most of their light is ultraviolet, which the eye and this sum do not see, and the true figure can be far higher.' : 'It could be out by a few hundred degrees.'} The Sun's is 5,772 K. Hotter stars are bluer and cooler stars are redder, the same way a poker in a fire goes from red to white.</p>
      <p class="swatches"><span><i style="background:rgb(${rgb})"></i>${unnamed ? 'This star' : n}</span><span><i style="background:rgb(255,236,214)"></i>The Sun</span></p>`)
      : row('How hot', `<p>Not known here. The catalogue this site uses has no colour measurement for this star, and colour is what the temperature is worked out from.${colour ? ` Its spectral type says it is ${colour}.` : ''}</p>`),
    byEye ? row('In your sky now', '<p data-now>Working it out…</p>') : '',
    row('Its names', `${whyNames}${names.length ? `<dl class="names">${names.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}${spect ? '' : (star.spect ?? '').trim() ? '<p>The catalogue\'s spectral type for it does not match its measured colour, most likely because it belongs to a companion star, so it is left out here.</p>' : '<p>Its spectral type, the code for what kind of star it is, is not in the catalogue.</p>'}`, true),
    row('Where this comes from', `<p>${modern ? 'Brightness in our sky, colour and spectral type' : 'Distance, brightness, colour and spectral type'} are from the <a href="https://codeberg.org/astronexus/hyg" rel="noopener">HYG star database, version 4.4</a>, by David Nash, shared under a <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">Creative Commons Attribution-ShareAlike 4.0</a> licence. ${modern ? `The distance is from <a href="${modern.url}" rel="noopener">${modern.by}</a>, and the light the star gives out is worked out from that distance.` : 'Its distances are those measured by the Hipparcos satellite.'} ${byType ? 'The temperature is read from the spectral type with the table of <a href="https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt" rel="noopener">Pecaut and Mamajek (2013)</a>, and the' : hasColour ? 'The temperature is worked out here from the colour with the formula of <a href="https://arxiv.org/abs/1201.1809" rel="noopener">Ballesteros (2012)</a>, and the' : 'The'} words are written for this site.</p>
      <p>To read more: <a href="/learn/colour-and-brightness">Colour and brightness</a>, <a href="/learn/how-stars-live-and-die">How stars live and die</a>, <a href="/learn/measuring-distance">Measuring distance</a>.</p>`, true),
  ].join('\n');
  return { html, description: `${lead.replace(/<[^>]+>/g, '').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))} It is ${round2(ly)} light years away.`, rgb, byEye };
}
