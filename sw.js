// service worker planu — wersja 8715dca556
const V='plan-8715dca556', FONTS='plan-fonts';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon.png'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==FONTS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.endsWith('gstatic.com')||u.hostname.endsWith('googleapis.com')){
    // czcionki: najpierw cache, potem sieć
    e.respondWith(caches.open(FONTS).then(async c=>{
      const hit=await c.match(e.request); if(hit) return hit;
      const net=await fetch(e.request); if(net.ok||net.type==='opaque') c.put(e.request,net.clone()); return net;
    }));
    return;
  }
  if(u.origin===location.origin){
    // własne pliki: najpierw sieć z pominięciem HTTP cache (GitHub Pages daje max-age=600 — bez no-store telefon widzi starą wersję do 10 min), offline z cache
    e.respondWith(fetch(e.request.url,{cache:'no-store',credentials:'same-origin'}).then(net=>{ caches.open(V).then(c=>c.put(e.request,net.clone())); return net; })
      .catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
  }
});
