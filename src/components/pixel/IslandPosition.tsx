import type {ReactNode} from 'react';
import {motion,useTransform,type MotionValue,type MotionStyle} from 'motion/react';

const desktopMap=[{x:18,y:69,w:38},{x:73,y:54,w:52},{x:49,y:11,w:34.5},{x:20,y:5,w:20.5},{x:85,y:9,w:23.5}];
const mobileMap=[{x:22,y:72,w:43},{x:72,y:67,w:50},{x:50,y:12,w:43},{x:12,y:5,w:28},{x:85,y:10,w:28}];
const desktopSky=[{x:28,y:12,w:14},{x:73,y:1,w:18},{x:50,y:7,w:16},{x:8,y:3,w:12},{x:92,y:11,w:12}];
const mobileSky=[{x:29,y:5,w:18},{x:73,y:-5,w:22},{x:51,y:2,w:22},{x:10,y:-4,w:17},{x:92,y:8,w:18}];

// Move the existing sprites themselves: the intro never swaps to a different map image.
export default function IslandPosition({index,progress,mobile,hidden=false,reduced=false,children}:{index:number|'home';progress:MotionValue<number>;mobile:boolean;hidden?:boolean;reduced?:boolean;children:ReactNode}){
 const home=index==='home';
 const start=home?(mobile?{x:54,y:52,w:82}:{x:58,y:53,w:66}):(mobile?mobileSky:desktopSky)[index];
 const end=home?(mobile?{x:46,y:60,w:23}:{x:40,y:59,w:16}):(mobile?mobileMap:desktopMap)[index];
 const x=useTransform(progress,v=>`${start.x+(end.x-start.x)*v}%`);
 const y=useTransform(progress,v=>`${start.y+(end.y-start.y)*v}%`);
 const width=useTransform(progress,v=>`${start.w+(end.w-start.w)*v}%`);
 const style={'--journey-x':x,'--journey-y':y,'--journey-width':width} as MotionStyle;
 return <motion.div className={home?'home-island':`island island-${index}`} data-island={index} style={style} animate={{opacity:hidden?0:1}} transition={{duration:reduced?0:.35}} inert={hidden}>{children}</motion.div>;
}
