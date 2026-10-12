/** One deliberate scroll gesture requests one completed episode. Busy input is discarded. */
export class ScrollGestureGate {
 private lastAt=-Infinity;
 private consumed=false;
 accept(at:number,locked:boolean){
  if(at-this.lastAt>180)this.consumed=false;
  this.lastAt=at;
  if(locked){this.consumed=true;return false;}
  if(this.consumed)return false;
  this.consumed=true;return true;
 }
}
