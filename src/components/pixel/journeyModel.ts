import type {CharacterMotion, Facing} from './PixelCharacter';

export type Location = {
 id:string; name:string; title:string; titleAccent?:string; copy:string; image:string; alt:string;
 x:number; y:number; width:number; ratio:number; ground:number; action:'sign'|'compass'|'campus'|'book'|'grant'|'documents';
};
export const locations:Location[]=[
 {id:'home',name:'Начало',title:'Твой путь начинается с тебя.',titleAccent:'с тебя.',copy:'Выбери профессию и найди свой вуз.',image:'/map-islands/home-polished.webp',alt:'Стартовая площадка с синим указателем на зелёном парящем острове',x:0,y:0,width:280,ratio:1,ground:.45,action:'sign'},
 {id:'careers',name:'Профессия',title:'Найди своё направление.',titleAccent:'своё направление.',copy:'Начни с короткого профтеста.',image:'/journey/careers.png',alt:'Учебный павильон с компьютером, микроскопом и творческой мастерской',x:-430,y:160,width:400,ratio:941/1672,ground:.66,action:'compass'},
 {id:'university',name:'Университет',title:'Выбери свой вуз.',titleAccent:'свой вуз.',copy:'Сравни направления, страны и бюджет.',image:'/islands/university-refined.png',alt:'Белый университетский кампус с синими крышами, фонтаном и дорожкой к входу',x:450,y:70,width:440,ratio:941/1672,ground:.66,action:'campus'},
 {id:'preparation',name:'Подготовка',title:'Подготовься к цели.',titleAccent:'к цели.',copy:'Проверь уровень IELTS или SAT.',image:'/islands/preparation-refined.png',alt:'Кампусная библиотека с синей крышей, книжными полками и столом во дворе',x:50,y:-340,width:400,ratio:941/1672,ground:.65,action:'book'},
 {id:'scholarships',name:'Стипендии',title:'Найди возможности.',titleAccent:'возможности.',copy:'Изучи программы и условия.',image:'/journey/scholarships.png',alt:'Университетский центр поддержки студентов со стендами стипендий',x:-420,y:-330,width:400,ratio:941/1672,ground:.66,action:'grant'},
 {id:'admissions',name:'Подача',title:'Собери заявку.',titleAccent:'заявку.',copy:'Эссе, документы и сроки — по порядку.',image:'/journey/admissions.png',alt:'Приёмная комиссия университета с папками, документами и учебным гербом',x:470,y:-340,width:400,ratio:941/1672,ground:.66,action:'documents'},
];
export const INTRO_END=1.15, FLIGHT_LENGTH=1, DWELL_LENGTH=.9;
export const sceneStart=(index:number)=>INTRO_END+(index-1)*(FLIGHT_LENGTH+DWELL_LENGTH)+FLIGHT_LENGTH;
export const FINAL_START=INTRO_END+5*(FLIGHT_LENGTH+DWELL_LENGTH);
export const JOURNEY_END=FINAL_START+1.05;
export const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
type Camera={x:number;y:number;width:number};
type Hero={x:number;y:number;z:number;mode:CharacterMotion;facing:Facing;sample:number|undefined;landing:number;width?:number};
export type JourneyFrame={camera:Camera;hero:Hero;index:number;fromIndex?:number;layout?:number;returning?:boolean;universityDeparture?:number;phase:'intro'|'flight'|'scene'|'final';local:number;copyOpacity:number;mapLabels:number;action:number};
export function facingFor(dx:number,dy:number):Facing{
 if(Math.abs(dy)>Math.abs(dx)*.9)return dy<0?'back':'front';
 return dx<0?'left':'right';
}
