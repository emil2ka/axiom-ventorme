import {describe,it,expect} from 'vitest';
import {ScrollGestureGate} from '../src/components/pixel/journeyInput';
describe('scroll episode gate',()=>{
 it('accepts one gesture and ignores its continuing momentum',()=>{
  const g=new ScrollGestureGate();expect(g.accept(0,false)).toBe(true);
  for(let t=16;t<500;t+=16)expect(g.accept(t,false)).toBe(false);
  expect(g.accept(900,false)).toBe(true);
 });
 it('does not replay scrolling that happened during an unfinished action',()=>{
  const g=new ScrollGestureGate();expect(g.accept(0,true)).toBe(false);
  expect(g.accept(100,true)).toBe(false);expect(g.accept(200,false)).toBe(false);
  expect(g.accept(600,false)).toBe(true);
 });
});
