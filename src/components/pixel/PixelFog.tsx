import {useEffect,useRef} from 'react';
import {motion,useTransform,type MotionValue} from 'motion/react';

const clouds=Array.from({length:12},(_,i)=>({
 x:[8,50,92][i%3],y:[-5,31,67,103][Math.floor(i/3)],
 side:i%3===0?-1:i%3===2?1:Math.floor(i/3)%2?-1:1,
 flip:i%2===0,depth:.9+(i%3)*.09,
}));
function Cloud({progress,index}:{progress:MotionValue<number>;index:number}){
 const cloud=clouds[index];
 const left=useTransform(progress,p=>`${cloud.x+cloud.side*65*(1-p)}%`);
 const top=useTransform(progress,p=>`${cloud.y+(index%2?14:-14)*(1-p)}%`);
 const scale=useTransform(progress,p=>(.86+p*.23)*cloud.depth);
 const opacity=useTransform(progress,[0,.16,.55,1],[0,.25,1,1]);
 return <motion.div className="fog-cloud" style={{left,top,scale,opacity}}>
  <img src="/sky/pixel-cloud-v1.png" alt="" draggable={false} style={{scale:cloud.flip?'-1 1':'1'}}/>
 </motion.div>;
}

/** Native pixel clouds. At progress=1 every cell is opaque before scenery changes. */
export default function PixelFog({progress}:{progress:MotionValue<number>}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d');if(!ctx)return;
  const draw=()=>{
   const p=progress.get();canvas.style.visibility=p>0?'visible':'hidden';
   canvas.dataset.covered=String(p>=1);
   const cell=innerWidth<760?16:22;
   const width=Math.ceil(innerWidth/cell),height=Math.ceil(innerHeight/cell);
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
   ctx.clearRect(0,0,width,height);if(p<=0)return;
   // Only seal remaining gaps after the illustrated clouds have gathered.
   // An early geometric curtain would compete with their organic silhouettes.
   const t=p>=1?1:Math.max(0,Math.min(1,(p-.78)/.22));if(t===0)return;
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const cloud=Math.sin(x*.14+y*.21)*Math.sin(y*.12-x*.11);
    const shade=Math.round(9*cloud);
    ctx.globalAlpha=t*t*(3-2*t);
    ctx.fillStyle=`rgb(${166+shade},${199+shade},${227+shade})`;
    ctx.fillRect(x,y,1,1);
   }
   ctx.globalAlpha=1;
  };
  draw();const unsubscribe=progress.on('change',draw);window.addEventListener('resize',draw);
  return()=>{unsubscribe();window.removeEventListener('resize',draw);};
 },[progress]);
 return <><canvas ref={ref} className="pixel-fog" aria-hidden="true"/>
  <div className="fog-clouds" aria-hidden="true">{clouds.map((_,i)=><Cloud key={i} index={i} progress={progress}/>)}</div>
 </>;
}
