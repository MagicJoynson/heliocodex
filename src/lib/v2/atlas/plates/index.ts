import type { PlateSpec } from './types';
import { jupiter } from './jupiter';
import { saturn } from './saturn';
import { earth, mars, uranus, neptune, pluto } from './others';

export type { PlateSpec, Figure, Ring } from './types';
/** In order outwards from the Sun. */
export const plates: Record<string, PlateSpec> = { earth, mars, jupiter, saturn, uranus, neptune, pluto };
