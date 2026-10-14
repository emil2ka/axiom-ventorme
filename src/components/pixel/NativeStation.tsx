import type {Location} from './journeyModel';
import {clamp} from './journeyModel';
import metadata from './station-meta.json';

/** Furniture and its moving item share a pixel-art atlas, light and foot anchor. */
export default function NativeStation({location,progress,seconds}:{location:Location;progress:number;seconds:number}){
 if(location.id==='home'||location.id==='university')return null;
 const name=(location.id==='preparation'?'library':location.id) as keyof typeof metadata;
 const fountain=location.id==='university';
 const frame=fountain?Math.floor(seconds*12)%16:progress<1?Math.floor(clamp(progress)*15):location.action==='book'?8+Math.floor(seconds*5)%8:15;
 const width=location.width*(fountain?.155:.145),height=location.width*location.ratio;
 const left=location.width*(fountain?-.285:location.action==='compass'?-.17:.17);
 const top=fountain?height*.004:-height*.008;
 const anchor=metadata[name],dx=(.5-anchor.centers[frame])*100,dy=(.9-anchor.baseline[frame])*100;
 return <div className="native-station" data-object={name} data-frame={frame} style={{left,top,width,height:width,transform:`translate(${-50+dx}%,${-90+dy}%)`,backgroundImage:`url('/journey/${name}-station.webp')`,backgroundSize:'400% 400%',backgroundPosition:`${frame%4/3*100}% ${Math.floor(frame/4)/3*100}%`}} aria-hidden="true"/>;
}
