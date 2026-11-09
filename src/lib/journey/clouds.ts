import * as THREE from 'three';
import { NOISE } from './glsl';
import type { LowerScene } from './types';

/** Looking along the cloud tops of a gas giant. No ground: just belts, storms and lightning. */
export interface CloudParams {
  horizon: string;
  zenith: string;
  palette: string[]; // belt and zone colours
  stormColor: string;
  readout: (g: number) => string;
  heightStart: number;
  heightEnd: number;
}

export function createClouds(p: CloudParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.5, 6000);
  const horizon = new THREE.Color(p.horizon);
  const zenith = new THREE.Color(p.zenith);
  const uniforms = {
    time: { value: 0 },
    horizon: { value: horizon },
    zenith: { value: zenith },
    flash: { value: 0 },
    flashPos: { value: new THREE.Vector2(0, -500) },
    pal: { value: p.palette.map((c) => new THREE.Color(c)) },
    storm: { value: new THREE.Color(p.stormColor) },
    camPos: { value: new THREE.Vector3() },
  };

  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(9000, 9000, 1, 1).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `${NOISE}
        varying vec3 vW; uniform float time; uniform vec3 horizon; uniform vec3 pal[6]; uniform vec3 storm; uniform vec3 camPos; uniform float flash; uniform vec2 flashPos;
        vec3 palAt(float i){ int k=int(mod(i,6.)); vec3 c=pal[0]; if(k==1)c=pal[1]; if(k==2)c=pal[2]; if(k==3)c=pal[3]; if(k==4)c=pal[4]; if(k==5)c=pal[5]; return c; }
        void main(){
          vec2 w=vW.xz;
          float band=w.y*-0.0042;
          float id0=floor(band);
          // each belt slides at its own speed (the jets)
          float sp=sin(id0*1.7)*14.+sin(id0*0.6)*8.;
          vec2 q=vec2(w.x+time*sp, w.y);
          float warp=fbm(vec2(q.x*0.004,q.y*0.012))*2.-1.;
          float warp2=fbm(vec2(q.x*0.02,q.y*0.05)+4.)*2.-1.;
          float b=band+warp*0.5+warp2*0.12;
          float id=floor(b); float f=fract(b);
          vec3 c=palAt(id*1.0+floor(h21(vec2(id,3.))*5.));
          vec3 c2=palAt(id+1.+floor(h21(vec2(id+1.,3.))*5.));
          c=mix(c,c2,smoothstep(.55,1.,f)*.6);
          float fine=fbm(vec2(q.x*0.014,q.y*0.05)+time*.02);
          float streak=fbm(vec2(q.x*0.0035,q.y*0.09));
          float fine2=fbm(vec2(q.x*0.045,q.y*0.14)+time*.03);
          c*=.55+.8*fine+.35*(fine2-.5);
          c=mix(c,c*1.25,smoothstep(.6,.9,streak)*.5);
          // the big oval
          vec2 s=(vec2(w.x-camPos.x-330.,w.y+850.))/vec2(760.,400.);
          float r=length(s);
          float ang=atan(s.y,s.x)+time*.08+1./(r+.2);
          float sw=fbm(vec2(cos(ang),sin(ang))*r*2.+3.);
          c=mix(c,storm*(.8+.45*sw),smoothstep(1.05,.55,r));
          c=mix(c,c*1.3,smoothstep(1.2,1.0,r)*.0);
          // flash from the deep layers
          c+=vec3(.9,.92,1.)*flash*exp(-length(w-flashPos)/160.)*1.6;
          float dist=length(vW-camPos);
          float fog=1.-exp(-dist*0.00072);
          vec3 fcol=horizon+vec3(.9,.92,1.)*flash*.3;
          gl_FragColor=vec4(mix(c,fcol,fog),1.);
        }`,
    }),
  );
  scene.add(deck);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(4000, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms,
      vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec3 vD; uniform vec3 horizon; uniform vec3 zenith; uniform float flash;
        void main(){ float h=clamp(vD.y,0.,1.); vec3 c=mix(horizon,zenith,pow(h,.45)); c+=vec3(.9,.92,1.)*flash*.35*(1.-h); gl_FragColor=vec4(c,1.); }`,
    }),
  );
  scene.add(sky);

  let nextFlash = 3, flashT = -1;
  return {
    scene, camera,
    update(g, dt, t, pointer, reduce) {
      uniforms.time.value = t;
      const hgt = p.heightStart + (p.heightEnd - p.heightStart) * g;
      camera.position.set(t * 3, hgt, 0);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -pointer.sx * 0.14;
      camera.rotation.x = -0.34 + 0.06 * g + pointer.sy * 0.05;
      camera.rotation.y += 0.28 * g;
      uniforms.camPos.value.copy(camera.position);
      sky.position.copy(camera.position);
      deck.position.set(camera.position.x, 0, 0);
      // lightning
      if (!reduce) {
        nextFlash -= dt;
        if (nextFlash <= 0 && flashT < 0) {
          flashT = 0;
          nextFlash = 2.5 + Math.random() * 6;
          uniforms.flashPos.value.set(camera.position.x + (Math.random() - 0.5) * 900, -400 - Math.random() * 1200);
        }
        if (flashT >= 0) {
          flashT += dt;
          const t1 = flashT;
          uniforms.flash.value = Math.max(0, Math.exp(-t1 * 9) * (0.6 + 0.4 * Math.sin(t1 * 45))) + (t1 > 0.18 && t1 < 0.45 ? Math.exp(-(t1 - 0.18) * 8) * 0.7 : 0);
          if (t1 > 0.9) { flashT = -1; uniforms.flash.value = 0; }
        }
      }
    },
    readout: p.readout,
  };
}
