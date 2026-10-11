import { useEffect, useState } from 'react';
export type CharacterMotion = 'idle'|'crouch'|'push'|'air'|'fall'|'land'|'walk';
export type Facing = 'back'|'front'|'left'|'right';
const mix=(a:number,b:number,t:number)=>Math.round(a+(b-a)*Math.max(0,Math.min(1,t)));

// The feet remain the anchor. Knees, elbows, torso and backpack change pose independently.
export default function PixelCharacter({mode='idle',facing='back',reduced=false}:{mode?:CharacterMotion;facing?:Facing;reduced?:boolean}){
 const [sample,setSample]=useState({mode,time:0});
 const time=sample.mode===mode?sample.time:0;
 useEffect(()=>{setSample({mode,time:0});if(reduced)return;let id=0,last=-1;const start=performance.now();const loop=(now:number)=>{const frame=Math.floor((now-start)/75);if(frame!==last){last=frame;setSample({mode,time:frame*75});}id=requestAnimationFrame(loop);};id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);},[mode,reduced]);
 let down=0,knee=0,tuck=0,arms=0,stride=0;
 const m=reduced?'idle':mode;
 if(m==='idle')down=Math.round(Math.sin(time/750)*.6);
 if(m==='crouch'){const p=Math.min(1,time/240);down=mix(0,12,p);knee=mix(0,8,p);arms=mix(0,5,p);}
 if(m==='push'){const p=Math.min(1,time/140);down=mix(10,-5,p);knee=mix(7,0,p);arms=mix(5,-13,p);}
 if(m==='air'){down=-5;knee=8;tuck=13;arms=-13;}
 if(m==='fall'){const p=Math.min(1,time/180);down=mix(-5,0,p);knee=mix(8,1,p);tuck=mix(13,0,p);arms=mix(-13,-3,p);}
 if(m==='land'){const p=Math.min(1,time/450);down=p<.25?mix(0,13,p/.25):mix(13,0,(p-.25)/.75);knee=Math.round(down*.7);arms=Math.round(down*.35);}
 if(m==='walk'){stride=Math.sin(time/105);down=Math.round(-Math.abs(stride)*2);}
 const hip=56+down,foot=78-tuck;
 const kneeY=m==='air'?61:Math.min(72,65+down/2);
 const k1={x:18-knee+Math.round(stride*3),y:Math.round(kneeY-Math.max(0,stride)*3)};
 const k2={x:30+knee-Math.round(stride*3),y:Math.round(kneeY-Math.max(0,-stride)*3)};
 const f1={x:18+Math.round(stride*3),y:foot-Math.round(Math.max(0,stride)*7)};
 const f2={x:30-Math.round(stride*3),y:foot-Math.round(Math.max(0,-stride)*7)};
 const hand1={x:7-Math.round(stride*2),y:50+down+arms+Math.round(stride*5)};
 const hand2={x:41+Math.round(stride*2),y:50+down+arms-Math.round(stride*5)};
 const front=facing==='front';const side=facing==='left'||facing==='right';
 const leg=(x:number,k:{x:number;y:number},f:{x:number;y:number},key:string)=><g key={key}><path d={`M${x} ${hip}L${k.x} ${k.y}L${f.x} ${f.y-2}`} fill="none" stroke="#182a45" strokeWidth="8"/><path d={`M${x-1} ${hip}L${k.x-1} ${k.y}L${f.x-1} ${f.y-2}`} fill="none" stroke="#34577d" strokeWidth="4"/><path d={`M${f.x-5} ${f.y-2}h10v4h-11v-2h1z`} fill="#14243c"/><path d={`M${f.x-4} ${f.y-1}h7v1h-7z`} fill="#728998"/></g>;
 const arm=(x:number,h:{x:number;y:number},left:boolean)=><g><path d={`M${x} ${32+down}L${left?7:41} ${39+down+arms/2}L${h.x} ${h.y}`} fill="none" stroke="#24449f" strokeWidth="8"/><path d={`M${x-1} ${32+down}L${left?6:40} ${39+down+arms/2}L${h.x-1} ${h.y}`} fill="none" stroke="#477bfa" strokeWidth="4"/><rect x={h.x-3} y={h.y-2} width="6" height="7" fill="#d6a37e"/><rect x={h.x-3} y={h.y+2} width="2" height="3" fill="#a7765e"/></g>;
 return <svg viewBox="0 0 48 82" className="character-svg" shapeRendering="crispEdges" aria-hidden="true" data-pose={mode} data-facing={facing}>
 <g transform={side?`translate(24 0) scale(${facing==='left'?-.8:.8} 1) translate(-24 0)`:undefined}>
 {leg(19,k1,f1,'left')}{leg(29,k2,f2,'right')}
 {arm(13,hand1,true)}{arm(35,hand2,false)}
 <g transform={`translate(0 ${down})`}>
 <path fill="#274cb9" d="M14 28h20v5h3v24H11V33h3z"/><path fill="#3a68e7" d="M15 29h9v25H13V34h2z"/><path fill="#6a95ff" d="M14 32h3v17h-3z"/>
 <path fill="#d5a27d" d="M19 20h10v11H19z"/><path fill="#ae7d60" d="M19 23h10v4H19z"/>
 <path fill="#322b32" d="M17 3h13v2h5v5h3v11h-4v4H16v-3h-4V10h3V6h2z"/>
 <path fill="#5d4338" d="M17 5h11v2h6v6h-7v-3H15V8h2z"/><path fill="#89614a" d="M18 5h8v2h-8zM16 9h5v2h-5z"/><path fill="#252934" d="M14 18h4v5h-4zM31 19h3v4h-3z"/>
 {(front||side)&&<><path fill="#dfa981" d="M17 14h14v9h-3v3h-8v-3h-3z"/><path fill="#bc8667" d="M28 16h3v7h-3z"/><path fill="#302b32" d="M16 12h15v5h-3v-3h-7v4h-5z"/><rect x={side?27:20} y="19" width="2" height="2" fill="#222638"/>{!side&&<rect x="27" y="19" width="2" height="2" fill="#222638"/>}</>}
 {!front?<><path fill="#42574d" d="M15 33h18v25H15z"/><path fill="#aebd2f" d="M17 34h15v23H17z"/><path fill="#dfff00" d="M17 34h15v15H17z"/><path fill="#eeff7b" d="M18 35h12v3H18z"/><path fill="#93a529" d="M18 49h13v7H18z"/><path fill="#6c7a27" d="M20 48h9v2h-9zM20 52h2v2h-2zM27 52h2v2h-2z"/><path fill="#324837" d="M15 34h2v18h-2zM32 34h2v18h-2z"/></>:<><path fill="#a2c736" d="M14 32h3v18h-3zM31 32h3v18h-3z"/><path fill="#203f9b" d="M23 32h2v23h-2z"/><path fill="#6a90ed" d="M25 34h1v18h-1z"/></>}
 </g></g></svg>;
}
