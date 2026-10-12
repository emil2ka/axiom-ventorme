import {useEffect,useRef,useState} from 'react';
import {motion,useMotionValueEvent,useTransform,type MotionStyle,type MotionValue} from 'motion/react';

type Kind='round'|'wisp'|'bank'|'wide';
type Layer={kind:Kind;x:number;y:number;size:number;side:number;rise:number;flip?:boolean;near?:boolean;cover?:boolean};
// Individually composed depths and paths, rather than rows of identical sprites.
const foreground:Layer[]=[
 {kind:'wisp',x:14,y:9,size:35,side:-1,rise:-24},
 {kind:'round',x:76,y:15,size:32,side:1,rise:20,flip:true},
 {kind:'round',x:8,y:43,size:29,side:-1,rise:12},
 {kind:'wisp',x:86,y:48,size:48,side:1,rise:-20,flip:true},
 {kind:'wide',x:24,y:78,size:58,side:-1,rise:24},
 {kind:'round',x:81,y:87,size:36,side:1,rise:-12},
 {kind:'wisp',x:45,y:27,size:44,side:-1,rise:-22},
 {kind:'round',x:49,y:66,size:33,side:1,rise:28,flip:true},
 {kind:'bank',x:20,y:-7,size:104,side:-1,rise:-19,near:true},
 {kind:'wide',x:75,y:6,size:110,side:1,rise:-12,near:true,flip:true},
 {kind:'wide',x:18,y:35,size:112,side:-1,rise:8,near:true},
 {kind:'bank',x:79,y:42,size:106,side:1,rise:-8,near:true,flip:true},
 {kind:'bank',x:26,y:70,size:108,side:-1,rise:18,near:true,flip:true},
 {kind:'wide',x:74,y:77,size:115,side:1,rise:16,near:true},
 {kind:'wide',x:18,y:107,size:109,side:-1,rise:28,near:true,flip:true},
 {kind:'bank',x:83,y:108,size:112,side:1,rise:24,near:true},
];
const layers=foreground;
const source=(kind:Kind)=>`/sky/pixel-cloud-${kind==='wide'?'v1':kind+'-v1'}.png`;
function Cloud({progress,revealing,layer,index}:{progress:MotionValue<number>;revealing:boolean;layer:Layer;index:number}){
 const x=useTransform(progress,p=>`${layer.side*(revealing?-95:75)*(1-p)}vw`);
 const y=useTransform(progress,p=>`${layer.rise*(revealing?-1:1)*(1-p)+Math.sin(p*Math.PI)*(index%2?7:-7)}svh`);
 const scale=useTransform(progress,p=>layer.near?.88+p*.24:.8+p*.18);
 const opacity=useTransform(progress,layer.cover?[0,.67,.88,1]:[0,.06,.16,1],layer.cover?[0,0,1,1]:[0,0,1,1]);
 return <motion.div className={`fog-cloud fog-cloud-${layer.kind} ${layer.near?'fog-cloud-near':'fog-cloud-far'}`} style={{left:`${layer.x}%`,top:`${layer.y}%`,x,y,scale,opacity,'--cloud-size':`${layer.size}vw`} as MotionStyle}>
  <div className="fog-cloud-art"><img src={source(layer.kind)} alt="" draggable={false} style={{transform:layer.flip?'scaleX(-1)':'none'}}/></div>
 </motion.div>;
}
// The last gaps close with many small native-resolution sprites, never one enlarged cloud.
function CloudCover({progress}:{progress:MotionValue<number>}){
 const ref=useRef<HTMLCanvasElement>(null);
 const opacity=useTransform(progress,[0,.68,.93,1],[0,0,1,1]);
 useEffect(()=>{
  let disposed=false;
  const round=new Image(),bank=new Image();round.src=source('round');bank.src=source('bank');
  const draw=()=>{
   if(disposed||!round.complete||!bank.complete||!round.naturalWidth||!bank.naturalWidth)return;
   const canvas=ref.current!,ctx=canvas.getContext('2d');if(!ctx)return;
   const w=innerWidth,h=innerHeight,dpr=Math.min(2,devicePixelRatio||1),small=w<=760;
   canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
   const dx=small?65:130,dy=small?65:100;
   let i=0;
   for(let y=-dy;y<h+dy*2;y+=dy)for(let x=-dx;x<w+dx*2;x+=dx){
    const seed=(i*37+11)%101,isBank=i%3===0,img=isBank?bank:round;
    const width=(small?(isBank?430:260):(isBank?650:410))*(.92+seed/625),height=width*img.naturalHeight/img.naturalWidth;
    const cx=x+(seed%23-11),cy=y+((i*19)%25-12);
    ctx.save();ctx.translate(cx,cy);if(i%2)ctx.scale(-1,1);ctx.drawImage(img,-width/2,-height/2,width,height);ctx.restore();i++;
   }
  };
  void Promise.all([round.decode(),bank.decode()]).then(draw).catch(()=>{});
  window.addEventListener('resize',draw);return()=>{disposed=true;window.removeEventListener('resize',draw);};
 },[]);
 return <motion.canvas ref={ref} className="cloud-cover" style={{opacity}}/>;
}
export default function PixelFog({progress,revealing=false}:{progress:MotionValue<number>;revealing?:boolean}){
 const [covered,setCovered]=useState(false),coverage=useRef(false);
 useMotionValueEvent(progress,'change',p=>{const next=p>=1;if(next!==coverage.current){coverage.current=next;setCovered(next);}});
 return <div className="fog-clouds" data-covered={covered} data-flow={revealing?'through':'gather'} aria-hidden="true"><CloudCover progress={progress}/>{layers.map((layer,i)=><Cloud key={i} index={i} layer={layer} progress={progress} revealing={revealing}/>)}</div>;
}
