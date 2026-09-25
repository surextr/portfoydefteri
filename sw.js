// Portföy Defteri - çevrimdışı çalışma
const SURUM='2026.09.25-2123';
const CEKIRDEK='pd-cekirdek-'+SURUM, HARITA='pd-harita';
const DOSYALAR=['./','./index.html','./ilan.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CEKIRDEK).then(c=>c.addAll(DOSYALAR)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pd-cekirdek-')&&k!==CEKIRDEK).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function agOnce(req){const c=await caches.open(CEKIRDEK);
  try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);const r=await fetch(req,{signal:ctl.signal,cache:'no-store'});clearTimeout(t);if(r&&r.ok)c.put(req,r.clone());return r}
  catch(e){return (await c.match(req,{ignoreSearch:true}))||(await c.match('./index.html'))||Response.error()}}
async function haritaParca(req){const c=await caches.open(HARITA);const m=await c.match(req);if(m)return m;
  try{const r=await fetch(req);if(r&&(r.ok||r.type==='opaque')){c.put(req,r.clone());c.keys().then(ks=>{if(ks.length>1500)ks.slice(0,ks.length-1500).forEach(k=>c.delete(k))})}return r}catch(e){return Response.error()}}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  if(u.origin===location.origin){e.respondWith(agOnce(e.request));return}
  if(/tile\.openstreetmap\.org$/.test(u.hostname)){e.respondWith(haritaParca(e.request))}});
