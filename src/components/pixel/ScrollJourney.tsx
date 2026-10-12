import {useEffect,useRef,useState} from 'react';
import {useReducedMotion} from 'motion/react';
import HeroSprite from './HeroSprite';
import {ScrollGestureGate} from './journeyInput';
import NativeStation from './NativeStation';
import {JourneyPlayback,introFrame,renderLocations,requestedScene} from './journeyPlayback';
import {locations,sceneStart,FINAL_START,JOURNEY_END,INTRO_END,ease,lerp,clamp,type JourneyFrame} from './journeyModel';
import './journey.css';

export default function ScrollJourney({registrationHref}:{registrationHref:string}){
 const root=useRef<HTMLElement>(null),[travel,setTravel]=useState(0),[size,setSize]=useState({w:1280,h:800}),[quiet,setQuiet]=useState(false),[ready,setReady]=useState(false),[headerOffset,setHeaderOffset]=useState(0);
 const systemQuiet=useReducedMotion(),reduced=quiet||!!systemQuiet;
 const target=useRef(0),smoothInput=useRef(0),viewport=useRef(size),playback=useRef(new JourneyPlayback());
 const furthest=useRef(0),freezeAt=useRef(0),navigationUntil=useRef(0),gesture=useRef(new ScrollGestureGate());
 const [frame,setFrame]=useState<JourneyFrame>(()=>introFrame(0,1280,800));
 // Keep the running state while applying updated geometry during local hot reloads.
 if(import.meta.env.DEV&&!(playback.current instanceof JourneyPlayback)){
  playback.current=Object.assign(new JourneyPlayback(),playback.current);
 }
 useEffect(()=>{try{setQuiet(localStorage.getItem('vp:motion')==='reduced');}catch{}},[]);
 useEffect(()=>{
  let raf=0,previous=performance.now();
  const update=()=>{const element=root.current;if(!element){setHeaderOffset(0);return;}viewport.current={w:innerWidth,h:innerHeight};setSize(viewport.current);const rect=element.getBoundingClientRect();setHeaderOffset(Math.min(0,rect.bottom-innerHeight));const start=rect.top+scrollY,distance=Math.max(1,element.offsetHeight-innerHeight),raw=clamp((scrollY-start)/distance)*JOURNEY_END;
   if(performance.now()>navigationUntil.current&&playback.current.isBusy()&&Math.abs(scrollY-freezeAt.current)>2){window.scrollTo({top:freezeAt.current,behavior:'instant'});return;}
   if(performance.now()>navigationUntil.current&&!playback.current.isBusy()&&requestedScene(raw)>playback.current.active+1){go(sceneStart(playback.current.active+1)+.36);return;}
   freezeAt.current=scrollY;target.current=raw;};
  const loop=(now:number)=>{const dt=Math.min(.08,(now-previous)/1000);previous=now;smoothInput.current=lerp(smoothInput.current,target.current,1-Math.exp(-dt/.08));if(Math.abs(target.current-smoothInput.current)<.0001)smoothInput.current=target.current;setTravel(smoothInput.current);const next=playback.current.update(smoothInput.current,dt,viewport.current.w,viewport.current.h);furthest.current=Math.max(furthest.current,playback.current.active);setFrame(next);raf=requestAnimationFrame(loop);};
  update();raf=requestAnimationFrame(loop);addEventListener('scroll',update,{passive:true});addEventListener('resize',update);return()=>{cancelAnimationFrame(raf);removeEventListener('scroll',update);removeEventListener('resize',update);};
 },[reduced]);
 function go(t:number){const element=root.current;if(!element){window.scrollTo({top:0,behavior:'instant'});return;}const y=element.getBoundingClientRect().top+scrollY+(element.offsetHeight-innerHeight)*clamp(t/JOURNEY_END);if(playback.current.isBusy())return;if(t===0){target.current=0;smoothInput.current=0;}navigationUntil.current=performance.now()+300;freezeAt.current=y;window.scrollTo({top:y,behavior:'instant'});}
 useEffect(()=>{
  if(reduced)return;
  let touchY=0,touchConsumed=false;
  const inside=()=>{const el=root.current;if(!el)return false;const r=el.getBoundingClientRect();return r.top<=0&&r.bottom>0;};
  const locked=()=>playback.current.isBusy()||performance.now()<navigationUntil.current;
  const step=(direction:number)=>{
   const p=playback.current,final=p.overview===1&&p.mapActor===0&&!p.mapRun;
   const index=final?6:p.active,next=Math.max(0,Math.min(6,index+direction));
   go(next===0?0:next===6?FINAL_START+.7:sceneStart(next)+.36);
  };
  const wheel=(e:WheelEvent)=>{
   if(!inside()||e.ctrlKey||Math.abs(e.deltaY)<1)return;
   const p=playback.current,finished=p.overview===1&&p.mapActor===0&&!p.isBusy();
   if(finished&&e.deltaY>0)return;
   e.preventDefault();if(gesture.current.accept(performance.now(),locked()))step(Math.sign(e.deltaY));
  };
  const keys=(e:KeyboardEvent)=>{
   if(!inside()||e.ctrlKey||e.metaKey||e.altKey||((e.target as Element)?.closest('input,textarea,select')||(e.key===' '&&(e.target as Element)?.closest('a,button'))))return;
   const direction=['ArrowDown','PageDown',' ','End'].includes(e.key)?1:['ArrowUp','PageUp','Home'].includes(e.key)?-1:0;
   if(!direction)return;e.preventDefault();if(!e.repeat&&!locked()){if(e.key==='Home')go(0);else step(direction);}
  };
  const start=(e:TouchEvent)=>{touchY=e.touches[0]?.clientY??0;touchConsumed=false;};
  const move=(e:TouchEvent)=>{if(e.touches.length!==1||!inside())return;const d=touchY-(e.touches[0]?.clientY??touchY);
   const p=playback.current;if(p.overview===1&&p.mapActor===0&&!p.isBusy()&&d>0)return;
   e.preventDefault();if(locked()){touchConsumed=true;return;}if(!touchConsumed&&Math.abs(d)>35){touchConsumed=true;step(Math.sign(d));}
  };
  addEventListener('wheel',wheel,{passive:false});addEventListener('keydown',keys);addEventListener('touchstart',start,{passive:true});addEventListener('touchmove',move,{passive:false});
  return()=>{removeEventListener('wheel',wheel);removeEventListener('keydown',keys);removeEventListener('touchstart',start);removeEventListener('touchmove',move);};
 },[reduced]);
 function toggle(){const q=!quiet;setQuiet(q);try{localStorage.setItem('vp:motion',q?'reduced':'full');}catch{}}
 const sceneLocations=renderLocations(frame,size.w,size.h),mobile=size.w<=760,k=size.w/frame.camera.width;
 const intro=frame.phase==='intro',final=frame.phase==='final',location=sceneLocations[frame.index];
 const entry=frame.phase==='flight'&&frame.fromIndex===0?ease(frame.local/.32):1;
 const introExpansion=frame.returning?1-ease(frame.local):intro?0:entry,introCopy=intro?frame.copyOpacity:0;
 const titleOpacity=frame.phase==='scene'?frame.copyOpacity:0;
 const actorWidth=(i:number)=>sceneLocations[i].width*(i===0?64/280:50/400);
 const busy=playback.current.isBusy()||performance.now()<navigationUntil.current;
 const heroSize=(frame.hero.width??(frame.phase==='flight'?lerp(actorWidth(frame.fromIndex??0),actorWidth(frame.index),ease(frame.local)):actorWidth(frame.index)))*(1+.5*frame.mapLabels);
 const landing=frame.hero.landing,dustOpacity=landing>0?Math.sin(Math.PI*landing):0;
 return <div className={`scroll-landing ${reduced?'journey-quiet':''}`} data-phase={frame.phase} data-location={location.id} data-travel={travel.toFixed(3)} data-locked={busy&&!reduced}>
  <div className="journey-backdrop" aria-hidden="true"/>
  <header className="journey-header" style={{transform:`translateY(${headerOffset}px)`}}><a className="journey-brand" href="#main" onClick={e=>{if(!reduced){e.preventDefault();go(0);}}} aria-label="Ventorme · Axiom — в начало"><img src="/brand/ventorme.svg" alt="Ventorme" width={198.174} height={42.997}/><span className="journey-brand-project">AXIOM</span></a><nav aria-label="Основная навигация"><a className="journey-header-cta" href={registrationHref}>В Ventorme <span>↗</span></a><button className="journey-motion" onClick={toggle} aria-pressed={quiet} aria-label={quiet?'Включить анимации':'Уменьшить движение'} title={quiet?'Включить анимации':'Уменьшить движение'}>{quiet?'▷':'Ⅱ'}</button></nav></header>
  {reduced?<main id="main" className="quiet-story"><section><h1>Твой путь начинается с тебя.</h1><p>{locations[0].copy}</p><a className="journey-cta" href={registrationHref}>Пройти профтест ↗</a></section>{sceneLocations.slice(1).map(loc=><section key={loc.id}><span className="journey-eyebrow">{loc.name}</span><h2>{loc.title}</h2><p>{loc.copy}</p><img src={loc.image} alt={loc.alt} loading="lazy"/></section>)}<section id="journey-finish"><h2>Теперь твой ход.</h2><p>Пройди бесплатный мини-профтест в Ventorme.</p><a className="journey-cta" href={registrationHref}>Пройти профтест ↗</a></section></main>:
  <main id="main" ref={root} className="scroll-journey" style={{height:`${(JOURNEY_END*.86+1)*100}svh`}}>
   <div className="journey-viewport">
    <div className="journey-copy journey-intro-copy" style={{opacity:introCopy,visibility:introCopy>.01?'visible':'hidden'}} inert={introCopy<.1}>
     <span className="journey-eyebrow">Поступление с Ventorme</span><h1>Твой путь<br/>начинается<br/> <em>с тебя.</em></h1><p>{locations[0].copy}</p><button className="journey-cta" disabled={busy} onClick={()=>go(sceneStart(1)+.36)}>Начать путь <span>↓</span></button>
    </div>
    <div className="journey-copy journey-scene-copy" style={{opacity:titleOpacity,visibility:titleOpacity>.01?'visible':'hidden'}} aria-hidden={titleOpacity<.1}>
     <span className="journey-eyebrow">{location.name}</span><h2>{location.title}</h2><p>{location.copy}</p>
    </div>
    <div className="journey-world" aria-label="Пиксельный мир поступления">
     <div className="journey-plane" style={{transform:`translate(${size.w/2-frame.camera.x*k}px, ${size.h/2-frame.camera.y*k}px) scale(${k})`}}>
      <svg className="journey-route" viewBox="-700 -650 1500 1200" style={{left:-700,top:-650,width:1500,height:1200}} aria-hidden="true"><defs><linearGradient id="route-light"><stop stopColor="#c9f4ff"/><stop offset="1" stopColor="#7eaaff"/></linearGradient></defs>{sceneLocations.slice(1).map((loc,i)=>{const from=sceneLocations[i],visible=travel>=INTRO_END+i*1.9;return <path key={loc.id} d={`M ${from.x} ${from.y} Q ${(from.x+loc.x)/2} ${Math.min(from.y,loc.y)-125} ${loc.x} ${loc.y}`} fill="none" stroke="url(#route-light)" strokeWidth="1.7" strokeDasharray="3 12" opacity={visible?.34:.09}/>;})}</svg>
      {sceneLocations.map((loc,i)=>{
       const skyX=mobile?[-110,110,0,-135,135]:[-100,20,-50,-150,90],skyY=mobile?[-255,-255,-360,-130,-130]:[-90,-112,-120,-80,-65];
       const expansion=i===0?1:lerp(mobile?.2:.13,1,introExpansion),x=i===0?loc.x:lerp(skyX[i-1],loc.x,introExpansion),y=i===0?loc.y:lerp(skyY[i-1],loc.y,introExpansion),width=loc.width*expansion,height=width*loc.ratio;
       const action=i===frame.fromIndex&&frame.phase==='flight'?1:i===frame.index&&frame.phase!=='flight'?frame.action:0;
       const distantOpacity=ease((frame.camera.width-700)/600);
       const opacity=intro?(i===0?1:frame.returning?.15+.85*(1-ease(frame.local/.6)):.15*(1-ease(frame.local/.8))):final?1:i===frame.index?entry:frame.phase==='flight'&&i===frame.fromIndex?1-ease((frame.local-.8)/.2)*(1-distantOpacity):frame.phase==='flight'?distantOpacity*(1-ease(frame.local/.25)):distantOpacity;
       return <div key={loc.id} className={`journey-island island-${loc.id}`} style={{left:x-width/2,top:y-height*loc.ground,width,height,zIndex:Math.round(y+700),opacity}} data-island={loc.id}>
        <img className="journey-island-art" src={loc.image} alt={loc.alt} width={1254} height={1254} draggable={false} fetchPriority={i===0?'high':'low'} decoding="async"/>
        <span className="journey-location-label" style={{opacity:i===0?0:frame.mapLabels,top:'102%',fontSize:Math.min(mobile?40:14,Math.max(10,11/k))}}>{loc.name}</span>
        {i>0&&!intro&&!final&&(i===frame.index||i===frame.fromIndex)&&<div className="journey-action-layer" style={{left:'50%',top:`${loc.ground*100}%`}}><NativeStation location={{...loc,width}} progress={action} seconds={i===frame.index?playback.current.sceneSeconds:0}/></div>}
       </div>;
      })}
      <div className="journey-ground-shadow" style={{left:frame.hero.x,top:frame.hero.y,opacity:Math.max(0,1-frame.hero.z/85),transform:`translate(-50%,-50%) scale(${1-frame.hero.z/310})`,zIndex:2999}}/>
      <div className="journey-actor" style={{left:frame.hero.x,top:frame.hero.y-frame.hero.z,zIndex:3000,width:heroSize,height:heroSize,opacity:ready?1:0}} data-pose={frame.hero.mode} data-facing={frame.hero.facing}>
       <div className="journey-actor-body"><HeroSprite mode={frame.hero.mode} facing={frame.hero.facing} sampleTime={frame.hero.sample} onReady={()=>setReady(true)}/></div>
      </div>
      <div className="journey-impact" style={{left:frame.hero.x,top:frame.hero.y,zIndex:3001,opacity:dustOpacity,transform:`translate(-50%,-50%) scale(${.5+landing})`}}>{[-1,1].map(side=><i key={side} style={{transform:`translate(${side*landing*30}px,${-Math.sin(landing*Math.PI)*13}px)`}}/>)}</div>
     </div>
    </div>

    <div className="journey-final-copy" style={{opacity:final?frame.copyOpacity:0,visibility:final?'visible':'hidden'}} inert={!final}>
     <span className="journey-eyebrow">Маршрут пройден</span><h2>Теперь <em>твой ход.</em></h2><p>Пройди бесплатный мини-профтест в Ventorme.</p><a className="journey-cta" href={registrationHref}>Пройти профтест <span>↗</span></a><button className="journey-replay" disabled={busy} onClick={()=>go(0)}>Повторить путь <span>↺</span></button>
    </div>
    <div className="journey-bottom" style={{opacity:intro?.65:1}}><nav className="journey-chapters" aria-label="Этапы поступления">{sceneLocations.slice(1).map((loc,i)=><button key={loc.id} disabled={busy||i+1>furthest.current} className={frame.index===i+1?'current':''} aria-current={frame.index===i+1?'step':undefined} onClick={()=>go(sceneStart(i+1)+.36)} aria-label={`${loc.name}. Перейти к сцене`}><span className="chapter-name">{loc.name}</span></button>)}</nav><span className="journey-scroll-hint">{busy?(frame.phase==='scene'?'Осматриваемся':'Герой в пути'):final?'Твой следующий шаг — Ventorme':'Листай дальше'} <span>{busy?'·':final?'↗':'↓'}</span></span></div>
    <div className="journey-progress" aria-hidden="true"><span style={{transform:`scaleX(${final?1:travel/JOURNEY_END})`}}/></div>
   </div>
  </main>}
  <footer className="journey-footer"><span>Ventorme · твой путь к поступлению</span><a href="https://ventorme.ai/" target="_blank" rel="noopener noreferrer">О Ventorme ↗</a><button onClick={()=>go(0)}>В начало ↑</button></footer>
 </div>;
}
