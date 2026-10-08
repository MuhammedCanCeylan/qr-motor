(function(){
'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const track=document.querySelector('#storyTrack'),frame=document.querySelector('#storyFrame'),panels=[...document.querySelectorAll('[data-panel]')],chapters=[...document.querySelectorAll('[data-chapter]')],motion=document.querySelector('#motionToggle');
 if(!track||!frame)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 let simple=true,raf=0,visible=true,lastChapter=-1,tiltX=0,tiltY=0,modeInitialized=false,tour=0;const play=document.querySelector('#playStory');
 function stopTour(){cancelAnimationFrame(tour);tour=0;play.textContent='Turu oynat ▷';play.setAttribute('aria-pressed','false');}
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
 function headerHeight(){return innerWidth<=760?64:76;}
 function progress(){const r=track.getBoundingClientRect(),length=track.offsetHeight-frame.offsetHeight;return clamp((headerHeight()-r.top)/Math.max(1,length));}
 function jumpChapter(n){stopTour();if(simple){panels[n].scrollIntoView({behavior:'auto',block:'center'});return;}const absolute=scrollY+track.getBoundingClientRect().top-headerHeight(),length=track.offsetHeight-frame.offsetHeight;scrollTo({top:absolute+length*[0,.5,1][n],behavior:reduced.matches?'auto':'smooth'});}
 function jumpHub(){stopTour();const hub=document.querySelector('#homeHub');scrollTo({top:scrollY+hub.getBoundingClientRect().top-headerHeight()-16,behavior:reduced.matches||simple?'auto':'smooth'});hub.focus({preventScroll:true});}
 function render(){raf=0;if(simple||!visible||document.body.dataset.view!=='home'||document.hidden)return;
  const p=progress(),segment=p<.5?0:1,t=smooth(p<.5?p*2:(p-.5)*2),mobile=innerWidth<=760;
  const key=mobile?[{x:0,y:1,r:-4,s:.92},{x:1,y:5,r:3,s:.94},{x:0,y:-1,r:-3,s:.93}]:[{x:0,y:1,r:-6,s:.98},{x:-60,y:6,r:3,s:.85},{x:1,y:0,r:-3,s:.96}];
  const a=key[segment],b=key[segment+1];
  frame.style.setProperty('--bike-x',lerp(a.x,b.x,t)+'%');frame.style.setProperty('--bike-y',lerp(a.y,b.y,t)+'%');frame.style.setProperty('--bike-rotate',lerp(a.r,b.r,t)+'deg');frame.style.setProperty('--bike-scale',lerp(a.s,b.s,t));
  frame.style.setProperty('--tilt-x',tiltX+'deg');frame.style.setProperty('--tilt-y',tiltY+'deg');frame.style.setProperty('--far-shift',(-p*90)+'px');frame.style.setProperty('--near-shift',(-p*190)+'px');frame.style.setProperty('--orbit-turn',(p*65)+'deg');frame.style.setProperty('--road-shift',(p*140)+'px');frame.style.setProperty('--story-progress',p);
  window.dispatchEvent(new CustomEvent('pcx:story',{detail:{progress:p}}));
  const chapter=p<.28?0:p<.76?1:2;
  if(chapter!==lastChapter){lastChapter=chapter;frame.dataset.scene=String(chapter);panels.forEach((el,i)=>{el.classList.toggle('is-active',i===chapter);el.inert=i!==chapter;el.setAttribute('aria-hidden',String(i!==chapter));});chapters.forEach((el,i)=>{if(i===chapter)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
 }
 function request(){if(!raf&&!simple&&visible&&document.body.dataset.view==='home')raf=requestAnimationFrame(render);}
 function setMode(){const compact=innerWidth<=760&&innerHeight<500&&innerWidth>innerHeight;const next=compact||reduced.matches||PCXStore.get().settings.motion===false;if(modeInitialized&&next===simple)return;stopTour();simple=next;modeInitialized=true;play.hidden=simple;cancelAnimationFrame(raf);raf=0;track.classList.toggle('story-simple',simple);track.classList.toggle('story-animated',!simple);motion.textContent=compact?'Yatay: sade görünüm':reduced.matches?'Sistem: az hareket':simple?'Hareket kapalı':'Hareket açık';motion.setAttribute('aria-pressed',String(!simple));motion.disabled=reduced.matches||compact;lastChapter=-1;
  if(simple){frame.removeAttribute('style');panels.forEach(el=>{el.inert=false;el.removeAttribute('aria-hidden');el.classList.add('is-active');});frame.dataset.scene='0';chapters.forEach(el=>el.removeAttribute('aria-current'));}else request();
 }
 play.addEventListener('click',()=>{if(tour){stopTour();return;}if(simple)return;const start=performance.now(),begin=progress()>.97?0:progress();const absolute=scrollY+track.getBoundingClientRect().top-headerHeight(),length=track.offsetHeight-frame.offsetHeight;play.textContent='Turu durdur Ⅱ';play.setAttribute('aria-pressed','true');function tick(now){if(simple||document.hidden||document.body.dataset.view!=='home'){stopTour();return;}const p=clamp(begin+(now-start)/18000);scrollTo({top:absolute+length*p,behavior:'instant'});if(p<1)tour=requestAnimationFrame(tick);else stopTour();}tour=requestAnimationFrame(tick);});
 document.addEventListener('click',e=>{if(e.target.closest('[data-open-sheet],[data-go],[data-game]'))stopTour();});
 window.addEventListener('wheel',stopTour,{passive:true});window.addEventListener('touchstart',e=>{if(!e.target.closest('#playStory'))stopTour();},{passive:true});window.addEventListener('keydown',e=>{if(['Escape','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))stopTour();});
 motion.addEventListener('click',()=>{const top=track.getBoundingClientRect().top+scrollY;PCXStore.setSetting('motion',simple);scrollTo({top:Math.max(0,top-headerHeight()),behavior:'auto'});request();});
 chapters.forEach(b=>b.addEventListener('click',()=>jumpChapter(Number(b.dataset.chapter))));document.querySelectorAll('[data-story-next]').forEach(b=>b.addEventListener('click',()=>jumpChapter(Number(b.dataset.storyNext))));document.querySelectorAll('[data-story-hub],#skipStory').forEach(b=>b.addEventListener('click',jumpHub));
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',()=>{setMode();request();},{passive:true});window.addEventListener('pcx:view',()=>{stopTour();lastChapter=-1;visible=true;request();});window.addEventListener('pcx:state',setMode);reduced.addEventListener('change',setMode);document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTour();cancelAnimationFrame(raf);raf=0;}else request();});
 frame.addEventListener('pointermove',e=>{if(!fine.matches||simple)return;const r=frame.getBoundingClientRect();tiltX=clamp((e.clientY-r.top)/r.height)*-3+1.5;tiltY=clamp((e.clientX-r.left)/r.width)*4-2;request();},{passive:true});frame.addEventListener('pointerleave',()=>{tiltX=tiltY=0;request();});
 if('IntersectionObserver'in window){const ob=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'});ob.observe(track);}
 setMode();
});
})();
