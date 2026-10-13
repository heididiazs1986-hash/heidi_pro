/* Mis hábitos — casillas, rachas, metas por semana, vínculos automáticos y análisis */
(function(){
  var MAX=30;
  var ICONS=['glass-water','apple','salad','leaf','dumbbell','footprints','wind','moon','sun','sunrise','book-open','pencil','laptop','graduation-cap','brain','heart','pill','sparkles','music','coffee','target','flower-2','bed','activity'];
  var LINK_TEXT={none:'Manual (yo lo marco)',water:'Agua: se marca al cumplir tu meta de vasos',food:'Alimentación: se marca con 4 de 5 en la calidad del día',study:'Estudio: se marca al registrar estudio',body:'Movimiento: se marca con la rutina',calm:'Calma: se marca con respiración o impulso superado',sleep:'Sueño: se marca al guardar tu sueño'};
  var LINK_SHORT={none:'Manual',water:'Agua',food:'Alimentación',study:'Estudio',body:'Movimiento',calm:'Calma',sleep:'Sueño'};
  var EMO2ICON={'💧':'glass-water','💻':'laptop','🧘':'activity','🌬️':'wind','🌙':'moon','🥗':'salad','🚶':'footprints','📖':'book-open','🧹':'sparkles','🙏':'heart','💊':'pill','✍️':'pencil','🏃':'footprints','🍎':'apple','🪥':'sparkles','💜':'heart','☀️':'sun','🎧':'music','🧠':'brain','🌿':'leaf'};
  var SEEDS=[
    {name:'Tomar agua',icon:'glass-water',link:'water',goal:7},
    {name:'Alimentarme bien',icon:'salad',link:'food',goal:5},
    {name:'Estudiar',icon:'laptop',link:'study',goal:5},
    {name:'Mover el cuerpo',icon:'activity',link:'body',goal:4},
    {name:'Respirar con calma',icon:'wind',link:'calm',goal:5},
    {name:'Dormir a tiempo',icon:'moon',link:'sleep',goal:7}
  ];
  var selIcon=ICONS[0],editing=null;

  if(!state.habitsInit){
    state.habits=SEEDS.map(function(s,i){return {id:'hb_'+Date.now()+'_'+i,name:s.name,icon:s.icon,link:s.link,goal:s.goal,created:today()}});
    state.habitsInit=true;state.habitsV3=true;
  }
  /* Migración desde la versión anterior: emoji -> ícono, agua vinculada, hábito de alimentación */
  state.habits.forEach(function(h){if(!h.icon)h.icon=EMO2ICON[h.emoji]||'star';delete h.emoji;if(!LINK_TEXT[h.link])h.link='none'});
  if(!state.habitsV3){
    state.habits.forEach(function(h){if(h.name==='Tomar agua'&&(!h.link||h.link==='none'))h.link='water'});
    if(!state.habits.some(function(h){return h.link==='food'||h.name==='Alimentarme bien'}))state.habits.splice(1,0,{id:'hb_'+Date.now()+'_f',name:'Alimentarme bien',icon:'salad',link:'food',goal:5,created:today()});
    state.habitsV3=true;
  }
  persist();

  var month=today().slice(0,7),gridFresh=true;
  function pad(n){return String(n).padStart(2,'0')}
  function tone(i){return 'tone-'+(i%6)}

  function sets(){
    var f=window.foodSets?foodSets():{water:new Set(),food:new Set()};
    return {
      water:f.water,food:f.food,
      study:new Set(state.studyLog.filter(function(x){return +x.minutes>0}).map(function(x){return x.date})),
      body:new Set(state.bodyLog),
      calm:new Set(state.calmLog.map(function(x){return x.date})),
      sleep:new Set(state.sleepLog.map(function(x){return x.date}))
    };
  }
  function manual(h,d){return !!(state.habitLog[d]&&state.habitLog[d].indexOf(h.id)>=0)}
  function isAuto(h,d,A){return !!(h.link&&h.link!=='none'&&A[h.link]&&A[h.link].has(d))}
  function done(h,d,A){return manual(h,d)||isAuto(h,d,A)}
  function hStreak(h,A){var d=today();if(!done(h,d,A))d=addDays(d,-1);var n=0;while(n<4000&&done(h,d,A)){n++;d=addDays(d,-1)}return n}
  function weekStart(d){var x=new Date(d+'T00:00:00');x.setDate(x.getDate()-((x.getDay()+6)%7));return iso(x)}
  function weekN(h,A){var ws=weekStart(today()),t=today(),n=0;for(var i=0;i<7;i++){var d=addDays(ws,i);if(d<=t&&done(h,d,A))n++}return n}
  function firstDate(h,A){
    var f=h.created||today();
    for(var d in state.habitLog){if(d<f&&state.habitLog[d].indexOf(h.id)>=0)f=d}
    if(h.link&&h.link!=='none'&&A[h.link])A[h.link].forEach(function(d){if(d<f)f=d});
    return f;
  }
  function rate(h,A,win){
    win=win||30;
    var t=today(),ws=addDays(t,-(win-1)),f=firstDate(h,A),from=f>ws?f:ws,span=Math.max(1,daysBetween(from,t)+1),n=0;
    for(var i=0;i<span;i++){if(done(h,addDays(from,i),A))n++}
    return {n:n,span:span,pct:Math.round(n/span*100)};
  }
  function bars(rows){return rows.map(function(r){return '<div class="bar-row"><div class="bar-head"><span>'+r.label+'</span><strong>'+r.valueText+'</strong></div><div class="bar-track"><span style="width:'+r.width+'%"></span></div></div>'}).join('')}
  function monthLabel(){var p=month.split('-').map(Number);return new Intl.DateTimeFormat('es-CO',{month:'long',year:'numeric'}).format(new Date(p[0],p[1]-1,1))}

  function gridHtml(A){
    var hs=state.habits;
    if(!hs.length)return '<p class="helper-text" style="padding:14px">Crea tu primer hábito.</p>';
    var p=month.split('-').map(Number),Y=p[0],M=p[1],dim=new Date(Y,M,0).getDate(),t=today();
    var elapsed=month>t.slice(0,7)?0:(month===t.slice(0,7)?+t.slice(8):dim);
    var head='<tr><th class="hg-name">Hábito</th>';
    for(var d=1;d<=dim;d++){var ds=month+'-'+pad(d),wd=new Date(Y,M-1,d).getDay();head+='<th class="'+((wd===0||wd===6)?'we':'')+' '+(ds===t?'tod':'')+'">'+d+'</th>'}
    head+='<th class="hg-pct">%</th></tr>';
    var body=hs.map(function(h){
      var n=0,cells='';
      for(var d=1;d<=dim;d++){
        var ds=month+'-'+pad(d),wd=new Date(Y,M-1,d).getDay(),dn=done(h,ds,A),au=isAuto(h,ds,A)&&!manual(h,ds),fut=ds>t;
        if(dn&&!fut)n++;
        cells+='<td class="'+((wd===0||wd===6)?'we':'')+'"><button class="hg-cell '+(dn?'on':'')+' '+(au?'auto':'')+' '+(ds===t?'today':'')+'" data-h-cell="'+h.id+'|'+ds+'" '+(fut?'disabled':'')+' aria-label="'+esc(h.name)+' '+ds+'"></button></td>';
      }
      return '<tr><td class="hg-name" title="'+esc(h.name)+'">'+icon(h.icon,15)+esc(h.name)+'</td>'+cells+'<td class="hg-pct">'+(elapsed?Math.round(n/elapsed*100):0)+'%</td></tr>';
    }).join('');
    return '<table class="hgrid"><thead>'+head+'</thead><tbody>'+body+'</tbody></table>';
  }

  function renderForm(){
    var box=$('mhIcons');if(!box)return;
    box.innerHTML=ICONS.map(function(n){return '<button type="button" class="'+(n===selIcon?'on':'')+'" data-h-icon="'+n+'" aria-label="'+n+'">'+icon(n,22)+'</button>'}).join('');
    var lk=$('mhLink');
    if(lk&&lk.options.length!==Object.keys(LINK_TEXT).length){var v=lk.value;lk.innerHTML=Object.keys(LINK_TEXT).map(function(k){return '<option value="'+k+'">'+(k==='none'?'Manual':'Auto: '+LINK_SHORT[k])+'</option>'}).join('');lk.value=v||'none'}
    $('mhCount').textContent=state.habits.length+'/'+MAX;
    $('mhFormTitle').textContent=editing?'Editar hábito':'Nuevo hábito';
    $('mhAddBtn').textContent=editing?'Guardar cambios':'Crear hábito';
    $('mhCancelBtn').classList.toggle('hidden',!editing);
  }

  function render(){
    if(!$('habitToday'))return;
    var A=sets(),t=today(),hs=state.habits;
    var doneToday=hs.filter(function(h){return done(h,t,A)}).length;
    var streaks=hs.map(function(h){return {h:h,s:hStreak(h,A)}}).sort(function(a,b){return b.s-a.s});
    var best=streaks[0]||null;
    var sumN=0,sumGoal=0;hs.forEach(function(h){sumN+=Math.min(weekN(h,A),h.goal);sumGoal+=h.goal});
    var weekPct=sumGoal?Math.min(100,Math.round(sumN/sumGoal*100)):0;
    var curMonth=t.slice(0,7),dimNow=+t.slice(8),monthDone=0;
    hs.forEach(function(h){for(var d=1;d<=dimNow;d++){if(done(h,curMonth+'-'+pad(d),A))monthDone++}});
    var monthPct=hs.length&&dimNow?Math.round(monthDone/(hs.length*dimNow)*100):0;

    if($('kpiHabits'))$('kpiHabits').textContent=doneToday+'/'+hs.length;
    if($('kpiBest'))$('kpiBest').textContent=(best?best.s:0)+' día(s)';
    $('mhStatToday').textContent=doneToday+'/'+hs.length;
    $('mhStatWeek').textContent=weekPct+'%';
    $('mhStatBest').textContent=best&&best.s>0?best.s+' día(s)':'—';
    $('mhStatMonth').textContent=monthPct+'%';

    $('habitToday').innerHTML=hs.length?hs.map(function(h,i){
      var d=done(h,t,A),s=hStreak(h,A),w=weekN(h,A);
      return '<div class="habit-row '+tone(i)+'"><span class="h-ic">'+icon(h.icon,20)+'</span><div><strong>'+esc(h.name)+'</strong>'
        +'<small>'+LINK_SHORT[h.link||'none']+' · '+(s>0?s+' día(s) seguidos':'Empieza hoy')+' · semana '+w+'/'+h.goal+'</small>'
        +'<div class="h-tools"><button data-h-edit="'+h.id+'">'+icon('pencil',12)+'Editar</button><button data-h-del="'+h.id+'">'+icon('trash',12)+'Quitar</button></div></div>'
        +'<button class="check '+(d?'done':'')+'" data-h-today="'+h.id+'" aria-label="Marcar '+esc(h.name)+'">'+icon('check',20)+'</button></div>';
    }).join(''):'<p class="helper-text" style="margin:0">Aún no tienes hábitos. Crea el primero.</p>';

    renderForm();
    $('mhMonthLabel').textContent=monthLabel();
    $('mhNext').disabled=month>=t.slice(0,7);
    var wr=$('habitGrid'),prev=wr.scrollLeft;
    wr.innerHTML=gridHtml(A);
    if(gridFresh&&wr.clientWidth>0){var th=wr.querySelector('th.tod');wr.scrollLeft=th?Math.max(0,th.offsetLeft-wr.clientWidth/2):0;gridFresh=false}
    else if(!gridFresh){wr.scrollLeft=prev}

    var rs=hs.map(function(h){var r=rate(h,A);return {h:h,n:r.n,span:r.span,pct:r.pct}}).filter(function(r){return r.span>=3}).sort(function(a,b){return b.pct-a.pct||b.n-a.n});
    var rows=rs.slice(0,5).map(function(r){return {label:esc(r.h.name),valueText:r.pct+'% · '+r.n+'/'+r.span+' días',width:r.pct}});
    var insight=rows.length?bars(rows.slice(0,3)):'<p class="helper-text" style="margin:0">Marca tus hábitos unos días y aquí aparece cuáles son tus más constantes.</p>';
    var weakest=rs.length>=3?rs[rs.length-1]:null;
    if(weakest&&weakest.pct<50&&rs.indexOf(weakest)>2)insight+='<p class="mh-note">Para reforzar: <b>'+esc(weakest.h.name)+'</b> ('+weakest.pct+'%). Amárralo a algo que ya haces, como el café o antes de dormir.</p>';
    $('habitInsights').innerHTML=insight;

    if($('habitRank'))$('habitRank').innerHTML=rows.length?bars(rows):'<p class="helper-text" style="margin:0">Marca tus hábitos unos días para ver el ranking.</p>';
    if($('habitCompliance'))$('habitCompliance').innerHTML=bars([{label:'Hoy',valueText:doneToday+'/'+hs.length,width:hs.length?Math.round(doneToday/hs.length*100):0},{label:'Esta semana',valueText:weekPct+'%',width:weekPct},{label:'Este mes',valueText:monthPct+'%',width:monthPct}]);
    if($('habitHeat')){
      var cells='';
      for(var i=27;i>=0;i--){var d=addDays(t,-i),n=0;hs.forEach(function(h){if(done(h,d,A))n++});var f=hs.length?n/hs.length:0;
        cells+='<i title="'+d+': '+n+'/'+hs.length+'" style="background:color-mix(in srgb,var(--primary) '+Math.round(f*100)+'%,var(--surface-3))"></i>'}
      $('habitHeat').innerHTML=cells;
    }
  }
  window.renderHabits=render;
  window.habitsSummary=function(){
    var A=sets(),t=today();
    return {list:state.habits.map(function(h,i){return {id:h.id,name:h.name,icon:h.icon,tone:i%6,done:done(h,t,A),streak:hStreak(h,A)}})};
  };
  window.onScreen=function(id){if(id==='myhabits'){month=today().slice(0,7);gridFresh=true}};

  function celebrate(h,d){
    if(d!==today()){toast('Marcado');return}
    var A=sets(),s=hStreak(h,A);
    if([3,7,14,21,30,50,100].indexOf(s)>=0)msg(s+' días seguidos con "'+h.name+'". Eso es constancia, no suerte.',6);
    else if(state.habits.length&&state.habits.every(function(x){return done(x,d,A)}))msg('Hoy cerraste todos tus hábitos. Descansa con orgullo.',6);
    else toast('Marcado');
  }
  function toggle(id,d){
    var h=state.habits.filter(function(x){return x.id===id})[0];if(!h)return;
    var A=sets();
    if(isAuto(h,d,A)&&!manual(h,d)){toast('Este hábito se marca solo desde '+LINK_SHORT[h.link]);return}
    var arr=state.habitLog[d]=state.habitLog[d]||[],i=arr.indexOf(id);
    if(i>=0){arr.splice(i,1);if(!arr.length)delete state.habitLog[d];save();return}
    arr.push(id);save();paws();celebrate(h,d);
  }
  function shiftMonth(n){var p=month.split('-').map(Number),x=new Date(p[0],p[1]-1+n,1);month=x.getFullYear()+'-'+pad(x.getMonth()+1);gridFresh=true;render()}
  function resetForm(){editing=null;selIcon=ICONS[0];$('mhName').value='';$('mhGoal').value='7';$('mhLink').value='none'}
  function saveHabit(){
    var name=$('mhName').value.trim();
    if(!name)return toast('Escribe el nombre del hábito');
    var data={name:name,icon:selIcon,link:$('mhLink').value||'none',goal:+$('mhGoal').value||7};
    if(editing){
      var h=state.habits.filter(function(x){return x.id===editing})[0];
      if(h)Object.assign(h,data);
      resetForm();save();toast('Cambios guardados');return;
    }
    if(state.habits.length>=MAX)return toast('Máximo '+MAX+' hábitos');
    data.id='hb_'+Date.now();data.created=today();state.habits.push(data);
    resetForm();save();paws();msg('Hábito creado. Pequeño y constante gana.',4);
  }

  document.addEventListener('DOMContentLoaded',function(){
    $('mhPrev').onclick=function(){shiftMonth(-1)};
    $('mhNext').onclick=function(){shiftMonth(1)};
    $('mhAddBtn').onclick=saveHabit;
    $('mhCancelBtn').onclick=function(){resetForm();render()};
    $('mhName').addEventListener('keydown',function(e){if(e.key==='Enter')saveHabit()});
    document.addEventListener('click',function(e){
      var b=e.target.closest('[data-h-icon],[data-h-today],[data-h-cell],[data-h-del],[data-h-edit]');if(!b)return;
      if(b.dataset.hIcon){selIcon=b.dataset.hIcon;renderForm();return}
      if(b.dataset.hToday){toggle(b.dataset.hToday,today());return}
      if(b.dataset.hCell){var p=b.dataset.hCell.split('|');toggle(p[0],p[1]);return}
      if(b.dataset.hDel){
        var h=state.habits.filter(function(x){return x.id===b.dataset.hDel})[0];if(!h)return;
        if(!confirm('¿Quitar "'+h.name+'"? Sus marcas también se borran.'))return;
        state.habits=state.habits.filter(function(x){return x.id!==h.id});
        Object.keys(state.habitLog).forEach(function(d){state.habitLog[d]=state.habitLog[d].filter(function(i){return i!==h.id});if(!state.habitLog[d].length)delete state.habitLog[d]});
        if(editing===h.id)resetForm();
        save();return;
      }
      if(b.dataset.hEdit){
        var hh=state.habits.filter(function(x){return x.id===b.dataset.hEdit})[0];if(!hh)return;
        editing=hh.id;selIcon=hh.icon;$('mhName').value=hh.name;$('mhGoal').value=String(hh.goal);renderForm();$('mhLink').value=hh.link||'none';
        $('mhName').scrollIntoView({behavior:'smooth',block:'center'});$('mhName').focus({preventScroll:true});
      }
    });
  });

  window.habitCsvFiles=function(){
    var A=sets(),t=today(),hs=state.habits,start=t;
    hs.forEach(function(h){var f=firstDate(h,A);if(f<start)start=f});
    var from=start<addDays(t,-400)?addDays(t,-400):start,span=daysBetween(from,t)+1,rows=[];
    for(var i=0;i<span;i++){var d=addDays(from,i);hs.forEach(function(h){if(done(h,d,A))rows.push({date:d,habit:h.name,automatico:isAuto(h,d,A)&&!manual(h,d)?'sí':'no'})})}
    return [['CSV/habitos.csv',toCSV(['name','icon','link','goal','created'],hs)],['CSV/habitos_registro.csv',toCSV(['date','habit','automatico'],rows)]];
  };
})();
