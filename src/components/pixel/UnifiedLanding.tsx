import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {animate,motion,useAnimationControls,useReducedMotion,useMotionValue,useSpring,useTransform,useMotionValueEvent} from 'motion/react';
import HeroSprite from './HeroSprite';
import IslandPosition from './IslandPosition';
import type {CharacterMotion,Facing} from './PixelCharacter';
import {worlds} from './worlds';
import './pixel.css';
import './unified.css';
import './intro.css';
type Point={x:number;y:number};type Box={left:number;top:number;width:number;height:number};
type Phase='map'|'preparing'|'crouch'|'flight'|'landing'|'zoom'|'explore'|'walk'|'return';
const mapAnchors=[[50,59],[50,60],[50,59],[52,58],[50,59]] as const;
const paths=[{start:[50,66],entry:[50,60]},{start:[50,67],entry:[50,59]},{start:[50,70],entry:[50,58]},{start:[50,65],entry:[50,55]},{start:[50,64],entry:[50,57]}] as const;
const groundLimits=[72,73,73,72,72] as const;
const sceneRatio=941/1672;
export default function UnifiedLanding({registrationHref}:{registrationHref:string}){
 const [phase,setPhase]=useState<Phase>('map'),[active,setActive]=useState<number|null>(null),[scene,setScene]=useState(false),[box,setBox]=useState<Box|null>(null),[mode,setMode]=useState<CharacterMotion>('idle'),[facing,setFacing]=useState<Facing>('front'),[ready,setReady]=useState(false),[quiet,setQuiet]=useState(false),[hud,setHud]=useState<Point>({x:0,y:0}),[entered,setEntered]=useState(false),[mobile,setMobile]=useState(false),[mapVisible,setMapVisible]=useState(false),[introDone,setIntroDone]=useState(false);
 const journeyRef=useRef<HTMLElement>(null);
 const groundPoint=useRef<readonly number[]>([50,64]);
 const cameraRef=useRef<HTMLDivElement>(null),stageRef=useRef<HTMLDivElement>(null),point=useRef<Point>({x:40,y:59}),alive=useRef(true),tokenRef=useRef(0),lock=useRef(false),location=useRef<number|'home'>('home'),scrollRef=useRef(0),sceneRef=useRef(false),activeRef=useRef<number|null>(null),phaseRef=useRef(phase);phaseRef.current=phase;activeRef.current=active;sceneRef.current=scene;
 const player=useAnimationControls(),camera=useAnimationControls();const systemReduced=useReducedMotion(),reduced=!!systemReduced||quiet;const busy=!['map','explore'].includes(phase);const world=active===null?null:worlds[active];
 const scrollProgress=useMotionValue(0),smoothProgress=useSpring(scrollProgress,{stiffness:110,damping:28,mass:.65});
 const progress=reduced?scrollProgress:smoothProgress;
 const blend=useMotionValue(0),miniOpacity=useTransform(blend,[0,.65,1],[1,1,0]),largeOpacity=useTransform(blend,[0,.65,1],[0,1,1]);
 const progressRef=useRef(progress);progressRef.current=progress;
 const introOpacity=useTransform(progress,[0,.42,.67,1],[1,1,0,0]),mapOpacity=useTransform(progress,[0,.55,.85,1],[0,0,1,1]),hintOpacity=useTransform(progress,[0,.35,.65,1],[1,1,0,0]);
 useMotionValueEvent(progress,'change',v=>{setMapVisible(v>=.68);setIntroDone(v>=.98);});
 const valid=(t:number)=>alive.current&&t===tokenRef.current;
 const pause=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,reduced?0:ms));
 const nextFrame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
 function introScale(){return 1+(innerWidth<=760?1:1.35)*(1-progressRef.current.get());}
 function mapScrollTop(){const section=journeyRef.current,sticky=section?.querySelector<HTMLElement>('.world-sticky');return section&&sticky?section.getBoundingClientRect().top+scrollY+section.offsetHeight-sticky.offsetHeight:scrollRef.current;}
 async function revealMap(){
  const section=journeyRef.current;if(!section)return;
  window.scrollTo({top:mapScrollTop(),behavior:reduced?'instant':'smooth'});
  if(reduced){scrollProgress.set(1);return;}
  const deadline=performance.now()+2200;
  while(alive.current&&progressRef.current.get()<.995&&performance.now()<deadline)await nextFrame();
 }
 function node(i:number|'home'){return cameraRef.current?.querySelector<HTMLElement>(`[data-island="${i}"]`);}
 function surface(i:number|'home',anchor?:readonly number[]):Point{const c=cameraRef.current,container=node(i),b=(anchor&&i!=='home'?container:container?.querySelector(i==='home'?'.home-art':'.map-art'))?.getBoundingClientRect(),f=c?.getBoundingClientRect();if(!b||!f)return point.current;const a=anchor??(i==='home'?[50,45]:mapAnchors[i]);return{x:(b.left-f.left+b.width*a[0]/100)/f.width*100,y:(b.top-f.top+b.height*a[1]/100)/f.height*100};}
 function sceneOffset(i:number){return{x:mapAnchors[i][0]-paths[i].start[0],y:mapAnchors[i][1]-sceneRatio*paths[i].start[1]};}
 function sceneAnchor(i:number,a:readonly number[]){const offset=sceneOffset(i);return[offset.x+a[0],offset.y+sceneRatio*a[1]] as const;}
 function updateHud(i:number){const b=node(i)?.querySelector('.island-image')?.getBoundingClientRect();if(b)setHud({x:b.left+b.width*paths[i].entry[0]/100,y:b.top+b.height*paths[i].entry[1]/100});}
 function fit(i:number){const c=cameraRef.current,s=stageRef.current,n=node(i);if(!c||!s||!n)return{scale:1,x:0,y:0};const b=s.getBoundingClientRect(),d=surface(i,sceneAnchor(i,[50,40]));const width=innerWidth<=760?Math.min(innerWidth*3,innerHeight*1.8,1600):Math.min(innerWidth*1.25,innerHeight*2,1600);const scale=width/n.offsetWidth;return{scale,x:innerWidth*.5-b.left-scale*c.clientWidth*d.x/100,y:innerHeight*(innerWidth<=760?.58:.47)-b.top-scale*c.clientHeight*d.y/100};}
 function sceneActorScale(zoom:number,y=64){const height=innerWidth<=760?Math.min(80,innerWidth*.17):110;const depth=Math.max(.7,Math.min(1.08,.7+(y-51)*.023));return height/(64*.75*zoom)*depth;}
 async function jump(end:Point,t:number,endScale=1,arrivalFacing:Facing='front'){
  const start=point.current,c=cameraRef.current;
  const dx=(end.x-start.x)*(c?.clientWidth??1),dy=(end.y-start.y)*(c?.clientHeight??1);
  const direction:Facing=Math.abs(dy)>Math.abs(dx)*1.12?(dy<0?'back':'front'):(dx<0?'left':'right');
  setPhase('crouch');setMode('crouch');setFacing(direction);await pause(350);if(!valid(t))return;setMode('push');await pause(190);if(!valid(t))return;setPhase('flight');setMode('air');
  const duration=reduced?0:1.05,arc=Math.max(17,Math.min(26,Math.abs(end.y-start.y)*.32+17));
  const times=Array.from({length:21},(_,n)=>n/20);
  const tops=times.map(u=>`${start.y+(end.y-start.y)*u-4*arc*u*(1-u)}%`);
  const flight=player.start({left:[`${start.x}%`,`${end.x}%`],top:tops,scale:endScale,transition:{left:{duration,ease:'linear'},top:{duration,times,ease:'linear'},scale:{duration,ease:'easeInOut'}}});
  const apexTime=Math.max(.35,Math.min(.82,.5-(end.y-start.y)/(8*arc)));
  await pause(apexTime*duration*1000);if(!valid(t))return;setMode('fall');await flight;if(!valid(t))return;point.current=end;setPhase('landing');setMode('land');await pause(470);if(valid(t)){setMode('idle');setFacing(arrivalFacing);}
 }
 async function choose(i:number){
  if(lock.current||!ready||scene)return;lock.current=true;const t=++tokenRef.current;setActive(i);setPhase('preparing');setEntered(false);
  if(progressRef.current.get()<.995){await revealMap();if(!valid(t))return;const p=surface('home');point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`,scale:1});}
  scrollProgress.set(1);smoothProgress.jump(1);blend.set(0);
  await nextFrame();const img=node(i)?.querySelector<HTMLImageElement>('.island-image');await img?.decode().catch(()=>{});if(!valid(t))return;
  await jump(surface(i),t,Math.max(.6,Math.min(1,worlds[i].w/40)),'back');if(!valid(t))return;location.current=i;
  const b=stageRef.current!.getBoundingClientRect();scrollRef.current=scrollY;setBox({left:b.left,top:b.top,width:b.width,height:b.height});sceneRef.current=true;setScene(true);setFacing('back');setPhase('zoom');await nextFrame();if(!valid(t))return;window.scrollTo({top:0,behavior:'instant'});
  const target=fit(i);await Promise.all([camera.start({...target,transition:{duration:reduced?0:1.6,ease:[.22,1,.36,1]}}),player.start({left:`${surface(i,sceneAnchor(i,paths[i].start)).x}%`,top:`${surface(i,sceneAnchor(i,paths[i].start)).y}%`,scale:sceneActorScale(target.scale,paths[i].start[1]),transition:{duration:reduced?0:1.6,ease:[.22,1,.36,1]}}),animate(blend,1,{duration:reduced?0:.85,delay:reduced?0:.3,ease:'easeInOut'})]);
  await nextFrame();await nextFrame();if(!valid(t))return;groundPoint.current=paths[i].start;point.current=surface(i,sceneAnchor(i,paths[i].start));updateHud(i);setPhase('explore');lock.current=false;
 }
 async function back(){
  if(lock.current||active===null)return;lock.current=true;const t=++tokenRef.current;setEntered(false);setPhase('return');
  await Promise.all([camera.start({scale:1,x:0,y:0,transition:{duration:reduced?0:1.2,ease:[.22,1,.36,1]}}),player.start({left:`${surface(active).x}%`,top:`${surface(active).y}%`,scale:Math.max(.6,Math.min(1,worlds[active].w/40)),transition:{duration:reduced?0:1.2,ease:[.22,1,.36,1]}}),animate(blend,0,{duration:reduced?0:.85,ease:'easeInOut'})]);if(!valid(t))return;
  point.current=surface(active);setScene(false);await nextFrame();window.scrollTo({top:mapScrollTop(),behavior:'instant'});setBox(null);await nextFrame();await jump(surface('home'),t,1);if(!valid(t))return;location.current='home';setActive(null);setMode('idle');setFacing('front');setPhase('map');lock.current=false;
 }
 async function walk(x:number,y:number,enter=false){
  if(lock.current||active===null||phase!=='explore')return;lock.current=true;setEntered(false);const t=++tokenRef.current,start=point.current,end=surface(active,sceneAnchor(active,[x,y]));setPhase('walk');setMode('walk');setFacing(end.y>start.y+1?'front':'back');
  const c=cameraRef.current!.getBoundingClientRect();const distance=Math.hypot((end.x-start.x)*c.width/100,(end.y-start.y)*c.height/100);const zoom=fit(active).scale;
  await player.start({left:`${end.x}%`,top:`${end.y}%`,scale:sceneActorScale(zoom,y),transition:{duration:reduced?0:Math.max(1.1,Math.min(3.4,distance/110)),ease:'linear'}});if(!valid(t))return;
  point.current=end;groundPoint.current=[x,y];setMode('idle');setFacing('back');setPhase('explore');setEntered(enter);lock.current=false;
 }
 function ground(e:React.MouseEvent<HTMLButtonElement>){if(active===null)return;const b=node(active)!.querySelector('.island-image')!.getBoundingClientRect(),path=paths[active];const y=Math.max(path.entry[1]+1,Math.min(groundLimits[active],e.detail===0?path.start[1]+2:(e.clientY-b.top)/b.height*100));const mix=Math.max(0,Math.min(1,(y-path.entry[1])/(path.start[1]-path.entry[1]))),center=path.entry[0]+(path.start[0]-path.entry[0])*mix,half=4+mix*5;const x=Math.max(center-half,Math.min(center+half,e.detail===0?path.start[0]:(e.clientX-b.left)/b.width*100));void walk(x,y);}
 useEffect(()=>{alive.current=true;try{setQuiet(localStorage.getItem('vp:motion')==='reduced');}catch{}return()=>{alive.current=false;++tokenRef.current;player.stop();camera.stop();};},[player,camera]);
 useEffect(()=>{
  const update=()=>{setMobile(innerWidth<=760);if(sceneRef.current||!['map','preparing'].includes(phaseRef.current))return;const section=journeyRef.current,sticky=section?.querySelector<HTMLElement>('.world-sticky');if(!section||!sticky)return;const start=section.getBoundingClientRect().top+scrollY;const distance=Math.max(1,section.offsetHeight-sticky.offsetHeight);scrollProgress.set(Math.max(0,Math.min(1,(scrollY-start)/distance)));};
  update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
 },[scrollProgress]);
 useEffect(()=>{const c=cameraRef.current;if(!c)return;let id=0;const place=()=>{if(lock.current)return;const i=activeRef.current;if(sceneRef.current&&i!==null){const target=fit(i);camera.set(target);const p=surface(i,sceneAnchor(i,groundPoint.current));point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`,scale:sceneActorScale(target.scale,groundPoint.current[1])});requestAnimationFrame(()=>requestAnimationFrame(()=>{if(alive.current)updateHud(i);}));}else{const p=surface(location.current);point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`,scale:1});}};id=requestAnimationFrame(place);const observer=new ResizeObserver(()=>{cancelAnimationFrame(id);id=requestAnimationFrame(place);});observer.observe(c);window.addEventListener('resize',place);return()=>{observer.disconnect();cancelAnimationFrame(id);window.removeEventListener('resize',place);};},[]);
 useEffect(()=>{const id=requestAnimationFrame(()=>{const i=activeRef.current;if(!sceneRef.current||i===null||lock.current)return;const target=fit(i),p=surface(i,sceneAnchor(i,groundPoint.current));camera.set(target);point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`,scale:sceneActorScale(target.scale,groundPoint.current[1])});requestAnimationFrame(()=>requestAnimationFrame(()=>{if(alive.current)updateHud(i);}));});return()=>cancelAnimationFrame(id);},[mobile]);
 useEffect(()=>{let id=0;const follow=()=>{if((phaseRef.current==='map'&&!lock.current)||phaseRef.current==='preparing'){const p=surface('home');point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`,scale:introScale()});}id=requestAnimationFrame(follow);};id=requestAnimationFrame(follow);return()=>cancelAnimationFrame(id);},[reduced,player]);
 function toggle(){const next=!quiet;setQuiet(next);try{localStorage.setItem('vp:motion',next?'reduced':'full');}catch{}}
 const frozen:CSSProperties|undefined=box?{position:'fixed',left:box.left,top:box.top,width:box.width,height:box.height,right:'auto',margin:0,overflow:'visible'}:undefined;
 return <div className={`pixel-landing unified-landing journey-intro ${scene?'scene-active':''} ${phase!=='map'?'worlds-still':''} ${reduced?'quiet':''}`} data-phase={phase} data-view={scene?'island':introDone?'map':'intro'}>
  <div className="shared-sky" aria-hidden="true"/>
  <header className="pixel-header"><a className="pixel-brand" href="#main" onClick={e=>{if(scene){e.preventDefault();void back();}}}>ventorme</a><nav><button className="nav-link" disabled={busy} onClick={()=>scene?void back():void revealMap()}>{scene?'← Карта островов':'Карта островов'}</button><button className="motion-toggle" disabled={busy} onClick={toggle} aria-pressed={quiet} aria-label={quiet?'Включить анимации':'Уменьшить движение'}>{quiet?'▷':'Ⅱ'}</button></nav></header>
  <main id="main"><section className="world-journey" ref={journeyRef} aria-label="Мир Ventorme"><div className="world-sticky">
   <motion.div className="hero-copy intro-copy" style={{opacity:introOpacity}} aria-hidden={scene||mapVisible} inert={scene||mapVisible}><h1>Твой путь<br/>начинается<br/><span>с тебя.</span></h1><p className="hero-description">Выбери направление, найди вуз и составь план поступления с Ventorme.</p><div className="hero-actions"><a className="pixel-primary" href={registrationHref}>Начать бесплатно <span>↗</span></a><button className="pixel-text-button" disabled={busy} onClick={()=>void revealMap()}>Открыть мой мир <span>↓</span></button></div></motion.div>
   <motion.div className="hero-copy map-copy" style={{opacity:mapOpacity}} aria-hidden={scene||!mapVisible} inert={scene||!mapVisible}><h2>Куда поступать?<br/><span>Начнём с тебя.</span></h2><p className="hero-description">Ventorme — твой ИИ-помощник: выбрать направление и вуз, подготовиться к экзаменам и спланировать поступление.</p><div className="hero-actions"><a className="pixel-primary" href={registrationHref}>Начать бесплатно <span>↗</span></a><button className="pixel-text-button" disabled={busy} onClick={()=>void choose(1)}>Найти вуз <span>↗</span></button></div><p className="map-guide">Выбери остров, чтобы узнать больше.</p></motion.div>
   <div className="world-stage" ref={stageRef} style={frozen}><motion.div className="world-camera" ref={cameraRef} animate={camera} initial={{scale:1,x:0,y:0}}>
    <IslandPosition index="home" progress={progress} mobile={mobile} hidden={scene} reduced={reduced}><img src="/map-islands/home-polished.png" alt="" className="home-art" draggable={false}/><motion.span className="home-label" style={{opacity:mapOpacity}}>Ты здесь</motion.span></IslandPosition>
    {worlds.map((w,i)=><IslandPosition index={i} progress={progress} mobile={mobile} key={w.key} hidden={scene&&active!==i} reduced={reduced}>
     <button className="island-select" disabled={busy||scene||!ready} onClick={()=>void choose(i)} aria-label={`${w.action}. Посетить остров`}><motion.img src={`/map-islands/${w.key}-polished.png`} alt="" className="island-art map-art" draggable={false} style={{opacity:active===i?miniOpacity:1}}/><motion.img src={active===i?`/islands/${w.key}-refined.png`:undefined} alt="" width={1672} height={941} className="island-image" draggable={false} style={{left:`${sceneOffset(i).x}%`,top:`${sceneOffset(i).y}%`,opacity:active===i?largeOpacity:0}}/><span className="island-label">{w.name}</span></button>
     {scene&&active===i&&<button className="island-walk-ground" style={{clipPath:`polygon(${paths[i].entry[0]-4}% ${sceneAnchor(i,paths[i].entry)[1]}%,${paths[i].entry[0]+4}% ${sceneAnchor(i,paths[i].entry)[1]}%,70% ${sceneAnchor(i,[50,groundLimits[i]])[1]}%,30% ${sceneAnchor(i,[50,groundLimits[i]])[1]}%)`}} onClick={ground} disabled={busy||entered} aria-label="Пройти по дорожке"/>}
    </IslandPosition>)}
    <motion.div className={`actor-anchor ${phase==='flight'?'in-air':''} ${phase==='landing'?'landed':''}`} animate={player} initial={{left:'40%',top:'59%',scale:1}} aria-hidden="true"><div className="actor-shadow"/><div className="actor-body"><HeroSprite mode={mode} facing={facing} reduced={reduced} onReady={()=>setReady(true)}/></div><div className="landing-ring"/><div className="landing-dust">{[0,1,2,3].map(i=><i key={i}/>)}</div></motion.div>
   </motion.div><motion.p className="journey-status" style={{opacity:mapOpacity}} role="status">{!scene&&phase!=='map'&&(phase==='crouch'?'Готовимся к прыжку…':phase==='flight'?'Прыжок…':phase==='landing'?'Приземление':'Открываем остров…')}</motion.p></div>
   <motion.button className="intro-hint" style={{opacity:hintOpacity}} aria-hidden={scene||mapVisible} inert={scene||mapVisible} disabled={busy} onClick={()=>void revealMap()}><span>⌄</span>Листай вниз — откроем твой мир</motion.button>
   {scene&&world&&<><motion.div className="unified-scene-title" initial={{opacity:0}} animate={{opacity:phase==='zoom'||entered?0:1}} transition={{duration:reduced?0:.35}}><span>{world.name}</span><h2>{world.title}</h2></motion.div>
    {phase!=='zoom'&&phase!=='return'&&!entered&&<><span className="entry-pin" style={{left:hud.x,top:hud.y}} aria-hidden="true"/><button className="unified-entry" style={{left:hud.x,top:hud.y-(mobile?82:110)}} disabled={busy} onClick={()=>void walk(paths[active!].entry[0],paths[active!].entry[1],true)}><span className="entry-action-icon" aria-hidden="true">↗</span><span className="entry-action-label">{phase==='walk'?'Идём…':world.entry}</span></button></>}
    <p className="unified-help" role="status">{phase==='walk'?'Герой идёт к выбранной точке':phase==='zoom'?'Приближаемся к острову':entered?'Продолжи на Ventorme':'Нажми на объект или на дорожку'}</p>
    {entered&&<div className="entry-panel" role="dialog" aria-modal="false" aria-label={world.name}><button className="entry-close" onClick={()=>setEntered(false)} aria-label="Вернуться на остров">×</button><span className="entry-kicker">VENTORME / {world.name}</span><h2>{world.action}</h2><p>{world.copy}</p><a className="pixel-primary" href={registrationHref}>{world.cta} ↗</a><small>Продолжить на платформе Ventorme</small></div>}
   </>}
  </div></section></main><footer className="pixel-footer"><span>VENTORME</span><p>Твой следующий шаг начинается с тебя.</p><a href="https://ventorme.ai/" target="_blank" rel="noopener noreferrer">О платформе ↗</a></footer>
 </div>;
}
