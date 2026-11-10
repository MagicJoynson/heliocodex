import type { PlateSpec } from './types';
import { jupiter } from './jupiter';

export type { PlateSpec, Figure, Ring } from './types';
export const plates: Record<string, PlateSpec> = { jupiter };
