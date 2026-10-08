(function () {
  const KEY = 'pcxHubV2State';
  const defaultState = {
    player: {
      id: null,
      nickname: '',
      xp: 0,
      coins: 0,
      level: 1,
      streak: 1,
      lastVisit: null,
      createdAt: null
    },
    settings: { theme: 'light', motion:true, sound: true, haptics: true },
    stats: {
      visits: 0,
      gamesPlayed: 0,
      totalScore: 0,
      bestReaction: null,
      bestLane: 0,
      bestTap: 0,
      bestMemory: null,
      contactsOpened: 0
    },
    arcade: {favorites:{ride:false,merge:false,stack:false,signal:false,reaction:false,tap:false,memory:false,snake:false,breaker:false,helmet:false,lights:false},paint:'sage',owned:{sage:true,orange:false,blue:false,plum:false,gold:false},lastGame:'',bonusDate:'',bestRide:0,bestMerge:0,bestStack:0,bestSignal:0,bestSnake:0,bestBreaker:0,bestHelmet:0,bestLights:0,puzzle:{cells:'',score:0,moves:0}},
    personal:{parking:{lat:null,lng:null,accuracy:null,savedAt:'',label:''},notes:[]},
    progress:{plays:{ride:0,merge:0,stack:0,signal:0,reaction:0,tap:0,memory:0,snake:0,breaker:0,helmet:0,lights:0},history:[],missions:{date:'',kinds:{ride:false,merge:false,stack:false,signal:false,reaction:false,tap:false,memory:false,snake:false,breaker:false,helmet:false,lights:false},rounds:0,exploreClaimed:false,scoreClaimed:false}},
    achievements: {},
    daily: { date: null, games: 0, claimed: false }
  };

  function uid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'pcx-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function mergeDeep(base, saved) {
    const out = JSON.parse(JSON.stringify(base));
    if(!saved || typeof saved!=='object' || Array.isArray(saved))return out;
    Object.keys(base).forEach(key=>{
      const v=saved[key], b=base[key];
      if(key==='notes'){out[key]=Array.isArray(v)?v.filter(n=>n&&typeof n.id==='string'&&typeof n.text==='string').slice(0,50).map(n=>({id:n.id.slice(0,80),text:n.text.slice(0,600),kind:['ride','idea','general'].includes(n.kind)?n.kind:'general',date:typeof n.date==='string'?n.date.slice(0,40):''})):[];}
      else if(key==='history'){out[key]=Array.isArray(v)?v.filter(h=>h&&['ride','merge','stack','signal','reaction','tap','memory','snake','breaker','helmet','lights'].includes(h.game)&&Number.isFinite(h.value)&&h.value>=0).slice(0,30).map(h=>({game:h.game,value:h.value,date:typeof h.date==='string'?h.date.slice(0,40):''})):[];}
      else if(key==='achievements') {out[key]={};if(v&&typeof v==='object')Object.entries(v).forEach(([id,date])=>{if(/^[a-z0-9_]+$/.test(id)&&typeof date==='string')out[key][id]=date;});}
      else if(b&&typeof b==='object')out[key]=mergeDeep(b,v);
      else if(typeof b==='number' && Number.isFinite(v)&&v>=0)out[key]=Math.min(v,1e12);
      else if(typeof b==='string' && typeof v==='string')out[key]=v.slice(0,200);
      else if(typeof b==='boolean' && typeof v==='boolean')out[key]=v;
      else if(b===null && (v===null||typeof v==='string'||(typeof v==='number'&&Number.isFinite(v)&&(v>=0||key==='lat'||key==='lng'))))out[key]=v;
    });
    return out;
  }
  function load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) {}
    const state = mergeDeep(defaultState, saved);
    if (!state.player.id) state.player.id = uid();
    if (!state.player.createdAt) state.player.createdAt = new Date().toISOString();
    return state;
  }

  const state = load();
  let storageError=false;
  function normalize(){state.settings.theme=state.settings.theme==='dark'?'dark':'light';state.player.nickname=String(state.player.nickname).slice(0,18);if(!['sage','orange','blue','plum','gold'].includes(state.arcade.paint)||!state.arcade.owned[state.arcade.paint])state.arcade.paint='sage';state.arcade.owned.sage=true;const p=state.personal.parking;if(p.lat!==null&&(!Number.isFinite(p.lat)||p.lat<-90||p.lat>90||!Number.isFinite(p.lng)||p.lng<-180||p.lng>180)){p.lat=null;p.lng=null;}recalcLevel();}
  normalize();

  function recalcLevel() {
    state.player.level = Math.max(1, Math.floor(state.player.xp / 500) + 1);
  }

  function save() {
    recalcLevel();
    if(state.player.xp>=5000)unlock('xp_5000');
    try{localStorage.setItem(KEY, JSON.stringify(state));storageError=false;}catch(_){storageError=true;window.dispatchEvent(new Event('pcx:storage-error'));}
    window.dispatchEvent(new CustomEvent('pcx:state', { detail: get() }));
  }

  function get() { return JSON.parse(JSON.stringify(state)); }

  function todayKey() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  }

  function touchVisit() {
    const today = todayKey();
    state.stats.visits += 1;
    if (state.player.lastVisit && state.player.lastVisit !== today) {
      const prev = new Date(state.player.lastVisit + 'T12:00:00');
      const cur = new Date(today + 'T12:00:00');
      const diff = Math.round((cur - prev) / 86400000);
      state.player.streak = diff === 1 ? state.player.streak + 1 : 1;
    }
    state.player.lastVisit = today;
    if (state.daily.date !== today) state.daily = { date: today, games: 0, claimed: false };
    unlock('first_scan');
    save();
  }

  function addRewards(xp, coins) {
    state.player.xp += xp || 0;
    state.player.coins += coins || 0;
    if (state.player.xp >= 5000) unlock('xp_5000');
    save();
  }

  function unlock(id) {
    if (!state.achievements[id]) {
      state.achievements[id] = new Date().toISOString();
      return true;
    }
    return false;
  }

  function recordGame(type, score, extra) {
    resetDaily();
    resetMissions();
    if(type in state.progress.plays){state.progress.plays[type]++;state.progress.missions.kinds[type]=true;state.progress.missions.rounds++;state.progress.history.unshift({game:type,value:type==='reaction'?extra?.ms??score:type==='memory'?extra?.moves??score:score,date:new Date().toISOString()});state.progress.history=state.progress.history.slice(0,30);}
    if(['ride','merge','stack','signal','snake','breaker','helmet','lights'].includes(type)){const key='best'+type[0].toUpperCase()+type.slice(1);state.arcade[key]=Math.max(state.arcade[key],score);}
    state.stats.gamesPlayed += 1;
    state.stats.totalScore += Number(score || 0);
    state.daily.games += 1;
    unlock('first_game');
    if (state.stats.gamesPlayed >= 10) unlock('gamer_10');
    if (state.stats.gamesPlayed >= 50) unlock('gamer_50');

    if (type === 'reaction') {
      const ms = Number(extra?.ms ?? score);
      if (!state.stats.bestReaction || ms < state.stats.bestReaction) state.stats.bestReaction = ms;
      if (ms < 250) unlock('fast_reaction');
      if (ms < 200) unlock('reflex_god');
    }
    if (type === 'lane' && score > state.stats.bestLane) state.stats.bestLane = score;
    if (type === 'tap' && score > state.stats.bestTap) state.stats.bestTap = score;
    if (type === 'memory') {
      const moves = Number(extra?.moves ?? score);
      if (!state.stats.bestMemory || moves < state.stats.bestMemory) state.stats.bestMemory = moves;
      if (moves <= 12) unlock('memory_master');
    }
    if (state.player.xp >= 5000) unlock('xp_5000');
    save();
  }

  function resetDaily(){if(state.daily.date!==todayKey())state.daily={date:todayKey(),games:0,claimed:false};}

  function claimDaily() {
    resetDaily();
    if (state.daily.games >= 3 && !state.daily.claimed) {
      state.daily.claimed = true;
      state.player.xp += 250;
      state.player.coins += 100;
      unlock('daily_first');
      save();
      return true;
    }
    return false;
  }

  function setNickname(name) {
    state.player.nickname = String(name || '').trim().slice(0, 18);
    save();
  }

  function setSetting(key, value) {
    if (key in state.settings) state.settings[key] = value;
    save();
  }

  function incrementContact() { state.stats.contactsOpened += 1; save(); }

  function restore(data){
    if(data?.app!=='pcx-hub'||![2,3,4,5,6,7,8].includes(data.version)||!data.state?.player||!data.state?.stats||!data.state?.settings||typeof data.state.player.nickname!=='string'||!Number.isFinite(data.state.player.xp)||data.state.player.xp<0)throw Error('Geçerli bir PCX Hub profil yedeği seç.');
    const clean=mergeDeep(defaultState,data.state);Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,clean);normalize();resetDaily();resetMissions();save();
  }
  const PAINTS={sage:{name:'Sage',color:'#b5c9a5',price:0},orange:{name:'Sunset',color:'#f48a52',price:120},blue:{name:'Coastal',color:'#7bb6d9',price:250},plum:{name:'Midnight',color:'#b2a0d5',price:400},gold:{name:'Altın Motor',color:'#efd16a',price:9999}};
  function favorite(id){if(!(id in state.arcade.favorites))return;state.arcade.favorites[id]=!state.arcade.favorites[id];save();}
  function paint(id){if(!PAINTS[id])return false;if(!state.arcade.owned[id]){if(state.player.coins<PAINTS[id].price)return false;state.player.coins-=PAINTS[id].price;state.arcade.owned[id]=true;}state.arcade.paint=id;if(id==='gold')unlock('gold_owner');save();return true;}
  function dailyGame(){const ids=['ride','merge','stack','signal','memory','reaction','tap','snake','breaker','helmet','lights'];const day=Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000);return ids[day%ids.length];}
  function dailyBonus(type,score){const thresholds={ride:100,merge:128,stack:5,signal:3,memory:1,reaction:1,tap:15,snake:50,breaker:200,helmet:100,lights:1};if(type!==dailyGame()||state.arcade.bonusDate===todayKey()||score<thresholds[type])return false;state.arcade.bonusDate=todayKey();addRewards(150,60);return true;}
  function setLastGame(id){if(id in state.arcade.favorites){state.arcade.lastGame=id;save();}}
  function savePuzzle(data){state.arcade.puzzle={cells:typeof data.cells==='string'?data.cells:'',score:Math.max(0,data.score||0),moves:Math.max(0,data.moves||0)};save();}
  function resetMissions(){if(state.progress.missions.date!==todayKey())state.progress.missions={date:todayKey(),kinds:{ride:false,merge:false,stack:false,signal:false,reaction:false,tap:false,memory:false,snake:false,breaker:false,helmet:false,lights:false},rounds:0,exploreClaimed:false,scoreClaimed:false};}
  function claimMission(id){resetMissions();const m=state.progress.missions;if(id==='explore'&&!m.exploreClaimed&&Object.values(m.kinds).filter(Boolean).length>=2){m.exploreClaimed=true;addRewards(120,45);return true;}if(id==='score'&&!m.scoreClaimed&&m.rounds>=5){m.scoreClaimed=true;addRewards(180,70);return true;}return false;}
  const SECRETS={ride_1000:{name:'QR’dan girdin, piste çıktın',hint:'Asfaltta dört haneli bir iz bırak.',text:'1000 puan. Motor artık seni yakın arkadaşlara aldı.',reward:77},gold_owner:{name:'Altın Motor Kulübü',hint:'Garajdaki en pahalı hayal.',text:'Altın kaplama tamam. Taksit yok, sürpriz masraf yok.',reward:0},do_not_touch:{name:'Tabelayı okudun aslında',hint:'Bazı düğmeler sabrını ölçer.',text:'DOKUNMA yazısını beş kez kontrol ettin. Bilim insanı.',reward:25},window_shopping:{name:'Vitrine Bakmak Bedava',hint:'Pahalı bir hayali birkaç kez yokla.',text:'Banka aramadı. Bu sadece bir oyun. Altın motor hâlâ vitrinde.',reward:0},snake_10:{name:'Simit Kervanı',hint:'Bir kuyruğu on simit uzat.',text:'Bu yılan değil, seyyar fırın.',reward:30},breaker_clear:{name:'Kentsel Dönüşüm',hint:'Son tuğlaya kadar devam et.',text:'Duvar kalmadı. Müteahhit seni arıyor.',reward:30},lights_clear:{name:'Son Çıkan Işıkları Söndürsün',hint:'Küçük şehrin bütün ışıklarını kapat.',text:'Elektrik faturası seni alkışlıyor.',reward:25},secret:{name:'Logoyla Fazla Samimi',hint:'Tepedeki P biraz ilgi istiyor.',text:'Logonun gizli mesaisi başladı.',reward:0}};
  function discover(id){if(!SECRETS[id]||!unlock(id))return false;state.player.coins+=SECRETS[id].reward;save();window.dispatchEvent(new CustomEvent('pcx:secret',{detail:{id,...SECRETS[id]}}));return true;}
  resetMissions();
  window.PCXStore = { get, save, restore, claimMission, discover, SECRETS, PAINTS, favorite, paint, dailyGame, dailyBonus, setLastGame, savePuzzle, todayKey, storageFailed:()=>storageError, touchVisit, addRewards, unlock, recordGame, claimDaily, setNickname, setSetting, incrementContact };
})();
