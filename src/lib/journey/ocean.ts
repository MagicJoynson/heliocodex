import * as THREE from 'three';
import { NOISE } from './glsl';
import { fbm } from './noise';
import type { LowerScene } from './types';

export interface OceanParams {
  horizon: string;
  zenith: string;
  sunDir: [number, number, number];
  water: string;
  deep: string;
  readout: (g: number) => string;
}

/** Open sea at golden hour with a far island: the one place in this system with liquid water on top. */
export function createOcean(p: OceanParams): LowerScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 6000);
  const sunDir = new THREE.Vector3(...p.sunDir).normalize();
  const U = {
    time: { value: 0 },
    sunDir: { value: sunDir },
    horizon: { value: new THREE.Color(p.horizon) },
    zenith: { value: new THREE.Color(p.zenith) },
    water: { value: new THREE.Color(p.water) },
    deep: { value: new THREE.Color(p.deep) },
    camPos: { value: new THREE.Vector3() },
  };

  const SKY = `${NOISE}
    vec3 skyCol(vec3 d, vec3 sunDir, vec3 horizon, vec3 zenith, float time){
      float h=clamp(d.y,0.,1.);
      vec3 col=mix(horizon,zenith,pow(h,.45));
      float s=max(dot(d,sunDir),0.);
      col+=vec3(1.,.62,.32)*pow(s,5.)*.55+vec3(1.,.8,.55)*pow(s,40.)*.5;
      // layered cumulus, lit from the low sun
      vec2 uv=d.xz/(d.y+.28)*1.3+vec2(time*.004,0.);
      float c=smoothstep(.5,.78,fbm(uv*1.8));
      float lit=.55+.9*pow(max(dot(normalize(vec3(d.xz,.3)),normalize(vec3(sunDir.xz,.3))),0.),2.);
      vec3 cc=mix(vec3(.5,.42,.46),vec3(1.,.82,.62),clamp(lit,0.,1.));
      col=mix(col,cc,c*smoothstep(0.,.18,d.y)*.9);
      col=mix(col,vec3(1.,.96,.88),smoothstep(.99993,.99998,s));
      return col;
    }`;

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(4000, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms: U,
      vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `${SKY} varying vec3 vD; uniform vec3 sunDir; uniform vec3 horizon; uniform vec3 zenith; uniform float time;
        void main(){ gl_FragColor=vec4(skyCol(normalize(vD),sunDir,horizon,zenith,time)*(vD.y<0.?.8:1.),1.); }`,
    }),
  );
  scene.add(sky);

  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(6000, 6000, 220, 220).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: U,
      vertexShader: `uniform float time; varying vec3 vW; varying vec3 vN;
        vec3 wave(vec2 p,vec2 d,float k,float a,float sp,inout vec2 dh){ float ph=dot(p,d)*k+time*sp; dh+=d*a*k*cos(ph); return vec3(0.,a*sin(ph),0.); }
        void main(){
          vec3 pos=position; vec2 dh=vec2(0.); vec3 off=vec3(0.);
          vec2 xz=(modelMatrix*vec4(position,1.)).xz;
          off+=wave(xz,normalize(vec2(1.,.4)),.09,.55,1.1,dh);
          off+=wave(xz,normalize(vec2(.6,1.)),.17,.28,1.5,dh);
          off+=wave(xz,normalize(vec2(-.3,1.)),.33,.13,2.1,dh);
          off+=wave(xz,normalize(vec2(1.,-.7)),.6,.05,3.1,dh);
          pos+=off; vN=normalize(vec3(-dh.x,1.,-dh.y));
          vec4 w=modelMatrix*vec4(pos,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `${SKY} varying vec3 vW; varying vec3 vN; uniform vec3 camPos; uniform vec3 sunDir; uniform vec3 horizon; uniform vec3 zenith; uniform vec3 water; uniform vec3 deep; uniform float time;
        void main(){
          vec3 n=normalize(vN); vec3 v=normalize(camPos-vW);
          float fres=pow(1.-max(dot(n,v),0.),4.)*.92+.04;
          vec3 r=reflect(-v,n); r.y=abs(r.y);
          vec3 refl=skyCol(r,sunDir,horizon,zenith,time);
          vec3 body=mix(deep,water,.5+.5*n.y*n.y);
          vec3 col=mix(body,refl,fres);
          float spec=pow(max(dot(r,sunDir),0.),220.)*6.;
          col+=vec3(1.,.8,.55)*spec;
          float dist=length(vW-camPos);
          col=mix(col,horizon*.98,1.-exp(-dist*.0007));
          gl_FragColor=vec4(col,1.);
        }`,
    }),
  );
  scene.add(sea);

  // a far island, so the eye has a coast to measure against
  const iGeo = new THREE.PlaneGeometry(900, 500, 120, 70).rotateX(-Math.PI / 2);
  {
    const pos = iGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const r = Math.hypot(x / 420, z / 220);
      const base = Math.max(0, 1 - r * r) * (55 + 90 * fbm(x * 0.01, z * 0.01, 4));
      pos.setY(i, base - 4);
    }
    iGeo.computeVertexNormals();
  }
  const island = new THREE.Mesh(iGeo, new THREE.MeshLambertMaterial({ color: 0x2c3a2c }));
  island.position.set(-520, 0, -1700);
  scene.add(island);
  scene.fog = new THREE.Fog(new THREE.Color(p.horizon).multiplyScalar(0.98), 400, 3200);
  scene.add(new THREE.DirectionalLight(0xffc995, 2.4), new THREE.HemisphereLight(0xb8c8e0, 0x2a3a2a, 0.9));

  return {
    scene, camera,
    update(g, _dt, t, pointer) {
      U.time.value = t;
      camera.position.set(Math.sin(t * 0.15) * 2, 2.4 + Math.sin(t * 0.5) * 0.25, -g * 40);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -pointer.sx * 0.14 + 0.18 * (1 - g);
      camera.rotation.x = pointer.sy * 0.05 + 0.02 + 0.06 * (1 - g);
      U.camPos.value.copy(camera.position);
      sky.position.copy(camera.position);
      sea.position.set(camera.position.x, 0, camera.position.z);
    },
    readout: p.readout,
  };
}
