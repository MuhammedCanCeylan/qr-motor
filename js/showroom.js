(function(){'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const dialog=document.querySelector('#showroom'),hero=document.querySelector('#modelMount'),stage=document.querySelector('#showroomMount'),status=document.querySelector('#modelStatus'),activate=document.querySelector('#activateModel'),frame=document.querySelector('#storyFrame');
 let viewer=null,loading=null,scriptPromise=null,opener=null,scrollPosition=0,night=false,spinning=false,p=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),spinButton=document.querySelector('#spinModel');
 function setStatus(message){status.textContent=message;document.querySelector('#showroomStatus').textContent=message;}
 function stopSpin(){spinning=false;viewer?.stop();spinButton.setAttribute('aria-pressed','false');spinButton.textContent='Yavaş dönüş';}
 function motion(){stopSpin();spinButton.disabled=reduced.matches||PCXStore.get().settings.motion===false;}
 function script(){if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{const el=document.createElement('script');el.src='js/viewer.bundle.js';el.onload=resolve;el.onerror=()=>{el.remove();scriptPromise=null;reject(Error('3D dosyası yüklenemedi.'));};document.head.append(el);});return scriptPromise;}
 function failed(){viewer=null;frame.classList.remove('has-model');dialog.classList.remove('model-ready');activate.disabled=false;activate.textContent='3D’yi yeniden dene';setStatus('3D açılamadı. Görsel görünüm devam ediyor; bağlantını kontrol edip tekrar deneyebilirsin.');document.querySelector('#retryModel').hidden=false;}
 async function load(){if(viewer)return viewer;if(loading)return loading;
  if(!/^https?:$/.test(location.protocol)){setStatus('3D için siteyi GitHub Pages bağlantısından veya yerel HTTP sunucusundan aç.');return null;}
  activate.disabled=true;activate.textContent='3D yükleniyor…';document.querySelector('#retryModel').hidden=true;setStatus('Model yükleniyor · 1,9 MB');
  loading=(async()=>{try{await script();viewer=await PCXViewer.create(dialog.open?stage:hero,new URL('assets/models/pcx-mobile.glb',document.baseURI).href,setStatus,failed);viewer.move(dialog.open?stage:hero,dialog.open);viewer.light(night);viewer.hero(p);frame.classList.add('has-model');dialog.classList.add('model-ready');activate.textContent='360° incele ↗';setStatus('3D hazır · Kaydırdıkça bakış açısı değişir.');return viewer;}catch(e){failed();return null;}finally{activate.disabled=false;loading=null;}})();return loading;
 }
 async function open(e){opener=e.currentTarget;scrollPosition=scrollY;dialog.showModal();document.body.style.overflow='hidden';motion();if(viewer){viewer.move(stage,true);}else await load();}
 function close(){dialog.close();}
 dialog.addEventListener('close',()=>{stopSpin();document.body.style.overflow='';if(viewer){viewer.move(hero,false);viewer.hero(p);}scrollTo({top:scrollPosition,behavior:'instant'});opener?.focus({preventScroll:true});});
 document.querySelectorAll('[data-showroom]').forEach(b=>b.addEventListener('click',open));
 activate.addEventListener('click',e=>viewer?open(e):load());document.querySelector('#closeShowroom').addEventListener('click',close);document.querySelector('#retryModel').addEventListener('click',load);
 document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>{stopSpin();viewer?.preset(b.dataset.angle);document.querySelectorAll('[data-angle]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 document.querySelector('#zoomIn').addEventListener('click',()=>{stopSpin();viewer?.zoom(.85);});document.querySelector('#zoomOut').addEventListener('click',()=>{stopSpin();viewer?.zoom(1.18);});
 document.querySelector('#resetModel').addEventListener('click',()=>{stopSpin();viewer?.preset('reset');document.querySelectorAll('[data-angle]').forEach(x=>x.setAttribute('aria-pressed','false'));});
 document.querySelector('#lightModel').addEventListener('click',e=>{night=!night;dialog.classList.toggle('night',night);e.currentTarget.setAttribute('aria-pressed',String(night));e.currentTarget.textContent=night?'Gündüz ışığı':'Gece ışığı';viewer?.light(night);});
 spinButton.addEventListener('click',()=>{if(!viewer)return;spinning=!spinning;viewer.spin(spinning);spinButton.setAttribute('aria-pressed',String(spinning));spinButton.textContent=spinning?'Dönüşü durdur':'Yavaş dönüş';});
 stage.addEventListener('pcx:manual-orbit',stopSpin);
 stage.addEventListener('keydown',e=>{if(!viewer)return;if(e.key==='+'||e.key==='='){e.preventDefault();viewer.zoom(.85);}if(e.key==='-'){e.preventDefault();viewer.zoom(1.18);}if(e.key.toLowerCase()==='r'){e.preventDefault();viewer.preset('reset');}});
 window.addEventListener('pcx:story',e=>{p=e.detail.progress;viewer?.hero(p);});window.addEventListener('pcx:state',motion);reduced.addEventListener('change',motion);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpin();});window.addEventListener('pcx:view',()=>{stopSpin();if(dialog.open)dialog.close();});motion();
});})();
