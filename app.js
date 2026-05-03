
const KEY='heidi_life_os_polished';
const state=JSON.parse(localStorage.getItem(KEY)||'{}');
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('es-CO').format(Math.round(Number(n||0)))+' COP';
const today=()=>new Date().toISOString().slice(0,10);
state.goalTarget ??= 10000000;
state.goalSaved ??= 0;
state.salary ??= 0;
state.alcoholToday ??= 0;
state.alcoholTypical ??= 0;
state.smokeTypical ??= 10000;
state.smokeHabitual ??= 10;
state.smokeCount ??= 0;
state.studyTotal ??= 0;
state.expenses ??= [];
state.alcoholLog ??= [];
state.exerciseDone ??= false;
state.bodyLast ??= '';
state.studyTopic ??= '';
state.journalTitle ??= '';
state.journalBody ??= '';
state.reflectionBody ??= '';
state.tasks ??= {
  home:[
    {id:'h1',emoji:'🛏️',when:'Cualquier momento',text:'Tender la cama',desc:'Dejar el cuarto en orden al empezar el día.',color:'pastel-lilac',done:false},
    {id:'h2',emoji:'🍽️',when:'Cualquier momento',text:'Limpiar la cocina',desc:'Recoger, lavar y organizar la cocina.',color:'pastel-pink',done:false},
    {id:'h3',emoji:'🚿',when:'Cualquier momento',text:'Lavar el baño',desc:'Lavamanos, sanitario y superficies.',color:'pastel-yellow',done:false},
    {id:'h4',emoji:'🧹',when:'Cualquier momento',text:'Barrer el piso',desc:'Barrer las áreas principales.',color:'pastel-green',done:false},
    {id:'h5',emoji:'🪣',when:'Cualquier momento',text:'Trapear el piso',desc:'Trapear y dejar fresco el espacio.',color:'pastel-blue',done:false},
    {id:'h6',emoji:'🧺',when:'Cualquier momento',text:'Lavar la ropa',desc:'Separar, lavar y tender la ropa.',color:'pastel-orange',done:false},
    {id:'h7',emoji:'🧊',when:'Semana',text:'Limpiar la nevera',desc:'Revisar alimentos y limpiar repisas.',color:'pastel-violet',done:false},
    {id:'h8',emoji:'🔥',when:'Semana',text:'Limpiar la estufa',desc:'Quemadores, tapa y grasa superficial.',color:'pastel-orange',done:false}
  ],
  work:[
    {id:'w1',emoji:'📋',when:'Hoy',text:'Revisar pendientes de trabajo',desc:'Aterrizar lo urgente y lo importante.',color:'pastel-blue',done:false},
    {id:'w2',emoji:'📞',when:'Hoy',text:'Responder contactos clave',desc:'Mensajes, llamadas y compromisos.',color:'pastel-pink',done:false},
    {id:'w3',emoji:'🧾',when:'Hoy',text:'Registrar gastos o avances',desc:'No dejar información suelta.',color:'pastel-yellow',done:false},
    {id:'w4',emoji:'🗂️',when:'Semana',text:'Organizar archivos y notas',desc:'Mantener control documental.',color:'pastel-lilac',done:false},
    {id:'w5',emoji:'💡',when:'Semana',text:'Planear siguiente gestión',desc:'Visualizar el siguiente paso.',color:'pastel-green',done:false}
  ]
};

function save(){localStorage.setItem(KEY, JSON.stringify(state)); render();}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),1700)}
function showMessage(msg, seconds=5){const b=$('messageBubble');$('bubbleText').textContent=msg;b.classList.remove('hidden');clearTimeout(showMessage._t);showMessage._t=setTimeout(()=>b.classList.add('hidden'), seconds*1000);} 
function closeMessage(){$('messageBubble').classList.add('hidden')}
function spawnPaws(){const layer=$('pawLayer');layer.innerHTML='';for(let i=0;i<6;i++){const p=document.createElement('div');p.className='paw';p.textContent='🐾';p.style.left=(8+Math.random()*80)+'vw';p.style.top=(18+Math.random()*64)+'vh';p.style.animationDelay=(i*0.07)+'s';layer.appendChild(p);}setTimeout(()=>layer.innerHTML='',1350)}
function calc(){const smokeUnit=Number(state.smokeTypical||0)/Math.max(1,Number(state.smokeHabitual||10));const smokeSpent=smokeUnit*Number(state.smokeCount||0);const spent=(state.expenses||[]).reduce((a,b)=>a+Number(b.amount||0),0);const wasteFromExpense=(state.expenses||[]).filter(e=>['alcohol','tabaco'].includes(e.category)).reduce((a,b)=>a+Number(b.amount||0),0);const recoveredAlcohol=Math.max(0,Number(state.alcoholTypical||0)-Number(state.alcoholToday||0));const recoveredSmoke=Math.max(0,Number(state.smokeTypical||0)-smokeSpent);const recoveredToday=recoveredAlcohol+recoveredSmoke;const wasted=Number(state.alcoholToday||0)+smokeSpent+wasteFromExpense;const balance=Number(state.salary||0)-spent;const goalPct=Math.max(0,Math.min(100,(Number(state.goalSaved||0)/Number(state.goalTarget))*100));return {smokeSpent,spent,recoveredToday,wasted,balance,goalPct};}
function streak(){const logs=(state.alcoholLog||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));if(!logs.length) return 0;let s=0;const seen=new Set();for(const l of logs){if(seen.has(l.date)) continue;seen.add(l.date);if(Number(l.amount||0)===0) s++; else break;}return s;}
function renderExpenseList(){const root=$('expenseList');const list=state.expenses||[];if(!list.length){root.innerHTML='<p class="helper-text">Todavía no has registrado gastos. Cada gasto guardado te devuelve control.</p>';return;}root.innerHTML=list.slice().reverse().map(item=>`<div class="stack-item"><div><span class="chip">${labelCat(item.category)}</span><strong>${escapeHtml(item.description||'Sin descripción')}</strong><small>${item.date} · ${fmt(item.amount)}</small></div><button class="remove-btn" data-remove="${item.id}">✕</button></div>`).join('');}
function renderTaskCards(rootId, list){const root=$(rootId);root.innerHTML=list.map(t=>`<div class="task-card ${t.color}"><div><small>${t.when}</small><strong>${t.emoji} ${escapeHtml(t.text)}</strong><p>${escapeHtml(t.desc)}</p></div><button class="mini-check ${t.done?'done':''}" data-task="${t.id}">${t.done?'✓':'○'}</button></div>`).join('');}
function renderBars(rootId, rows){const root=$(rootId); root.innerHTML=rows.map(r=>`<div class="bar-row"><div class="bar-head"><span>${r.label}</span><strong>${r.valueText}</strong></div><div class="bar-track"><span style="width:${r.width}%"></span></div></div>`).join('');}
function render(){const m=calc();$('todayLabel').textContent=new Intl.DateTimeFormat('es-CO',{weekday:'long',day:'numeric',month:'long'}).format(new Date());$('statusPill').textContent=m.recoveredToday>0?'Día con avance':'Día en construcción';$('homeHeroTitle').textContent=m.balance>=0?'Vas tomando control':'Ojo con el saldo';$('homeHeroText').textContent=`Saldo estimado: ${fmt(m.balance)} · Recuperado hoy: ${fmt(m.recoveredToday)} · Estudio acumulado: ${state.studyTotal||0} min.`;
$('kpiStreak').textContent=`${streak()} día(s)`;$('kpiCigs').textContent=state.smokeCount||0;$('kpiRecovered').textContent=fmt(m.recoveredToday);$('kpiGoal').textContent=`${m.goalPct.toFixed(0)}%`;
$('alcoholToday').value=state.alcoholToday||'';$('alcoholTypical').value=state.alcoholTypical||'';$('smokeTypical').value=state.smokeTypical||'';$('smokeHabitual').value=state.smokeHabitual||'';$('smokeCount').textContent=state.smokeCount||0;
const alcoholDelta=Number(state.alcoholTypical||0)-Number(state.alcoholToday||0);$('alcoholFeedback').textContent=alcoholDelta>=0?`Hoy evitaste ${fmt(alcoholDelta)} frente a tu patrón. Eso también vale.`:`Hoy te pasaste ${fmt(Math.abs(alcoholDelta))}. Regístralo sin mentirte y vuelve al plan.`;$('smokeFeedback').textContent=`Impacto inmediato de hoy: ${fmt(m.smokeSpent)}. Recuperado frente a tu rutina: ${fmt(Math.max(0,Number(state.smokeTypical||0)-m.smokeSpent))}.`;
$('salaryInput').value=state.salary||'';$('goalSavedInput').value=state.goalSaved||'';$('goalLabel').textContent=`${fmt(state.goalSaved)} de ${fmt(state.goalTarget)} · ${m.goalPct.toFixed(0)}%`;$('goalBar').style.width=m.goalPct+'%';$('wasteValue').textContent=fmt(m.wasted);$('balanceValue').textContent=fmt(m.balance);renderExpenseList();
renderTaskCards('homeTasksList', state.tasks.home); renderTaskCards('workTasksList', state.tasks.work); $('homeTasksDone').textContent=`${state.tasks.home.filter(t=>t.done).length}/${state.tasks.home.length}`; $('workTasksDone').textContent=`${state.tasks.work.filter(t=>t.done).length}/${state.tasks.work.length}`;
$('bodyText').textContent=state.exerciseDone?`Última rutina registrada: ${state.bodyLast||today()}. Bien.`:'Marca la rutina cuando la completes.'; $('studyTopic').value=state.studyTopic||''; $('studyText').textContent=state.studyTopic?`Último tema: ${state.studyTopic} · Total acumulado: ${state.studyTotal||0} min.`:'Aún no has registrado estudio.'; $('journalTitle').value=state.journalTitle||''; $('journalBody').value=state.journalBody||''; $('reflectionBody').value=state.reflectionBody||'';
$('dbRecovered').textContent=fmt(m.recoveredToday); $('dbAlcohol').textContent=fmt(state.alcoholToday||0); $('dbSmoke').textContent=fmt(m.smokeSpent); $('dbStudy').textContent=`${state.studyTotal||0} min`;
renderBars('habitBars', [
  {label:'Ahorro potencial de hoy', valueText:fmt(m.recoveredToday), width:Math.min(100,(m.recoveredToday/Math.max(1,(Number(state.alcoholTypical||0)+Number(state.smokeTypical||0))))*100)},
  {label:'Gasto alcohol', valueText:fmt(state.alcoholToday||0), width:Math.min(100,((Number(state.alcoholToday||0))/Math.max(1,Number(state.alcoholTypical||0)||1))*100)},
  {label:'Gasto tabaco', valueText:fmt(m.smokeSpent), width:Math.min(100,(m.smokeSpent/Math.max(1,Number(state.smokeTypical||0)||1))*100)},
  {label:'Meta título', valueText:`${m.goalPct.toFixed(0)}%`, width:m.goalPct}
]);
const totals={}; for(const e of state.expenses){totals[e.category]=(totals[e.category]||0)+Number(e.amount||0)}; const entries=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5); renderBars('expenseBars', entries.length?entries.map(([k,v])=>({label:labelCat(k),valueText:fmt(v),width:Math.min(100,(v/Math.max(...entries.map(x=>x[1]),1))*100)})):[{label:'Sin gastos registrados',valueText:'0 COP',width:0}]);
$('weeklySummary').innerHTML=`<div>✅ Casa completadas: ${state.tasks.home.filter(t=>t.done).length}</div><div>✅ Trabajo completadas: ${state.tasks.work.filter(t=>t.done).length}</div><div>📚 Estudio acumulado: ${state.studyTotal||0} min</div><div>💸 Dinero desperdiciado: ${fmt(m.wasted)}</div><div>💜 Recuperado potencial hoy: ${fmt(m.recoveredToday)}</div>`;}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function labelCat(c){return ({mercado:'Mercado',arriendo:'Arriendo',servicios:'Servicios',deudas:'Deudas',ahorro:'Ahorro',transporte:'Transporte',salud:'Salud',estudio:'Estudio',alcohol:'Alcohol',tabaco:'Tabaco',otros:'Otros'})[c]||c;}
function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id===id)); $('quickMenuOverlay').classList.add('hidden'); spawnPaws(); window.scrollTo({top:0,behavior:'smooth'});} 
function askNext(msg='¿Quieres registrar otra categoría?'){showMessage(msg,5); setTimeout(()=>$('quickMenuOverlay').classList.remove('hidden'),300);} 
function bind(){document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.goto))); document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',()=>go('home'))); document.querySelectorAll('[data-open-menu]').forEach(b=>b.addEventListener('click',()=>$('quickMenuOverlay').classList.remove('hidden'))); document.querySelectorAll('[data-close-menu]').forEach(b=>b.addEventListener('click',()=>$('quickMenuOverlay').classList.add('hidden'))); $('fabMenuBtn').addEventListener('click',()=>$('quickMenuOverlay').classList.remove('hidden')); $('closeBubble').addEventListener('click',closeMessage);
$('saveAlcoholBtn').addEventListener('click',()=>{state.alcoholToday=Number($('alcoholToday').value||0); state.alcoholTypical=Number($('alcoholTypical').value||0); state.alcoholLog=(state.alcoholLog||[]).filter(x=>x.date!==today()); state.alcoholLog.push({date:today(),amount:state.alcoholToday}); save(); toast('Alcohol guardado'); askNext(state.alcoholToday===0?'Muy bien. Hoy te protegiste. ¿Qué registramos ahora?':'Quedó registrado. Sin culpa, pero con claridad. ¿Qué sigue?');});
$('urgeBtn').addEventListener('click',()=>showMessage('ALTO. Agua, respira, cambia de lugar y espera 10 minutos. El impulso también se cansa.',6));
$('smokePlus').addEventListener('click',()=>{state.smokeCount=Number(state.smokeCount||0)+1; render(); spawnPaws();}); $('smokeMinus').addEventListener('click',()=>{state.smokeCount=Math.max(0,Number(state.smokeCount||0)-1); render(); spawnPaws();}); $('saveSmokeBtn').addEventListener('click',()=>{state.smokeTypical=Number($('smokeTypical').value||0); state.smokeHabitual=Number($('smokeHabitual').value||10); save(); toast('Cigarrillo guardado'); askNext('Listo. Quedó actualizado. ¿Qué quieres registrar ahora?');});
$('saveSalaryBtn').addEventListener('click',()=>{state.salary=Number($('salaryInput').value||0); state.goalSaved=Number($('goalSavedInput').value||0); save(); toast('Datos base guardados'); showMessage('Perfecto. Ahora sí quedó guardado el salario y tu avance del título.',5);});
$('saveExpenseBtn').addEventListener('click',()=>{const category=$('expenseCategory').value, amount=Number($('expenseAmount').value||0), desc=$('expenseDesc').value.trim(); if(amount<=0){toast('Ingresa un valor válido'); return;} state.expenses.push({id:Date.now(),date:today(),category,amount,description:desc}); if(category==='ahorro') state.goalSaved=Number(state.goalSaved||0)+amount; $('expenseAmount').value=''; $('expenseDesc').value=''; save(); toast('Gasto guardado'); askNext('Gasto registrado. ¿Quieres pasar a otra categoría?');});
$('exportBackupBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`HEIDI_LIFE_OS_${today()}.json`; a.click(); URL.revokeObjectURL(a.href); toast('Respaldo exportado');});
$('recoveredToGoalBtn').addEventListener('click',()=>{const rec=calc().recoveredToday; if(rec<=0){toast('Hoy no hay recuperado para enviar'); return;} state.goalSaved=Number(state.goalSaved||0)+rec; state.expenses.push({id:Date.now(),date:today(),category:'ahorro',amount:rec,description:'Recuperado por reducción de hábitos'}); save(); toast('Recuperado enviado al título'); showMessage('Eso sí suma. Convertiste tu esfuerzo en ahorro real.',5);});
document.addEventListener('click',e=>{const rem=e.target.getAttribute('data-remove'); if(rem){state.expenses=state.expenses.filter(x=>String(x.id)!==String(rem)); save(); toast('Gasto eliminado');} const tid=e.target.getAttribute('data-task'); if(tid){['home','work'].forEach(group=>{state.tasks[group]=state.tasks[group].map(t=>t.id===tid?{...t,done:!t.done}:t)}); save(); spawnPaws(); showMessage('Bien. Cada tarea marcada también es avance real.',3);}});
$('bodyDoneBtn').addEventListener('click',()=>{state.exerciseDone=true; state.bodyLast=today(); save(); spawnPaws(); showMessage('Excelente. Hoy sí te moviste. Aunque sea poco, cuenta.',4); toast('Rutina registrada');}); $('breathBtn').addEventListener('click',()=>showMessage('Inhala 4 · sostén 4 · exhala 6. Haz 5 ciclos. Baja el cuerpo antes de decidir.',6));
$('saveStudyBtn').addEventListener('click',()=>{const mins=Number($('studyMinutes').value||0); state.studyTopic=$('studyTopic').value.trim(); state.studyTotal=Number(state.studyTotal||0)+mins; $('studyMinutes').value=''; save(); toast('Estudio guardado'); askNext('Buen trabajo. Estudiar también es construir salida. ¿Qué sigue?');});
$('saveJournalBtn').addEventListener('click',()=>{state.journalTitle=$('journalTitle').value; state.journalBody=$('journalBody').value; state.journalDate=today(); save(); toast('Diario guardado'); showMessage('Escribir también ordena. Ya quedó guardado.',4);});
$('saveReflectionBtn').addEventListener('click',()=>{state.reflectionBody=$('reflectionBody').value; state.reflectionDate=today(); save(); toast('Cierre guardado'); showMessage('Cierre listo. Mañana no empieza desde cero: empieza desde lo aprendido.',5);});}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
window.addEventListener('DOMContentLoaded',()=>{bind(); render(); showMessage('Bienvenida. Hoy no se arregla toda la vida. Hoy se sostiene el plan.',5);});
