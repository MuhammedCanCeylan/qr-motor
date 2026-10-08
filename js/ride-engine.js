/* Deterministic simulation, shared by the canvas renderer and regression tests. */
(function(){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lanes=[100,180,260];
function create(random=Math.random){
 const s={time:0,distance:0,score:0,speed:190,level:1,target:1,x:180,lives:3,objects:[],spawn:.8,coins:0,bonus:0,combo:0,energy:100,boost:0,shield:0,invulnerable:0,magnet:0,oil:0,over:false,milestone:false,events:[],nextId:0};
 function event(text){s.events.push(text);}
 function steer(direction){if(!s.over)s.target=clamp(s.target+direction,0,2);}
 function boost(){if(s.over||s.boost>0||s.energy<100)return false;s.energy=0;s.boost=2.6;event('NİTRO · Puan akışı hızlandı!');return true;}
 function spawn(){const safe=Math.floor(random()*3),blocked=[0,1,2].filter(n=>n!==safe),double=s.level>=3&&random()<.35,obstacles=double?blocked:[blocked[Math.floor(random()*2)]];
  for(const lane of obstacles){const r=random(),kind=r<.15?'oil':r<.4?'cone':'car';s.objects.push({id:s.nextId++,lane,y:-65,kind,color:['#d6a174','#8fa7b0','#b1bd94'][Math.floor(random()*3)],used:false,passed:false});}
  const r=random(),kind=r<.08?'shield':r<.16?'magnet':r<.23?'charge':'coin';s.objects.push({id:s.nextId++,lane:safe,y:-100,kind,used:false});
 }
 function update(dt){if(s.over)return;s.time+=dt;s.level=1+Math.floor(s.time/18);s.speed=(190+245*(1-Math.exp(-s.time/70)))*(s.boost>0?1.42:1);s.distance+=s.speed*dt;
  for(const k of ['boost','shield','invulnerable','magnet','oil'])s[k]=Math.max(0,s[k]-dt);if(!s.boost)s.energy=Math.min(100,s.energy+dt*8);
  s.x+=(lanes[s.target]-s.x)*Math.min(1,dt*(s.oil>0?7:18));s.spawn-=dt;
  if(s.spawn<=0){spawn();s.spawn=Math.max(.9,1.5-s.level*.065);}
  for(const o of s.objects){o.y+=s.speed*dt;const dx=Math.abs(lanes[o.lane]-s.x),dy=Math.abs(o.y-365),hazard=['car','cone','oil'].includes(o.kind);
   if(o.used)continue;
   if(o.kind==='coin'&&s.magnet>0&&dy<110){o.used=true;s.coins++;continue;}
   if(dx<(hazard?32:29)&&dy<(o.kind==='car'?51:29)){
    if(o.kind==='coin'){s.coins++;s.combo++;o.used=true;}
    else if(o.kind==='shield'){s.shield=7;o.used=true;event('KALKAN · 7 saniye koruma');}
    else if(o.kind==='magnet'){s.magnet=7;o.used=true;event('MIKNATIS · Jetonlar sana geliyor');}
    else if(o.kind==='charge'){s.energy=100;o.used=true;event('NİTRO DOLDU · Hazır olduğunda bas');}
    else if(s.shield>0||s.invulnerable>0){o.used=true;}
    else if(o.kind==='oil'){s.oil=2;s.combo=0;o.used=true;event('YAĞ LEKESİ · Direksiyon biraz ağırlaştı');}
    else {s.lives--;s.invulnerable=1.6;s.combo=0;o.used=true;event(s.lives?'Ufak bir çizik. Devam!':'Motor: Ben burada ineyim.');if(!s.lives)s.over=true;}
   }
   if(hazard&&!o.used&&!o.passed&&o.y>419){o.passed=true;if(dx>33&&dx<64){s.bonus+=20;event('KIL PAYI · +20 puan');}}
  }
  s.objects=s.objects.filter(o=>!o.used&&o.y<530);s.score=Math.floor(s.distance/16)+s.coins*20+s.bonus;
  if(s.score>=1000&&!s.milestone){s.milestone=true;event('1000! QR’a bakacaktın. Yarışçı oldun.');}
 }
 return {state:s,steer,boost,update,resume(){s.invulnerable=Math.max(s.invulnerable,1.2);},takeEvents(){return s.events.splice(0);}};
}
window.PCXRideEngine={create};
})();
