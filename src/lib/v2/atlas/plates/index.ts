import type { PlateSpec } from './types';
import { jupiter } from './jupiter';
import { saturn } from './saturn';
import { earth, mars, uranus, neptune, pluto } from './others';
import { haumea, makemake, eris, gonggong, quaoar, orcus } from './dwarfs';

export type { PlateSpec, Figure, Ring } from './types';
/** The planets in order outwards from the Sun, then the dwarf planets beyond Neptune in the same order. */
export const plates: Record<string, PlateSpec> = { earth, mars, jupiter, saturn, uranus, neptune, orcus, pluto, haumea, quaoar, makemake, gonggong, eris };
