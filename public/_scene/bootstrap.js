const source = new URL('./brand-world.js', import.meta.url);
let runtime;
const engine = () => runtime || (runtime=import(source.href));
const mounts = new WeakMap();
window.CineStory={mountStory(_three,section,kind,options={}){
 if(!section||mounts.has(section))return mounts.get(section);
 let disposed=false,controller;
 const handle={dispose(){disposed=true;controller?.dispose();mounts.delete(section);}};mounts.set(section,handle);
 section.classList.remove('cine-real-story');section.innerHTML='';
 engine().then(({mountWorld})=>{if(!disposed)controller=mountWorld(section,kind,options);}).catch(()=>section.classList.add('world-fallback'));
 return handle;
}};
function start(){
 document.querySelectorAll('[data-story]').forEach(section=>window.CineStory.mountStory(null,section,section.dataset.story));
 document.querySelectorAll('[data-brand-world]').forEach(host=>engine().then(({mountWorld})=>mountWorld(host,host.dataset.brandWorld,{hero:true})));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
