
const STORAGE_KEY = 'heidiLifeOSPro';
const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

state.goalTarget ??= 10000000;
state.goalSaved ??= 0;
state.salary ??= 0;
state.alcoholToday ??= 0;
state.alcoholTypical ??= 0;
state.smokeTypical ??= 12000;
state.smokeHabitualCount ??= 10;
state.smokeCount ??= 0;
state.studyMinutesTotal ??= 0;
state.expenses ??= [];

const fmt = n => new Intl.NumberFormat('es-CO').format(Math.round(Number(n || 0))) + ' COP';
const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);

const screenMessages = {
  inicio: 'Hoy no se arregla toda la vida. Hoy se sostiene el plan.',
  habitos: 'Si reduces, cuenta. Si recaíste, no mientas: registra y retoma.',
  dinero: 'Tu dinero necesita dirección, no desapariciones silenciosas.',
  cuerpo: '20 minutos bastan para empezar a recuperar poder sobre tu cuerpo.',
  estudio: 'Aprender poquito, pero constante, vale más que prometer mucho.',
  dia: 'Escribir ordena. Cerrar el día también es autocuidado.',
  panel: 'Mira patrones, no solo momentos. Ahí está la mejora real.'
};

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function toast(msg){
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1800);
}

function calc(){
  const smokeUnit = Number(state.smokeTypical || 0) / Math.max(1, Number(state.smokeHabitualCount || 10));
  const smokeToday = Number(state.smokeCount || 0) * smokeUnit;
  const expenseSum = (state.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const wastedFromExpenses = (state.expenses || []).filter(e => ['alcohol','tabaco'].includes(e.category)).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const recoveredAlcohol = Math.max(0, Number(state.alcoholTypical || 0) - Number(state.alcoholToday || 0));
  const recoveredSmoke = Math.max(0, Number(state.smokeTypical || 0) - smokeToday);
  const recoveredToday = recoveredAlcohol + recoveredSmoke;
  const wasted = Number(state.alcoholToday || 0) + smokeToday + wastedFromExpenses;
  const balance = Number(state.salary || 0) - expenseSum;
  const goalPct = Math.max(0, Math.min(100, (Number(state.goalSaved || 0) / Number(state.goalTarget || 10000000)) * 100));
  return { smokeUnit, smokeToday, expenseSum, recoveredToday, wasted, balance, goalPct };
}

function alcoholStreak(){
  const logs = state.alcoholLog || [];
  if(!logs.length) return 0;
  const sorted = [...logs].sort((a,b) => b.date.localeCompare(a.date));
  let streak = 0;
  const seen = new Set();
  for(const log of sorted){
    if(seen.has(log.date)) continue;
    seen.add(log.date);
    if(Number(log.amount || 0) === 0) streak += 1; else break;
  }
  return streak;
}

function renderExpenses(){
  const root = $('expenseList');
  const list = state.expenses || [];
  if(!list.length){
    root.innerHTML = '<div class="feedback">Aún no has registrado gastos. Mejor: cada peso registrado te devuelve control.</div>';
    return;
  }
  root.innerHTML = list.slice().reverse().map(item => `
    <div class="expense-item">
      <div class="expense-main">
        <div><span class="chip">${labelCat(item.category)}</span></div>
        <b>${escapeHtml(item.description || 'Sin descripción')}</b>
        <small>${item.date}</small>
      </div>
      <div class="expense-meta">
        <span class="amount">${fmt(item.amount)}</span>
        <button class="remove-expense" data-remove-expense="${item.id}">✕</button>
      </div>
    </div>
  `).join('');
}

function labelCat(cat){
  const map = {mercado:'Mercado',arriendo:'Arriendo',servicios:'Servicios',transporte:'Transporte',deudas:'Deudas',ahorro:'Ahorro',alcohol:'Alcohol',tabaco:'Tabaco',salud:'Salud',estudio:'Estudio',otros:'Otros'};
  return map[cat] || cat;
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function renderChart(metrics){
  $('chart').innerHTML = [
    {label:'Ahorro potencial de hoy', value:metrics.recoveredToday, max:Math.max(1, Number(state.alcoholTypical||0) + Number(state.smokeTypical||0) || 50000)},
    {label:'Gasto alcohol', value:Number(state.alcoholToday||0), max:Math.max(1, Number(state.alcoholTypical||0) || 50000)},
    {label:'Gasto tabaco', value:metrics.smokeToday, max:Math.max(1, Number(state.smokeTypical||0) || 50000)}
  ].map(item => `
    <div class="chart-item">
      <div class="chart-top"><span>${item.label}</span><strong>${fmt(item.value)}</strong></div>
      <div class="bar"><span style="width:${Math.min(100, (item.value / item.max) * 100)}%"></span></div>
    </div>
  `).join('');
}

function render(){
  const m = calc();
  $('todayLabel').textContent = new Intl.DateTimeFormat('es-CO', { weekday:'long', day:'numeric', month:'long' }).format(new Date());
  $('topState').textContent = m.recoveredToday > 0 ? 'Día con avance' : 'Día en construcción';

  $('heroSummary').textContent = `Saldo estimado: ${fmt(m.balance)} · Recuperado hoy: ${fmt(m.recoveredToday)} · Estudio acumulado: ${state.studyMinutesTotal || 0} min.`;
  $('heroTitle').textContent = m.balance >= 0 ? 'Vas tomando control' : 'Ojo con el saldo';
  $('kpiStreak').textContent = `${alcoholStreak()} día(s)`;
  $('kpiCigs').textContent = state.smokeCount || 0;
  $('kpiRecovered').textContent = fmt(m.recoveredToday);
  $('kpiGoal').textContent = `${m.goalPct.toFixed(0)}%`;

  $('salary').value = state.salary || '';
  $('goalSaved').value = state.goalSaved || '';
  $('goalText').textContent = `${fmt(state.goalSaved)} de ${fmt(state.goalTarget)}`;
  $('goalBar').style.width = `${m.goalPct}%`;
  $('wasteCard').textContent = fmt(m.wasted);
  $('balanceText').textContent = fmt(m.balance);

  $('alcoholToday').value = state.alcoholToday || '';
  $('alcoholTypical').value = state.alcoholTypical || '';
  const alcoholDelta = Number(state.alcoholTypical || 0) - Number(state.alcoholToday || 0);
  $('alcoholFeedback').textContent = alcoholDelta >= 0
    ? `Progreso firme: hoy evitaste ${fmt(alcoholDelta)} frente a tu patrón.`
    : `Alerta: hoy te pasaste ${fmt(Math.abs(alcoholDelta))} por encima de lo habitual. No romantices eso; retoma mañana.`;

  $('smokeTypical').value = state.smokeTypical || '';
  $('smokeHabitualCount').value = state.smokeHabitualCount || '';
  $('smokeCount').textContent = state.smokeCount || 0;
  $('smokeImpact').textContent = `Impacto inmediato de hoy: ${fmt(m.smokeToday)} en tabaco. Recuperado frente a tu rutina: ${fmt(Math.max(0, Number(state.smokeTypical || 0) - m.smokeToday))}.`;

  $('studyTopic').value = state.studyTopic || '';
  $('studyMinutes').value = '';
  $('studyProgress').textContent = state.studyTopic
    ? `Último tema: ${state.studyTopic} · acumulado total: ${state.studyMinutesTotal || 0} min.`
    : 'Aún no has registrado estudio hoy.';

  $('journalTitle').value = state.journalTitle || '';
  $('journalBody').value = state.journalBody || '';
  $('dayReflection').value = state.dayReflection || '';
  $('weeklySummary').textContent = `Diario: ${state.lastJournalDate || 'sin entrada'} · Reflexión: ${state.lastReflectionDate || 'pendiente'} · Ejercicio: ${state.exerciseDoneDate || 'pendiente'} · Estudio: ${state.studyMinutesTotal || 0} min acumulados.`;

  renderExpenses();
  renderChart(m);
}

function setScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  const wrap = $('gomaWrap');
  wrap.className = `goma-wrap pos-${id}`;
  $('gomaBubble').textContent = screenMessages[id] || screenMessages.inicio;
  spawnPaws();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function spawnPaws(){
  const layer = $('pawLayer');
  layer.innerHTML = '';
  for(let i = 0; i < 4; i++){
    const el = document.createElement('div');
    el.className = 'paw';
    el.textContent = '🐾';
    el.style.left = `${12 + Math.random() * 70}vw`;
    el.style.top = `${18 + Math.random() * 60}vh`;
    el.style.animationDelay = `${i * 0.08}s`;
    layer.appendChild(el);
  }
  setTimeout(() => layer.innerHTML = '', 1400);
}

function bindEvents(){
  document.querySelectorAll('[data-screen]').forEach(btn => btn.addEventListener('click', () => setScreen(btn.dataset.screen)));

  $('saveAlcoholBtn').addEventListener('click', () => {
    state.alcoholToday = Number($('alcoholToday').value || 0);
    state.alcoholTypical = Number($('alcoholTypical').value || 0);
    state.alcoholLog = (state.alcoholLog || []).filter(item => item.date !== today());
    state.alcoholLog.push({ date: today(), amount: state.alcoholToday });
    $('gomaBubble').textContent = state.alcoholToday === 0 ? 'Eso. Hoy protegiste tu avance.' : 'Registrar con honestidad también es disciplina.';
    save();
    toast('Alcohol guardado');
  });

  $('urgencyBtn').addEventListener('click', () => {
    $('gomaBubble').textContent = 'ALTO. No negocies con el impulso. Agua, respira, cambia de lugar y espera 10 minutos.';
    toast('Modo urgencia activado');
    spawnPaws();
  });

  $('smokePlus').addEventListener('click', () => { state.smokeCount = Number(state.smokeCount || 0) + 1; save(); toast('+1 cigarrillo'); });
  $('smokeMinus').addEventListener('click', () => { state.smokeCount = Math.max(0, Number(state.smokeCount || 0) - 1); save(); toast('Ajustado'); });
  $('smokeTypical').addEventListener('input', () => { state.smokeTypical = Number($('smokeTypical').value || 0); save(); });
  $('smokeHabitualCount').addEventListener('input', () => { state.smokeHabitualCount = Number($('smokeHabitualCount').value || 10); save(); });

  $('salary').addEventListener('input', () => { state.salary = Number($('salary').value || 0); save(); });
  $('goalSaved').addEventListener('input', () => { state.goalSaved = Number($('goalSaved').value || 0); save(); });

  $('addExpenseBtn').addEventListener('click', () => {
    const category = $('expenseCategory').value;
    const amount = Number($('expenseAmount').value || 0);
    const description = $('expenseDesc').value.trim();
    if(amount <= 0){ toast('Ingresa un valor válido'); return; }
    state.expenses.push({ id: Date.now(), date: today(), category, amount, description });
    if(category === 'ahorro') state.goalSaved = Number(state.goalSaved || 0) + amount;
    $('expenseAmount').value = '';
    $('expenseDesc').value = '';
    save();
    toast('Gasto registrado');
  });

  document.addEventListener('click', e => {
    const id = e.target.getAttribute('data-remove-expense');
    if(!id) return;
    state.expenses = (state.expenses || []).filter(item => String(item.id) !== String(id));
    save();
    toast('Gasto eliminado');
  });

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `HEIDI_LIFE_OS_${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('sendRecoveredBtn').addEventListener('click', () => {
    const recovered = calc().recoveredToday;
    if(recovered <= 0){ toast('Hoy no hay recuperado para enviar'); return; }
    state.goalSaved = Number(state.goalSaved || 0) + recovered;
    state.expenses.push({ id: Date.now(), date: today(), category: 'ahorro', amount: recovered, description: 'Recuperado por reducción de alcohol/tabaco' });
    save();
    toast('Recuperado enviado al título');
  });

  $('exerciseDoneBtn').addEventListener('click', () => {
    state.exerciseDoneDate = today();
    $('breathStatus').textContent = 'Excelente. Tu cuerpo ya recibió cuidado hoy.';
    save();
    toast('Rutina registrada');
  });

  $('breathBtn').addEventListener('click', () => {
    $('breathStatus').textContent = 'Inhala 4 · sostén 4 · exhala 6. Repite 5 veces. No pelees con la mente: baja el cuerpo.';
    $('gomaBubble').textContent = 'Respira antes de decidir. Tu cuerpo necesita menos revolución.';
    spawnPaws();
  });

  $('studySaveBtn').addEventListener('click', () => {
    const topic = $('studyTopic').value.trim();
    const minutes = Number($('studyMinutes').value || 0);
    state.studyTopic = topic;
    state.studyMinutesTotal = Number(state.studyMinutesTotal || 0) + minutes;
    save();
    toast('Estudio registrado');
  });

  $('journalSaveBtn').addEventListener('click', () => {
    state.journalTitle = $('journalTitle').value;
    state.journalBody = $('journalBody').value;
    state.lastJournalDate = today();
    save();
    toast('Diario guardado');
  });

  $('reflectionSaveBtn').addEventListener('click', () => {
    state.dayReflection = $('dayReflection').value;
    state.lastReflectionDate = today();
    save();
    toast('Día cerrado');
  });
}

if('serviceWorker' in navigator){
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  render();
  setScreen('inicio');
});
