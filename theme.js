/* Modo claro / oscuro: sigue el sistema hasta que elijas con el botón; la elección se recuerda */
(function(){
  var KEY='heidi_theme';
  function saved(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function system(){return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
  function apply(t){
    document.documentElement.dataset.theme=t;
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#1e1150':'#8b5cff');
    var b=document.getElementById('themeBtn');if(b){b.textContent=t==='dark'?'☀️':'🌙';b.setAttribute('aria-label',t==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro')}
  }
  apply(saved()||system());
  window.setTheme=function(t){try{localStorage.setItem(KEY,t)}catch(e){}apply(t)};
  window.toggleTheme=function(){window.setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')};
  if(window.matchMedia){try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(!saved())apply(system())})}catch(e){}}
  window.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('themeBtn');if(b){b.onclick=window.toggleTheme;apply(document.documentElement.dataset.theme)}});
})();
