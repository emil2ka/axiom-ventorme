const actions:Record<string,{verb:string;object:string;running:string;done:string}>={
 careers:{verb:'Открыть',object:'ноутбук',running:'Открываем ноутбук',done:'Ноутбук открыт'},
 university:{verb:'Запустить',object:'фонтан',running:'Запускаем фонтан',done:'Фонтан запущен'},
 preparation:{verb:'Открыть',object:'книгу',running:'Открываем книгу',done:'Книга открыта'},
 scholarships:{verb:'Открыть',object:'письмо',running:'Открываем письмо',done:'Письмо открыто'},
 admissions:{verb:'Собрать',object:'документы',running:'Собираем документы',done:'Документы собраны'},
};

/** One optional scene interaction; scrolling remains available before a click. */
export default function JourneyAction({location,running,done,onActivate}:{location:string;running:boolean;done:boolean;onActivate:()=>void}){
 const action=actions[location];if(!action)return null;
 return <div className="journey-action-prompt" data-state={running?'running':done?'done':'ready'}>
  <span className="journey-action-caption">{running?'Герой действует':done?'Можно листать дальше':'Нажми, чтобы'}</span>
  <button className="journey-action-button" disabled={running} onClick={onActivate} title={done?'Повторить действие':undefined}>
   <span className="journey-action-words" key={running?'running':done?'done':'ready'}>
    {running?action.running:done?action.done:<><span>{action.verb}</span> <strong>{action.object}</strong></>}
   </span>
   <span className="journey-action-symbol" aria-hidden="true">{running?<i/>:done?'↺':'↗'}</span>
  </button>
  <span className="journey-action-status" role="status">{done?action.done:running?action.running:''}</span>
 </div>;
}
