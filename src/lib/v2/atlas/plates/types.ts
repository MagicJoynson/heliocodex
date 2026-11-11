import type { Family, ViewFrom } from '../chart';
import type { Source } from '../types';

/** One drawing on a plate page. */
export interface Figure {
  id: string;
  /** Roman numeral shown in the corner, as on a printed atlas plate. */
  numeral: string;
  title: string;
  /** What the reader is looking at, in a sentence or two. */
  caption: string;
  /** Family ids drawn on this figure. */
  families: string[];
  /** Edge of the drawing, km from the planet's centre. */
  spanKm: number;
  /** Names set along orbits: body id to a bearing on the page (0 top, 90 right). */
  names: Record<string, number>;
  /** Looking down on the planet's own pole (the default) or on the plane of the planets. */
  view?: ViewFrom;
  /**
   * Names for orbits too small to set a name along: body id to a bearing on the orbit where a
   * short line starts, and the place on the page where the name is written.
   */
  leaders?: Record<string, { at: number; to: [number, number] }>;
  /** The middle of the drawing, km to the right of and below the parent. The parent, unless said. */
  centreKm?: [number, number];
  /** Give the scale bar in astronomical units instead of kilometres. */
  unit?: 'au';
  /** Another figure whose whole extent is marked on this one as a small square. */
  marks?: string;
}

/** `only` keeps a ring to the one drawing whose id it names. */
export interface Ring { name: string; innerKm: number; outerKm: number; faint?: boolean; only?: string }

/** Everything that is decided by hand for one planet's family of moons. */
export interface PlateSpec {
  parent: string;
  title: string;
  lead: string;
  /** A sentence for the key when something about this family needs saying. */
  caution?: string;
  /** The planet's radius at the equator, km: drawn to scale. */
  equatorKm: number;
  rings: Ring[];
  families: Family[];
  figures: Figure[];
  sources: Source[];
  /** Says where the drawing is seen from, when it is neither the parent's pole nor the plane of the planets. */
  viewNote?: string;
  /** Says what tilt is measured from, when that is not the parent's equator. */
  tiltNote?: string;
  /** What the dots are, for the line under each drawing. Moons unless said. */
  dots?: string;
}
