import {useEffect,useRef,useState} from 'react';
import type {CharacterMotion,Facing} from './PixelCharacter';
import metadata from './hero-atlas-meta.json';
import walkMetadata from './hero-walk-meta.json';
import actionMetadata from './hero-actions-meta.json';
import thinkingMetadata from './hero-university-v2-meta.json';
import {universityPose} from './universityAnimation';

const backCenters=[137.5,135,129,133,121.5,118.5,138.5,135,129.5,132,123.5,121.5,141,134,126.5,128.5,128.5,119,133,132,133.5,126,125,124].map(v=>v/256);
const backBaseline=[251,251,251,251,251,246,251,251,251,251,243,243,236,239,240,240,240,239,237,237,234,226,237,237].map(v=>v/256);
const atlases={
 back:{src:'/characters/hero-atlas.webp',columns:6,rows:4,centers:backCenters,baseline:backBaseline},
 frontSide:{src:'/characters/hero-front-side.webp',...metadata['hero-front-side']},
 frontJump:{src:'/characters/hero-front-jump.webp',...metadata['hero-front-jump']},
 walk:{src:'/journey/hero-walk-atlas.webp',...walkMetadata},
 actions:{src:'/journey/hero-actions-v2.webp',...actionMetadata['hero-actions-v2']},
 backJump:{src:'/journey/hero-back-jump-v2.webp',...actionMetadata['hero-back-jump-v2']},
 thinkingRaise:{src:'/journey/hero-university-raise-v2.webp',...thinkingMetadata.raise},
 thinkingBridge:{src:'/journey/hero-university-bridge-v2.webp',...thinkingMetadata.bridge},
 thinkingLook:{src:'/journey/hero-university-look-v2.webp',...thinkingMetadata.look},
};

export default function HeroSprite({mode='idle',facing='front',reduced=false,thinking=false,thinkingDeparture,onReady,onThinkingAssetsReady,sampleTime}:{mode?:CharacterMotion;facing?:Facing;reduced?:boolean;thinking?:boolean;thinkingDeparture?:number;onReady?:()=>void;onThinkingAssetsReady?:()=>void;sampleTime?:number}){
 const key=`${mode}:${facing}:${thinking}`;
 const [clock,setClock]=useState({key,t:0}),[loaded,setLoaded]=useState(false),[available,setAvailable]=useState<string[]>([]);
 const callback=useRef(onReady);callback.current=onReady;
 const thinkingCallback=useRef(onThinkingAssetsReady);thinkingCallback.current=onThinkingAssetsReady;
 const thinkingStart=useRef<number|null>(null);
 useEffect(()=>{
  let alive=true;
  const thinkingSources=new Set([atlases.thinkingRaise.src,atlases.thinkingBridge.src,atlases.thinkingLook.src]);
  let pendingThinking=thinkingSources.size;
  Object.values(atlases).forEach(async atlas=>{
   try{const image=new Image();image.src=atlas.src;await image.decode();if(alive){setAvailable(prev=>[...prev,atlas.src]);if(atlas===atlases.frontSide){setLoaded(true);callback.current?.();}}}catch{}
   finally{if(thinkingSources.has(atlas.src)&&--pendingThinking===0&&alive)thinkingCallback.current?.();}
  });
  return()=>{alive=false;};
 },[]);
 useEffect(()=>{
  setClock({key,t:0});if(reduced||sampleTime!==undefined)return;
  let id=0,last=-1;const start=performance.now();
  const loop=(now:number)=>{const frame=Math.floor((now-start)/65);if(frame!==last){last=frame;setClock({key,t:frame*65});}id=requestAnimationFrame(loop);};
  id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
 },[key,reduced,sampleTime===undefined]);
 const t=sampleTime??(clock.key===key?clock.t:0);
 let atlas=atlases.back,frame=0,poseScale=1;
 let thinkingPose:ReturnType<typeof universityPose>|undefined;
 const side=facing==='left'||facing==='right';
 const thinkingReady=available.includes(atlases.thinkingRaise.src)&&available.includes(atlases.thinkingBridge.src)&&available.includes(atlases.thinkingLook.src);
 if(!thinking)thinkingStart.current=null;
 else if(thinkingReady&&thinkingStart.current===null)thinkingStart.current=t;
 if(thinking&&mode==='idle'&&facing==='back'){
  if(thinkingReady){
   const pose=universityPose(Math.max(0,t-(thinkingStart.current??t)),thinkingDeparture,reduced);
   thinkingPose=pose;
   atlas=pose.sheet==='raise'?atlases.thinkingRaise:pose.sheet==='bridge'?atlases.thinkingBridge:atlases.thinkingLook;
   frame=pose.frame;poseScale=thinkingMetadata[pose.sheet].scales[frame];
  }else{atlas=atlases.backJump;frame=0;}
 }else if(mode==='interact'){
  atlas=atlases.actions;frame=reduced?0:Math.min(15,Math.floor(t/90));
 }else if(mode==='walk'&&(side||facing==='back')){
  atlas=atlases.walk;frame=(side?0:8)+(reduced?0:Math.floor(t/100)%8);
 }else if(mode==='idle'&&facing==='front'){
  atlas=atlases.frontSide;
  const cycle=t%8200;
  const wave=[4,5,6,5,6,5,4,7];
  if(!reduced){frame=cycle>=1300&&cycle<2340?wave[Math.floor((cycle-1300)/130)]:cycle>=5200&&cycle<5330?2:Math.floor(t/1300)%2;}
 }else if(side){
  atlas=atlases.frontSide;frame=8;
  if(!reduced){
   if(mode==='crouch')frame=t<100?8:9;
   if(mode==='push')frame=10;
   if(mode==='air')frame=t<220?11:12;
   if(mode==='fall')frame=13;
   if(mode==='land')frame=t<220?14:15;
  }
 }else if(facing==='front'&&mode!=='walk'){
  atlas=atlases.frontJump;
  if(!reduced){
   if(mode==='crouch')frame=t<120?0:1;
   if(mode==='push')frame=2;
   if(mode==='air')frame=t<220?3:4;
   if(mode==='fall')frame=5;
   if(mode==='land')frame=t<220?6:7;
  }
 }else if(!reduced){
  atlas=atlases.backJump;
  if(mode==='crouch')frame=Math.min(3,1+Math.floor(t/110));
  if(mode==='push')frame=t<80?4:5;
  if(mode==='air')frame=t<120?6:t<240?7:8;
  if(mode==='fall')frame=t<95?9:10;
  if(mode==='land')frame=t<80?11:t<180?12:t<300?13:t<430?14:15;
  if(mode==='walk')frame=facing==='front'?22+Math.floor(t/140)%2:14+Math.floor(t/90)%8;
 }
 if(!available.includes(atlas.src)){atlas=thinking&&available.includes(atlases.backJump.src)?atlases.backJump:atlases.frontSide;frame=0;poseScale=1;}
 const col=frame%atlas.columns,row=Math.floor(frame/atlas.columns);
 // Align each pose to the foot anchor, including tucked flight frames.
 const dx=(.5-atlas.centers[frame])*100*poseScale,dy=(.9-atlas.baseline[frame])*100*poseScale;
 if(thinkingPose&&thinkingReady){
  const sheets=[['raise',atlases.thinkingRaise],['bridge',atlases.thinkingBridge],['look',atlases.thinkingLook]] as const;
  return <div className="hero-sprite hero-thinking-sprite" data-pose={mode} data-facing={facing} data-frame={frame} data-loaded={loaded} data-atlas={atlas.src} aria-hidden="true">
   {sheets.map(([sheet,layer])=>{
    const active=sheet===thinkingPose.sheet,layerFrame=active?frame:0,scale=thinkingMetadata[sheet].scales[layerFrame];
    const x=(.5-layer.centers[layerFrame])*100*scale,y=(.9-layer.baseline[layerFrame])*100*scale;
    return <div key={sheet} className="hero-thinking-layer" style={{backgroundImage:`url(${layer.src})`,backgroundSize:'400% 200%',backgroundPosition:`${layerFrame%4/3*100}% ${Math.floor(layerFrame/4)*100}%`,opacity:active?1:0,transform:`translate(${x}%,${y}%) scale(${scale})`}}/>;
   })}
  </div>;
 }
 return <div className="hero-sprite" data-pose={mode} data-facing={facing} data-frame={frame} data-loaded={loaded} data-atlas={atlas.src} aria-hidden="true" style={{
  backgroundImage:loaded?`url(${atlas.src})`:undefined,
  backgroundSize:`${atlas.columns*100}% ${atlas.rows*100}%`,
  backgroundPosition:`${col/(atlas.columns-1)*100}% ${row/(atlas.rows-1)*100}%`,
  transform:`translate(${dx}%,${dy}%) ${poseScale===1?'':`scale(${poseScale})`} ${facing==='left'?'scaleX(-1)':''}`,
 }}/>
}
