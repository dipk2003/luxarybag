/* Shared real-time brand environments. All imagery is mapped onto real geometry;
   human characters are rigged meshes, never cut-out photographs or video planes. */
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from './vendor/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/environments/RoomEnvironment.js';
import { clone as cloneSkeleton } from './vendor/utils/SkeletonUtils.js';
import { gunzipSync } from './vendor/fflate.module.js';

const BASE = new URL('./', import.meta.url);
const people = new Map();
const compact = () => matchMedia('(max-width: 700px)').matches;
const clamp = THREE.MathUtils.clamp;
const blend = THREE.MathUtils.lerp;
const profiles = {
 gym: { title:['Show up for yourself.','Build strength that stays.','Find your people.'], accent:'#d4ff3a', background:'#171b1c', person:'andre', dark:true },
 clinic: { title:['A calmer welcome.','Care, considered.','Leave with confidence.'], accent:'#12a594', background:'#e4ede9', person:'priya' },
 interiors: { title:['Light changes everything.','Details you can feel.','A home, lived in.'], accent:'#c9a24a', background:'#d8d0c3', person:'priya' },
 construction: { title:['An idea worth building.','A clear point of view.','Made for real life.'], accent:'#ff6a13', background:'#dbd4c7', person:'andre' },
 candle: { title:['A moment to slow down.','The care in the craft.','Make yourself at home.'], accent:'#c9a227', background:'#c4a98d', person:'priya' },
 studio: { title:['Ideas begin with people.','A thoughtful direction.','Made to move you.'], accent:'#e6532f', background:'#ddd8ca', person:'andre' },
 batter: { title:['The beginning of a good morning.','A little patience. A lot of care.','Gather around the good stuff.'], accent:'#ec653f', background:'#d5d5bc', person:'priya' },
 saree: { title:['Tradition in every thread.','A fresh point of view.','Find your own expression.'], accent:'#b28459', background:'#d6c8b8', person:'priya' },
 jewellery: { title:['Considered in every detail.','Something personal.','A story you carry.'], accent:'#c8a66d', background:'#ccc0ac', person:'priya' },
 bags: { title:['Beautiful, by design.','Made for your everyday.','Carry your point of view.'], accent:'#c6a37b', background:'#d6c7b6', person:'priya' },
 events: { title:['Begin with a feeling.','Consider every detail.','Make room for your people.'], accent:'#d8ae6b', background:'#d5c7b9', person:'priya' },
};
const aliases = {home:'interiors',interior:'interiors',site:'construction',candles:'candle',fashion:'saree',business:'studio',saas:'studio',jewels:'jewellery',gems:'jewellery',silk:'saree',leather:'bags',luxe:'bags',festive:'events',banquet:'events'};
function personAsset(id) {
 if(!people.has(id)){
  const loader=new GLTFLoader();
  // Use the image-loading path allowed by img-src for embedded model textures.
  // ImageBitmapLoader fetches blob URLs through connect-src, which opaque previews disallow.
  loader.register(parser=>({name:'BRAND_image_textures',beforeRoot(){parser.textureLoader=new THREE.TextureLoader(parser.options.manager);parser.textureLoader.setCrossOrigin(parser.options.crossOrigin);}}));
  const load=async()=>{
   const response=await fetch(new URL('models/'+id+'.glb.gz',BASE));
   if(!response.ok)return loader.loadAsync(new URL('models/'+id+'.glb',BASE).href);
   let bytes=new Uint8Array(await response.arrayBuffer());
   if(bytes[0]===31&&bytes[1]===139){
    if(typeof DecompressionStream!=='undefined'){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));bytes=new Uint8Array(await new Response(stream).arrayBuffer());}
    else bytes=gunzipSync(bytes);
   }
   return loader.parseAsync(bytes.buffer,new URL('models/',BASE).href);
  };
  people.set(id,load().catch(error=>{people.delete(id);throw error;}));
 }
 return people.get(id);
}

function createWorld(kind, renderer, notify) {
 const profile=profiles[kind],scene=new THREE.Scene();let disposed=false;
 scene.background=new THREE.Color(profile.background);scene.fog=new THREE.Fog(profile.background,16,40);
 const root=new THREE.Group();scene.add(root);
 const geometries=new Map(),materials=new Map(),textures=[];
 const geo=(w,h,d,r=.035)=>{const key=[w,h,d,r].join(':');if(!geometries.has(key))geometries.set(key,r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d));return geometries.get(key);};
 const mat=(color,roughness=.7,metalness=0)=>{const key=[color,roughness,metalness].join(':');if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));return materials.get(key);};
 const wood=mat('#a4835f',.78),stone=mat('#c9c3b7',.88),white=mat('#efede5',.72),metal=mat('#494c48',.3,.78),black=mat('#202825',.78),accent=mat(profile.accent,.65);
 const box=(w,h,d,x,y,z,material=white,r=.035)=>{const mesh=new THREE.Mesh(geo(w,h,d,r),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;};
 const cylinder=(radius,height,x,y,z,material=metal,top=radius)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,radius,height,24),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;};
 const sphere=(radius,x,y,z,material)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,18,12),material);mesh.position.set(x,y,z);mesh.castShadow=true;root.add(mesh);return mesh;};
 const floorMaterial=(kind==='gym'?mat('#353735',.98):mat('#f7f3e9',.86).clone());
 const floor=box(16,.16,15,0,-.1,0,floorMaterial,0);floor.receiveShadow=true;
 box(16,4.8,.18,0,2.3,-5,profile.dark?mat('#313633',.94):stone,0);
 box(.18,4.8,9,-7,2.3,-.6,profile.dark?mat('#202623',.92):white,0);
 // Recessed ceiling beams, not a low-poly sky box.
 for(let x=-6;x<=6;x+=3){box(.12,.2,9,x,4.5,-.5,wood);}
 const ceiling=box(16,.12,10,0,4.72,-.5,white,0);ceiling.castShadow=false;
 const sunlight=new THREE.DirectionalLight('#fff3de',profile.dark?2.1:3.1);sunlight.position.set(4.5,7,4);sunlight.castShadow=true;
 sunlight.shadow.mapSize.set(compact()?512:1024,compact()?512:1024);sunlight.shadow.camera.left=-8;sunlight.shadow.camera.right=8;sunlight.shadow.camera.top=7;sunlight.shadow.camera.bottom=-5;sunlight.shadow.normalBias=.035;sunlight.shadow.bias=-.0002;sunlight.shadow.radius=3;sunlight.shadow.camera.far=25;scene.add(sunlight);
 scene.add(new THREE.HemisphereLight('#fff8ed','#a8ac9e',profile.dark?1.3:1.8));
 const fill=new THREE.DirectionalLight('#dce9ff',.8);fill.position.set(-5,3,2);scene.add(fill);
 const environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const environmentTarget=pmrem.fromScene(environment,.02,0.1,25);scene.environment=environmentTarget.texture;scene.environmentIntensity=.32;environment.dispose();pmrem.dispose();
 // Real surface detail, with separate base colour, normal and roughness maps.
 const textureLoader=new THREE.TextureLoader();const applySurface=(material,id,repeat)=>{
  const assignments=[['Diffuse','map'],['nor_gl','normalMap'],['Rough','roughnessMap']];
   for(const [file,slot] of assignments){const texture=textureLoader.load(new URL('textures/'+id+'-'+file+'.webp',BASE).href,notify);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(...repeat);if(slot==='map')texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());material[slot]=texture;textures.push(texture);}
  material.normalScale=new THREE.Vector2(.35,.35);material.needsUpdate=true;
 };
 if(kind!=='gym')applySurface(floorMaterial,'wood_floor_deck',[3,3]);else applySurface(floorMaterial,'concrete_wall_001',[5,5]);
 const wallStone=stone.clone();applySurface(wallStone,'concrete_wall_001',[2,1]);box(5,4.4,.1,-3,2.2,-4.85,wallStone,0);
 // Window recess and mullions give the light a real architectural source.
 const windowMaterial=new THREE.MeshStandardMaterial({color:'#dce8e0',emissive:'#d4e3dc',emissiveIntensity:.3,roughness:.22,metalness:.18});
 box(4.8,3.2,.08,4.2,2.5,-4.85,windowMaterial,0);
 for(const x of [1.8,3.4,5,6.6])box(.045,3.3,.1,x,2.5,-4.75,metal,0);
 box(4.9,.05,.1,4.2,2.5,-4.75,metal,0);
 const furniture=(id,x,z,width,rotation=0)=>{personAsset(id).then(gltf=>{if(disposed)return;const object=gltf.scene.clone(true);const bounds=new THREE.Box3().setFromObject(object);const size=new THREE.Vector3();bounds.getSize(size);object.scale.setScalar(width/Math.max(size.x,size.z));object.position.set(x-bounds.getCenter(new THREE.Vector3()).x*object.scale.x,-bounds.min.y*object.scale.y,z-bounds.getCenter(new THREE.Vector3()).z*object.scale.z);object.rotation.y=rotation;object.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});scene.add(object);notify();}).catch(()=>{});};
 const plant=(x,z)=>furniture('plant',x,z,.85);
 plant(6,-3.7);plant(-5.7,-3.5);
 const lamp=(x,z)=>{cylinder(.022,2.8,x,1.4,z,metal);const shade=new THREE.Mesh(new THREE.ConeGeometry(.48,.25,28,1,true),mat('#d5b786',.42,.65));shade.position.set(x,2.75,z);root.add(shade);const bulb=sphere(.08,x,2.58,z,new THREE.MeshStandardMaterial({color:'#fff1cf',emissive:'#ffdc9a',emissiveIntensity:2}));bulb.castShadow=false;};
 const table=(x,z,width=3,depth=1.2,y=.95)=>{box(width,.1,depth,x,y,z,wood);for(const dx of [-width*.4,width*.4])for(const dz of [-depth*.35,depth*.35])box(.055,y,.055,x+dx,y/2,z+dz,metal);};
 const sofa=(x,z)=>furniture('sofa',x,z,3);
 const rug=new THREE.Mesh(new THREE.PlaneGeometry(5,3.6),mat(profile.dark?'#262a27':'#c9c3b6',1));rug.rotation.x=-Math.PI/2;rug.position.set(0,.001,.2);rug.receiveShadow=true;root.add(rug);

 const personPosition=new THREE.Vector3(2.4,0,-1.6);
 if(kind==='gym'){
  for(const x of [-3,3]){
   for(const dx of [-.55,.55]){box(.1,2.7,.1,x+dx,1.35,-3,metal);box(.1,.12,1.4,x+dx,.08,-3,metal);}
   box(1.3,.08,.08,x,2.65,-3,metal);const bar=cylinder(.025,1.7,x,1.45,-2.85,mat('#aeb4b2',.2,.95));bar.rotation.z=Math.PI/2;
   for(const side of [-1,1]){const plate=cylinder(.27,.12,x+side*.66,1.45,-2.85,black);plate.rotation.z=Math.PI/2;}
   box(.48,.16,1.4,x,.56,-1.5,black,.08);box(.08,.5,.08,x,.25,-1.5,metal);
  }
  for(let i=0;i<8;i++){const x=-4+i*.55;const handle=cylinder(.035,.4,x,.82,1.1,metal);handle.rotation.z=Math.PI/2;for(const sign of [-1,1]){const weight=cylinder(.13,.16,x+sign*.22,.82,1.1,black);weight.rotation.z=Math.PI/2;}}
  box(5,.1,.7,-2,.58,1.1,metal);personPosition.set(1.5,0,-.5);
 }else if(kind==='clinic'){
  box(3,1.05,.85,-2,.525,-2.3,white,.12);box(3.1,.06,1,-2,1.08,-2.3,wood);
  const chair=box(.95,.28,1.55,1.2,.65,.7,mat('#85b8a8',.76),.12);chair.rotation.x=.09;box(.95,.9,.25,1.2,1.15,-.08,mat('#85b8a8',.76),.12).rotation.x=-.3;
  cylinder(.24,.65,1.2,.32,.6,metal);box(.9,.08,.8,1.2,.08,.6,white);sofa(-4.5,.9);personPosition.set(-.2,0,-1.9);
 }else if(kind==='construction'){
  table(0,.3,3.8,2.4,.8);const concrete=mat('#b9b5aa',.9);
  for(let floorIndex=0;floorIndex<3;floorIndex++){const y=.94+floorIndex*.42;box(2.8,.045,1.7,0,y,.3,concrete,0);for(const x of [-1.25,0,1.25])for(const z of [-.4,.95])box(.06,.42,.06,x,y+.2,z,white,0);}
  box(3.2,.018,2,0,.87,.3,white,0);personPosition.set(2.5,0,-1.7);
 }else if(kind==='candle'||kind==='batter'){
  table(-.3,0,4.6,1.4,1.05);box(5,1.1,.8,0,.55,-3.7,white);box(5.1,.06,.92,0,1.13,-3.7,wood);
  for(let i=0;i<4;i++){box(1.1,1,.08,-1.9+i*1.25,1.8,-4.6,wood);}
  if(kind==='candle'){
   const glass=new THREE.MeshPhysicalMaterial({color:'#b97d43',roughness:.23,metalness:.05,transparent:true,opacity:.58,transmission:compact()?0:.25,thickness:.1});materials.set('glass',glass);
   for(let i=0;i<7;i++){const x=-1.9+(i%4)*.8,z=-.35+Math.floor(i/4)*.58;cylinder(.18,.44,x,1.33,z,glass);cylinder(.155,.31,x,1.31,z,mat('#efe1c8',.86));cylinder(.008,.04,x,1.49,z,black);}
  }else{
   cylinder(.47,.07,-.8,1.14,.1,black);box(.75,.04,.08,-.05,1.15,.1,wood);cylinder(.39,.018,-.8,1.19,.1,mat('#e1c18a',.98));
   for(let i=0;i<4;i++){const idli=sphere(.12,.5+(i%2)*.27,1.2,-.2+Math.floor(i/2)*.25,mat('#f4efdf',.92));idli.scale.y=.48;}
   cylinder(.33,.04,.65,1.12,-.08,white);cylinder(.3,.48,1.7,1.35,-.15,metal);box(.5,.06,.48,1.7,1.62,-.15,black);
  }
  personPosition.set(.7,0,-1.5);
 }else if(['saree','jewellery','bags','events'].includes(kind)){
  table(-1.2,.5,2.8,1.2,.85);box(4,.15,.5,0,2.8,-3.9,wood);
  if(kind==='saree')for(let i=0;i<7;i++){const textile=box(.38,1.3,.045,-2+i*.6,1.9,-3.9,mat(['#9e4e3e','#b69c6d','#3a6253','#b4a191'][i%4],.95),.015);textile.rotation.z=.02*Math.sin(i);}
  if(kind==='jewellery')for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.028,12,40),mat('#c4a25d',.16,.92));ring.position.set(-2+i*.8,1.15,.5);ring.rotation.x=-.2;root.add(ring);box(.5,.08,.45,-2+i*.8,.94,.5,mat('#e5ded0',.96));}
  if(kind==='bags')for(let i=0;i<3;i++){const leather=mat(['#865844','#334638','#bb9573'][i],.62);box(.55,.48,.2,-2+i*.85,1.15,.5,leather,.08);const handle=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,8,28,Math.PI),leather);handle.position.set(-2+i*.85,1.42,.5);root.add(handle);}
  if(kind==='events'){cylinder(1.1,.12,-1.1,.86,.8,white);for(let i=0;i<6;i++){const a=i*Math.PI/3;box(.42,.1,.42,-1.1+Math.cos(a)*1.35,.5,.8+Math.sin(a)*1.35,wood);box(.42,.55,.08,-1.1+Math.cos(a)*1.35,.8,.8+Math.sin(a)*1.35,wood);}cylinder(.14,.38,-1.1,1.1,.8,white);for(let i=0;i<6;i++)sphere(.09,-1.1+Math.cos(i)*.17,1.4+Math.sin(i)*.1,.8+Math.sin(i)*.17,mat('#e6d7bc',.85));}
  personPosition.set(2,0,-1.4);
 }else{
  sofa(-2,-2);furniture('chair',1.5,1.3,.85,-.7);table(-1,.3,2.3,1.1,.48);lamp(-4,-2.5);
  box(.3,.04,.42,-1.2,.57,.25,accent,.015);box(.26,.035,.36,-1.15,.6,.26,white,.015);
  if(kind==='studio'){table(3,-2,2.5,1.2,.9);box(.8,.015,.5,3,.97,-2,metal,.01);box(.8,.55,.025,3,1.24,-2.22,black,.015).rotation.x=-.1;box(.72,.44,.01,3,1.24,-2.19,new THREE.MeshStandardMaterial({color:'#dde3d4',emissive:'#b7c6af',emissiveIntensity:.25}));}
  personPosition.set(2,0,-1.15);
 }
 let actor=null,mixer=null;
 const humanReady=personAsset(profile.person).then(gltf=>{
  if(disposed)return;actor=cloneSkeleton(gltf.scene);const bounds=new THREE.Box3().setFromObject(actor),height=bounds.max.y-bounds.min.y;actor.scale.setScalar(1.72/height);actor.position.copy(personPosition);actor.position.y-=bounds.min.y*(1.72/height);actor.rotation.y=-.2;
  actor.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;if(node.material){const list=Array.isArray(node.material)?node.material:[node.material];list.forEach(material=>{material.envMapIntensity=.35;});}}});
  scene.add(actor);mixer=new THREE.AnimationMixer(actor);const clip=gltf.animations.find(a=>a.name==='Idle')||gltf.animations[0];if(clip)mixer.clipAction(clip).play();return actor;
 }).catch(()=>null);
 return {scene,root,profile,humanReady,focus:personPosition,update(delta,time){mixer?.update(Math.min(delta,.05));if(actor)actor.rotation.y=-.2+Math.sin(time*.12)*.055;},dispose(){disposed=true;mixer?.stopAllAction();environmentTarget.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

export function mountWorld(host, kind, options={}) {
 kind=aliases[kind]||kind;if(!profiles[kind]||host.dataset.worldMounted)return;host.dataset.worldMounted='true';
 const hero=options.hero===true,reduced=matchMedia('(prefers-reduced-motion: reduce)'),profile=profiles[kind];
 host.classList.add(hero?'brand-world-hero':'brand-world-story');host.style.setProperty('--scene-accent',profile.accent);
 const stage=document.createElement('div');stage.className='brand-world-stage';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Interactive 3D '+kind+' environment');canvas.setAttribute('role','img');stage.appendChild(canvas);host.appendChild(stage);
 let caption,number,progressBar;
 if(!hero){const copy=document.createElement('div');copy.className='brand-world-caption';const eyebrow=document.createElement('p');eyebrow.textContent='A CLOSER LOOK / ';number=document.createElement('span');number.textContent='01';eyebrow.appendChild(number);caption=document.createElement('h2');caption.textContent=profile.title[0];const line=document.createElement('span');line.className='brand-world-progress';progressBar=document.createElement('i');line.appendChild(progressBar);copy.append(eyebrow,caption,line);stage.appendChild(copy);}
 const status=document.createElement('span');status.className='brand-world-status';status.textContent='Preparing the space…';stage.appendChild(status);
 let renderer,world,frame=0,visible=false,last=0,elapsed=0,pointerX=0,pointerY=0,current=0,target=0,disposed=false;
 const camera=new THREE.PerspectiveCamera(40,1,.1,60);const lookAt=new THREE.Vector3();
 function positionCamera(progress){const mobile=compact();const phase=hero ? .18+progress*.55 : progress;
  const x=blend(4.4,1.1,phase),z=blend(6.5,4.6,phase);camera.position.set(x+pointerX*.16,mobile?2:2.05+Math.sin(phase*Math.PI)*.18,z+(mobile?.8:0));lookAt.set(mobile?world.focus.x-.25:.25+phase*.4,mobile?1:1.15,mobile?world.focus.z+.4:blend(-1.2,-.3,phase));lookAt.x+=pointerX*.06;lookAt.y+=pointerY*.04;camera.lookAt(lookAt);
 }
 function resize(){if(!renderer)return;const rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,compact()?1.15:1.6));renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.fov=compact()?47:40;camera.updateProjectionMatrix();positionCamera(current);}
 function progress(){if(hero){target=clamp(-host.getBoundingClientRect().top/innerHeight,0,1);return;}const bounds=host.getBoundingClientRect();target=clamp(-bounds.top/Math.max(1,bounds.height-innerHeight),0,1);}
 function render(time){frame=0;if(!visible||document.hidden||disposed)return;const minFrame=1000/(compact()?24:40);if(time-last<minFrame){frame=requestAnimationFrame(render);return;}const delta=last?Math.min((time-last)/1000,.25):.016;last=time;elapsed+=delta;current+=((reduced.matches?0:target)-current)*(1-Math.exp(-delta*8));positionCamera(current);world.update(reduced.matches?0:delta,elapsed,current);renderer.render(world.scene,camera);if(!host.classList.contains('world-ready')){host.classList.add('world-ready');status.textContent='3D EXPERIENCE';}if(caption){const index=Math.min(2,Math.floor((reduced.matches?0:target)*3));caption.textContent=profile.title[index];number.textContent='0'+(index+1);progressBar.style.transform='scaleX('+current+')';}if(!reduced.matches)frame=requestAnimationFrame(render);}
 async function initialize(){
  if(renderer||disposed)return;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:!compact(),alpha:false,powerPreference:'low-power'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;world=createWorld(kind,renderer,()=>{if(visible&&!disposed&&!frame)frame=requestAnimationFrame(render);});resize();progress();if(visible)frame=requestAnimationFrame(render);world.humanReady.then(actor=>{if(disposed)return;host.dataset.humanReady=actor?'true':'false';if(reduced.matches&&visible)frame=requestAnimationFrame(render);});}catch{host.classList.add('world-fallback');status.textContent='Explore the collection below';}}
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){initialize();if(renderer&&world&&!frame)frame=requestAnimationFrame(render);}else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:hero?'100px':'-24px 0px'});observer.observe(host);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
 const onScroll=()=>{progress();if(reduced.matches&&visible&&renderer&&!frame)frame=requestAnimationFrame(render);};addEventListener('scroll',onScroll,{passive:true});
 const onPointer=event=>{if(reduced.matches||event.pointerType!=='mouse')return;const b=host.getBoundingClientRect();pointerX=clamp((event.clientX-b.left)/b.width-.5,-.5,.5);pointerY=clamp((event.clientY-b.top)/Math.min(b.height,innerHeight)-.5,-.5,.5);};host.addEventListener('pointermove',onPointer,{passive:true});
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else if(visible&&renderer&&!frame)frame=requestAnimationFrame(render);};document.addEventListener('visibilitychange',visibility);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);host.classList.add('world-fallback');status.textContent='Explore the collection below';});
 return {dispose(){disposed=true;observer.disconnect();resizeObserver.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',onScroll);host.removeEventListener('pointermove',onPointer);document.removeEventListener('visibilitychange',visibility);world?.dispose();renderer?.dispose();stage.remove();delete host.dataset.worldMounted;delete host.dataset.humanReady;host.classList.remove('world-ready','world-fallback');}};
}
