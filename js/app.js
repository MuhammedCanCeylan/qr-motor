(function () {
  const cfg = window.PCX_CONFIG;
  const store = window.PCXStore;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  let toastTimer;
  let deferredInstallPrompt = null;

  const ACHIEVEMENTS = {
    first_scan: ['İlk Temas', 'QR/AR üzerinden ilk ziyaretini yaptın.', '📱'],
    first_game: ['İlk Oyun', 'Oyun alanında ilk turunu tamamladın.', '🎮'],
    gamer_10: ['Oyuncu', '10 oyun tamamladın.', '🔥'],
    gamer_50: ['Arcade Müdavimi', '50 oyun tamamladın.', '🕹️'],
    fast_reaction: ['Hızlı Refleks', '250 ms altına indin.', '⚡'],
    reflex_god: ['Reflex God', '200 ms altına indin.', '🏁'],
    memory_master: ['Hafıza Ustası', 'Match Club oyununu 12 hamle veya altında bitirdin.', '🧠'],
    xp_5000: ['PCX Master', '5.000 XP topladın.', '🏆'],
    daily_first: ['Günlük Görev', 'İlk günlük görevi tamamladın.', '✅'],
    ride_1000:['1000 Kulübü','City Ride’da 1000 puana ulaştın.','🏁'],
    gold_owner:['Altın Motor','9999 jetonluk hayali garajına aldın.','✦'],
    secret: ['Secret Hunter', 'Gizli modu buldun.', '🕵️']
  };

  function toast(message, ms=2200) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  function vibrate(pattern=15) {
    const s = store.get();
    if (s.settings.haptics && navigator.vibrate) navigator.vibrate(pattern);
  }

  function escapeHTML(s='') {
    return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function randomGuest() {
    const names = ['RoadGhost','NightRider','PCXPilot','CityRider','NeonScoot','UrbanFox','LaneWizard','MotoPixel'];
    return names[Math.floor(Math.random()*names.length)] + Math.floor(10 + Math.random()*90);
  }

  function applyConfig() {
    $$('[data-owner-name]').forEach(el => el.textContent = cfg.ownerName);
    $$('[data-vehicle-label]').forEach(el => el.textContent = cfg.vehicle.label);
    $$('[data-instagram-handle]').forEach(el => el.textContent = cfg.instagramHandle);
    $$('[data-version]').forEach(el => el.textContent = 'v' + cfg.version);
    document.title = `${cfg.appName} · ${cfg.vehicle.model}`;
  }

  function renderState() {
    const s = store.get();
    document.documentElement.dataset.theme = s.settings.theme;
    const nick = s.player.nickname || 'Misafir Sürücü';
    $$('[data-player-name]').forEach(el => el.textContent = nick);
    $$('[data-level]').forEach(el => el.textContent = s.player.level);
    $$('[data-xp]').forEach(el => el.textContent = s.player.xp.toLocaleString('tr-TR'));
    $$('[data-coins]').forEach(el => el.textContent = s.player.coins.toLocaleString('tr-TR'));
    $$('[data-streak]').forEach(el => el.textContent = s.player.streak);
    $$('[data-games-played]').forEach(el => el.textContent = s.stats.gamesPlayed);
    $$('[data-visits]').forEach(el => el.textContent = s.stats.visits);

    const levelStart = (s.player.level - 1) * 500;
    const pct = Math.min(100, ((s.player.xp - levelStart) / 500) * 100);
    const xpBar = $('#xpBarFill'); if (xpBar) xpBar.style.width = pct + '%';
    const xpCaption = $('#xpCaption'); if (xpCaption) xpCaption.textContent = `${s.player.xp - levelStart} / 500 XP`;

    const daily = $('#dailyProgress');
    if (daily) daily.textContent = `${Math.min(s.daily.games,3)} / 3 oyun`;
    const dailyBar = $('#dailyBarFill');
    if (dailyBar) dailyBar.style.width = Math.min(100, (s.daily.games/3)*100) + '%';
    const dailyBtn = $('#dailyClaim');
    if (dailyBtn) {
      dailyBtn.disabled = s.daily.games < 3 || s.daily.claimed;
      dailyBtn.textContent = s.daily.claimed ? 'Ödül alındı ✓' : s.daily.games >= 3 ? 'Ödülü al' : '3 oyun tamamla';
    }

    const themeBtn = $('#themeToggle'); if (themeBtn) { themeBtn.innerHTML = PCXIcon(s.settings.theme === 'dark' ? 'sun' : 'moon'); themeBtn.setAttribute('aria-label',s.settings.theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'); }
    document.querySelector('meta[name="theme-color"]').content=s.settings.theme==='dark'?'#151a17':'#f5f5f2';
    const soundToggle = $('#soundToggle'); if (soundToggle) soundToggle.checked = s.settings.sound;
    const hapticToggle = $('#hapticToggle'); if (hapticToggle) hapticToggle.checked = s.settings.haptics;

    renderAchievements();
    renderPersonalBests();
  }

  function renderAchievements() {
    const box = $('#achievementGrid'); if (!box) return;
    const s = store.get();
    box.innerHTML = Object.entries(ACHIEVEMENTS).map(([id, a]) => {
      const unlocked = !!s.achievements[id];
      return `<div class="achievement ${unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${unlocked ? a[2] : '🔒'}</div>
        <div><strong>${a[0]}</strong><span>${a[1]}</span></div>
      </div>`;
    }).join('');
  }

  function renderPersonalBests() {
    const s = store.get();
    const r = $('#bestReaction'); if (r) r.textContent = s.stats.bestReaction ? `${s.stats.bestReaction} ms` : '—';
    const l = $('#bestLane'); if (l) l.textContent = s.stats.bestLane || '—';
    const t = $('#bestTap'); if (t) t.textContent = s.stats.bestTap || '—';
    const m = $('#bestMemory'); if (m) m.textContent = s.stats.bestMemory ? `${s.stats.bestMemory} hamle` : '—';
  }

  function setView(id, push=true) {
    if(id==='lounge')id='tools';
    const exists = document.getElementById('view-' + id);
    if (!exists) id = 'home';
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + id));
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    document.body.dataset.view=id;
    window.dispatchEvent(new CustomEvent('pcx:view',{detail:id}));
    window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    $$('.nav-btn').forEach(b => {if(b.dataset.view===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    if (push && location.hash !== '#'+id) history.pushState(null, '', '#' + id);
  }

  let previousFocus = null;
  function openSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    if(!sheet.classList.contains('open')) previousFocus = document.activeElement;
    sheet.classList.add('open');
    document.body.classList.add('modal-open');
    document.querySelector('.app-shell').inert = true;
    if(id==='profileSheet') $('#nicknameInput').value=store.get().player.nickname;
    sheet.querySelector('button,input')?.focus();
  }
  function closeSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet || !sheet.classList.contains('open')) return;
    if(id==='gameSheet') window.dispatchEvent(new Event('pcx:game-close'));
    sheet.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.querySelector('.app-shell').inert = false;
    if(previousFocus?.isConnected)previousFocus.focus();else document.querySelector('.nav-btn.active')?.focus();
  }

  function whatsapp(text) {
    store.incrementContact();
    const url = `https://wa.me/${cfg.ownerPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  }

  function contactPreset(type) {
    const presets = {
      blocking: 'Merhaba, motorunuz yolu/çıkışı kapatıyor. QR/AR etiketi üzerinden ulaşıyorum.',
      fallen: 'Merhaba, motorunuz devrilmiş veya devrilmek üzere görünüyor. QR/AR etiketi üzerinden ulaşıyorum.',
      light: 'Merhaba, motorunuzun ışığı açık kalmış gibi görünüyor. QR/AR etiketi üzerinden ulaşıyorum.',
      damage: 'Merhaba, motorunuzda bir hasar fark ettim. QR/AR etiketi üzerinden ulaşıyorum.',
      key: 'Merhaba, motorunuzun anahtarı/kişisel bir eşyanız üzerinde unutulmuş olabilir. QR/AR etiketi üzerinden ulaşıyorum.',
      other: 'Merhaba, Honda PCX motorunuzla ilgili QR/AR etiketi üzerinden ulaşıyorum.'
    };
    whatsapp(presets[type] || presets.other);
  }

  async function shareApp() {
    const data = { title: cfg.appName, text: `${cfg.vehicle.label} dijital garajı`, url: location.href.split('#')[0] };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(data.url);
      toast('🔗 Link kopyalandı');
    } catch (e) { if (e.name !== 'AbortError') toast('Paylaşım açılamadı'); }
  }

  function sendLocation() {
    if (!navigator.geolocation) return whatsapp('Merhaba, motorunuzla ilgili acil bir durum var fakat konumumu otomatik paylaşamıyorum.');
    toast('📍 Konum izni bekleniyor...');
    const button=$('#sendLocation');button.disabled=true;
    navigator.geolocation.getCurrentPosition(pos => {
      const {latitude, longitude} = pos.coords;
      const message=`Merhaba, motorunuzla ilgili ulaşıyorum. Bulunduğum konum: https://www.google.com/maps?q=${latitude},${longitude}`;
      const link=document.createElement('a');link.className='location-ready secondary';link.textContent='Konumumu WhatsApp ile gönder ↗';link.href=`https://wa.me/${cfg.ownerPhone}?text=${encodeURIComponent(message)}`;link.target='_blank';link.rel='noopener';link.onclick=()=>{store.incrementContact();link.remove();};
      $('#contactSheet .location-ready')?.remove();$('#contactSheet .contact-primary').after(link);button.disabled=false;toast('Konum hazır. Göndermek için yeni bağlantıya dokun.');
    }, () => {button.disabled=false;toast('Konum alınamadı. WhatsApp üzerinden yazabilirsin.');}, {enableHighAccuracy:true, timeout:8000});
  }

  function playTone(type) {
    if (!store.get().settings.sound) return toast('Ses ayarlardan kapalı.');
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, now);
      if (type === 'horn') {
        osc.type='square'; osc.frequency.setValueAtTime(430,now); osc.frequency.setValueAtTime(520,now+.12);
        gain.gain.exponentialRampToValueAtTime(.18,now+.02); gain.gain.exponentialRampToValueAtTime(.0001,now+.48);
      } else if (type === 'rev') {
        osc.type='sawtooth'; osc.frequency.setValueAtTime(55,now); osc.frequency.exponentialRampToValueAtTime(520,now+.65);
        gain.gain.exponentialRampToValueAtTime(.16,now+.02); gain.gain.exponentialRampToValueAtTime(.0001,now+.9);
      } else {
        osc.type='sawtooth'; osc.frequency.setValueAtTime(48,now); osc.frequency.linearRampToValueAtTime(70,now+.7);
        gain.gain.exponentialRampToValueAtTime(.08,now+.02); gain.gain.exponentialRampToValueAtTime(.0001,now+.8);
      }
      osc.onended=()=>ctx.close(); osc.start(now); osc.stop(now+1);
      vibrate(type === 'horn' ? [20,30,20] : [25,20,45]);
    } catch (_) { toast('Bu tarayıcı ses efektini başlatamadı.'); }
  }

  function updateClock() {
    const d = new Date();
    const el = $('#liveClock'); if (el) el.textContent = d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    const date = $('#liveDate'); if (date) date.textContent = d.toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});
  }

  function registerSW() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
    }
  }

  function initInstall() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault(); deferredInstallPrompt = e;
      const b = $('#installBtn'); if (b) b.hidden = false;
    });
    $('#installBtn')?.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return toast('Tarayıcının “Ana ekrana ekle” menüsünü kullanabilirsin.');
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      $('#installBtn').hidden = true;
    });
  }

  function bindUI() {
    $$('.nav-btn,[data-go]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view || btn.dataset.go)));
    $$('[data-open-sheet]').forEach(btn => btn.addEventListener('click', () => openSheet(btn.dataset.openSheet)));
    $$('[data-close-sheet]').forEach(btn => btn.addEventListener('click', () => closeSheet(btn.dataset.closeSheet)));
    $$('.sheet-backdrop').forEach(x => x.addEventListener('click', e => { if (e.target === x) closeSheet(x.id); }));
    $$('[data-contact]').forEach(btn => btn.addEventListener('click', () => contactPreset(btn.dataset.contact)));
    $('#directCall')?.addEventListener('click', () => { store.incrementContact(); location.href = `tel:+${cfg.ownerPhone}`; });
    $('#directWhatsApp')?.addEventListener('click', () => contactPreset('other'));
    $('#shareBtn')?.addEventListener('click', shareApp);
    $('#sendLocation')?.addEventListener('click', sendLocation);
    $('#instagramBtn')?.addEventListener('click', () => window.open(cfg.instagramUrl,'_blank','noopener'));
    $('#dailyClaim')?.addEventListener('click', () => {
      if (store.claimDaily()) { toast('🎁 +250 XP ve +100 coin!'); confetti(); } else toast('Önce 3 oyun tamamla.');
    });
    $('#saveNickname')?.addEventListener('click', () => {
      const name = $('#nicknameInput').value.trim();
      if (!name) return toast('Bir nickname yaz.');
      store.setNickname(name); closeSheet('profileSheet'); toast('Profil kaydedildi ✓');
    });
    $('#randomNickname')?.addEventListener('click', () => $('#nicknameInput').value = randomGuest());
    $('#themeToggle')?.addEventListener('click', () => {
      const s=store.get(); store.setSetting('theme', s.settings.theme==='dark'?'light':'dark');
    });
    $('#soundToggle')?.addEventListener('change', e => store.setSetting('sound', e.target.checked));
    $('#hapticToggle')?.addEventListener('change', e => store.setSetting('haptics', e.target.checked));
    $$('[data-sound]').forEach(b => b.addEventListener('click',()=>playTone(b.dataset.sound)));
    $('#secretBadge')?.addEventListener('click', (()=>{ let taps=0,timer; return ()=>{ taps++; clearTimeout(timer); timer=setTimeout(()=>taps=0,1200); if(taps>=7){ if(store.unlock('secret')) {store.addRewards(300,150); toast('Gizli rozet açıldı! +300 XP'); confetti();} else toast('Bu gizli rozeti zaten kazandın.'); taps=0; } };})());
    $('#copyPhone')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(cfg.ownerPhoneDisplay); toast('📋 Numara kopyalandı'); } catch(_){toast('Kopyalanamadı: '+cfg.ownerPhoneDisplay,5000);} });
  }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for(let i=0;i<28;i++) {
      const d=document.createElement('i'); d.className='confetti'; d.style.left=Math.random()*100+'vw'; d.style.setProperty('--drift',(Math.random()-.5)*140+'px'); d.style.animationDuration=(1.5+Math.random()*1.2)+'s'; document.body.appendChild(d); setTimeout(()=>d.remove(),3000);
    }
  }

  window.PCXApp = { toast, vibrate, openSheet, closeSheet, setView, confetti, renderState };

  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    store.touchVisit();
    renderState();
    bindUI();
    $$('.sheet-backdrop').forEach((el,i)=>{el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');const title=el.querySelector('h2');title.id ||= 'dialog-title-'+i;el.setAttribute('aria-labelledby',title.id);el.querySelector('.sheet-head>button')?.setAttribute('aria-label','Kapat');});
    $('#randomNickname').setAttribute('aria-label','Rastgele oyuncu adı oluştur');
    document.addEventListener('keydown',e=>{
      const dialog=$('.sheet-backdrop.open'); if(!dialog)return;
      if(e.key==='Escape'){e.preventDefault();closeSheet(dialog.id);}
      if(e.key==='Tab'){
        const all=$$('button:not(:disabled),input:not([hidden]),a[href],[tabindex="0"]',dialog).filter(el=>el.getClientRects().length);
        const first=all[0],last=all[all.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
    });
    $('#exportData').onclick=()=>{
      const blob=new Blob([JSON.stringify({app:'pcx-hub',version:8,state:store.get()},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pcx-hub-yedek.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Profil yedeği indirildi.');
    };
    $('#importData').onclick=()=>$('#backupFile').click();
    $('#backupFile').onchange=async e=>{
      const file=e.target.files[0];if(!file)return;
      try{if(file.size>1024*1024)throw Error('Dosya çok büyük.');const data=JSON.parse(await file.text());store.restore(data);$('#nicknameInput').value=store.get().player.nickname;toast('Profil yedeği yüklendi.');}catch(err){toast(err.message||'Geçerli bir PCX Hub yedeği seç.',4000);}finally{e.target.value='';}
    };
    window.addEventListener('pcx:storage-error',()=>toast('Tarayıcı kaydetmeye izin vermiyor. Çıkmadan önce yedek indir.',6000));
    if(store.storageFailed()) toast('Veriler kalıcı kaydedilemiyor. Çıkmadan önce yedek indir.',6000);
    registerSW();
    initInstall();
    updateClock(); setInterval(updateClock,30000);
    window.addEventListener('popstate',()=>setView(location.hash.slice(1)||'home',false));
    window.addEventListener('hashchange',()=>setView(location.hash.slice(1)||'home',false));
    const initial = location.hash.replace('#','') || 'home'; setView(initial,false);
    window.addEventListener('pcx:state', renderState);
  });
})();
