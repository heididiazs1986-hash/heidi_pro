/* Pantalla "Hoy" y enganche de renderizado */
(function(){
  function greeting(){var h=new Date().getHours();return h<12?'Buenos días, Heidi':h<19?'Buenas tardes, Heidi':'Buenas noches, Heidi'}
  function render(){
    if(!$('homeHabits'))return;
    $('homeGreeting').textContent=greeting();
    $('homeEyebrow').textContent=new Intl.DateTimeFormat('es-CO',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    var hs=window.habitsSummary?habitsSummary():{list:[]};
    $('homeHabits').innerHTML=hs.list.length?hs.list.map(function(x){
      return '<div class="habit-row tone-'+x.tone+'"><span class="h-ic">'+icon(x.icon,20)+'</span><div><strong>'+esc(x.name)+'</strong><small>'+(x.streak>0?x.streak+' día(s) seguidos':'Hoy puedes empezar la racha')+'</small></div><button class="check '+(x.done?'done':'')+'" data-h-today="'+x.id+'" aria-label="Marcar '+esc(x.name)+'">'+icon('check',20)+'</button></div>';
    }).join(''):'<p class="helper-text" style="margin:0">Crea tu primer hábito en la sección Hábitos.</p>';
    $('homeWater').innerHTML=(function(){var f=foodToday();return '<div class="water-main"><span class="big-num">'+f.water+'</span><span class="card-sub">de '+f.goal+' vasos</span></div><div class="glasses">'+waterHtml()+'</div>'})();
    var up=state.workTasks.filter(function(t){return !t.done}).sort(function(a,b){return (a.dueDate||'').localeCompare(b.dueDate||'')}).slice(0,3).map(workInfo);
    var home=state.tasks.home.filter(function(t){return !t.done}).slice(0,Math.max(0,3-up.length));
    var html=up.map(function(i){return '<div class="task-card '+i.cls+'"><div><strong>'+esc(i.title)+'</strong><small>'+i.status+'</small></div><span></span></div>'}).join('')
      +home.map(function(t){return '<div class="task-card '+t.color+'"><div><strong>'+esc(t.text)+'</strong><small>Casa</small></div><span></span></div>'}).join('');
    $('homeUpcoming').innerHTML=html||'<p class="helper-text" style="margin:0">Nada pendiente. Buen trabajo.</p>';
  }
  window.renderHome=render;
  window.afterRender=function(){
    if(window.renderHabits)renderHabits();
    if(window.renderFood)renderFood();
    render();
    if(window.hydrateIcons)hydrateIcons();
  };
  window.extraCsvFiles=function(){return (window.habitCsvFiles?habitCsvFiles():[]).concat(window.foodCsvFiles?foodCsvFiles():[])};
})();
