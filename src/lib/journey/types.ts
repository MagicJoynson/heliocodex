import * as THREE from 'three';
import type { PlanetLook } from './planet';

export interface Pointer { x: number; y: number; sx: number; sy: number }

/** The "lower" half of a journey: what you see once you are through the haze. */
export interface LowerScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** g runs 0..1 over the whole time the visitor stays in this scene */
  update(g: number, dt: number, t: number, pointer: Pointer, reduce: boolean): void;
  /** Text for the right-hand ruler while in this scene */
  readout(g: number): string;
  toneMapping?: THREE.ToneMapping;
  exposure?: number;
  shadows?: boolean;
}

export interface Moon { orbitR: number; size: number; color: number; seed: number; speed: number; phase: number }

export interface OrbitConfig {
  look: PlanetLook;
  radiusKm: number;
  /** starting altitude, in planet radii */
  startAltRadii: number;
  /** altitude where the haze takes over, in planet radii */
  handoverAlt: number;
  target: { lat: number; lon: number };
  startYaw: number;
  startTilt: number;
  /** how the end of the descent is lit and framed, matching the lower scene */
  landing: {
    sunElev: number; sunYaw: number; faceYaw: number; pitch: number;
    /** instead: the Sun's direction in the planet's own frame (y = north pole), and face due south */
    sun?: [number, number, number]; faceSouth?: boolean;
  };
  moons: Moon[];
}

export interface World {
  slug: string;
  orbit: OrbitConfig;
  hazeCss: string;
  buildLower(): LowerScene;
}
