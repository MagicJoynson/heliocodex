import * as THREE from 'three/webgpu';
import { uniform, texture, renderOutput } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { fxaa } from 'three/addons/tsl/display/FXAANode.js';

/**
 * The finishing pass. The two scenes are drawn into a floating-point picture, then:
 *  - an exposure that adapts like an eye (brighter in the dark, dimmer in sunlight or looking at the Sun),
 *  - bloom, so the Sun and bright things glow instead of ending in a hard edge,
 *  - edge smoothing (FXAA, cheap enough for a phone), and on the best devices 4x multisampling as well.
 * Anything that goes wrong here switches the pass off and the view is drawn directly, as before.
 */
export interface PostOptions { bloom: boolean; msaa: boolean; hdr: boolean }

export function createPost(renderer: THREE.WebGPURenderer, o: PostOptions) {
  const rt = new THREE.RenderTarget(2, 2, { type: o.hdr ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true, samples: o.msaa ? 4 : 0 });
  rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
  const exposure = uniform(1);
  const strength = uniform(o.bloom ? 0.5 : 0);
  const scene = texture(rt.texture).mul(exposure);
  const glow = bloom(scene, 0.5, 0.6, 1.05);
  glow.strength = strength;
  const lit = o.bloom ? scene.add(glow) : scene;
  const pipeline = new THREE.RenderPipeline(renderer);
  pipeline.outputColorTransform = false;
  pipeline.outputNode = fxaa(renderOutput(lit, THREE.NoToneMapping, THREE.SRGBColorSpace));
  let w = 0, h = 0;
  const size = new THREE.Vector2();
  return {
    exposure,
    /** match the picture to the canvas's drawing size */
    fit() {
      renderer.getDrawingBufferSize(size);
      const nw = Math.max(2, Math.round(size.x)), nh = Math.max(2, Math.round(size.y));
      if (nw !== w || nh !== h) { w = nw; h = nh; rt.setSize(w, h); }
    },
    begin() { renderer.setRenderTarget(rt); },
    end() { renderer.setRenderTarget(null); pipeline.render(); },
    dispose() { rt.dispose(); pipeline.dispose?.(); },
  };
}
export type Post = ReturnType<typeof createPost>;
