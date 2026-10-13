/* Apariencia: automático (sigue al sistema), claro u oscuro. Cambia TODA la interfaz. */
(function(){
  var KEY='heidi_theme',META={light:'#f7f2f1',dark:'#150e17'};
  function pref(){try{var v=localStorage.getItem(KEY);return v==='light'||v==='dark'?v:'auto'}catch(e){return 'auto'}}
  function system(){return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
  function eff(){var p=pref();return p==='auto'?system():p}
  function apply(){
    var t=eff();
    document.documentElement.setAttribute('data-theme',t);
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',META[t]);
    var b=document.getElementById('themeBtn');
    if(b&&window.icon){b.innerHTML=icon(t==='dark'?'sun':'moon',20);b.setAttribute('aria-label',t==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro')}
    document.querySelectorAll('[data-theme-pref]').forEach(function(x){x.classList.toggle('on',x.dataset.themePref===pref())});
  }
  window.setThemePref=function(p){try{if(p==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,p)}catch(e){}apply()};
  window.toggleTheme=function(){window.setThemePref(eff()==='dark'?'light':'dark')};
  apply();
  if(window.matchMedia){try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',apply)}catch(e){}}
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('themeBtn');if(b)b.onclick=window.toggleTheme;
    document.addEventListener('click',function(e){var x=e.target.closest('[data-theme-pref]');if(x)window.setThemePref(x.dataset.themePref)});
    apply();
  });
})();
