import {useEffect,useRef,useState} from 'react';
import type {CharacterMotion,Facing} from './PixelCharacter';
import metadata from './hero-atlas-meta.json';

const backCenters=[137.5,135,129,133,121.5,118.5,138.5,135,129.5,132,123.5,121.5,141,134,126.5,128.5,128.5,119,133,132,133.5,126,125,124].map(v=>v/256);
const backBaseline=[251,251,251,251,251,246,251,251,251,251,243,243,236,239,240,240,240,239,237,237,234,226,237,237].map(v=>v/256);
const atlases={
 back:{src:'/characters/hero-atlas.png',columns:6,rows:4,centers:backCenters,baseline:backBaseline},
 frontSide:{src:'/characters/hero-front-side.png',...metadata['hero-front-side']},
 frontJump:{src:'/characters/hero-front-jump.png',...metadata['hero-front-jump']},
};

export default function HeroSprite({mode='idle',facing='front',reduced=false,onReady}:{mode?:CharacterMotion;facing?:Facing;reduced?:boolean;onReady?:()=>void}){
 const key=`${mode}:${facing}`;
 const [clock,setClock]=useState({key,t:0}),[loaded,setLoaded]=useState(false);
 const callback=useRef(onReady);callback.current=onReady;
 useEffect(()=>{
  let alive=true;
  Promise.all(Object.values(atlases).map(async atlas=>{const image=new Image();image.src=atlas.src;await image.decode();})).then(()=>{if(alive){setLoaded(true);callback.current?.();}}).catch(()=>{});
  return()=>{alive=false;};
 },[]);
 useEffect(()=>{
  setClock({key,t:0});if(reduced)return;
  let id=0,last=-1;const start=performance.now();
  const loop=(now:number)=>{const frame=Math.floor((now-start)/65);if(frame!==last){last=frame;setClock({key,t:frame*65});}id=requestAnimationFrame(loop);};
  id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
 },[key,reduced]);
 const t=clock.key===key?clock.t:0;
 let atlas=atlases.back,frame=0;
 const side=facing==='left'||facing==='right';
 if(mode==='idle'&&facing==='front'){
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
  if(mode==='crouch')frame=Math.min(3,1+Math.floor(t/90));
  if(mode==='push')frame=t<80?4:5;
  if(mode==='air')frame=t<180?6:7;
  if(mode==='fall')frame=t<100?8:9;
  if(mode==='land')frame=t<80?10:t<180?11:t<300?12:t<430?13:0;
  if(mode==='walk')frame=facing==='front'?22+Math.floor(t/140)%2:14+Math.floor(t/90)%8;
 }
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
