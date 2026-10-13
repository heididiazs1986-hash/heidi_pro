/* Heidi Life OS 3: red primero (siempre la versión más nueva) y caché como respaldo sin conexión */
const CACHE='heidi-life-os-v3';
const ASSETS=['./','./index.html','./styles.css','./icons.js','./theme.js','./app.js','./habits.js','./food.js','./home.js','./nav.js','./manifest.json','./goma-icon.png','./icon-180.png','./icon-192.png','./icon-512.png','./fonts/inter-Regular.woff','./fonts/inter-Medium.woff','./fonts/inter-SemiBold.woff','./fonts/inter-Bold.woff','./fonts/lora-var.woff'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>c.add(new Request(a,{cache:'reload'})).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==self.location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:r.mode!=='navigate'}).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
