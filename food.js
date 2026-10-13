/* Alimentación: agua, calidad del día, comidas, lista de mercado y análisis semanal */
(function(){
  var Q=[['fruta','Comí fruta','apple'],['verdura','Comí verduras','carrot'],['proteina','Comí una proteína en cada comida principal','utensils'],['sinultra','Evité ultraprocesados y gaseosas','cookie'],['consciente','Comí sin prisa y sin pantallas','leaf']];
  var MEAL_ICON={'Desayuno':'coffee','Media mañana':'apple','Almuerzo':'utensils','Merienda':'cookie','Cena':'salad'};
  var IDEAS=[['wheat','Desayuno con proteína','Huevo, queso o yogur natural con fruta y algo de grano.'],['salad','Una ensalada grande al día','Base de hojas, un color más y proteína.'],['utensils','Lentejas o fríjoles dos veces por semana','Económicos y llenan por horas.'],['milk','Merienda planeada','Fruta con nueces o yogur, antes de que llegue el antojo.'],['droplets','Botella a la vista','Llénala al empezar la mañana y de nuevo en la tarde.']];
  var DAYS=['D','L','M','M','J','V','S'];

  var F=state.food=state.food||{};
  F.waterGoal=F.waterGoal||8;F.water=F.water||{};F.quality=F.quality||{};F.meals=F.meals||[];F.shopping=F.shopping||[];

  function w(d){return +F.water[d]||0}
  function q(d){return (F.quality[d]||[]).length}
  window.foodSets=function(){
    var W=new Set(),Fd=new Set();
    Object.keys(F.water).forEach(function(d){if(F.water[d]>=F.waterGoal)W.add(d)});
    Object.keys(F.quality).forEach(function(d){if(F.quality[d].length>=4)Fd.add(d)});
    return {water:W,food:Fd};
  };
  window.foodToday=function(){var t=today();return {water:w(t),goal:F.waterGoal,quality:q(t)}};

  window.waterHtml=function(){
    var t=today(),n=w(t),g=F.waterGoal,h='';
    for(var i=0;i<g;i++)h+='<button class="'+(i<n?'on':'')+'" data-water-set="'+(i+1)+'" aria-label="'+(i+1)+' vasos">'+icon('glass-water',18)+'</button>';
    return h;
  };

  function render(){
    if(!$('waterNum'))return;
    var t=today(),n=w(t),g=F.waterGoal;
    $('waterNum').textContent=n;$('waterOf').textContent='de '+g+' vasos';
    $('waterSub').textContent=n>=g?'Meta cumplida':'Faltan '+(g-n);
    $('waterGlasses').innerHTML=waterHtml();
    $('waterGoal').value=String(g);
    var qs=F.quality[t]||[];
    $('qualSub').textContent=qs.length+' de '+Q.length;
    $('foodQuality').innerHTML=Q.map(function(x){var on=qs.indexOf(x[0])>=0;return '<button class="qitem '+(on?'on':'')+'" data-q="'+x[0]+'"><span class="box">'+icon('check',14)+'</span><span>'+x[1]+'</span></button>'}).join('');
    var ms=F.meals.filter(function(m){return m.date===t});
    $('mealList').innerHTML=ms.length?ms.map(function(m){return '<div class="meal"><span class="m-ic">'+icon(MEAL_ICON[m.type]||'utensils',18)+'</span><div><strong>'+esc(m.text)+'</strong><small>'+esc(m.type)+'</small></div><button class="remove-btn" data-meal-del="'+m.id+'" aria-label="Quitar">'+icon('x',16)+'</button></div>'}).join(''):'<p class="helper-text" style="margin:0">Aún no has registrado comidas hoy.</p>';

    var wk='';
    for(var i=6;i>=0;i--){var d=addDays(t,-i),dow=new Date(d+'T00:00:00').getDay();
      wk+='<div class="col"><div class="bars"><span class="b" title="Agua" style="height:'+Math.max(3,Math.min(1,w(d)/g)*96)+'px"></span><span class="b q" title="Calidad" style="height:'+Math.max(3,q(d)/Q.length*96)+'px"></span></div><span class="d '+(i===0?'t':'')+'">'+DAYS[dow]+'</span></div>';
    }
    $('foodWeek').innerHTML=wk;

    /* Mercado */
    var sh=F.shopping;
    $('shopSub').textContent=sh.filter(function(s){return s.done}).length+' de '+sh.length;
    $('shopList').innerHTML=sh.length?sh.map(function(s){return '<div class="shop '+(s.done?'done':'')+'"><button class="mini-check '+(s.done?'done':'')+'" data-shop-toggle="'+s.id+'" aria-label="Marcar">'+(s.done?icon('check',16):'')+'</button><strong>'+esc(s.text)+'</strong><button class="remove-btn" data-shop-del="'+s.id+'" aria-label="Quitar">'+icon('x',16)+'</button></div>'}).join(''):'<p class="helper-text" style="margin:0">Tu lista está vacía. Agrega lo que necesitas comprar.</p>';
    $('foodIdeas').innerHTML=IDEAS.map(function(x){return '<div><span class="p-ic">'+icon(x[0],18)+'</span><p><b>'+x[1]+'.</b> <span>'+x[2]+'</span></p></div>'}).join('');
    $('marketSpent').textContent=fmt(state.expenses.filter(function(e){return e.category==='mercado'}).reduce(function(a,b){return a+(+b.amount||0)},0));

    /* Análisis */
    if($('foodDash')){
      var wsum=0,qdays=0,meals=0;
      for(var k=0;k<7;k++){var dd=addDays(t,-k);wsum+=Math.min(1,w(dd)/g);if(q(dd)>=4)qdays++;meals+=F.meals.filter(function(m){return m.date===dd}).length}
      var wp=Math.round(wsum/7*100);
      $('foodDash').innerHTML='<div class="bar-row"><div class="bar-head"><span>Agua frente a la meta</span><strong>'+wp+'%</strong></div><div class="bar-track"><span style="width:'+wp+'%"></span></div></div>'
        +'<div class="bar-row"><div class="bar-head"><span>Días con buena alimentación</span><strong>'+qdays+'/7</strong></div><div class="bar-track"><span style="width:'+Math.round(qdays/7*100)+'%"></span></div></div>'
        +'<div class="bar-row"><div class="bar-head"><span>Comidas registradas</span><strong>'+meals+'</strong></div></div>';
    }
  }
  window.renderFood=render;

  function setWater(n){var t=today();F.water[t]=Math.max(0,Math.min(30,n));if(!F.water[t])delete F.water[t];save();if(n>=F.waterGoal&&n===F.waterGoal)toast('Meta de agua cumplida')}
  function addMeal(){var tx=$('mealText').value.trim();if(!tx)return toast('Escribe qué comiste');F.meals.push({id:'m_'+Date.now(),date:today(),type:$('mealType').value,text:tx});$('mealText').value='';save();toast('Comida agregada')}
  function addShop(){var tx=$('shopText').value.trim();if(!tx)return;F.shopping.push({id:'s_'+Date.now(),text:tx,done:false});$('shopText').value='';save()}

  document.addEventListener('DOMContentLoaded',function(){
    $('waterPlus').onclick=function(){setWater(w(today())+1)};
    $('waterMinus').onclick=function(){setWater(w(today())-1)};
    $('waterGoal').onchange=function(){F.waterGoal=+$('waterGoal').value||8;save()};
    $('mealAdd').onclick=addMeal;
    $('mealText').addEventListener('keydown',function(e){if(e.key==='Enter')addMeal()});
    $('shopAdd').onclick=addShop;
    $('shopText').addEventListener('keydown',function(e){if(e.key==='Enter')addShop()});
    $('shopClear').onclick=function(){F.shopping=F.shopping.filter(function(s){return !s.done});save()};
    document.addEventListener('click',function(e){
      var b;
      if(b=e.target.closest('[data-water-set]')){var n=+b.dataset.waterSet;setWater(w(today())===n?n-1:n);return}
      if(b=e.target.closest('[data-q]')){var t=today(),a=F.quality[t]=F.quality[t]||[],i=a.indexOf(b.dataset.q);if(i>=0)a.splice(i,1);else a.push(b.dataset.q);if(!a.length)delete F.quality[t];save();return}
      if(b=e.target.closest('[data-meal-del]')){F.meals=F.meals.filter(function(m){return m.id!==b.dataset.mealDel});save();return}
      if(b=e.target.closest('[data-shop-toggle]')){F.shopping.forEach(function(s){if(s.id===b.dataset.shopToggle)s.done=!s.done});save();return}
      if(b=e.target.closest('[data-shop-del]')){F.shopping=F.shopping.filter(function(s){return s.id!==b.dataset.shopDel});save();return}
    });
  });

  window.foodCsvFiles=function(){
    var rows=[];Object.keys(F.water).forEach(function(d){rows.push({date:d,vasos:F.water[d],meta:F.waterGoal,calidad:(F.quality[d]||[]).join(' | ')})});
    Object.keys(F.quality).forEach(function(d){if(F.water[d]===undefined)rows.push({date:d,vasos:0,meta:F.waterGoal,calidad:F.quality[d].join(' | ')})});
    rows.sort(function(a,b){return a.date<b.date?-1:1});
    return [['CSV/alimentacion_dia.csv',toCSV(['date','vasos','meta','calidad'],rows)],['CSV/alimentacion_comidas.csv',toCSV(['date','type','text'],F.meals)],['CSV/lista_mercado.csv',toCSV(['text','done'],F.shopping)]];
  };
})();
