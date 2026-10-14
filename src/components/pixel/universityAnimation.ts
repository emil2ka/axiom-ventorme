export const UNIVERSITY_EXIT_SECONDS=.8;
export const UNIVERSITY_SCENE_SECONDS=3.2;

const raising=[
 ['raise',0,250],['raise',1,180],['raise',2,160],
 ['bridge',0,110],['bridge',1,110],['raise',3,160],
 ['bridge',2,110],['bridge',3,110],['raise',4,160],
 ['bridge',4,110],['raise',5,180],['raise',6,180],['raise',7,180],
] as const;
export const UNIVERSITY_RAISE_MS=raising.reduce((total,[,,duration])=>total+duration,0);
const looking=[[0,650],[1,240],[2,1200],[3,240],[4,650],[5,400],[6,1200],[7,400]] as const;
const lookDuration=looking.reduce((total,[,duration])=>total+duration,0);

export function universityPose(milliseconds:number,departure?:number,reduced=false):{sheet:'raise'|'bridge'|'look';frame:number;step:number}{
 if(reduced)return{sheet:'raise',frame:7,step:raising.length-1};
 if(departure!==undefined){
  const p=Math.max(0,Math.min(1,departure)),eased=p*p*(3-2*p);
  const step=Math.round((raising.length-1)*(1-eased)),[sheet,frame]=raising[step];
  return{sheet,frame,step};
 }
 const time=Math.max(0,milliseconds);
 if(time<UNIVERSITY_RAISE_MS){
  let local=time;
  for(let step=0;step<raising.length;step++){
   const [sheet,frame,duration]=raising[step];
   if(local<duration)return{sheet,frame,step};local-=duration;
  }
 }
 let local=(time-UNIVERSITY_RAISE_MS)%lookDuration;
 for(const [frame,duration] of looking){if(local<duration)return{sheet:'look',frame,step:raising.length+frame};local-=duration;}
 return{sheet:'look',frame:0,step:raising.length};
}
