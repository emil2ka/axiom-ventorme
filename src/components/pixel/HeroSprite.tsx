import {useEffect,useRef,useState} from 'react';
import type {CharacterMotion,Facing} from './PixelCharacter';
import metadata from './hero-atlas-meta.json';
import walkMetadata from './hero-walk-meta.json';
import actionMetadata from './hero-actions-meta.json';

const backCenters=[137.5,135,129,133,121.5,118.5,138.5,135,129.5,132,123.5,121.5,141,134,126.5,128.5,128.5,119,133,132,133.5,126,125,124].map(v=>v/256);
const backBaseline=[251,251,251,251,251,246,251,251,251,251,243,243,236,239,240,240,240,239,237,237,234,226,237,237].map(v=>v/256);
const atlases={
 back:{src:'/characters/hero-atlas.png',columns:6,rows:4,centers:backCenters,baseline:backBaseline},
 frontSide:{src:'/characters/hero-front-side.png',...metadata['hero-front-side']},
 frontJump:{src:'/characters/hero-front-jump.png',...metadata['hero-front-jump']},
 walk:{src:'/journey/hero-walk-atlas.png',...walkMetadata},
 actions:{src:'/journey/hero-actions-v2.png',...actionMetadata['hero-actions-v2']},
 backJump:{src:'/journey/hero-back-jump-v2.png',...actionMetadata['hero-back-jump-v2']},
};

export default function HeroSprite({mode='idle',facing='front',reduced=false,onReady,sampleTime}:{mode?:CharacterMotion;facing?:Facing;reduced?:boolean;onReady?:()=>void;sampleTime?:number}){
 const key=`${mode}:${facing}`;
 const [clock,setClock]=useState({key,t:0}),[loaded,setLoaded]=useState(false),[available,setAvailable]=useState<string[]>([]);
 const callback=useRef(onReady);callback.current=onReady;
 useEffect(()=>{
  let alive=true;
  Object.values(atlases).forEach(async atlas=>{try{const image=new Image();image.src=atlas.src;await image.decode();if(alive){setAvailable(prev=>[...prev,atlas.src]);if(atlas===atlases.frontSide){setLoaded(true);callback.current?.();}}}catch{}});
  return()=>{alive=false;};
 },[]);
 useEffect(()=>{
  setClock({key,t:0});if(reduced||sampleTime!==undefined)return;
  let id=0,last=-1;const start=performance.now();
  const loop=(now:number)=>{const frame=Math.floor((now-start)/65);if(frame!==last){last=frame;setClock({key,t:frame*65});}id=requestAnimationFrame(loop);};
  id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
 },[key,reduced,sampleTime===undefined]);
 const t=sampleTime??(clock.key===key?clock.t:0);
 let atlas=atlases.back,frame=0;
 const side=facing==='left'||facing==='right';
 if(mode==='interact'){
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
 if(!available.includes(atlas.src)){atlas=atlases.frontSide;frame=0;}
 const col=frame%atlas.columns,row=Math.floor(frame/atlas.columns);
 // Align each pose to the foot anchor, including tucked flight frames.
 const dx=(.5-atlas.centers[frame])*100,dy=(.9-atlas.baseline[frame])*100;
 return <div className="hero-sprite" data-pose={mode} data-facing={facing} data-frame={frame} data-loaded={loaded} data-atlas={atlas.src} aria-hidden="true" style={{
  backgroundImage:loaded?`url(${atlas.src})`:undefined,
  backgroundSize:`${atlas.columns*100}% ${atlas.rows*100}%`,
  backgroundPosition:`${col/(atlas.columns-1)*100}% ${row/(atlas.rows-1)*100}%`,
  transform:`translate(${dx}%,${dy}%) ${facing==='left'?'scaleX(-1)':''}`,
 }}/>
}
