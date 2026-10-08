(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let current=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rounded(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function open(id){
 const meta=PCXArcade.games[id];if(!meta)return;
 if(current)current.destroy();
 $('#toast')?.classList.remove('show');$$('.confetti').forEach(el=>el.remove());
 const knownSecrets=new Set(Object.keys(PCXStore.get().achievements));
 PCXStore.setLastGame(id);
 $('#gameTitle').textContent=meta.name;
 $('#gameStage').innerHTML=`<div class="game-toolbar"><span id="gameStatus">Hazır olduğunda başla</span><button id="pauseGame" class="secondary" aria-label="Oyunu duraklat" disabled>Duraklat</button></div><div class="game-playarea" id="playArea"></div><div class="game-overlay" id="gameOverlay"><div class="game-overlay-card"><span class="kicker">${meta.tag}</span><h3>${meta.name}</h3><p>${meta.how}</p><button class="primary" id="startGame">${id==='merge'&&PCXStore.get().arcade.puzzle.cells?'Kaldığım yerden devam':'Oyuna başla'} →</button><small>Duraklat: P · Çıkış: Esc</small></div></div>`;
 const controller=new AbortController();let raf=0,last=performance.now(),started=false,paused=false,done=false,alive=true,game;
 const ctx={
  id,body:$('#playArea'),time:0,
  get active(){return alive&&started&&!paused&&!done},
  get done(){return done},
  on(el,event,fn,opts={}){el.addEventListener(event,fn,{...opts,signal:controller.signal});},
  action(el,fn){this.on(el,'click',e=>{if(this.active)fn(e)});},
  status(text){$('#gameStatus').textContent=text},
  finish(score,extra={}){
   if(done||!alive)return;done=true;$('#pauseGame').disabled=true;
   const before=PCXArcade.best(id),value=(id==='reaction'?extra.ms:id==='memory'?extra.moves:score);
   PCXStore.recordGame(id,score,extra);
   const xp=score>0?clamp(Math.round(40+score*.25),40,300):0,coins=score>0?clamp(Math.round(15+score*.08),15,100):0;PCXStore.addRewards(xp,coins);
   const found=Object.entries(PCXStore.SECRETS).filter(([key])=>PCXStore.get().achievements[key]&&!knownSecrets.has(key)).map(([,e])=>e.name);
   const bonus=PCXStore.dailyBonus(id,score),record=!before||(['reaction','memory'].includes(id)?value<before:value>before);
   $('#gameOverlay').hidden=false;$('#gameOverlay').innerHTML=`<div class="game-overlay-card result-card"><span class="kicker">${record?'YENİ KİŞİSEL REKOR':'TUR TAMAMLANDI'}</span><h3>${value} <small>${meta.unit}</small></h3><p>+${xp} XP · +${coins} jeton${bonus?'<br>Günün bonusu: +150 XP · +60 jeton':''}</p>${found.length?'<p class="result-discovery">✦ Yeni keşif: '+found.join(' · ')+'</p>':''}<div class="result-actions"><button class="primary" id="replayGame">Tekrar oyna</button><button class="secondary" id="shareScore">Skoru paylaş</button><button class="text-btn" id="backArcade">Oyunlara dön</button></div></div>`;
   $('#replayGame').onclick=()=>open(id);$('#backArcade').onclick=()=>PCXApp.closeSheet('gameSheet');
   $('#shareScore').onclick=async()=>{const text=`PCX Hub · ${meta.name}: ${value} ${meta.unit}. Senin rekorun kaç?`,url=location.protocol.startsWith('http')?location.href.split('#')[0]+'#games':undefined;try{if(navigator.share)await navigator.share({title:'PCX Hub',text,...(url?{url}:{})});else if(navigator.clipboard){await navigator.clipboard.writeText(text+(url?' '+url:''));PCXApp.toast('Skor metni kopyalandı.');}else PCXApp.toast(text,5000);}catch(e){if(e.name!=='AbortError')PCXApp.toast('Paylaşılamadı. Rekorun profilinde kayıtlı.');}};
   $('#replayGame').focus();if(record)PCXApp.confetti();
  },
  pause(){if(!started||done||paused)return;paused=true;game.pause?.();$('#pauseGame').disabled=true;$('#gameOverlay').hidden=false;$('#gameOverlay').innerHTML='<div class="game-overlay-card"><span class="kicker">KÜÇÜK BİR MOLA</span><h3>Oyun duraklatıldı.</h3><p>Hazır olunca kaldığın yerden devam et.</p><button class="primary" id="resumeGame">Devam et →</button></div>';$('#resumeGame').onclick=()=>{paused=false;last=performance.now();game.resume?.();$('#gameOverlay').hidden=true;$('#pauseGame').disabled=false;ctx.body.tabIndex=-1;ctx.body.focus();};},
  destroy(){alive=false;cancelAnimationFrame(raf);controller.abort();game?.destroy?.();},
  canvas(width,height){const c=$('canvas',this.body),dpr=Math.min(2,window.devicePixelRatio||1);c.width=width*dpr;c.height=height*dpr;const c2=c.getContext('2d');c2.scale(dpr,dpr);return c2;}
 };
 current=ctx;game=builders[id](ctx);
 ctx.on($('#startGame'),'click',()=>{started=true;ctx.status('Oyun başladı');$('#gameOverlay').hidden=true;$('#pauseGame').disabled=false;game.start?.();ctx.body.tabIndex=-1;ctx.body.focus();last=performance.now();});
 ctx.on($('#pauseGame'),'click',()=>ctx.pause());
 ctx.on(document,'keydown',e=>{if(!$('#gameSheet').classList.contains('open'))return;if(e.key.toLowerCase()==='p'&&ctx.active){e.preventDefault();ctx.pause();return;}if(!ctx.active||e.repeat)return;if(e.target.closest?.('button')&&!ctx.body.contains(e.target))return;game.key?.(e);});
 function frame(t){if(!alive)return;const elapsed=(t-last)/1000,dt=Math.min(.05,elapsed);last=t;if(ctx.active){ctx.time+=dt;game.update?.(['tap','reaction','signal','memory','helmet'].includes(id)?elapsed:dt);game.draw?.();}raf=requestAnimationFrame(frame);}
 PCXApp.openSheet('gameSheet');game.draw?.();raf=requestAnimationFrame(frame);
}
function mergeLine(row){let a=row.filter(Boolean),out=[],gain=0;for(let i=0;i<a.length;i++){if(a[i]===a[i+1]){out.push(a[i]*2);gain+=a[i]*2;i++;}else out.push(a[i]);}while(out.length<4)out.push(0);return {line:out,gain};}
function moveBoard(board,dir){const result=board.slice();let gain=0;for(let i=0;i<4;i++){const ids=Array.from({length:4},(_,j)=>dir==='left'?i*4+j:dir==='right'?i*4+3-j:dir==='up'?j*4+i:(3-j)*4+i);const r=mergeLine(ids.map(k=>board[k]));gain+=r.gain;ids.forEach((k,j)=>result[k]=r.line[j]);}return {board:result,gain,changed:result.some((v,i)=>v!==board[i])};}
function merge(g){
 g.body.innerHTML='<div class="merge-hud"><span>PUAN <b id="mergeScore">0</b></span><span>HAMLE <b id="mergeMoves">0</b></span></div><div id="mergeBoard" class="merge-board" role="group" aria-label="2048 oyun tahtası"></div><div class="puzzle-actions"><button id="undoMerge" class="secondary" disabled>Geri al</button><button id="finishMerge" class="secondary" disabled>Turu bitir</button></div><div class="arrow-pad" aria-label="Yön kontrolleri"><button data-dir="up" aria-label="Yukarı">↑</button><button data-dir="left" aria-label="Sol">←</button><button data-dir="down" aria-label="Aşağı">↓</button><button data-dir="right" aria-label="Sağ">→</button></div>';
 let board=Array(16).fill(0),score=0,moves=0,undo=null;
 const saved=PCXStore.get().arcade.puzzle;try{const a=JSON.parse(saved.cells);if(Array.isArray(a)&&a.length===16&&a.every(v=>Number.isInteger(v)&&v>=0&&v<=2048&&(v===0||(v&(v-1))===0))){board=a;score=saved.score;moves=saved.moves;}}catch(_){}
 function spawn(){const empty=board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);if(empty.length)board[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4;}
 if(!board.some(Boolean)){spawn();spawn();}
 function render(){const box=$('#mergeBoard');box.innerHTML=board.map(v=>`<div class="number-tile n${v}" aria-label="${v||'boş'}">${v||''}</div>`).join('');$('#mergeScore').textContent=score;$('#mergeMoves').textContent=moves;$('#undoMerge').disabled=!undo;$('#finishMerge').disabled=moves<5;g.status('Acele yok · İlerlemen otomatik kaydediliyor');}
 function persist(){PCXStore.savePuzzle({cells:JSON.stringify(board),score,moves});}
 function finish(){PCXStore.savePuzzle({cells:'',score:0,moves:0});g.finish(score);}
 function move(dir){const r=moveBoard(board,dir);if(!r.changed)return;undo={board:board.slice(),score,moves};board=r.board;score+=r.gain;moves++;spawn();render();persist();if(board.includes(2048)||!['left','right','up','down'].some(d=>moveBoard(board,d).changed))finish();}
 g.action($('#undoMerge'),()=>{if(!undo)return;({board,score,moves}=undo);undo=null;render();persist();});g.action($('#finishMerge'),()=>{if(moves>=5)finish();});$$('[data-dir]',g.body).forEach(b=>g.action(b,()=>move(b.dataset.dir)));
 let start=null;const box=$('#mergeBoard');g.on(box,'pointerdown',e=>{if(!g.active)return;start={x:e.clientX,y:e.clientY};box.setPointerCapture(e.pointerId);});g.on(box,'pointerup',e=>{if(!start||!g.active)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});g.on(box,'pointercancel',()=>start=null);
 render();return {pause(){start=null;},key(e){const dir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(dir){e.preventDefault();move(dir);}},start(){persist();}};
}
function stack(g){
 g.body.innerHTML='<div class="stack-hud"><span>KAT <b id="stackScore">0</b></span><span id="stackHint">Tam ortasına bırak.</span></div><canvas class="stack-canvas" aria-label="Sky Stack blok yerleştirme alanı"></canvas><button class="game-primary" id="dropStack">YERLEŞTİR</button>';
 const canvas=$('canvas',g.body),x=g.canvas(360,400);let blocks=[{x:65,w:230}],moving={x:15,w:230},dir=1,count=0,perfect=0;
 const colors=['#91b094','#bbcba6','#e1bc83','#d79f76','#8faab2'];
 function drop(){const top=blocks[blocks.length-1],delta=moving.x-top.x;let left=Math.max(top.x,moving.x),right=Math.min(top.x+top.w,moving.x+moving.w);if(Math.abs(delta)<7){left=top.x;right=top.x+top.w;perfect++;$('#stackHint').textContent='Kusursuz! ×'+perfect;PCXApp.vibrate(12);}else{perfect=0;$('#stackHint').textContent='Bir kat daha. Devam!';}if(right-left<4){g.finish(count);return;}blocks.push({x:left,w:right-left});count++;$('#stackScore').textContent=count;moving={x:count%2?0:360-(right-left),w:right-left};dir=count%2?1:-1;g.status('Kat '+count+' · Tek dokunuş');}
 g.action($('#dropStack'),drop);g.on(canvas,'pointerdown',e=>{if(g.active){e.preventDefault();drop();}});
 return {key(e){if(e.code==='Space'){e.preventDefault();drop();}},update(dt){moving.x+=dir*(100+Math.min(170,count*8))*dt;if(moving.x<0){moving.x=0;dir=1;}if(moving.x+moving.w>360){moving.x=360-moving.w;dir=-1;}},draw(){x.fillStyle='#e8ede2';x.fillRect(0,0,360,400);x.fillStyle='#cfdbcd';for(let i=0;i<6;i++)x.fillRect(i*70-15,290-(i%3)*24,50,120);const first=Math.max(0,blocks.length-10);blocks.slice(first).forEach((b,j)=>{const y=365-j*26;rounded(x,b.x+4,y+4,b.w,24,4,'#233a2922');rounded(x,b.x,y,b.w,24,4,colors[(j+first)%colors.length]);});const y=365-Math.min(blocks.length,10)*26;rounded(x,moving.x,y,moving.w,24,4,'#d96d43');x.strokeStyle='#43583b44';x.setLineDash([4,5]);x.strokeRect(blocks[blocks.length-1].x,y,blocks[blocks.length-1].w,24);x.setLineDash([]);}};
}
function signal(g){
 g.body.innerHTML='<div class="signal-info"><span class="kicker">TAMAMLANAN TUR</span><strong id="signalRound">0</strong><p id="signalPrompt">Önce izle, sonra tekrar et.</p></div><div class="signal-board">'+[1,2,3,4].map(n=>`<button data-signal="${n-1}" aria-label="Işık ${n}">${n}</button>`).join('')+'</div>';
 let seq=[],round=0,index=0,phase='show',clock=0,flash=-1;
 function next(){seq.push(Math.floor(Math.random()*4));index=0;phase='show';clock=0;$('#signalPrompt').textContent='İzle ve sırayı hatırla.';}
 function light(i){$$('[data-signal]',g.body).forEach((b,k)=>b.classList.toggle('lit',k===i));}
 function press(n){if(phase!=='input')return;light(n);flash=.18;if(n!==seq[index]){g.finish(round);return;}index++;if(index===seq.length){round++;$('#signalRound').textContent=round;phase='between';clock=0;light(-1);$('#signalPrompt').textContent='Doğru! Bir ışık daha geliyor.';PCXApp.vibrate(12);}}
 $$('[data-signal]',g.body).forEach(b=>g.action(b,()=>press(Number(b.dataset.signal))));
 return {start:next,key(e){if(/^[1-4]$/.test(e.key)){e.preventDefault();press(Number(e.key)-1);}},resume(){if(phase==='show'){clock=0;light(-1);}},update(dt){clock+=dt;if(phase==='show'){const step=Math.floor(Math.max(0,clock-.5)/.75);if(clock<.5)light(-1);else if(step<seq.length)light((clock-.5)%.75<.48?seq[step]:-1);else{phase='input';light(-1);$('#signalPrompt').textContent='Şimdi sen. Aynı sıraya dokun.';}}else if(phase==='between'&&clock>.8)next();else if(phase==='input'&&flash>0){flash-=dt;if(flash<=0)light(-1);}g.status(phase==='input'?'Sıra sende':'Işıkları izle');}};
}
function reaction(g){
 g.body.innerHTML='<button class="reaction-pad" id="reactionPad"><span class="reaction-dot"></span><strong id="reactionText">Yeşili bekle.</strong><small id="reactionNote">Alan yeşil olunca dokun.</small></button>';
 let wait=1.3+Math.random()*2.5,elapsed=0,green=false,go=0;const pad=$('#reactionPad');
 function press(){if(!green){elapsed=0;wait=1.5+Math.random()*2;$('#reactionText').textContent='Erken! Yeniden bekle.';return;}const ms=Math.max(1,Math.round(performance.now()-go));g.finish(Math.max(1,1000-ms),{ms});}
 g.action(pad,press);return {key(e){if(e.code==='Space'){e.preventDefault();press();}},pause(){green=false;elapsed=0;pad.classList.remove('green');$('#reactionText').textContent='Yeşili bekle.';},update(dt){elapsed+=dt;if(!green&&elapsed>=wait){green=true;go=performance.now();pad.classList.add('green');$('#reactionText').textContent='ŞİMDİ!';$('#reactionNote').textContent='Dokun';PCXApp.vibrate(10);}}};
}
function tap(g){
 g.body.innerHTML='<div class="tap-meter"><div><small>KALAN SÜRE</small><strong id="tapTime">10.0</strong></div><div><small>DOKUNUŞ</small><strong id="tapCount">0</strong></div></div><button class="rush-pad" id="tapPad">DOKUN<span>İlk dokunuşta süre başlar.</span></button>';
 let count=0,left=10;function press(){if(left<=0)return;count++;$('#tapCount').textContent=count;if(count%10===0)PCXApp.vibrate(8);}
 g.action($('#tapPad'),press);return {key(e){if(e.code==='Space'){e.preventDefault();press();}},update(dt){if(!count)return;left=Math.max(0,left-dt);$('#tapTime').textContent=left.toFixed(1);if(left===0)g.finish(count);}};
}
function memory(g){
 const symbols=['home','game','garage','spark','flag','bolt'],cards=[...symbols,...symbols];for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 g.body.innerHTML='<div class="memory-head"><span>HAMLE <b id="memoryMoves">0</b></span><span>ÇİFT <b id="memoryPairs">0</b>/6</span></div><div class="match-board">'+cards.map((v,i)=>`<button class="match-card" data-card="${i}" aria-label="Kapalı kart ${i+1}"><span>?</span></button>`).join('')+'</div>';
 let first=-1,second=-1,wait=0,moves=0,pairs=0,matched=new Set();const buttons=$$('.match-card',g.body);
 function reveal(i){buttons[i].classList.add('flipped');buttons[i].innerHTML=PCXIcon(cards[i]);buttons[i].setAttribute('aria-label',cards[i]);}
 buttons.forEach((b,i)=>g.action(b,()=>{if(wait>0||matched.has(i)||i===first)return;reveal(i);if(first<0){first=i;return;}moves++;$('#memoryMoves').textContent=moves;if(cards[first]===cards[i]){matched.add(first);matched.add(i);[first,i].forEach(k=>{buttons[k].classList.add('matched');buttons[k].disabled=true;});first=-1;pairs++;$('#memoryPairs').textContent=pairs;if(pairs===6)g.finish(Math.max(1,60-moves),{moves});}else{second=i;wait=.7;}}));
 return {update(dt){if(wait<=0)return;wait-=dt;if(wait<=0){[first,second].forEach(i=>{buttons[i].classList.remove('flipped');buttons[i].innerHTML='<span>?</span>';buttons[i].setAttribute('aria-label','Kapalı kart '+(i+1));});first=second=-1;}}};
}
const builders={ride:window.PCXCityRide,merge,stack,signal,reaction,tap,memory,...window.PCXExtraGames};
document.addEventListener('DOMContentLoaded',()=>{
 document.addEventListener('click',e=>{const b=e.target.closest('[data-game]');if(b)open(b.dataset.game);});
 window.addEventListener('pcx:game-close',()=>{current?.destroy();current=null;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)current?.pause();});
 let viewportWidth=innerWidth;window.addEventListener('resize',()=>{if(Math.abs(innerWidth-viewportWidth)>60)current?.pause();viewportWidth=innerWidth;});
 $('#closeGame').onclick=()=>PCXApp.closeSheet('gameSheet');
});
window.PCXArcadeLogic={mergeLine,moveBoard};
})();
