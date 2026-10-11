import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import {worldArt,homeArt} from './islands';
import {CampusFlag} from './scenery';
import PixelCharacter,{type CharacterMotion} from './PixelCharacter';
import WorldScene from './WorldScene';
import {worlds,type EntryPoint} from './worlds';
import './pixel.css';
type Point={x:number;y:number};
type Phase='overview'|'crouching'|'jumping'|'landing'|'opening'|'scene'|'returning';
function Arrow(){return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>;}
export default function PixelLanding({registrationHref}:{registrationHref:string}){
 const [view,setView]=useState<'map'|'scene'>('map'),[phase,setPhase]=useState<Phase>('overview'),[active,setActive]=useState<number|null>(null),[ready,setReady]=useState(false),[quiet,setQuiet]=useState(false),[mode,setMode]=useState<CharacterMotion>('idle'),[from,setFrom]=useState<EntryPoint>({x:50,y:84,scale:.4});
 const cameraRef=useRef<HTMLDivElement>(null),stageRef=useRef<HTMLDivElement>(null),point=useRef<Point>({x:40,y:59}),location=useRef<number|'home'>('home'),alive=useRef(true),sequence=useRef(0),lock=useRef(false),returning=useRef(false);
 const player=useAnimationControls(),camera=useAnimationControls();const systemReduced=useReducedMotion(),reduced=!!systemReduced||quiet;
 const busy=phase!=='overview';
 function valid(token:number){return alive.current&&sequence.current===token;}
 function wait(ms:number){return new Promise<void>(resolve=>setTimeout(resolve,reduced?0:ms));}
 function surface(id:number|'home'):Point{
  const c=cameraRef.current,b=c?.querySelector<HTMLElement>(`[data-island="${id}"]`)?.getBoundingClientRect(),frame=c?.getBoundingClientRect();if(!b||!frame)return point.current;
  const a=id==='home'?[52,21]:worlds[id].anchor;return{x:(b.left-frame.left+b.width*a[0]/100)/frame.width*100,y:(b.top-frame.top+b.height*a[1]/100)/frame.height*100};
 }
 async function jump(end:Point,token:number){
  const start=point.current;setPhase('crouching');setMode('crouch');await wait(290);if(!valid(token))return;
  setMode('push');await wait(130);if(!valid(token))return;setPhase('jumping');setMode('air');
  const duration=reduced?0:.95;const minArc=((cameraRef.current?.querySelector<HTMLElement>('.actor-body')?.getBoundingClientRect().height??54)+4)/(cameraRef.current?.clientHeight??560)*100;const apex=Math.max(minArc,Math.min(start.y,end.y)-19);
  // X keeps its speed while Y follows the ballistic rise and fall.
  const flight=player.start({left:[`${start.x}%`,`${end.x}%`],top:[`${start.y}%`,`${apex}%`,`${end.y}%`],transition:{left:{duration,ease:'linear'},top:{duration,times:[0,.49,1],ease:['easeOut','easeIn']}}});
  await wait(710);if(!valid(token))return;setMode('fall');await flight;if(!valid(token))return;
  point.current=end;setPhase('landing');setMode('land');await wait(500);if(!valid(token))return;setMode('idle');
 }
 async function choose(i:number){
  if(lock.current||view!=='map'||!ready)return;lock.current=true;const token=++sequence.current;setActive(i);
  const preload=new Image();preload.src=`/scenes/${worlds[i].key}.png`;const loaded=preload.decode().catch(()=>undefined);
  if(window.innerWidth<=760){stageRef.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});await wait(250);}
  await jump(surface(i),token);if(!valid(token))return;location.current=i;setPhase('opening');
  const c=cameraRef.current,d=surface(i);if(c){const scale=1.3;await camera.start({scale,x:c.clientWidth*(.6-scale*d.x/100),y:c.clientHeight*(.58-scale*d.y/100),transition:{duration:reduced?0:.32,ease:[.22,1,.36,1]}});}
  await loaded;if(!valid(token))return;
  const b=cameraRef.current?.querySelector<HTMLElement>('.actor-body')?.getBoundingClientRect();
  setFrom(b?{x:(b.left+b.width/2)/window.innerWidth*100,y:b.bottom/window.innerHeight*100,scale:b.height/100}:{x:50,y:84,scale:.4});
  window.scrollTo({top:0,behavior:'instant'});setView('scene');setPhase('scene');lock.current=false;
 }
 function leaveScene(){if(lock.current)return;lock.current=true;++sequence.current;returning.current=true;setReady(true);setPhase('returning');setView('map');setMode('idle');}
 useEffect(()=>{alive.current=true;try{setQuiet(localStorage.getItem('vp:motion')==='reduced');}catch{}return()=>{alive.current=false;++sequence.current;player.stop();camera.stop();};},[player,camera]);
 useEffect(()=>{
  if(view!=='map')return;const frame=cameraRef.current;if(!frame)return;camera.set({scale:1,x:0,y:0});let raf=0,cancelled=false;
  const place=()=>{if(cancelled)return;const p=surface(location.current);point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`});setReady(true);};
  raf=requestAnimationFrame(()=>{place();if(returning.current){returning.current=false;requestAnimationFrame(()=>requestAnimationFrame(async()=>{const token=sequence.current;await jump(surface('home'),token);if(!valid(token)||cancelled)return;location.current='home';setActive(null);setPhase('overview');setMode('idle');lock.current=false;}));}});
  const observer=new ResizeObserver(()=>{if(lock.current)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(place);});observer.observe(frame);
  return()=>{cancelled=true;cancelAnimationFrame(raf);observer.disconnect();};
 },[view]);
 function toggle(){const next=!quiet;setQuiet(next);try{localStorage.setItem('vp:motion',next?'reduced':'full');}catch{}}
 if(view==='scene'&&active!==null)return <div className={`pixel-landing ${reduced?'quiet':''}`} data-phase="scene"><main id="main"><WorldScene world={worlds[active]} from={from} reduced={reduced} registrationHref={registrationHref} onBack={leaveScene}/></main></div>;
 return <div className={`pixel-landing ${reduced?'quiet':''}`} data-phase={phase}>
  <div className="sky" aria-hidden="true"/><header className="pixel-header"><a className="pixel-brand" href="#main">VENTORME</a><nav aria-label="Основная навигация"><button className="nav-link" onClick={()=>void choose(1)} disabled={busy}>Исследовать мир</button><button className="motion-toggle" onClick={toggle} disabled={busy} aria-pressed={quiet} aria-label={quiet?'Включить анимации':'Уменьшить движение'}>{quiet?'▷':'Ⅱ'}</button></nav></header>
  <main id="main"><section className="world-journey" aria-label="Исследуй возможности Ventorme"><div className="world-sticky">
   <div className="hero-copy"><h1>Куда поступать?<br/><span>Начнём с тебя.</span></h1><p className="hero-description">Ventorme — твой ИИ-помощник: выбрать направление и вуз, подготовиться к экзаменам и спланировать поступление.</p><div className="hero-actions"><a className="pixel-primary" href={registrationHref}>Начать бесплатно <Arrow/></a><button className="pixel-text-button" onClick={()=>void choose(1)} disabled={busy}>Исследовать острова <span>↗</span></button></div></div>
   <div className="world-stage" ref={stageRef}><motion.div className="world-camera" ref={cameraRef} animate={camera} initial={{scale:1,x:0,y:0}}>
    <div className="home-island" data-island="home"><svg viewBox="0 0 304 306" className="home-art" aria-hidden="true" shapeRendering="crispEdges" dangerouslySetInnerHTML={{__html:homeArt}}/><span className="home-label">Ты здесь</span></div>
    {worlds.map((w,i)=><div className={`island island-${i}`} data-island={i} key={w.key} style={{left:`${w.x}%`,top:`${w.y}%`,width:`${w.w}%`}}><button className="island-select" onClick={()=>void choose(i)} disabled={busy||!ready} aria-label={`${w.action}. Посетить остров`}><svg viewBox="0 0 304 306" className={`island-art art-${i}`} aria-hidden="true" shapeRendering="crispEdges"><g dangerouslySetInnerHTML={{__html:worldArt[i]}}/>{i===1&&<CampusFlag/>}</svg><span className="island-label">{w.name}<span>↗</span></span></button></div>)}
    {ready&&<motion.div className={`actor-anchor map-actor ${phase==='jumping'?'in-air':''} ${phase==='landing'?'landed':''}`} animate={player} initial={{left:`${point.current.x}%`,top:`${point.current.y}%`}} aria-hidden="true"><div className="actor-shadow"/><div className="actor-body"><PixelCharacter mode={mode} reduced={reduced}/></div><div className="landing-ring"/><div className="landing-dust">{[0,1,2,3].map(i=><i key={i}/>)}</div></motion.div>}
   </motion.div><p className="journey-status" role="status">{phase==='crouching'?'Готовимся к прыжку…':phase==='jumping'?'Прыжок…':phase==='landing'?'Приземление':phase==='opening'?'Открываем остров…':phase==='returning'?'Возвращаемся':'Нажми на остров — начнём путешествие'}</p></div>
  </div></section></main><footer className="pixel-footer"><span>VENTORME</span><p>Твой следующий шаг начинается с тебя.</p><a href="https://ventorme.ai/" target="_blank" rel="noopener noreferrer">О платформе ↗</a></footer>
 </div>;
}
