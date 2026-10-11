import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import PixelCharacter, {type CharacterMotion,type Facing} from './PixelCharacter';
import type {World,EntryPoint} from './worlds';
export default function WorldScene({world,from,reduced,registrationHref,onBack}:{world:World;from:EntryPoint;reduced:boolean;registrationHref:string;onBack:()=>void}){
 const canvas=useRef<HTMLDivElement>(null),point=useRef({x:50,y:84}),alive=useRef(true),lock=useRef(true);
 const actor=useAnimationControls();const [mode,setMode]=useState<CharacterMotion>('land'),[facing,setFacing]=useState<Facing>('back'),[ready,setReady]=useState(false),[walking,setWalking]=useState(false),[entered,setEntered]=useState(false),[marker,setMarker]=useState<{x:number;y:number}|null>(null);
 const [size,setSize]=useState({w:1280,h:720});
 const imageRef=useRef<HTMLImageElement>(null);
 const src=`/scenes/${world.key}.png`;
 function project(x:number,y:number){const iw=imageRef.current?.naturalWidth||1672,ih=imageRef.current?.naturalHeight||941;const scale=Math.max(size.w/iw,size.h/ih);return {x:(x/100*iw*scale-(iw*scale-size.w)/2)/size.w*100,y:(y/100*ih*scale-(ih*scale-size.h)/2)/size.h*100};}
 const goal=project(world.doorX,world.door);
 useEffect(()=>{const c=canvas.current;if(!c)return;const observer=new ResizeObserver(()=>setSize({w:c.clientWidth,h:c.clientHeight}));observer.observe(c);return()=>observer.disconnect();},[]);
 useEffect(()=>{alive.current=true;actor.start({left:'50%',top:'84%',scale:1,transition:{duration:reduced?0:.75,ease:[.22,1,.36,1]}}).then(()=>{if(!alive.current)return;setMode('idle');setReady(true);lock.current=false;});return()=>{alive.current=false;actor.stop();};},[actor,reduced]);
 async function walkTo(x:number,y:number,enter=false){
  if(lock.current||entered)return;lock.current=true;setWalking(true);setMode('walk');setMarker({x,y});
  const start=point.current,dx=x-start.x,dy=y-start.y;
  setFacing(Math.abs(dx)>Math.abs(dy)*1.6?(dx>0?'right':'left'):dy>1?'front':'back');
  const b=canvas.current?.getBoundingClientRect();const distance=Math.hypot(dx*(b?.width??1280)/100,dy*(b?.height??720)/100);
  const scale=Math.max(.68,Math.min(1.15,.68+(y-goal.y)*.019));
  await actor.start({left:`${x}%`,top:`${y}%`,scale,transition:{duration:reduced?0:Math.max(1.1,Math.min(3.3,distance/115)),ease:'linear'}});
  if(!alive.current)return;point.current={x,y};setMode('idle');setWalking(false);setMarker(null);lock.current=false;
  if(enter){setFacing('back');setEntered(true);}
 }
 function groundClick(e:React.MouseEvent<HTMLButtonElement>){const b=canvas.current?.getBoundingClientRect();if(!b)return;let y=e.detail===0?85:(e.clientY-b.top)/b.height*100;y=Math.max(goal.y+1,Math.min(93,y));const half=6+(y-goal.y)*.8;let x=e.detail===0?50:(e.clientX-b.left)/b.width*100;x=Math.max(goal.x-half,Math.min(goal.x+half,x));void walkTo(x,y);}
 return <section className="full-scene" data-world={world.key} aria-label={`Остров: ${world.name}`}>
  <div className="scene-canvas" ref={canvas}>
   <motion.img ref={imageRef} src={src} className="scene-environment" alt="" aria-hidden="true" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:reduced?0:.45}}/>
   <div className="scene-top-wash"/>
   <header className="scene-header"><a className="scene-brand" href="#main" onClick={e=>{e.preventDefault();if(!walking&&ready)onBack();}}>ventorme</a><span className="scene-breadcrumb">Карта <span>→</span> {world.name}</span><button onClick={onBack} disabled={!ready||walking}>← Карта островов</button></header>
   <motion.div className="scene-title" initial={{opacity:0,y:12}} animate={{opacity:entered?0:1,y:0}} transition={{duration:reduced?0:.4,delay:reduced?0:.25}} aria-hidden={entered}><h1>{world.title}</h1><p>Твой путь начинается здесь</p></motion.div>
   <button className="scene-ground" style={{clipPath:`polygon(${goal.x-6}% ${goal.y}%,${goal.x+6}% ${goal.y}%,88% 96%,12% 96%)`}} onClick={groundClick} disabled={!ready||walking||entered} aria-label="Пройти по дорожке"/>
   {!entered&&<button className="scene-entry" style={{left:`${goal.x}%`,top:`${goal.y-10}%`}} onClick={()=>void walkTo(goal.x,goal.y,true)} disabled={!ready||walking}>{walking?'Идём…':world.entry}<span>⌄</span></button>}
   <div className="scene-door-ring" style={{left:`${goal.x}%`,top:`${goal.y}%`}} aria-hidden="true"/>
   {marker&&<div className="walk-marker" style={{left:`${marker.x}%`,top:`${marker.y}%`}} aria-hidden="true"/>}
   <motion.div className="actor-anchor scene-actor" animate={actor} initial={{left:`${from.x}%`,top:`${from.y}%`,scale:from.scale}} style={{transformOrigin:'0 0'}} aria-hidden="true">
    <div className="actor-shadow"/><div className="actor-body"><PixelCharacter mode={mode} facing={facing} reduced={reduced}/></div>
   </motion.div>
   <p className="scene-help" role="status"><span>⌖</span>{!ready?'Ты на острове':walking?'Герой идёт к выбранной точке':entered?'Ты у входа. Продолжи свой путь в Ventorme':'Нажми на вход или на дорожку — герой подойдёт'}</p>
   {entered&&<motion.div className="entry-panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.3}} role="dialog" aria-modal="false" aria-label={world.name}>
    <button className="entry-close" aria-label="Вернуться во двор" onClick={()=>setEntered(false)}>×</button><span className="entry-kicker">VENTORME / {world.name.toUpperCase()}</span><h2>{world.action}</h2><p>{world.copy}</p><a className="pixel-primary" href={registrationHref}>{world.cta}<span>↗</span></a><small>Продолжить на платформе Ventorme</small>
   </motion.div>}
  </div>
 </section>;
}
