import {locations as sourceLocations,clamp,ease,lerp,INTRO_END,FINAL_START,JOURNEY_END,FLIGHT_LENGTH,DWELL_LENGTH,sceneStart,facingFor,type Location,type JourneyFrame} from './journeyModel';
import {UNIVERSITY_EXIT_SECONDS,UNIVERSITY_SCENE_SECONDS} from './universityAnimation';

export const isCompactViewport=(w:number,h:number)=>w<=760||(w<=1024&&h<=500);

export function mapLocations(w:number,h:number):Location[]{
 const mobile=isCompactViewport(w,h);
 // Keep the desktop map; portrait uses a compact orbit around the home island.
 const coords=mobile&&w<=h?[
  [0,0,230],[-260,260,430],[260,260,500],
  [0,-350,430],[-380,-210,280],[380,-210,280],
 ]:mobile?[
  [0,0,230],[-240,.0504*h*1000/w+106.2,430],[260,.0294*h*1000/w+137.1,500],
  [40,-.2016*h*1000/w+106.2,430],[-340,-.231*h*1000/w+47.9,280],[390,-.21*h*1000/w+50.7,280],
 ]:[[0,0,160],[-220,179,380],[330,123,520],[90,-269,345],[-200,-368,205],[450,-325,235]];
 return sourceLocations.map((loc,i)=>({...loc,image:i===0?loc.image:loc.id==='university'?'/journey/university-story.webp':`/journey/${i===3?'library':loc.id}-balanced.webp`,alt:loc.id==='university'?'Два университета на острове с развилкой дорожек':loc.alt,ratio:1,ground:i===0?.45:.62,x:coords[i][0],y:coords[i][1],width:coords[i][2]}));
}
export function mapCamera(w:number,h:number){return isCompactViewport(w,h)?{x:40,y:-.272*h*1000/w-52.9,width:1000}:{x:-181.25,y:-.099*h*1562.5/w,width:1562.5};}
export function journeyLocations(w:number,h:number):Location[]{
 const coords=[[0,0],[-240,360],[200,740],[-220,1120],[180,1500],[-200,1880]];
 return mapLocations(w,h).map((loc,i)=>({...loc,x:coords[i][0],y:coords[i][1]}));
}
export function renderLocations(frame:JourneyFrame,w:number,h:number):Location[]{
 const route=journeyLocations(w,h),p=frame.layout??1;
 return mapLocations(w,h).map((loc,i)=>({...loc,x:lerp(loc.x,route[i].x,p),y:lerp(loc.y,route[i].y,p)}));
}
const cameraMix=(a:JourneyFrame['camera'],b:JourneyFrame['camera'],p:number)=>({x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p),width:lerp(a.width,b.width,p)});
export function closeCamera(loc:Location,w:number,h:number){
 const mobile=isCompactViewport(w,h),landscape=mobile&&w>h,home=loc.id==='home',university=loc.id==='university';
 // Reserve room for the title and touch navigation on short phone screens.
 const sceneScale=landscape?Math.min(.65,(h-80)/w):Math.min(university?1.18:1.6,Math.max(1,(h-260)/w));
 const width=loc.width/(home?(mobile?(landscape?.34:h<700?.66:.72):.42):(mobile?sceneScale:university?.62:.78));
 const sx=landscape?.73:mobile?.5:home?.73:university?.66:.69,sy=landscape?.64:mobile?(home&&h<620?.73:.70):home?.61:university?.69:.73;
 return{x:loc.x-(sx-.5)*width,y:loc.y-(sy-.5)*h*width/w,width};
}
export function introFrame(raw:number,w:number,h:number):JourneyFrame{
 const p=clamp(raw/INTRO_END),home=journeyLocations(w,h)[0],camera=closeCamera(home,w,h);
 return{camera:{...camera,width:camera.width*(1+.07*ease(p))},hero:{x:0,y:0,z:0,mode:'idle',facing:'front',sample:undefined,landing:0},index:0,layout:1,phase:'intro',local:p,copyOpacity:1-ease((p-.76)/.23),mapLabels:0,action:0};
}
export function stationPoint(loc:Location){
 const side=loc.action==='compass'?-1:1;
 return{x:loc.x+(loc.action==='campus'?0:side*loc.width*.105),y:loc.y-(loc.action==='campus'?loc.width*.04:loc.width*.006)};
}
export function settledFrame(index:number,seconds:number,w:number,h:number):JourneyFrame{
 const loc=journeyLocations(w,h)[index],point=stationPoint(loc),walk=clamp(seconds/.8),p=ease(walk),action=clamp((seconds-.8)/1.44),working=index!==0&&loc.action!=='campus';
 return{camera:closeCamera(loc,w,h),hero:{x:lerp(loc.x,point.x,p),y:lerp(loc.y,point.y,p),z:0,mode:walk<1?'walk':working?'interact':'idle',facing:walk<1?facingFor(point.x-loc.x,point.y-loc.y):loc.action==='compass'?'left':'back',sample:walk<1?seconds*1000:working?(seconds-.8)*1000:0,landing:0},index,phase:'scene',local:clamp(seconds/2.15),copyOpacity:ease(seconds/.28),mapLabels:0,action};
}
export function hopFrame(from:number,to:number,p:number,w:number,h:number,start:JourneyFrame,homeRaw=0,mapSpace=false):JourneyFrame{
 const locs=mapSpace?mapLocations(w,h):journeyLocations(w,h),dest=locs[to],f=clamp((p-.22)/.56),path=ease(f);
 const begin=start.hero,end=mapSpace&&to!==0?stationPoint(dest):{x:dest.x,y:dest.y},dx=end.x-begin.x,dy=end.y-begin.y;
 const descending=dy>0,distance=Math.hypot(dx,dy),arc=descending?Math.max(55,Math.min(105,distance*.14)):Math.max(90,Math.min(175,distance*.22));
 const hero:JourneyFrame['hero']={x:lerp(begin.x,end.x,path),y:lerp(begin.y,end.y,descending?f*f:path),z:f===0||f===1?0:Math.sin(Math.PI*f)*arc,mode:'idle',facing:descending&&Math.abs(dx)>dy*.7?(dx<0?'left':'right'):facingFor(dx,dy),sample:0,landing:0};
 if(p<.14){hero.mode='crouch';hero.sample=p/.14*320;}
 else if(p<.22){hero.mode='push';hero.sample=(p-.14)/.08*180;}
 else if(p<.49){hero.mode='air';hero.sample=(p-.22)/.27*360;}
 else if(p<.78){hero.mode='fall';hero.sample=(p-.49)/.29*190;}
 else if(p<.98){hero.mode='land';hero.sample=(p-.78)/.2*470;hero.landing=clamp((p-.78)/.2);}
 else{hero.facing=to===0?'front':'back';}
 const destCam=to===0?introFrame(homeRaw,w,h).camera:closeCamera(dest,w,h);
 // Keep a medium shot during travel: reveal neighbouring scenery, not tiny map thumbnails.
 const wide=Math.min(780,Math.max(480,start.camera.width*1.15,destCam.width*1.15));
 const move=ease((p-.1)/.78),expand=ease(p/.4),approach=ease((p-.55)/.45);
 const width=lerp(lerp(start.camera.width,wide,expand),destCam.width,approach);
 // Follow the character, including a portion of its vertical arc. The endpoint
 // offsets are normalised, so changing zoom cannot push it out of the frame.
 const ox=lerp((start.camera.x-begin.x)/start.camera.width,(destCam.x-end.x)/destCam.width,move);
 const oy=lerp((start.camera.y-begin.y)/start.camera.width,(destCam.y-end.y)/destCam.width,move);
 return{camera:{x:hero.x+ox*width,y:hero.y+oy*width-hero.z*.55,width},hero,index:to,fromIndex:from,phase:'flight',local:p,copyOpacity:0,mapLabels:0,action:0};
}
export function requestedScene(raw:number){return raw<INTRO_END?0:Math.min(5,1+Math.floor((raw-INTRO_END)/(FLIGHT_LENGTH+DWELL_LENGTH)));}
export const HOP_SECONDS=1.85;
export function finalCamera(w:number,h:number){
 const camera=mapCamera(w,h);
 if(!isCompactViewport(w,h))return{...camera,x:camera.x-50,y:camera.y+25,width:1740};
 const islands=mapLocations(w,h);
 const top=Math.min(...islands.map(loc=>loc.y-loc.width*loc.ground));
 const bottom=Math.max(...islands.map(loc=>loc.y+loc.width*(1-loc.ground)+42));
 const landscape=w>h,areaTop=landscape?65:h<620?185:205,areaBottom=landscape?h-90:h-146;
 const left=Math.min(...islands.map(loc=>loc.x-loc.width/2)),right=Math.max(...islands.map(loc=>loc.x+loc.width/2));
 const width=Math.max((bottom-top)*w/Math.max(100,areaBottom-areaTop),landscape?Math.max(1540,(right-left)/.52):(right-left)*w/(w-40));
 return{...camera,x:landscape?(left+right)/2-.23*width:(left+right)/2,width,y:(top+bottom)/2-((areaTop+areaBottom)/2-h/2)*width/w};
}
/** Scroll requests a destination. A running hop always reaches its landing, even if scroll stops. */
export class JourneyPlayback{
 active=0;sceneSeconds=0;overview=0;run:null|{from:number;to:number;seconds:number;start:JourneyFrame}=null;
 universityExit:null|{seconds:number}=null;
 universityAssetsReady:boolean;
 constructor(universityAssetsReady=true){this.universityAssetsReady=universityAssetsReady;}
 mapActor=5;mapRun:null|{from:number;to:number;seconds:number;start:JourneyFrame}=null;
 homeReturn:null|{seconds:number;start:JourneyFrame}=null;
 last:JourneyFrame|null=null;
 isBusy(){return !!this.run||!!this.mapRun||!!this.homeReturn||!!this.universityExit||(this.active===2&&!this.universityAssetsReady)||(this.overview===1&&this.mapActor===5)||(this.active>0&&this.sceneSeconds<(this.active===2?UNIVERSITY_SCENE_SECONDS:2.25))||(this.overview>0&&this.overview<1);}
 update(raw:number,dt:number,w:number,h:number):JourneyFrame{
  raw=clamp(raw,0,JOURNEY_END);dt=clamp(dt,0,.08);const desired=requestedScene(raw);
  if(desired===0&&this.overview===1&&this.mapActor===0&&!this.mapRun&&!this.homeReturn&&this.last)this.homeReturn={seconds:0,start:this.last};
  if(this.homeReturn){
   this.homeReturn.seconds+=dt;const p=clamp(this.homeReturn.seconds/1.15),dest=introFrame(0,w,h);
   this.last={...dest,returning:true,layout:0,local:p,camera:cameraMix(this.homeReturn.start.camera,dest.camera,ease(p)),copyOpacity:ease((p-.3)/.7),mapLabels:1-ease(p/.35)};
   if(p>=1){this.active=0;this.sceneSeconds=0;this.overview=0;this.mapActor=5;this.homeReturn=null;}
   return this.last;
  }
  if(this.run){
   this.run.seconds+=dt;
   const p=clamp(this.run.seconds/HOP_SECONDS);
   this.last=hopFrame(this.run.from,this.run.to,p,w,h,this.run.start,raw);
   if(p>=1){this.active=this.run.to;this.sceneSeconds=0;this.run=null;}
   return this.last;
  }
  if(this.active===0&&desired===0){this.last=introFrame(raw,w,h);return this.last;}
  this.sceneSeconds+=dt;
  if(this.active===2&&!this.universityAssetsReady)this.sceneSeconds=Math.min(this.sceneSeconds,.8);
  const current=this.active===0?introFrame(INTRO_END,w,h):settledFrame(this.active,this.sceneSeconds,w,h);
  const showOverview=raw>=FINAL_START&&this.active===5&&this.sceneSeconds>=2.25;
  if(this.overview===1&&!this.mapRun&&((showOverview&&this.mapActor===5)||(!showOverview&&this.mapActor===0))){
   const from=this.mapActor,to=from===5?0:5,loc=mapLocations(w,h)[from],point=from===0?{x:loc.x,y:loc.y}:stationPoint(loc);
   this.mapRun={from,to,seconds:0,start:{...current,camera:finalCamera(w,h),hero:{...current.hero,...point,z:0}}};
  }
  this.overview=clamp(this.overview+((showOverview||this.mapRun||this.mapActor===0)?dt:-dt)/1.1);
  if(this.overview>0){
   const p=ease(this.overview);
   const end=finalCamera(w,h);
   const mapped=stationPoint(mapLocations(w,h)[5]);
   let hero:JourneyFrame['hero']={...current.hero,x:lerp(current.hero.x,mapped.x,p),y:lerp(current.hero.y,mapped.y,p),mode:'idle',facing:'front',sample:undefined};
   if(this.mapRun){
    this.mapRun.seconds+=dt;const q=clamp(this.mapRun.seconds/HOP_SECONDS),locs=mapLocations(w,h);
    const size=(i:number)=>locs[i].width*(i===0?64/280:50/400);
    const hop=hopFrame(this.mapRun.from,this.mapRun.to,q,w,h,this.mapRun.start,0,true);
    hero={...hop.hero,width:lerp(size(this.mapRun.from),size(this.mapRun.to),ease(q))};
    if(q>=1){this.mapActor=this.mapRun.to;this.mapRun=null;}
   }else if(this.mapActor===0){const home=mapLocations(w,h)[0];hero={...hero,x:home.x,y:home.y,width:home.width*64/280};}
   this.last={...current,layout:1-p,camera:cameraMix(current.camera,end,p),phase:'final',local:p,copyOpacity:p,mapLabels:p,hero};return this.last;
  }
  if(desired===this.active)this.universityExit=null;
  if(this.active===2&&desired!==2&&this.sceneSeconds>=UNIVERSITY_SCENE_SECONDS){
   this.universityExit??={seconds:0};this.universityExit.seconds+=dt;
   const departure=clamp(this.universityExit.seconds/UNIVERSITY_EXIT_SECONDS);
   if(departure<1){this.last={...current,universityDeparture:departure};return this.last;}
   this.universityExit=null;
  }
  if(desired!==this.active&&(this.active===0||this.sceneSeconds>=(this.active===2?UNIVERSITY_SCENE_SECONDS:2.25))){
   this.run={from:this.active,to:desired,seconds:0,start:this.last?.phase==='final'?current:this.last??current};
   this.last=hopFrame(this.active,desired,0,w,h,this.run.start,raw);return this.last;
  }
  this.last=current;return current;
 }
}
