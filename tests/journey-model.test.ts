import {describe,it,expect} from 'vitest';
import {hopFrame,settledFrame,introFrame,journeyLocations,mapLocations,finalCamera} from '../src/components/pixel/journeyPlayback';
import {INTRO_END} from '../src/components/pixel/journeyModel';

describe('camera and sprite geometry for complete jumps',()=>{
 for(const [w,h] of [[1440,900],[320,568],[375,667],[390,844],[430,932],[740,390],[932,430]]){
  it(`keeps the hero visible for every forward and reverse destination at ${w}px`,()=>{
   for(let from=0;from<6;from++)for(let to=0;to<6;to++)if(from!==to){
    const start=from===0?introFrame(INTRO_END,w,h):settledFrame(from,3,w,h);
    for(let p=0;p<=1;p+=.02){const f=hopFrame(from,to,p,w,h,start),k=w/f.camera.width;
     const x=w/2+(f.hero.x-f.camera.x)*k,y=h/2+(f.hero.y-f.hero.z-f.camera.y)*k;
     expect(x).toBeGreaterThan(40);expect(x).toBeLessThan(w-25);expect(y).toBeGreaterThan(100);expect(y).toBeLessThan(h-45);
    }
   }
  });
  it(`matches the actual starting frame and destination surface at ${w}px`,()=>{
   const a=settledFrame(3,3,w,h),first=hopFrame(3,4,0,w,h,a),end=hopFrame(3,4,1,w,h,a),next=settledFrame(4,0,w,h),loc=journeyLocations(w,h)[4];
   expect(first.hero.x).toBe(a.hero.x);expect(first.hero.y).toBe(a.hero.y);for(const key of ['x','y','width'] as const)expect(first.camera[key]).toBeCloseTo(a.camera[key],8);
   expect(end.hero.x).toBeCloseTo(loc.x,8);expect(end.hero.y).toBeCloseTo(loc.y,8);expect(end.hero.z).toBe(0);for(const key of ['x','y','width'] as const)expect(end.camera[key]).toBeCloseTo(next.camera[key],8);
  });
 }
});

// The final map must fit above the touch controls, even on short screens.
describe('mobile overview framing',()=>{
 for(const [w,h] of [[320,568],[375,667],[390,844],[430,932],[740,390],[932,430]]){
  it(`keeps every island inside the viewport at ${w}×${h}`,()=>{
   const camera=finalCamera(w,h),k=w/camera.width;
   for(const loc of mapLocations(w,h)){
    const x=w/2+(loc.x-camera.x)*k,y=h/2+(loc.y-camera.y)*k;
    expect(x-loc.width*k/2).toBeGreaterThan(0);
    expect(x+loc.width*k/2).toBeLessThan(w);
    expect(y-loc.width*loc.ground*k).toBeGreaterThan(58);
    expect(y+loc.width*(1-loc.ground)*k).toBeLessThan(h-65);
   }
  });
 }
});
