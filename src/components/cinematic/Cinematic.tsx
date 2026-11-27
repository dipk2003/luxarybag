// @ts-nocheck
'use client';
import {useEffect,useRef} from 'react';
function loadWorld(){if(!document.getElementById('brand-world-css')){const link=document.createElement('link');link.id='brand-world-css';link.rel='stylesheet';link.href='/_scene/world.css';document.head.appendChild(link);}const url='/_scene/brand-world.js';return import(/* webpackIgnore: true */ /* @vite-ignore */ url);}
export function CinematicScene({preset='silk',className=''}){const ref=useRef(null);useEffect(()=>{let handle,cancelled=false;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;observer.disconnect();loadWorld().then(({mountWorld})=>{if(!cancelled&&ref.current)handle=mountWorld(ref.current,preset,{hero:true});});},{rootMargin:'100px'});if(ref.current)observer.observe(ref.current);return()=>{cancelled=true;observer.disconnect();handle?.dispose();};},[preset]);return <div ref={ref} className={'brand-hero-surface pointer-events-none '+className} style={{position:'absolute',inset:0,zIndex:1,minHeight:0,borderRadius:0}}/>;}
export function CinematicMotion(){return null;}
