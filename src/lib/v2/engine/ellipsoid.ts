/**
 * The drawn surface of a flattened world, as an ellipsoid, for the brake and the floor in free flight.
 * Pure arithmetic, so the same code is used by the engine and by the checks that measure it.
 */
import type { V3 } from './vec';

/** semi-axes along the globe's own x (towards the node), y (the spin pole) and z, with those axes in the engine frame */
export type Ellipsoid = { X: V3; Y: V3; Z: V3; a: number; b: number; c: number };

const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];

/** distance from the centre to the surface along a unit direction from the centre */
export function ellipsoidRadius(e: Ellipsoid, u: V3): number {
  const x = dot(u, e.X) / e.a, y = dot(u, e.Y) / e.b, z = dot(u, e.Z) / e.c;
  return 1 / Math.sqrt(x * x + y * y + z * z);
}

/**
 * Metres from the camera, along the unit direction `d`, to the first point of the surface; 0 if inside it (or, heading away,
 * within 1% of it); Infinity if the way is clear. `oc` is the vector from the camera to the centre. With no `e` the body is a sphere of radius `mean`.
 */
export function ellipsoidAhead(e: Ellipsoid | null, mean: number, oc: V3, d: V3): number {
  // into the space where the surface is a unit sphere
  const ocs: V3 = e ? [dot(oc, e.X) / e.a, dot(oc, e.Y) / e.b, dot(oc, e.Z) / e.c] : [oc[0] / mean, oc[1] / mean, oc[2] / mean];
  const ds: V3 = e ? [dot(d, e.X) / e.a, dot(d, e.Y) / e.b, dot(d, e.Z) / e.c] : [d[0] / mean, d[1] / mean, d[2] / mean];
  const C = dot(ocs, ocs) - 1;
  const B = dot(ds, ocs);
  if (C < 0) return 0;
  if (B <= 0) return C < 0.0201 ? 0 : Infinity;
  const A = dot(ds, ds);
  const disc = B * B - A * C;
  if (disc < 0) return Infinity;
  return Math.max(0, (B - Math.sqrt(disc)) / A);
}
