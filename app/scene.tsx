'use client';

import { useEffect, useRef } from 'react';

type SceneProps = { kind: 'hero' | 'system' | 'portfolio' | 'about' | 'collective' | 'signature' | 'venture'; paused: boolean; onReady?: () => void };
export default function Scene({ kind, paused, onReady }: SceneProps) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')]).then(([T, { RoomEnvironment }]) => {
      if (disposed) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { element.dataset.fallback = 'true'; onReady?.(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      const isCollective = kind === 'collective' || kind === 'signature';
      renderer.toneMappingExposure = kind === 'hero' || isCollective || kind === 'venture' ? 1.55 : 1.2;
      element.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(36, 1, .1, 100);
      camera.position.z = kind === 'hero' ? 6.5 : (kind === 'portfolio' || kind === 'about') ? 7.5 : 10;
      const pmrem = new T.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, .04);
      scene.environment = environment.texture;
      room.dispose(); pmrem.dispose();
      const group = new T.Group(); scene.add(group);
      const geometry = kind === 'venture' ? new T.TorusGeometry(1.35,.19,24,80,Math.PI) : isCollective ? new T.CapsuleGeometry(.23, .92, 10, 32) : kind === 'hero' ? new T.TorusKnotGeometry(1.22, .31, 200, 32, 2, 3) : kind === 'about' ? new T.TorusGeometry(1.35,.13,24,6) : kind === 'portfolio' ? new T.TorusGeometry(1.5,.07,20,100) : new T.BoxGeometry(.57, .57, .57);
      const material = new T.MeshPhysicalMaterial({ color: kind === 'system' ? 0x2854ff : 0xb8c8e9, metalness: kind === 'hero' || isCollective ? 1 : .65, roughness: kind === 'hero' || isCollective ? .14 : .25, clearcoat: 1, clearcoatRoughness: .12 });
      const knot = new T.Mesh(geometry, material);
      const cubes = new T.InstancedMesh(geometry, material, 64);
      const coreGeometry = isCollective ? new T.SphereGeometry(.36, 40, 32) : null;
      const coreMaterial = isCollective ? new T.MeshPhysicalMaterial({color:0x244aff,metalness:.48,roughness:.16,clearcoat:1}) : null;
      const petals: InstanceType<typeof T.Mesh>[] = [];
      const arches: InstanceType<typeof T.Group>[] = [];
      const capGeometry = kind === 'venture' ? new T.SphereGeometry(.19,24,16) : null;
      const accentGeometry = kind === 'venture' ? new T.TorusGeometry(1.03,.035,16,100) : null;
      const accentMaterial = kind === 'venture' ? new T.MeshPhysicalMaterial({color:0x5b85ff,emissive:0x244aff,emissiveIntensity:.5,metalness:.55,roughness:.18}) : null;
      const accent = kind === 'venture' ? new T.Mesh(accentGeometry!,accentMaterial!) : null;
      if(kind === 'venture') {
        for(let i=0;i<2;i++) {
          const arch=new T.Group();arch.add(new T.Mesh(geometry,material));
          for(const x of [-1.35,1.35]) {const cap=new T.Mesh(capGeometry!,material);cap.position.x=x;arch.add(cap);}
          arches.push(arch);group.add(arch);
        }
        group.add(accent!);
      } else if (isCollective) {
        for(let i=0;i<6;i++) {const petal=new T.Mesh(geometry,material);petal.scale.set(1.15,1,.65);petals.push(petal);group.add(petal);}
        group.add(new T.Mesh(coreGeometry!,coreMaterial!));
      } else if (kind === 'hero') group.add(knot); else if (kind === 'portfolio' || kind === 'about') { for(let i=0;i<3;i++){const ring=new T.Mesh(geometry,material);ring.rotation.set(i*Math.PI/3,i*Math.PI/3,0);group.add(ring);} } else group.add(cubes);
      scene.add(new T.AmbientLight(0xdce7ff, 1));
      const light = new T.DirectionalLight(0xd1dcff, 5); light.position.set(-3, 4, 5); scene.add(light);
      const rim = new T.PointLight(0x315cff, 35); rim.position.set(4, -2, 3); scene.add(rim);
      const dummy = new T.Object3D();
      const dispersed = Array.from({length:64},(_,i)=>new T.Vector3(Math.sin(i * 12.3) * 4.6, Math.cos(i * 6.78) * 3.5, Math.sin(i * 4.13) * 2.8));
      let visible = true, frame = 0, px = 0, py = 0, smx = 0, smy = 0;
      const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;}, {rootMargin:'150px'}); observer.observe(element);
      let lastWidth = 0, lastHeight = 0;
      geometry.computeBoundingSphere();
      const resize = () => {
        const w = element.clientWidth, h = element.clientHeight;
        if (!w || !h || (w === lastWidth && h === lastHeight)) return;
        lastWidth = w; lastHeight = h; renderer.setSize(w,h,false); camera.aspect=w/h;
        if(kind === 'hero' || isCollective || kind === 'venture') {
          // Fit a rotation-invariant bounding sphere to both canvas dimensions.
          const verticalHalfFov = T.MathUtils.degToRad(camera.fov / 2);
          const limitingHalfFov = Math.min(verticalHalfFov, Math.atan(Math.tan(verticalHalfFov)*camera.aspect));
          const radius = kind === 'venture' ? 2.4 : isCollective ? 2.35 : (geometry.boundingSphere?.radius ?? 2.2) + .3;
          camera.position.z = radius / Math.sin(limitingHalfFov) * 1.08;
        }
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize); ro.observe(element); resize();
      const pointer = (event: PointerEvent) => {px = (event.clientX / window.innerWidth - .5) * .3; py = (event.clientY / window.innerHeight - .5) * .2;};
      window.addEventListener('pointermove',pointer,{passive:true});
      const transformSection = document.getElementById(kind === 'venture' ? 'build-with-us' : kind === 'collective' ? 'team-collective' : kind === 'about' ? 'about' : kind === 'portfolio' ? 'other-work' : 'transformation');
      const birth = performance.now();
      let smoothProgress = paused ? 1 : 0;
      const render = (time:number) => {
        frame = requestAnimationFrame(render);
        if (!visible || document.hidden) return;
        smx += ((paused ? 0 : px)-smx)*.035; smy += ((paused ? 0 : py)-smy)*.035;
        const t = paused ? 0 : time * .00016;
        if(kind === 'hero') {
          const scroll = paused ? 0 : Math.min(window.scrollY / window.innerHeight, 1.7);
          group.rotation.set(.2 + t * .22 + smy + scroll * .6, -.45 + t*.34 + smx + scroll*1.8, -.4 + scroll*.55);
          group.position.y = paused ? 0 : Math.sin(t)*.06 - scroll*.1;
          group.scale.setScalar(1);
        } else if(kind === 'venture') {
          const rect=transformSection?.getBoundingClientRect();
          const target=paused ? 1 : Math.max(0,Math.min(1,(window.innerHeight*.8-(rect?.top ?? 0))/(window.innerHeight*.95)));
          smoothProgress+=(target-smoothProgress)*.045;
          const p=smoothProgress*smoothProgress*(3-2*smoothProgress);
          arches.forEach((arch,i)=>{
            const direction=i===0?1:-1;
            arch.position.set(0,direction*(1-p)*.45,direction*(1-p)*.55);
            arch.rotation.set(direction*(1-p)*.55,direction*(1-p)*.7,i*Math.PI);
          });
          accent!.rotation.set((1-p)*Math.PI/2,0,0);
          group.rotation.set(.3+p*.25,-.45+p*.8,-.3+p*.45+(paused?0:Math.sin(t*.4)*.07));
        } else if(isCollective) {
          const rect = transformSection?.getBoundingClientRect();
          const target = paused ? 1 : kind === 'signature' ? Math.min(1,(performance.now()-birth)/1100) : Math.max(0,Math.min(1,(window.innerHeight*.85-(rect?.top ?? 0))/(window.innerHeight*.8)));
          smoothProgress += (target-smoothProgress)*.055;
          const p = smoothProgress*smoothProgress*(3-2*smoothProgress);
          const spread = 1-p;
          petals.forEach((petal,i)=>{
            const angle = i*Math.PI/3;
            const radius = .9 + spread*.65;
            petal.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,spread*Math.sin(i*2.4)*.85);
            petal.rotation.set(.25+spread*Math.sin(i)*.75,.2+spread*Math.cos(i)*.65,angle-.9+spread*.45);
          });
          group.rotation.set(.35+p*.35,-.3+p*.6,-.45+p*.9+(paused?0:t*.2));
          group.scale.setScalar(.9+p*.28);
        } else if(kind === 'portfolio' || kind === 'about') {
          const rect=transformSection?.getBoundingClientRect();
          const p=paused ? 0 : 1-(rect?.top ?? 0)/window.innerHeight;
          group.rotation.set(.4+p*.7+t*.2,p*1.6+t*.25,-.3+p*.4);
          group.children.forEach((ring,i)=>{ring.rotation.x=i*Math.PI/3+p*.5;ring.rotation.y=i*Math.PI/3+p*(i-1)*.7;});
        } else {
          const rect = transformSection?.getBoundingClientRect();
          const p = paused ? 1 : Math.max(0,Math.min(1, -(rect?.top ?? 0) / Math.max(1,(rect?.height ?? 1)-window.innerHeight)));
          const eased = Math.min(1,Math.max(0,p*1.6-.12));
          for(let i=0;i<64;i++) {
            const target=new T.Vector3((i%4-1.5)*.66,(Math.floor(i/4)%4-1.5)*.66,(Math.floor(i/16)-1.5)*.66);
            dummy.position.copy(dispersed[i]).lerp(target,eased);
            dummy.rotation.set((1-eased)*(i*.7+t), (1-eased)*(i*.3+t), (1-eased)*i*.2);
            dummy.updateMatrix();cubes.setMatrixAt(i,dummy.matrix);
          }
          cubes.instanceMatrix.needsUpdate=true;
          group.rotation.set(.3 + p*.4, .45 + p*1.5 + t*.15, .1);
        }
        renderer.render(scene,camera);
      };
      render(0); onReady?.();
      cleanup = () => {cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();window.removeEventListener('pointermove',pointer);geometry.dispose();material.dispose();coreGeometry?.dispose();coreMaterial?.dispose();capGeometry?.dispose();accentGeometry?.dispose();accentMaterial?.dispose();cubes.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
    }).catch(()=> {if(!disposed){element.dataset.fallback='true';onReady?.();}});
    return () => {disposed=true;cleanup();};
  },[kind,paused,onReady]);
  return <div ref={host} className={`three-scene scene-${kind}`} aria-hidden="true"><div className="scene-fallback">{kind==='system'?'✳':'∞'}</div></div>;
}
