import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// One context, moved between the decorative hero and the accessible inspector.
export async function create(host, url, onStatus, onLost) {
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<761?1.35:1.75));
 renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const canvas=renderer.domElement;canvas.setAttribute('aria-label','Honda PCX üç boyutlu model');canvas.setAttribute('role','img');host.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.01,100);
 const ambient=new THREE.HemisphereLight(0xffffff,0x85917a,2.5);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xfff0dc,3);key.position.set(3,5,4);scene.add(key);
 const rim=new THREE.DirectionalLight(0xddefff,2);rim.position.set(-4,3,-3);scene.add(rim);
 const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);
 scene.environment=environment.texture;room.dispose();pmrem.dispose();
 const controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.enableDamping=false;controls.enabled=false;controls.minDistance=2.1;controls.maxDistance=14;controls.minPolarAngle=.2;controls.maxPolarAngle=Math.PI*.51;
 let disposed=false,modal=false,active=true,raf=0,spin=false,lastTime=0,progress=0,model,corners=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function render(now){raf=0;if(disposed||!active||document.hidden)return;const r=host.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return;
  if(spin&&modal&&!reduced.matches&&window.PCXStore?.get().settings.motion!==false){const dt=Math.min((now-lastTime)/1000,.05);const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),dt*.3);camera.position.copy(controls.target).add(offset);camera.lookAt(controls.target);raf=requestAnimationFrame(render);}lastTime=now;renderer.render(scene,camera);
 }
 function draw(){if(!raf&&!disposed&&active&&!document.hidden)raf=requestAnimationFrame(render);}
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(!modal)hero(progress);else angle(Math.atan2(camera.position.x,camera.position.z)||2.6);draw();}
 function angle(a){
  const direction=new THREE.Vector3(Math.sin(a),.24,Math.cos(a)).normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize(),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  let distance=3;for(const c of corners)distance=Math.max(distance,c.dot(direction)+Math.abs(c.dot(right))/(tan*camera.aspect),c.dot(direction)+Math.abs(c.dot(up))/tan);
  camera.position.copy(direction.multiplyScalar(distance*(modal?1.16:1.12)));controls.target.set(0,0,0);camera.lookAt(controls.target);controls.update();draw();
 }
 function hero(p){progress=p;if(modal)return;angle(2.6+p*Math.PI*1.8);}
 function stop(){spin=false;cancelAnimationFrame(raf);raf=0;draw();}
 const ro=new ResizeObserver(resize);ro.observe(host);
 const io=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)draw();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'50px'});io.observe(host);
 function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else draw();}
 document.addEventListener('visibilitychange',visibility);controls.addEventListener('change',draw);
 controls.addEventListener('start',()=>{stop();host.dispatchEvent(new CustomEvent('pcx:manual-orbit',{bubbles:true}));});
 function lost(e){e.preventDefault();dispose();onLost();}canvas.addEventListener('webglcontextlost',lost);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);controls.dispose();const textures=new Set(),materials=new Set(),geometries=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());environment.dispose();renderer.dispose();canvas.remove();}
 try {
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);let data;
  try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Model indirilemedi.');data=await response.arrayBuffer();}finally{clearTimeout(timeout);}
  onStatus('Işıklar hazırlanıyor…');const gltf=await loader.parseAsync(data,new URL('.',url).href);model=gltf.scene;scene.add(model);
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=2.8/Math.max(size.x,size.y,size.z);
  model.scale.multiplyScalar(scale);model.position.addScaledVector(center,-scale);
  model.updateMatrixWorld(true);model.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position,step=Math.max(1,Math.ceil(positions.count/250));for(let i=0;i<positions.count;i+=step)corners.push(new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld));});
  // Keep source materials. Lower-cost transparent glass replaces transmission buffers.
  model.traverse(o=>{if(o.isMesh){for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(m.transmission>0){m.transmission=0;m.transparent=true;m.opacity=.36;m.depthWrite=false;}m.envMapIntensity=1;}}});
  resize();return {
   move(next,inspect){stop();ro.unobserve(host);io.unobserve(host);host=next;host.append(canvas);modal=inspect;controls.enabled=inspect;canvas.style.touchAction=inspect?'none':'pan-y';active=true;ro.observe(host);io.observe(host);resize();if(inspect)angle(2.6);else hero(progress);},
   hero,resize,dispose,
   preset(name){stop();const values={front:Math.PI/2,side:Math.PI,rear:-Math.PI/2,detail:2.4};angle(values[name]??2.6);if(name==='detail'){camera.position.multiplyScalar(.65);controls.target.set(0,.3,0);camera.lookAt(controls.target);draw();}},
   zoom(amount){stop();const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*amount,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);camera.lookAt(controls.target);draw();},
   light(night){renderer.toneMappingExposure=night?.95:1.25;key.color.set(night?0xb3caff:0xfff0dc);draw();},
   spin(value){spin=value&&!reduced.matches;lastTime=performance.now();draw();},stop
  };
 }catch(error){dispose();throw error;}
}
