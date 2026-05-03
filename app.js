const state = JSON.parse(localStorage.getItem('heidiLifeOS') || '{}');
const expenseCategories = ['mercado','arriendo','servicios','deudas','ahorro','alcohol','tabaco','otros'];
const fmt = n => new Intl.NumberFormat('es-CO').format(Number(n || 0)) + ' COP';

function save(){ localStorage.setItem('heidiLifeOS', JSON.stringify(state)); render(); }
function today(){ return new Date().toISOString().slice(0,10); }

function setScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id===id));
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.screen===id));
  document.getElementById('goma').style.transform = `translateY(${id==='panel' ? -8 : 0}px)`;
}

function buildExpenses(){
  const root = document.getElementById('expenseFields'); root.innerHTML='';
  expenseCategories.forEach(cat=>{ const i = document.createElement('input'); i.type='number'; i.min='0'; i.step='500'; i.value = state.expenses?.[cat] || 0; i.placeholder = cat; i.addEventListener('input', e=>{ state.expenses = state.expenses || {}; state.expenses[cat]=Number(e.target.value||0); save(); }); root.append(i); });
}

function render(){
  const alcoholToday = Number(state.alcoholToday || 0), alcoholTypical = Number(state.alcoholTypical || 0);
  const smokeCount = Number(state.smokeCount || 0), smokeTypical = Number(state.smokeTypical || 0);
  const smokeUnit = smokeTypical / Math.max(1, Number(state.smokeHabitualCount || 10));
  const smokeToday = smokeCount * smokeUnit;
  const expenses = Object.values(state.expenses || {}).reduce((a,b)=>a+Number(b||0),0);
  const salary = Number(state.salary || 0);
  const balance = salary - expenses;
  const wasted = (state.expenses?.alcohol || 0) + (state.expenses?.tabaco || 0) + alcoholToday + smokeToday;

  document.getElementById('homeToday').textContent = `Balance estimado hoy: ${fmt(balance)} · Estudio: ${state.studyMinutes || 0} min`;
  document.getElementById('goalText').textContent = `Meta título: 10,000,000 COP · Saldo actual: ${fmt(Math.max(0,balance))}`;
  document.getElementById('goalBar').style.width = `${Math.min(100, Math.max(0, balance / 10000000 * 100))}%`;

  document.getElementById('alcoholToday').value = alcoholToday; document.getElementById('alcoholTypical').value = alcoholTypical;
  const alcoholDelta = alcoholTypical - alcoholToday;
  document.getElementById('alcoholFeedback').textContent = alcoholDelta >= 0
    ? `Progreso firme: hoy evitaste ${fmt(alcoholDelta)} frente a tu patrón.`
    : `Alerta: hoy gastaste ${fmt(Math.abs(alcoholDelta))} más de lo habitual. Retoma control mañana.`;

  document.getElementById('smokeTypical').value = smokeTypical; document.getElementById('smokeCount').textContent = smokeCount;
  document.getElementById('smokeImpact').textContent = `Impacto inmediato de hoy: ${fmt(smokeToday)} en tabaco.`;

  document.getElementById('salary').value = salary; document.getElementById('wasteCard').textContent = fmt(wasted); document.getElementById('balanceText').textContent = fmt(balance);
  document.getElementById('studyProgress').textContent = state.studyTopic ? `Tema: ${state.studyTopic} · ${state.studyMinutes || 0} min acumulados` : 'Aún no has registrado estudio hoy.';
  document.getElementById('weeklySummary').textContent = `Diario: ${state.lastJournalDate || 'sin entrada'} · Reflexión: ${state.lastReflectionDate || 'pendiente'} · Ejercicio: ${state.exerciseDoneDate || 'pendiente'}`;

  const chart = document.getElementById('chart');
  chart.innerHTML = ['Ahorro potencial', 'Gasto alcohol', 'Gasto tabaco'].map((label, idx)=>{
    const value = idx===0 ? Math.max(0, alcoholTypical-alcoholToday) : (idx===1? alcoholToday : smokeToday);
    return `<div>${label}: ${fmt(value)}<div class="bar"><span style="width:${Math.min(100, value/50000*100)}%"></span></div></div>`;
  }).join('');
}

document.addEventListener('click', e=>{
  const screen = e.target.dataset.screen; if (screen) return setScreen(screen);
  const action = e.target.dataset.action; if (!action) return;
  if (action==='save-alcohol'){ state.alcoholToday = Number(alcoholToday.value||0); state.alcoholTypical=Number(alcoholTypical.value||0); state.lastHabitDate=today(); document.getElementById('gomaMessage').textContent='Goma: registrar con honestidad también es disciplina.'; save(); }
  if (action==='smoke-plus'){ state.smokeCount = Number(state.smokeCount||0)+1; save(); }
  if (action==='smoke-minus'){ state.smokeCount = Math.max(0, Number(state.smokeCount||0)-1); save(); }
  if (action==='exercise-done'){ state.exerciseDoneDate=today(); document.getElementById('breathStatus').textContent='Excelente. Tu cuerpo ya recibió cuidado.'; save(); }
  if (action==='breath-start'){ document.getElementById('breathStatus').textContent='Inhala... sostén... exhala... ciclo completado.'; }
  if (action==='study-save'){ state.studyTopic = document.getElementById('studyTopic').value.trim(); state.studyMinutes = Number(document.getElementById('studyMinutes').value||0)+(state.studyMinutesBase||0); state.studyMinutesBase=0; save(); }
  if (action==='journal-save'){ state.lastJournalDate=today(); save(); }
  if (action==='reflection-save'){ state.lastReflectionDate=today(); save(); }
});

document.getElementById('salary').addEventListener('input', e=>{ state.salary=Number(e.target.value||0); save(); });
document.getElementById('alcoholToday').addEventListener('input', e=> state.alcoholToday=Number(e.target.value||0));
document.getElementById('alcoholTypical').addEventListener('input', e=> state.alcoholTypical=Number(e.target.value||0));
document.getElementById('smokeTypical').addEventListener('input', e=> state.smokeTypical=Number(e.target.value||0));

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
buildExpenses(); setScreen('inicio'); render();
