// The flat charts of what lies beyond the Solar System: the nearest stars, the stars you can see
// by eye, the Milky Way, the galaxies round it and the cosmic web.
//
// The data is cut from public/data/deep/ by scripts/data/build-deep-charts.py, so every dot here is
// the same star or galaxy the 3D view draws. Everything in this file is pure and runs in the test.
import file from '../../../data/deep/charts.json';

export type V3 = [number, number, number];
export interface NearStar { p: V3; absMag: number; colour: number; name: string; ly: number }
export interface Galaxy { p: V3; absMag: number | null; name: string; kpc: number }

const raw = file as unknown as {
  nearLy: number; skyMag: number; webMpc: number; webSlabMpc: number; h0: number; webAll: number;
  near: [number, number, number, number, number, string][]; sky: V3[]; skyNamed: [number, number, number, number, string][];
  group: [number, number, number, number | null, string][]; web: [number, number][]; clusters: [number, number, number, string][];
};

export const LY_PER_PC = 3.0856775814913673e16 / 9.4607304725808e15;
/** The Sun's distance from the centre of the Milky Way, pc (GRAVITY Collaboration 2019). The engine uses the same. */
export const R0_PC = 8178;
export const limits = { nearLy: raw.nearLy, skyMag: raw.skyMag, webMpc: raw.webMpc, webSlabMpc: raw.webSlabMpc, h0: raw.h0, webAll: raw.webAll };

const dist = (p: readonly unknown[]) => Math.hypot(p[0] as number, p[1] as number, p[2] as number);
/** Stars within 20 light years, nearest first. Galactic frame, light years from the Sun. */
export const nearStars: NearStar[] = raw.near.map((s) => ({ p: [s[0], s[1], s[2]], absMag: s[3], colour: s[4], name: s[5], ly: dist(s) }));
/** Every star of magnitude 6 or brighter. Galactic frame, light years from the Sun. */
export const skyStars: V3[] = raw.sky;
export const skyNamed = raw.skyNamed.map((s) => ({ p: [s[0], s[1], s[2]] as V3, mag: s[3], name: s[4], ly: dist(s) }));
/** McConnachie's galaxies. Galactic frame, kpc from the Sun. */
export const groupGalaxies: Galaxy[] = raw.group.map((g) => ({ p: [g[0], g[1], g[2]], absMag: g[3], name: g[4], kpc: dist(g) }));
/** 2MRS galaxies near the supergalactic plane, Mpc from us in that plane. */
export const webGalaxies: [number, number][] = raw.web.map((w) => [w[0] / 10, w[1] / 10]);
export const clusters = raw.clusters.map((c) => ({ x: c[0], y: c[1], z: c[2], name: c[3], inSlab: Math.abs(c[2]) <= raw.webSlabMpc }));

// ---- the page
// Every Sun-centred chart looks down on the disc of the Milky Way from its north side, with the
// centre of the galaxy towards the top. Galactic x (to the centre) runs up the page and galactic y
// (the way the Sun is going) runs to the left.
export const R = 430;
export const onPage = (p: number[], half: number): [number, number] => [(-p[1] / half) * R, (-p[0] / half) * R];
/** The same stars seen from the side: the centre of the galaxy to the right, galactic north up. */
export const onSide = (p: number[], half: number): [number, number] => [(p[0] / half) * R, (-p[2] / half) * R];

/** Many small dots as one path: a zero-length line with round ends draws a dot. */
export function dotPath(points: [number, number][], limit = R): string {
  let d = '';
  for (const [x, y] of points) if (Math.hypot(x, y) <= limit) d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
  return d;
}

/** Radius of a star's dot from its true brightness: Sirius large, a red dwarf small. */
export const starDot = (absMag: number) => Math.min(8, Math.max(2, 7.2 - 0.34 * absMag));
/** Radius of a galaxy's dot from its true brightness, in three steps. */
export const galaxyDot = (absMag: number | null) => (absMag === null ? 3 : absMag <= -17 ? 9 : absMag <= -13 ? 5.5 : 3);

export const fmtLy = (ly: number) => {
  const [div, word] = ly >= 1e9 ? [1e9, ' billion'] : ly >= 1e6 ? [1e6, ' million'] : [1, ''];
  return `${(ly / div).toLocaleString('en-GB', { maximumSignificantDigits: ly < 100 ? 3 : 2 })}${word} light years`;
};

// ---- the Milky Way, as a model
// The same model as the 3D view (makeSpiral in engine/deep.ts): four arms that leave the ends of
// the bar and wind out at a pitch of 12.5 degrees, a bar 5 kpc from middle to end set 30 degrees
// from the line to the Sun, and the Sun's own short Local arm. Lengths in parsecs. The model's x
// runs from the centre towards the Sun and its y to the right on the page.
export const milkyWay = {
  pitchDeg: 12.5, discPc: 16000,
  bar: { angleDeg: -30, halfPc: 5000, widthPc: 800 },
  arms: [
    { name: 'a', theta0Deg: 330, r0: 3400, rMax: 16000 }, { name: 'b', theta0Deg: 150, r0: 3400, rMax: 16000 },
    { name: 'c', theta0Deg: 60, r0: 3400, rMax: 15000 }, { name: 'd', theta0Deg: 240, r0: 3400, rMax: 15000 },
  ],
  /** the Local arm: a short spur through the Sun's neighbourhood */
  local: { r0: 6500, throughPc: 8400, spanDeg: [-35, 30] as [number, number] },
};
const K = Math.tan((milkyWay.pitchDeg * Math.PI) / 180);
/** Where an arm is at radius r: the angle from the centre-to-Sun line, in radians. */
export const armAngle = (theta0: number, r0: number, r: number) => theta0 + Math.log(r / r0) / K;
/** Model x, y (pc) to the page, for a chart `halfPc` from middle to edge. The Sun is below the centre. */
export const modelOnPage = (x: number, y: number, halfPc: number): [number, number] => [(y / halfPc) * R, (x / halfPc) * R];

export function armPath(arm: { theta0Deg: number; r0: number; rMax: number }, halfPc: number): string {
  const t0 = (arm.theta0Deg * Math.PI) / 180;
  let d = '';
  for (let r = arm.r0; r <= arm.rMax + 1; r += 150) {
    const th = armAngle(t0, arm.r0, r), [x, y] = modelOnPage(r * Math.cos(th), r * Math.sin(th), halfPc);
    d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
export function localArmPath(halfPc: number): string {
  const l = milkyWay.local, t0 = -Math.log(l.throughPc / l.r0) / K;
  let d = '';
  for (let deg = l.spanDeg[0]; deg <= l.spanDeg[1]; deg += 2.5) {
    const th = (deg * Math.PI) / 180, r = l.r0 * Math.exp(K * (th - t0)), [x, y] = modelOnPage(r * Math.cos(th), r * Math.sin(th), halfPc);
    d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// ---- names
export interface Label { x: number; y: number; text: string; anchor: 'start' | 'end' | 'middle'; tx: number; ty: number }
/**
 * Put a name beside each point without two names touching: to the right if there is room, then
 * the left, above and below. Earlier points get first choice. A name that fits nowhere is left
 * out, and the caller must list it elsewhere.
 */
export function placeLabels(points: { x: number; y: number; r: number; text: string }[], size = 19, avoid: [number, number, number, number][] = [], edge = R + 30): { placed: Label[]; dropped: string[] } {
  const boxes: [number, number, number, number][] = points.map((p) => [p.x - p.r - 2, p.y - p.r - 2, p.x + p.r + 2, p.y + p.r + 2]);
  boxes.push(...avoid);
  const placed: Label[] = [], dropped: string[] = [];
  for (const p of points) {
    const w = p.text.length * size * 0.5 + 6, h = size, g = p.r + 7;
    const tries: [Label['anchor'], number, number][] = [['start', p.x + g, p.y + h * 0.32], ['end', p.x - g, p.y + h * 0.32], ['middle', p.x, p.y - g - 2], ['middle', p.x, p.y + g + h * 0.8]];
    let done = false;
    for (const [anchor, tx, ty] of tries) {
      const x0 = anchor === 'start' ? tx : anchor === 'end' ? tx - w : tx - w / 2;
      const box: [number, number, number, number] = [x0, ty - h * 0.8, x0 + w, ty + h * 0.25];
      if (box[0] < -edge || box[2] > edge || box[1] < -edge || box[3] > edge) continue;
      if (boxes.some((b) => b !== boxes[points.indexOf(p)] && box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
      boxes.push(box); placed.push({ x: p.x, y: p.y, text: p.text, anchor, tx, ty }); done = true; break;
    }
    if (!done) dropped.push(p.text);
  }
  return { placed, dropped };
}

/** Where DeepPlate writes the words for a ring of radius r, as a box for placeLabels to keep clear of. */
export const ringLabelBox = (r: number, text: string): [number, number, number, number] => [-(text.length * 4.6), r + 4, text.length * 4.6, r + 22];
