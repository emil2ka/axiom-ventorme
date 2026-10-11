import {useEffect,useRef,useState} from 'react';
import type {CharacterMotion,Facing} from './PixelCharacter';
export default function HeroSprite({mode='idle',facing='back',reduced=false,onReady}:{mode?:CharacterMotion;facing?:Facing;reduced?:boolean;onReady?:()=>void}){
 const [clock,setClock]=useState({mode,t:0}),[loaded,setLoaded]=useState(false);const callback=useRef(onReady);callback.current=onReady;
 useEffect(()=>{const image=new Image();image.src='/characters/hero-atlas.png';let alive=true;image.decode().then(()=>{if(alive){setLoaded(true);callback.current?.();}}).catch(()=>{});return()=>{alive=false;};},[]);
 useEffect(()=>{setClock({mode,t:0});if(reduced)return;let id=0,last=-1;const start=performance.now();const loop=(now:number)=>{const frame=Math.floor((now-start)/80);if(frame!==last){last=frame;setClock({mode,t:frame*80});}id=requestAnimationFrame(loop);};id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);},[mode,reduced]);
 const t=clock.mode===mode?clock.t:0;let frame=0;
 if(!reduced){if(mode==='crouch')frame=Math.min(3,1+Math.floor(t/90));if(mode==='push')frame=t<80?4:5;if(mode==='air')frame=t<180?6:7;if(mode==='fall')frame=t<100?8:9;if(mode==='land')frame=t<80?10:t<180?11:t<300?12:t<430?13:0;if(mode==='walk')frame=facing==='front'?22+Math.floor(t/140)%2:14+Math.floor(t/90)%8;}
 const col=frame%6,row=Math.floor(frame/6);
 const centers=[137.5,135,129,133,121.5,118.5,138.5,135,129.5,132,123.5,121.5,141,134,126.5,128.5,128.5,119,133,132,133.5,126,125,124];
 const baseline=[251,251,251,251,251,246,251,251,251,251,243,243,236,239,240,240,240,239,237,237,234,226,237,237];
 return <div className={`hero-sprite ${facing==='left'?'sprite-left':''}`} data-pose={mode} data-frame={frame} data-loaded={loaded} aria-hidden="true" style={{backgroundImage:loaded?'url(/characters/hero-atlas.png)':undefined,backgroundPosition:`${col/5*100}% ${row/3*100}%`,transform:`translate(${(128-centers[frame])/256*100}%,${(230-baseline[frame])/256*100}%) ${facing==='left'?'scaleX(-1)':''}`}}/>;
}
