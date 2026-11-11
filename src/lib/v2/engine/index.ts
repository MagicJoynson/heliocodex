/**
 * The engine's public surface: the only things the rest of the site (lessons, the margin, the
 * atlas, moons and small bodies) should import from the engine. Everything else in this folder
 * may change without notice.
 *
 * Conventions follow src/lib/v2/atlas/types.ts: the site speaks kilometres, degrees and ISO times;
 * the engine converts to metres in doubles internally. Nothing in this file imports three.js.
 *
 * Status (11 Nov 2026): createWorld() implements all of Engine. flyTo takes the Sun, planets,
 * moons, dwarf planets, the scale-ladder places and catalogue stars ("star:<index in stars.bin>").
 */
import type { View } from '../atlas/types';

export type { View, Body, ScalePlace } from '../atlas/types';
export type { HeightSource } from './heights';
export { eclToWorld } from './vec';

/** What the camera is near, for the margin to pick its lessons and facts. Fired when it changes. */
export interface Context {
  /** Body id of the nearest body that fills a useful part of the view, or a scale place. */
  near: string;
  /** Rough distance band, so the margin can change its tone: on the ground, in orbit, between worlds, far out. */
  band: 'surface' | 'orbit' | 'system' | 'interstellar' | 'galactic' | 'cosmic';
  /** Height above the ground (surface, orbit) or distance from the Sun (further out), km. */
  km: number;
  /** The engine's clock, ISO 8601 UTC. */
  timeIso: string;
  /** Set while the camera is beside a catalogue star it flew to: its index in stars.bin (as in 'star:<n>'). */
  star?: number;
}

/**
 * Something extra drawn in the world: orbit lines, labels, a constellation figure, the asteroid
 * belt. A layer gets a plain callback each frame with positions it can trust, and hands back
 * its own three.js objects through `attach`. It never touches the camera or the renderer.
 */
export interface Layer {
  /** Unique name, used by View.highlight and the margin's toggles. */
  name: string;
  /** Called once with a parent object to add things to; positions are relative to the camera. */
  attach(parent: unknown): void;
  /**
   * Called each frame before drawing. `rel(id)` gives a body's position minus the camera's,
   * in metres (double precision, already in the engine frame). Return false to hide the layer.
   */
  update?(rel: (id: string) => [number, number, number] | null, timeJd: number): boolean | void;
  detach?(): void;
  /** Called when the view changes size: its height in CSS pixels and vertical field of view. */
  resize?(heightPx: number, fovDeg: number): void;
}

export interface Engine {
  /**
   * Fly the camera somewhere: the Sun, a planet, a moon or a dwarf planet, by id. Honoured from View
   * so far: target, distanceKm, timeIso (set before leaving). Not yet: place, facing, highlight.
   * Resolves on arrival. Rejects with an error named 'AbortError' when another flight (or the way in)
   * replaces it, or a plain Error when there is no such place, in which case the flight in progress
   * carries on. opts.secs of 0 arrives at once.
   */
  flyTo(view: View, opts?: { secs?: number }): Promise<void>;
  /** Whether flyTo can go there now, so nothing offers a link that goes nowhere. */
  canFlyTo(id: string): boolean;
  /** Add a layer. Returns a function that removes it. */
  registerLayer(layer: Layer): () => void;
  /** Listen for changes of place. Returns a function that stops listening. */
  onContext(cb: (c: Context) => void): () => void;
  /** Set the clock (ISO 8601 UTC), or pass null to follow real time again. */
  setTime(iso: string | null): void;
  /**
   * Time runs this many times faster than real time (1 is real time; negative runs backwards).
   * After setTime, a rate of 1 keeps the set clock ticking; setTime(null) goes back to real time.
   * The clock stays between 1800 and 2200.
   */
  setRate(rate: number): void;
}
