import * as THREE from 'three';

export interface Pointer { x: number; y: number; sx: number; sy: number }

/** The "lower" half of a journey: what you see once you are through the haze. */
export interface LowerScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** g runs 0..1 over the whole time the visitor stays in this scene */
  update(g: number, dt: number, t: number, pointer: Pointer, reduce: boolean): void;
  /** Text for the right-hand ruler while in this scene */
  readout(g: number): string;
}

export interface Moon { orbitR: number; size: number; color: number; seed: number; speed: number; phase: number }

export interface OrbitConfig {
  texture: string;
  cloudTexture?: string;
  radiusKm: number;
  startAltRadii: number;
  rim: [number, number, number];
  rimOuter: [number, number, number];
  target: { lat: number; lon: number };
  startYaw: number;
  startTilt: number;
  spin: number;
  moons: Moon[];
  lightYaw: number;
}

export interface World {
  slug: string;
  orbit: OrbitConfig;
  hazeCss: string;
  buildLower(): LowerScene;
}
