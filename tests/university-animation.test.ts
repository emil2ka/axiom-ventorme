import {describe,it,expect} from 'vitest';
import {universityPose,UNIVERSITY_RAISE_MS} from '../src/components/pixel/universityAnimation';

describe('university thinking poses',()=>{
 it('raises the hand through adjacent frames and then keeps the hand at the chin',()=>{
  let previous=universityPose(0).step;
  for(let time=100;time<UNIVERSITY_RAISE_MS;time+=100){
   const pose=universityPose(time);expect(pose.sheet).not.toBe('look');
   expect(pose.step-previous).toBeGreaterThanOrEqual(0);expect(pose.step-previous).toBeLessThanOrEqual(1);previous=pose.step;
  }
  expect(previous).toBe(12);
  for(const time of [2000,4000,10000,30000])expect(universityPose(time).sheet).toBe('look');
 });
 it('returns to the original neutral pose through adjacent frames before departure',()=>{
  expect(universityPose(20000,0)).toMatchObject({sheet:'raise',frame:7});
  let previous=universityPose(20000,0).step;
  for(let step=1;step<=20;step++){
   const pose=universityPose(20000,step/20);
   expect(pose.sheet).not.toBe('look');expect(previous-pose.step).toBeGreaterThanOrEqual(0);expect(previous-pose.step).toBeLessThanOrEqual(1);previous=pose.step;
  }
  expect(previous).toBe(0);
 });
 it('uses one static contemplative pose when motion is reduced',()=>{
  expect(universityPose(0,undefined,true)).toEqual(universityPose(20000,undefined,true));
 });
});
