'use strict';
/* ==================================================================== sound effects (WebAudio synth) + narrator voice */
const AU = (window.AU = { ctx: null, out: null, nb: null, loops: {}, voice: null });

AU.unlock = () => {
  if (!AU.ctx) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      AU.ctx = new C(); AU.out = AU.ctx.createGain(); AU.out.gain.value = 0.55; AU.out.connect(AU.ctx.destination);
      AU.musOut = AU.ctx.createGain(); AU.musOut.gain.value = AU.MUS_VOL; AU.musOut.connect(AU.ctx.destination);
      const n = AU.ctx.sampleRate * 2, b = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      AU.nb = b;
    } catch (e) { AU.ctx = null; }
  }
  if (AU.ctx && AU.ctx.state === 'suspended' && !document.hidden) AU.ctx.resume();
  if (AU.ctx && !AU.warm) { AU.warm = true; for (const v of AU.VOICE_SET) AU.buf('v_' + v).catch(() => {}); }
  if (AU.ctx && AU.musWant && !AU.mus) AU.music(AU.musWant);
  try {
    if (!AU.native && window.speechSynthesis && !AU.primed) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); AU.primed = true; }
  } catch (e) { /* no speech */ }
};

AU.tone = (f, d, o) => {
  o = o || {};
  const c = AU.ctx, t = c.currentTime + (o.at || 0);
  const os = c.createOscillator(); os.type = o.type || 'sine';
  os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d);
  const g = c.createGain(), v = o.vol === undefined ? 0.2 : o.vol;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.atk || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  os.connect(g); g.connect(AU.out); os.start(t); os.stop(t + d + 0.03);
};
AU.noise = (d, o) => {
  o = o || {};
  const c = AU.ctx, t = c.currentTime + (o.at || 0);
  const s = c.createBufferSource(); s.buffer = AU.nb; s.playbackRate.value = o.rate || 1;
  const f = c.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1000, t);
  if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + d);
  f.Q.value = o.q || 0.7;
  const g = c.createGain(), v = o.vol === undefined ? 0.2 : o.vol;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.atk || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(AU.out); s.start(t, Math.random() * 1.5); s.stop(t + d + 0.05);
};

const SFX = {
  click: () => AU.tone(880, 0.07, { type: 'triangle', vol: 0.1, to: 1180 }),
  hit: () => { AU.noise(0.13, { f: 1500, vol: 0.4 }); AU.tone(150, 0.16, { vol: 0.32, to: 60 }); },
  break: () => {
    AU.noise(0.5, { f: 2000, fto: 280, vol: 0.5 }); AU.tone(110, 0.32, { vol: 0.38, to: 40 });
    for (let i = 0; i < 6; i++) AU.noise(0.05, { ft: 'highpass', f: 2600, vol: 0.18, at: 0.05 + i * 0.055 });
  },
  found: () => [523, 659, 784, 1047].forEach((f, i) => AU.tone(f, 0.28, { type: 'triangle', vol: 0.15, at: i * 0.08 })),
  snap: () => { AU.noise(0.04, { ft: 'highpass', f: 3000, vol: 0.28 }); AU.tone(620, 0.12, { type: 'triangle', vol: 0.15 }); AU.tone(930, 0.2, { type: 'triangle', vol: 0.12, at: 0.06 }); },
  win: () => {
    [523, 659, 784].forEach((f) => AU.tone(f, 0.5, { type: 'triangle', vol: 0.11 }));
    [659, 784, 1047].forEach((f) => AU.tone(f, 0.7, { type: 'triangle', vol: 0.11, at: 0.25 }));
    AU.tone(1319, 0.9, { vol: 0.09, at: 0.5 });
  },
  crack: () => { AU.noise(0.06, { ft: 'highpass', f: 2200, vol: 0.4 }); AU.noise(0.12, { f: 900, vol: 0.22, at: 0.02 }); },
  hatch: () => { AU.noise(0.3, { f: 2600, fto: 400, vol: 0.45 }); if (!AU.baby(G.cur(), { at: 0.3 })) SFX.chirp(0.3); },
  chirp: (at) => { at = at || 0; AU.tone(1400, 0.12, { vol: 0.12, to: 2600, at }); AU.tone(1650, 0.15, { vol: 0.12, to: 3000, at: at + 0.17 }); },
  beetle: () => { AU.tone(1200, 0.07, { type: 'square', vol: 0.05 }); AU.tone(1800, 0.1, { type: 'square', vol: 0.05, at: 0.07 }); },
  sniff: () => { for (let i = 0; i < 3; i++) AU.noise(0.17, { ft: 'bandpass', f: 650, q: 1.6, vol: 0.32, at: i * 0.24 }); },
  alert: () => { AU.tone(330, 0.15, { type: 'square', vol: 0.05 }); AU.tone(247, 0.22, { type: 'square', vol: 0.05, at: 0.17 }); },
  catch: () => { AU.noise(0.22, { ft: 'bandpass', f: 600, fto: 2400, q: 1, vol: 0.3 }); AU.tone(880, 0.16, { type: 'triangle', vol: 0.13, at: 0.12, to: 1320 }); },
  jump: () => AU.noise(0.28, { ft: 'bandpass', f: 380, fto: 1800, q: 1.2, vol: 0.26 }),
  thud: () => { AU.tone(90, 0.28, { vol: 0.42, to: 38 }); AU.noise(0.16, { f: 500, vol: 0.3 }); },
  whoosh: () => AU.noise(0.32, { ft: 'bandpass', f: 300, fto: 1600, q: 0.9, vol: 0.2 }),
  ok: () => { AU.tone(660, 0.1, { type: 'triangle', vol: 0.13 }); AU.tone(990, 0.17, { type: 'triangle', vol: 0.13, at: 0.08 }); },
  miss: () => AU.tone(300, 0.2, { type: 'triangle', vol: 0.11, to: 190 }),
  step: () => AU.noise(0.07, { f: 260, vol: 0.16 }),
  pop: () => AU.tone(520, 0.09, { vol: 0.14, to: 950 }),
  roar: () => {
    const c = AU.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(135, t + 0.3); o.frequency.linearRampToValueAtTime(72, t + 1.1);
    const lfo = c.createOscillator(); lfo.frequency.value = 27; const lg = c.createGain(); lg.gain.value = 16; lfo.connect(lg); lg.connect(o.frequency);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1100, t + 0.35); f.frequency.linearRampToValueAtTime(260, t + 1.2);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
    o.connect(f); f.connect(g); g.connect(AU.out); o.start(t); lfo.start(t); o.stop(t + 1.3); lfo.stop(t + 1.3);
    AU.noise(1.1, { ft: 'bandpass', f: 520, q: 0.8, vol: 0.16 });
  },
};
AU.play = (name, a) => {
  if (!AU.ctx || !G.state.settings.sfx || !SFX[name]) return;
  try { SFX[name](a); } catch (e) { /* audio glitch */ }
};
/** continuous scraping noise while brushing (level 0..1) */
AU.brush = (level) => {
  if (!AU.ctx || !G.state.settings.sfx) return;
  let L = AU.loops.brush;
  if (!L) {
    const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.nb; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(AU.out); s.start();
    L = AU.loops.brush = { s, g };
  }
  L.g.gain.setTargetAtTime(0.22 * G.clamp(level, 0, 1), AU.ctx.currentTime, 0.04);
};
AU.stopLoops = () => {
  for (const k in AU.loops) { try { AU.loops[k].s.stop(); } catch (e) { /* already stopped */ } }
  AU.loops = {};
};

/* ---------------- narrator voice (browser speech; Yandex SpeechKit later) */
/** in the Android app the phone's own speech engine reads the lines (WebView has no browser speech) */
AU.native = window.DinoTTS || null;
AU._tts = (on) => { if (window.UI) UI.narrSpeaking(!!on); };
/** recorded narration (Yandex SpeechKit, tools/voice): every line has a clip; clips sit about fifty to a file (tools/voice_merge.py)
 *  (voice/p<N>.mp3, in the order the lines come in the game) and VOICE (js/voice.js) gives each line's
 *  [pack, offset, length] by its normalized text. A line without a recording is read by the device voice. */
AU.vkey = (t) => String(t).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
AU.clip = null; AU.clipUrl = null; AU.clipTok = 0;
AU.packs = new Map();
AU.opusOk = (() => { try { return !!new Audio().canPlayType('audio/ogg; codecs="opus"'); } catch (e) { return false; } })();
AU.clipFor = (t) => {
  const v = (typeof VOICE !== 'undefined' && VOICE[AU.vkey(t)]) || null;
  return v && (typeof v[0] !== 'string' || AU.opusOk) ? v : null;   // "oN" packs are Ogg Opus
};
/** a line with the animal's name in it is said only where it has been recorded; everywhere else the short line that suits every animal is said */
AU.alt = (full, short) => (AU.clipFor(full) ? full : short);
AU.pack = (n) => {
  let p = AU.packs.get(n);
  if (!p) {
    // a pack is voice/p<N>.mp3 (the first recordings) or voice/o<N>.ogg (Opus: clearer at the same size)
    p = fetch(typeof n === 'string' ? 'voice/' + n + '.ogg' : 'voice/p' + n + '.mp3').then((r) => { if (!r.ok) throw new Error('voice ' + r.status); return r.arrayBuffer(); });
    p.catch(() => AU.packs.delete(n));
    AU.packs.set(n, p);
    if (AU.packs.size > 4) AU.packs.delete(AU.packs.keys().next().value);   // keep the newest packs only (1.6–5 MB each)
  }
  return p;
};
AU.stopClip = () => {
  AU.clipTok++;
  const a = AU.clip, u = AU.clipUrl; AU.clip = null; AU.clipUrl = null;
  if (a) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) { /* ignore */ } }
  if (u) URL.revokeObjectURL(u);
};
AU.playClip = (v, text) => {
  AU.stopClip();
  const tok = AU.clipTok;
  const fail = () => { if (tok === AU.clipTok) { AU.stopClip(); if (window.UI) UI.narrSpeaking(false); if (text) AU.speak(text); } };
  AU.pack(v[0]).then((buf) => {
    if (tok !== AU.clipTok) return;                       // another line has started meanwhile
    const url = URL.createObjectURL(new Blob([buf.slice(v[1], v[1] + v[2])], { type: typeof v[0] === 'string' ? 'audio/ogg' : 'audio/mpeg' }));
    const a = new Audio(url);
    AU.clip = a; AU.clipUrl = url;
    let played = false;
    const end = () => { if (AU.clip === a) { AU.stopClip(); if (window.UI) UI.narrSpeaking(false); } };
    a.addEventListener('playing', () => { played = true; if (AU.clip === a && window.UI) UI.narrSpeaking(true); });
    a.addEventListener('ended', end);
    a.addEventListener('error', () => { if (AU.clip === a) { if (played) end(); else fail(); } });
    const p = a.play();
    if (p && p.catch) p.catch((e) => { if (AU.clip === a) { if (e && e.name === 'NotSupportedError') fail(); else end(); } });   // e.g. no tap yet on the page
  }).catch(fail);
};
const ttsStop = () => { try { if (AU.native) AU.native.stop(); else if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
AU.pickVoice = () => {
  if (!window.speechSynthesis) return null;
  const vs = speechSynthesis.getVoices();
  AU.voiceCount = vs.length;
  const ru = vs.filter((v) => /^ru/i.test(v.lang));
  return ru.find((v) => /Milena|Google|Yandex|Alena|Katya|Svetlana/i.test(v.name)) || ru[0] || null;
};
if (window.speechSynthesis) {
  AU.voice = AU.pickVoice();
  try { speechSynthesis.addEventListener('voiceschanged', () => { AU.voice = AU.pickVoice(); }); } catch (e) { /* old API */ }
}
AU.say = (text) => {
  if (!G.state.settings.voice || !text) return;
  const id = AU.clipFor(text);
  if (id) { ttsStop(); AU.playClip(id, text); return; }
  AU.stopClip();
  AU.speak(text);
};
/** the device voice (phone speech engine in the app, browser speech on the web) */
AU.speak = (text) => {
  if (AU.native) { try { AU.native.speak(String(text)); } catch (e) { /* no voice */ } return; }
  if (!window.speechSynthesis) return;
  if (!AU.voice) AU.voice = AU.pickVoice();
  if (!AU.voice && AU.voiceCount > 0) return; // no Russian voice on this device
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU'; if (AU.voice) u.voice = AU.voice;
    u.rate = 1.0; u.pitch = 1.1;
    u.onstart = () => UI.narrSpeaking(true);
    u.onend = u.onerror = () => UI.narrSpeaking(false);
    speechSynthesis.speak(u);
  } catch (e) { /* speech unavailable */ }
};
AU.hush = () => { AU.stopClip(); ttsStop(); UI.narrSpeaking(false); };

/* ==================================================================== music and the animals' voices
 * snd/m_*.mp3 — two loops (tools/make_music.py): each file holds PAD s of the loop's end, the loop, PAD s of its start,
 * so looping [PAD, PAD + LOOP) is seamless whatever the mp3 decoder's delay. snd/v_*.mp3 — one call of each kind of
 * animal (tools/make_voices.py); an animal plays its kind's call faster when small, slower when big. */
AU.MUS_VOL = 0.3; AU.MUS_DUCK = 0.11;
AU.TRACKS = { calm: { loop: 64, pad: 0.5 }, play: { loop: 64, pad: 0.5 } };
/** the museum, the map and the digs are calm; the chapters' games play */
AU.trackOf = (scene) => (/^(loading|title|map|site|museum|path|final|dig|assemble)$/.test(scene) ? 'calm' : 'play');
AU.bufs = new Map();
AU.buf = (name) => {
  let p = AU.bufs.get(name);
  if (!p) {
    p = fetch('snd/' + name + '.mp3').then((r) => { if (!r.ok) throw new Error(name + ' ' + r.status); return r.arrayBuffer(); })
      .then((a) => new Promise((res, rej) => AU.ctx.decodeAudioData(a, res, rej)));
    p.catch(() => AU.bufs.delete(name));
    AU.bufs.set(name, p);
  }
  return p;
};
AU.musPos = {};
AU.mus = null;
/** play a music track (null: none); before the first tap it only remembers which one */
AU.music = (name) => {
  AU.musWant = name;
  if (!AU.ctx) return;
  const want = G.state.settings.music !== false && G.state.settings.sfx !== false ? name : null, cur = AU.mus;
  if (cur && cur.name === want) return;
  if (cur) {
    AU.mus = null;
    const T = AU.TRACKS[cur.name], t = AU.ctx.currentTime;
    if (cur.src) {
      AU.musPos[cur.name] = (t - cur.t0) % T.loop;
      cur.g.gain.cancelScheduledValues(t); cur.g.gain.setValueAtTime(cur.g.gain.value, t); cur.g.gain.linearRampToValueAtTime(0, t + 0.9);
      try { cur.src.stop(t + 1.0); } catch (e) { /* already stopped */ }
    }
  }
  if (!want) return;
  const m = (AU.mus = { name: want });
  AU.buf('m_' + want).then((b) => {
    if (AU.mus !== m) return;
    const T = AU.TRACKS[want], c = AU.ctx, t = c.currentTime + 0.05, at = (AU.musPos[want] || 0) % T.loop;
    const s = c.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = T.pad; s.loopEnd = T.pad + T.loop;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + 1.6);
    s.connect(g); g.connect(AU.musOut); s.start(t, T.pad + at);
    Object.assign(m, { src: s, g, t0: t - at });
  }).catch(() => { if (AU.mus === m) AU.mus = null; });
};
/** the music steps back while the narrator speaks */
AU.duck = (on) => {
  if (!AU.musOut) return;
  AU.musOut.gain.setTargetAtTime(on ? AU.MUS_DUCK : AU.MUS_VOL, AU.ctx.currentTime, on ? 0.12 : 0.6);
};

AU.VOICE_SET = ['roar_big', 'roar_small', 'boom_giant', 'grunt_herb', 'hiss_croc', 'screech_ptero', 'chirp_bird', 'call_sea', 'snort_beast', 'chirp_baby'];
/** each animal: [kind of voice, speed] — big animals slower and deeper */
AU.VOICES = {
  herrera: ['roar_big', 1.12], eorap: ['roar_small', 1.15], sauro: ['hiss_croc', 0.85], rioja: ['boom_giant', 1.25], coelo: ['roar_small', 1.0],
  posto: ['hiss_croc', 0.9], placer: ['snort_beast', 0.9], desma: ['grunt_herb', 1.05], icaro: ['chirp_bird', 1.0], cymbo: ['call_sea', 0.8],
  petein: ['screech_ptero', 1.15], austria: ['screech_ptero', 1.05], tany: ['hiss_croc', 1.2], placod: ['call_sea', 1.25], notho: ['hiss_croc', 1.1],
  masto: ['hiss_croc', 0.95], liso: ['snort_beast', 0.82], lystro: ['snort_beast', 1.2], cyno: ['roar_small', 0.85], isano: ['boom_giant', 1.15],
  loto: ['grunt_herb', 1.1], shringa: ['grunt_herb', 1.25], shansi: ['hiss_croc', 0.9], sharo: ['chirp_bird', 1.1], atopo: ['call_sea', 1.3],
  stego: ['grunt_herb', 0.9], mamen: ['boom_giant', 0.9], dilo: ['roar_big', 1.1], cryolo: ['roar_big', 1.05], megalo: ['roar_big', 0.95],
  lourin: ['roar_big', 0.9], giraffa: ['boom_giant', 0.85], archaeo: ['chirp_bird', 0.95], plateo: ['boom_giant', 1.3], eudimo: ['screech_ptero', 1.2],
  shoni: ['call_sea', 0.75],
  allo: ['roar_big', 0.95], cerato: ['roar_big', 1.06], diplo: ['boom_giant', 0.85], ornitho: ['roar_small', 1.15], fruita: ['chirp_baby', 1.35],
  scutel: ['grunt_herb', 1.35], sarah: ['boom_giant', 1.3], kther: ['snort_beast', 1.2], kchel: ['hiss_croc', 1.45],
  piat: ['roar_big', 1.12], brachy: ['boom_giant', 1.05], chile: ['grunt_herb', 1.3], dako: ['hiss_croc', 0.95],
  ichthy: ['call_sea', 1.2], plesio: ['call_sea', 1.05], temno: ['call_sea', 0.8], lio: ['call_sea', 0.68], leeds: ['call_sea', 0.58],
  dimorpho: ['screech_ptero', 1.1], rhampho: ['screech_ptero', 1.2], ptero: ['screech_ptero', 1.3], compso: ['roar_small', 1.4],
  cetio: ['boom_giant', 0.9], europa: ['boom_giant', 1.25], scelido: ['grunt_herb', 1.15], miragaia: ['grunt_herb', 1.0], torvo: ['roar_big', 0.88],
  shuno: ['boom_giant', 1.1], barapa: ['boom_giant', 0.95], guan: ['roar_small', 0.95], limu: ['chirp_bird', 0.8], yin: ['grunt_herb', 1.4],
  kulinda: ['chirp_bird', 0.9], gigant: ['grunt_herb', 1.0], anchi: ['chirp_bird', 1.1], epidex: ['chirp_bird', 1.3], yiqi: ['chirp_bird', 1.2],
  volati: ['snort_beast', 1.6], sordes: ['screech_ptero', 1.35], castoro: ['snort_beast', 1.4], kara: ['hiss_croc', 1.8],
  glacia: ['boom_giant', 1.25], sidero: ['hiss_croc', 0.8], nb_ausplesio: ['hiss_croc', 1.3], nb_millipede: ['hiss_croc', 2.2],
  kentro: ['grunt_herb', 1.1], dysalo: ['grunt_herb', 1.5], masso: ['boom_giant', 1.35], hetero: ['chirp_bird', 0.95], spico: ['grunt_herb', 0.85],
  nb_dracovenator: ['roar_big', 1.2], nb_megazostrodon: ['snort_beast', 1.8], nb_lesothosaurus: ['chirp_bird', 1.0],
  nb_adratiklit: ['grunt_herb', 0.95], nb_atlasaurus: ['boom_giant', 0.9],
  nb_patagosaurus: ['boom_giant', 0.95], nb_condorraptor: ['roar_big', 1.15], nb_manidens: ['grunt_herb', 1.45],
  nb_eoabelisaurus: ['roar_big', 1.05], nb_cricosaurus: ['hiss_croc', 1.15], nb_caypullisaurus: ['call_sea', 0.95],
  nb_allosaurus: ['roar_big', 0.95], nb_amphitherium: ['chirp_baby', 1.35], nb_antpterosaur: ['screech_ptero', 1.1], nb_camptosaurus: ['grunt_herb', 1.1],
  nb_cetiosaurus: ['boom_giant', 0.95], nb_compsognathus: ['roar_small', 1.35], nb_dicraeosaurus: ['boom_giant', 1.1], nb_diplodocus: ['boom_giant', 0.85],
  nb_dysalotosaurus: ['grunt_herb', 1.35], nb_exaeretodon: ['snort_beast', 1.15], nb_glacialisaurus: ['boom_giant', 1.2], nb_hyperodapedon: ['hiss_croc', 1.35],
  nb_ischigualastia: ['snort_beast', 0.9], nb_kayentatherium: ['snort_beast', 1.25], nb_kentrosaurus: ['grunt_herb', 1.1], nb_klobiodon: ['screech_ptero', 1.15],
  nb_lusotitan: ['boom_giant', 0.85], nb_miragaia: ['grunt_herb', 1.0], nb_omeisaurus: ['boom_giant', 0.95], nb_pterodactylus: ['screech_ptero', 1.25],
  nb_rhamphorhynchus: ['screech_ptero', 1.15], nb_sarahsaurus: ['boom_giant', 1.3], nb_scutellosaurus: ['grunt_herb', 1.4], nb_torvosaurus: ['roar_big', 0.9],
  nb_tritylodon: ['snort_beast', 1.35], nb_tuojiangosaurus: ['grunt_herb', 0.95], nb_yangchuanosaurus: ['roar_big', 1.0],
};
AU.voiceNow = null;
/** one animal call at a time: a new one cuts the old one short */
AU.call = (name, rate, o) => {
  o = o || {};
  if (!AU.ctx || !G.state.settings.sfx) return false;
  const c = AU.ctx, tok = (AU.callTok = (AU.callTok || 0) + 1), at = c.currentTime + (o.at || 0);
  AU.buf('v_' + name).then((b) => {
    if (tok !== AU.callTok) return;
    const t = Math.max(at, c.currentTime);
    const old = AU.voiceNow;
    if (old) { try { old.g.gain.setTargetAtTime(0, t, 0.03); old.s.stop(t + 0.15); } catch (e) { /* gone */ } }
    const s = c.createBufferSource(); s.buffer = b; s.playbackRate.value = rate * (0.97 + Math.random() * 0.06);
    const g = c.createGain(); g.gain.value = 0.95 * (o.vol === undefined ? 1 : o.vol);
    s.connect(g); g.connect(AU.out); s.start(t);
    const me = (AU.voiceNow = { s, g });
    s.onended = () => { if (AU.voiceNow === me) AU.voiceNow = null; };
  }).catch(() => { if (o.fallback) AU.play(o.fallback); });
  return true;
};
/** the call of an animal (a species id or a neighbour 'nb_<key>') */
AU.voiceOf = (id, o) => {
  const v = AU.VOICES[id], sp = window.DATA && DATA.species[id];
  const pv = v || (sp && sp.predator ? ['roar_small', 1] : ['grunt_herb', 1.1]);
  return AU.call(pv[0], pv[1], Object.assign({ fallback: sp && sp.predator ? 'roar' : 'chirp' }, o));
};
/** a hatchling's peeps: the babies of big animals peep a little lower */
AU.baby = (id, o) => {
  const v = AU.VOICES[id], r = v ? G.clamp(0.75 + 0.3 * v[1], 0.95, 1.2) : 1.05;
  return AU.call('chirp_baby', r, Object.assign({ fallback: 'chirp' }, o));
};
document.addEventListener('visibilitychange', () => {
  if (!AU.ctx) return;
  try { if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume(); } catch (e) { /* ignore */ }
});
