import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {motion,useAnimationControls,useReducedMotion} from 'motion/react';
import HeroSprite from './HeroSprite';
import type {CharacterMotion,Facing} from './PixelCharacter';
import {worlds} from './worlds';
import './pixel.css';
import './unified.css';
type Point={x:number;y:number};type Box={left:number;top:number;width:number;height:number};
type Phase='map'|'preparing'|'crouch'|'flight'|'landing'|'zoom'|'explore'|'walk'|'return';
const mapAnchors=[[50,59],[50,60],[50,59],[52,58],[50,59]] as const;
const mapLayouts=[{x:18,y:69,w:38},{x:73,y:54,w:52},{x:49,y:11,w:34.5},{x:20,y:5,w:20.5},{x:85,y:9,w:23.5}] as const;
const paths=[{start:[50,66],entry:[50,60]},{start:[50,67],entry:[50,59]},{start:[52,71],entry:[52,65]},{start:[50,65],entry:[50,55]},{start:[50,64],entry:[50,57]}] as const;
export default function UnifiedLanding({registrationHref}:{registrationHref:string}){
 const [phase,setPhase]=useState<Phase>('map'),[active,setActive]=useState<number|null>(null),[scene,setScene]=useState(false),[box,setBox]=useState<Box|null>(null),[mode,setMode]=useState<CharacterMotion>('idle'),[facing,setFacing]=useState<Facing>('back'),[ready,setReady]=useState(false),[quiet,setQuiet]=useState(false),[hud,setHud]=useState<Point>({x:0,y:0}),[entered,setEntered]=useState(false);
 const cameraRef=useRef<HTMLDivElement>(null),stageRef=useRef<HTMLDivElement>(null),point=useRef<Point>({x:40,y:59}),alive=useRef(true),tokenRef=useRef(0),lock=useRef(false),location=useRef<number|'home'>('home'),scrollRef=useRef(0),sceneRef=useRef(false),activeRef=useRef<number|null>(null),phaseRef=useRef(phase);phaseRef.current=phase;activeRef.current=active;sceneRef.current=scene;
 const player=useAnimationControls(),camera=useAnimationControls();const systemReduced=useReducedMotion(),reduced=!!systemReduced||quiet;const busy=!['map','explore'].includes(phase);const world=active===null?null:worlds[active];
 const valid=(t:number)=>alive.current&&t===tokenRef.current;
 const pause=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,reduced?0:ms));
 const nextFrame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
 function node(i:number|'home'){return cameraRef.current?.querySelector<HTMLElement>(`[data-island="${i}"]`);}
 function surface(i:number|'home',anchor?:readonly number[]):Point{const c=cameraRef.current,container=node(i),b=(anchor?container:container?.querySelector(i==='home'?'.home-art':'.map-art'))?.getBoundingClientRect(),f=c?.getBoundingClientRect();if(!b||!f)return point.current;const a=anchor??(i==='home'?[50,45]:mapAnchors[i]);return{x:(b.left-f.left+b.width*a[0]/100)/f.width*100,y:(b.top-f.top+b.height*a[1]/100)/f.height*100};}
 function detailAnchor(a:readonly number[]){return [a[0],21.85+a[1]*.563] as const;}
 function updateHud(i:number){const b=node(i)?.querySelector('.island-image')?.getBoundingClientRect();if(b)setHud({x:b.left+b.width*paths[i].entry[0]/100,y:b.top+b.height*paths[i].entry[1]/100});}
 function fit(i:number){const c=cameraRef.current,s=stageRef.current,n=node(i);if(!c||!s||!n)return{scale:1,x:0,y:0};const b=s.getBoundingClientRect(),d=surface(i,detailAnchor([50,40]));const width=innerWidth<=760?Math.min(innerWidth*3.8,innerHeight*2.2):Math.min(innerWidth*1.4,innerHeight*2.6);const scale=width/n.offsetWidth;return{scale,x:innerWidth*.5-b.left-scale*c.clientWidth*d.x/100,y:innerHeight*(innerWidth<=760?.58:.47)-b.top-scale*c.clientHeight*d.y/100};}
 function sceneActorScale(zoom:number,y=64){const height=innerWidth<=760?Math.min(80,innerWidth*.17):110;const depth=Math.max(.7,Math.min(1.08,.7+(y-51)*.023));return height/(64*.75*zoom)*depth;}
 async function jump(end:Point,t:number,endScale=1){
  const start=point.current;setPhase('crouch');setMode('crouch');setFacing('back');await pause(350);if(!valid(t))return;setMode('push');await pause(190);if(!valid(t))return;setPhase('flight');setMode('air');
  const height=((cameraRef.current?.querySelector<HTMLElement>('.actor-body')?.getBoundingClientRect().height??64)*.9+4)/(cameraRef.current?.clientHeight??560)*100;const apex=Math.max(height,Math.min(start.y,end.y)-18);const duration=reduced?0:1;
  const flight=player.start({left:[`${start.x}%`,`${end.x}%`],top:[`${start.y}%`,`${apex}%`,`${end.y}%`],scale:endScale,transition:{left:{duration,ease:'linear'},top:{duration,times:[0,.49,1],ease:['easeOut','easeIn']},scale:{duration,ease:'easeInOut'}}});
  await pause(760);if(!valid(t))return;setMode('fall');await flight;if(!valid(t))return;point.current=end;setPhase('landing');setMode('land');await pause(470);if(valid(t))setMode('idle');
 }
 async function choose(i:number){
  if(lock.current||!ready||scene)return;lock.current=true;const t=++tokenRef.current;setActive(i);setPhase('preparing');setEntered(false);
  const img=node(i)?.querySelector<HTMLImageElement>('.island-image');await img?.decode().catch(()=>{});if(!valid(t))return;
  if(innerWidth<=760){stageRef.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});await pause(470);}
  await jump(surface(i),t,Math.max(.6,Math.min(1,worlds[i].w/40)));if(!valid(t))return;location.current=i;
  const b=stageRef.current!.getBoundingClientRect();scrollRef.current=scrollY;setBox({left:b.left,top:b.top,width:b.width,height:b.height});setScene(true);setPhase('zoom');await nextFrame();if(!valid(t))return;window.scrollTo({top:0,behavior:'instant'});
  const target=fit(i);await Promise.all([camera.start({...target,transition:{duration:reduced?0:1.4,ease:[.22,1,.36,1]}}),player.start({left:`${surface(i,detailAnchor(paths[i].start)).x}%`,top:`${surface(i,detailAnchor(paths[i].start)).y}%`,scale:sceneActorScale(target.scale,paths[i].start[1]),transition:{duration:reduced?0:1.4,ease:[.22,1,.36,1]}})]);
  await nextFrame();await nextFrame();if(!valid(t))return;point.current=surface(i,detailAnchor(paths[i].start));updateHud(i);setPhase('explore');lock.current=false;
 }
 async function back(){
  if(lock.current||active===null)return;lock.current=true;const t=++tokenRef.current;setEntered(false);setPhase('return');
  await Promise.all([camera.start({scale:1,x:0,y:0,transition:{duration:reduced?0:1,ease:[.22,1,.36,1]}}),player.start({left:`${surface(active).x}%`,top:`${surface(active).y}%`,scale:Math.max(.6,Math.min(1,worlds[active].w/40)),transition:{duration:reduced?0:1,ease:[.22,1,.36,1]}})]);if(!valid(t))return;
  point.current=surface(active);setScene(false);await nextFrame();window.scrollTo({top:scrollRef.current,behavior:'instant'});setBox(null);await nextFrame();await jump(surface('home'),t,1);if(!valid(t))return;location.current='home';setActive(null);setMode('idle');setPhase('map');lock.current=false;
 }
 async function walk(x:number,y:number,enter=false){
  if(lock.current||active===null||phase!=='explore')return;lock.current=true;setEntered(false);const t=++tokenRef.current,start=point.current,end=surface(active,detailAnchor([x,y]));setPhase('walk');setMode('walk');setFacing(end.y>start.y+1?'front':end.x<start.x-2?'left':'back');
  const c=cameraRef.current!.getBoundingClientRect();const distance=Math.hypot((end.x-start.x)*c.width/100,(end.y-start.y)*c.height/100);const zoom=fit(active).scale;
  await player.start({left:`${end.x}%`,top:`${end.y}%`,scale:sceneActorScale(zoom,y),transition:{duration:reduced?0:Math.max(1.1,Math.min(3.4,distance/110)),ease:'linear'}});if(!valid(t))return;
  point.current=end;setMode('idle');setFacing('back');setPhase('explore');setEntered(enter);lock.current=false;
 }
 function ground(e:React.MouseEvent<HTMLButtonElement>){if(active===null)return;const b=node(active)!.querySelector('.island-image')!.getBoundingClientRect();const y=Math.max(paths[active].entry[1]+1,Math.min(72,e.detail===0?paths[active].start[1]:(e.clientY-b.top)/b.height*100));const half=5+(y-51)*.85;const x=Math.max(50-half,Math.min(50+half,e.detail===0?50:(e.clientX-b.left)/b.width*100));void walk(x,y);}
 useEffect(()=>{alive.current=true;try{setQuiet(localStorage.getItem('vp:motion')==='reduced');}catch{}return()=>{alive.current=false;++tokenRef.current;player.stop();camera.stop();};},[player,camera]);
 useEffect(()=>{const c=cameraRef.current;if(!c)return;let id=0;const place=()=>{if(lock.current)return;const i=activeRef.current;if(sceneRef.current&&i!==null){const target=fit(i);camera.set(target);player.set({scale:sceneActorScale(target.scale)});requestAnimationFrame(()=>{if(alive.current)updateHud(i);});}else{const p=surface(location.current);point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`,scale:1});}};id=requestAnimationFrame(place);const observer=new ResizeObserver(()=>{cancelAnimationFrame(id);id=requestAnimationFrame(place);});observer.observe(c);window.addEventListener('resize',place);return()=>{observer.disconnect();cancelAnimationFrame(id);window.removeEventListener('resize',place);};},[]);
 useEffect(()=>{let id=0;if(reduced){id=requestAnimationFrame(()=>{if(phaseRef.current==='map'){const p=surface('home');point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`});}});return()=>cancelAnimationFrame(id);}const follow=()=>{if(phaseRef.current==='map'&&!lock.current){const p=surface('home');point.current=p;player.set({left:`${p.x}%`,top:`${p.y}%`});}id=requestAnimationFrame(follow);};id=requestAnimationFrame(follow);return()=>cancelAnimationFrame(id);},[reduced,player]);
 function toggle(){const next=!quiet;setQuiet(next);try{localStorage.setItem('vp:motion',next?'reduced':'full');}catch{}}
 const frozen:CSSProperties|undefined=box?{position:'fixed',left:box.left,top:box.top,width:box.width,height:box.height,right:'auto',margin:0,overflow:'visible'}:undefined;
 return <div className={`pixel-landing unified-landing ${scene?'scene-active':''} ${phase!=='map'?'worlds-still':''} ${reduced?'quiet':''}`} data-phase={phase}>
  <div className="shared-sky" aria-hidden="true"/>
  <header className="pixel-header"><a className="pixel-brand" href="#main" onClick={e=>{if(scene){e.preventDefault();void back();}}}>VENTORME</a><nav><button className="nav-link" disabled={busy} onClick={()=>scene?void back():void choose(1)}>{scene?'← Карта островов':'Исследовать мир'}</button><button className="motion-toggle" disabled={busy} onClick={toggle} aria-pressed={quiet} aria-label={quiet?'Включить анимации':'Уменьшить движение'}>{quiet?'▷':'Ⅱ'}</button></nav></header>
  <main id="main"><section className="world-journey" aria-label="Мир Ventorme"><div className="world-sticky">
   <div className="hero-copy" aria-hidden={scene} inert={scene}><h1>Куда поступать?<br/><span>Начнём с тебя.</span></h1><p className="hero-description">Ventorme — твой ИИ-помощник: выбрать направление и вуз, подготовиться к экзаменам и спланировать поступление.</p><div className="hero-actions"><a className="pixel-primary" href={registrationHref}>Начать бесплатно <span>↗</span></a><button className="pixel-text-button" disabled={busy} onClick={()=>void choose(1)}>Исследовать острова <span>↗</span></button></div></div>
   <div className="world-stage" ref={stageRef} style={frozen}><motion.div className="world-camera" ref={cameraRef} animate={camera} initial={{scale:1,x:0,y:0}}>
    <motion.div className="home-island" data-island="home" animate={{opacity:scene?0:1}}><img src="/map-islands/home-polished.png" alt="" className="home-art" draggable={false}/><span className="home-label">Ты здесь</span></motion.div>
    {worlds.map((w,i)=><motion.div className={`island island-${i}`} data-island={i} key={w.key} style={{left:`${mapLayouts[i].x}%`,top:`${mapLayouts[i].y}%`,width:`${mapLayouts[i].w}%`}} animate={{opacity:scene&&active!==i?0:1}} transition={{duration:reduced?0:.35}} inert={scene&&active!==i}>
     <button className="island-select" disabled={busy||scene||!ready} onClick={()=>void choose(i)} aria-label={`${w.action}. Посетить остров`}><motion.img src={`/map-islands/${w.key}-polished.png`} alt="" className="island-art map-art" draggable={false} animate={{opacity:scene&&active===i&&phase!=='return'?0:1}} transition={{duration:reduced?0:.85}}/><motion.img src={`/islands/${w.key}.png`} alt="" className="island-image" draggable={false} initial={{opacity:0}} animate={{opacity:scene&&active===i&&phase!=='return'?1:0}} transition={{duration:reduced?0:.85}}/><span className="island-label">{w.name}<span>↗</span></span></button>
     {scene&&active===i&&<button className="island-walk-ground" style={{clipPath:`polygon(${paths[i].entry[0]-4}% ${detailAnchor(paths[i].entry)[1]}%,${paths[i].entry[0]+4}% ${detailAnchor(paths[i].entry)[1]}%,70% ${detailAnchor([50,73])[1]}%,30% ${detailAnchor([50,73])[1]}%)`}} onClick={ground} disabled={busy||entered} aria-label="Пройти по дорожке"/>}
    </motion.div>)}
    <motion.div className={`actor-anchor ${phase==='flight'?'in-air':''} ${phase==='landing'?'landed':''}`} animate={player} initial={{left:'40%',top:'59%',scale:1}} aria-hidden="true"><div className="actor-shadow"/><div className="actor-body"><HeroSprite mode={mode} facing={facing} reduced={reduced} onReady={()=>setReady(true)}/></div><div className="landing-ring"/><div className="landing-dust">{[0,1,2,3].map(i=><i key={i}/>)}</div></motion.div>
   </motion.div><p className="journey-status" role="status">{!scene&&(phase==='map'?'Нажми на остров — начнём путешествие':phase==='crouch'?'Готовимся к прыжку…':phase==='flight'?'Прыжок…':phase==='landing'?'Приземление':'Открываем остров…')}</p></div>
   {scene&&world&&<><motion.div className="unified-scene-title" initial={{opacity:0}} animate={{opacity:phase==='zoom'||entered?0:1}} transition={{duration:reduced?0:.35}}><span>{world.name.toUpperCase()}</span><h2>{world.title}</h2></motion.div>
    {phase!=='zoom'&&phase!=='return'&&!entered&&<button className="unified-entry" style={{left:hud.x,top:hud.y-64}} disabled={busy} onClick={()=>void walk(paths[active!].entry[0],paths[active!].entry[1],true)}>{phase==='walk'?'Идём…':world.entry}<span>⌄</span></button>}
    <p className="unified-help" role="status">{phase==='walk'?'Герой идёт к выбранной точке':phase==='zoom'?'Приближаемся к острову':entered?'Ты у входа':'Нажми на вход или на дорожку'}</p>
    {entered&&<div className="entry-panel" role="dialog" aria-modal="false" aria-label={world.name}><button className="entry-close" onClick={()=>setEntered(false)} aria-label="Вернуться на остров">×</button><span className="entry-kicker">VENTORME / {world.name}</span><h2>{world.action}</h2><p>{world.copy}</p><a className="pixel-primary" href={registrationHref}>{world.cta} ↗</a><small>Продолжить на платформе Ventorme</small></div>}
   </>}
  </div></section></main><footer className="pixel-footer"><span>VENTORME</span><p>Твой следующий шаг начинается с тебя.</p><a href="https://ventorme.ai/" target="_blank" rel="noopener noreferrer">О платформе ↗</a></footer>
 </div>;
}
