import {describe,it,expect} from 'vitest';
import {JourneyPlayback,HOP_SECONDS,mapLocations,mapCamera,requestedScene,journeyLocations,introFrame} from '../src/components/pixel/journeyPlayback';
import {INTRO_END,sceneStart,FINAL_START} from '../src/components/pixel/journeyModel';
function advance(player:JourneyPlayback,raw:number,seconds:number){let f=player.update(raw,0,390,844);for(let t=0;t<seconds;t+=1/60)f=player.update(raw,1/60,390,844);return f;}
describe('complete scroll-triggered actions',()=>{
 it('lands and starts its action when the user stops scrolling midway through the trigger range',()=>{
  const p=new JourneyPlayback();p.update(0,0,390,844);
  const mid=advance(p,INTRO_END+.13,HOP_SECONDS*.48);expect(mid.phase).toBe('flight');expect(mid.hero.z).toBeGreaterThan(0);
  const finished=advance(p,INTRO_END+.13,HOP_SECONDS+2.5);expect(finished.phase).toBe('scene');expect(finished.index).toBe(1);expect(finished.hero.z).toBe(0);expect(finished.action).toBe(1);
 });
 it('finishes the current jump and uses only the latest requested destination',()=>{
  const p=new JourneyPlayback();p.update(0,0,390,844);advance(p,INTRO_END+.2,.5);
  advance(p,sceneStart(3),.1);advance(p,sceneStart(5),.1);const first=advance(p,sceneStart(5),1.3);
  expect(first.index).toBe(1);expect(first.hero.z).toBe(0);
  const last=advance(p,sceneStart(5),4);expect(last.index).toBe(5);expect(last.phase).toBe('scene');expect(p.run).toBeNull();
 });
 it('returns home with a completed reverse jump',()=>{
  const p=new JourneyPlayback();p.update(0,0,390,844);advance(p,sceneStart(2),4);
  const back=advance(p,0,4);expect(back.phase).toBe('intro');expect(back.hero.z).toBe(0);expect(p.active).toBe(0);
 });
 it('keeps the old map placement: campus right, library above, two small upper corners',()=>{
  const a=mapLocations(1440,900),c=mapCamera(1440,900),k=1440/c.width;
  const x=(i:number)=>720+(a[i].x-c.x)*k;
  expect(x(2)).toBeGreaterThan(x(0));expect(x(1)).toBeLessThan(x(0));expect(a[3].y).toBeLessThan(a[0].y);
  expect(a[2].width).toBeGreaterThan(a[4].width);expect(a[2].width).toBeGreaterThan(a[5].width);
 });
 it('a trigger range requests a destination, not an incomplete physics pose',()=>{expect(requestedScene(INTRO_END+.01)).toBe(1);});
 it('starts on the home island and descends before revealing the map only in the finale',()=>{
  const a=introFrame(0,1440,900),b=introFrame(INTRO_END-.01,1440,900),route=journeyLocations(1440,900);
  expect(b.camera.width/a.camera.width).toBeLessThan(1.1);expect(b.mapLabels).toBe(0);
  for(let i=1;i<route.length;i++)expect(route[i].y).toBeGreaterThan(route[i-1].y);
  const p=new JourneyPlayback();const final=advance(p,FINAL_START+.1,6);expect(final.phase).toBe('final');expect(final.layout).toBe(0);
  const reverse=advance(p,sceneStart(5),.4);expect(reverse.layout).toBeGreaterThan(0);expect(reverse.layout).toBeLessThan(1);
  const close=advance(p,sceneStart(5),1);expect(close.phase).toBe('scene');expect(close.index).toBe(5);
 });
});
