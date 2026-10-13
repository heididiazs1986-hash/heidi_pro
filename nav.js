/* Navegación por grupos: barra lateral (escritorio), barra inferior + "Más" (celular) y subpestañas */
(function(){
  var GROUPS=[
    {id:'hoy',label:'Hoy',icon:'house',tabs:[['home','Hoy']],more:false},
    {id:'habitos',label:'Hábitos',icon:'circle-check',tabs:[['myhabits','Mis hábitos'],['habits','Reducir']]},
    {id:'alimentacion',label:'Alimentación',icon:'apple',tabs:[['food','Mi día'],['foodplan','Semana y mercado']]},
    {id:'bienestar',label:'Bienestar',icon:'heart-pulse',tabs:[['calm','Calma'],['body','Movimiento'],['sleep','Sueño'],['library','Biblioteca']]},
    {id:'planear',label:'Planear',icon:'list-checks',tabs:[['tasks','Tareas'],['study','Estudio']]},
    {id:'finanzas',label:'Dinero',icon:'wallet',tabs:[['money','Dinero']]},
    {id:'diario',label:'Diario',icon:'notebook-pen',tabs:[['day','Diario'],['visual','Proceso visual']]},
    {id:'analisis',label:'Análisis',icon:'chart-column',tabs:[['dashboard','Análisis']]},
    {id:'ajustes',label:'Ajustes',icon:'sliders-horizontal',tabs:[['backup','Respaldo y apariencia']]}
  ];
  var MAIN=['hoy','habitos','alimentacion','bienestar'];
  var SUBS={hoy:'Tu día',habitos:'Rutinas y reducción',alimentacion:'Agua, comidas y mercado',bienestar:'Calma, cuerpo y sueño',planear:'Tareas y estudio',finanzas:'Salario, gastos y ahorro',diario:'Diario y fotos',analisis:'Tus números',ajustes:'Respaldo y tema'};
  var cur='home';
  function groupOf(id){return GROUPS.filter(function(g){return g.tabs.some(function(t){return t[0]===id})})[0]||GROUPS[0]}

  function build(){
    var sn=document.getElementById('snav'),tb=document.getElementById('tabbar'),ml=document.getElementById('moreList');
    sn.innerHTML=GROUPS.map(function(g){return '<button data-nav="'+g.tabs[0][0]+'" data-g="'+g.id+'">'+icon(g.icon,20)+'<span>'+g.label+'</span></button>'}).join('');
    tb.innerHTML=MAIN.map(function(id){var g=GROUPS.filter(function(x){return x.id===id})[0];return '<button data-nav="'+g.tabs[0][0]+'" data-g="'+g.id+'">'+icon(g.icon,22)+'<span>'+g.label+'</span></button>'}).join('')
      +'<button id="tabMore" data-g="mas">'+icon('ellipsis',22)+'<span>Más</span></button>';
    ml.innerHTML=GROUPS.filter(function(g){return MAIN.indexOf(g.id)<0}).map(function(g){return '<button data-nav="'+g.tabs[0][0]+'"><span class="si">'+icon(g.icon,20)+'</span><span>'+g.label+'<small>'+SUBS[g.id]+'</small></span></button>'}).join('');
    document.getElementById('tabMore').onclick=function(){document.getElementById('quickMenuOverlay').classList.remove('hidden')};
  }

  function mark(id){
    cur=id;var g=groupOf(id);
    document.querySelectorAll('#snav button,#tabbar button[data-g]').forEach(function(b){b.classList.toggle('on',b.dataset.g===g.id||(b.dataset.g==='mas'&&MAIN.indexOf(g.id)<0))});
    var st=document.getElementById('subtabs');
    if(g.tabs.length>1){st.classList.remove('hidden');st.innerHTML=g.tabs.map(function(t){return '<button data-nav="'+t[0]+'" class="'+(t[0]===id?'on':'')+'">'+t[1]+'</button>'}).join('')}
    else{st.classList.add('hidden');st.innerHTML=''}
  }

  var goOrig=window.go;
  window.go=function(id){
    if(!document.getElementById(id))return;
    var r=goOrig.apply(this,arguments);mark(id);if(window.onScreen)window.onScreen(id);
    if(window.afterRender)window.afterRender();
    return r;
  };

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-nav]');
    if(b){e.preventDefault();window.go(b.dataset.nav)}
  });

  /* Goma: da un consejo según dónde estás */
  var TIPS={
    home:'Empieza por lo pequeño: un hábito marcado ya cambia el día.',
    myhabits:'Si hoy fallaste, mañana retomas. La constancia es volver.',
    habits:'Registrar sin juzgarte ya es avanzar.',
    food:'Un vaso de agua ahora. Después sigues.',
    foodplan:'Comprar con lista ahorra plata y evita improvisar.',
    calm:'Exhala más largo de lo que inhalas.',
    body:'Con diez minutos ya cuenta.',
    sleep:'Pantalla afuera de la cama. Tu mañana lo agradece.',
    library:'Elige algo que te baje el ritmo.',
    tasks:'Una tarea a la vez. Empieza por la más pequeña.',
    study:'Veinte minutos enfocados valen más que dos horas dispersas.',
    money:'Lo que se registra se puede mejorar.',
    day:'Escribe sin corregir. Es solo para ti.',
    visual:'Una foto de hoy es evidencia de tu esfuerzo.',
    dashboard:'Mira la tendencia, no un solo día.',
    backup:'Descarga tu respaldo de vez en cuando.'
  };
  document.addEventListener('DOMContentLoaded',function(){
    build();
    var fab=document.getElementById('fabMenuBtn');
    fab.onclick=function(){window.msg(TIPS[cur]||TIPS.home,6);window.paws()};
    mark('home');
    if(window.hydrateIcons)hydrateIcons();
  });
})();
