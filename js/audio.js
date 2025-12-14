// 8-Bit Web Audio 合成音效與復古 Chiptune 背景音樂引擎
window.PixelAudio = (function() {
  let ctx = null;
  let sfxMuted = false;
  let bgmPlaying = false;
  let bgmTimer = null;
  let bgmStep = 0;

  function init() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playTone(freq, type, duration, vol = 0.11, slideFreq = null) {
    if (sfxMuted) return;
    init();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function shoot(towerType) {
    if (towerType === 'archer') playTone(560, 'square', 0.06, 0.07, 240);
    else if (towerType === 'cannon') playTone(130, 'sawtooth', 0.16, 0.13, 42);
    else if (towerType === 'frost') playTone(820, 'sine', 0.10, 0.08, 440);
    else if (towerType === 'tesla') playTone(920, 'sawtooth', 0.08, 0.08, 300);
    else if (towerType === 'sniper') playTone(680, 'triangle', 0.15, 0.13, 140);
  }

  function hit(isCrit) {
    if (isCrit) {
      playTone(680, 'square', 0.08, 0.11, 1020);
    } else {
      playTone(220, 'triangle', 0.04, 0.05, 110);
    }
  }

  function coin() {
    playTone(987.77, 'square', 0.06, 0.09);
    setTimeout(() => playTone(1318.51, 'square', 0.13, 0.09), 60);
  }

  function upgrade() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 'square', 0.09, 0.10), i * 50);
    });
  }

  function achievement() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 'square', 0.14, 0.13), i * 75);
    });
  }

  function bossWarning() {
    playTone(196, 'sawtooth', 0.26, 0.15, 125);
    setTimeout(() => playTone(174.61, 'sawtooth', 0.34, 0.15, 105), 280);
  }

  function skill() {
    playTone(330, 'sawtooth', 0.22, 0.14, 880);
    setTimeout(() => playTone(880, 'square', 0.24, 0.13, 220), 160);
  }

  const MELODY = [
    261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
    293.66, 349.23, 440.00, 587.33, 440.00, 349.23,
    246.94, 293.66, 392.00, 493.88, 392.00, 293.66,
    261.63, 329.63, 392.00, 523.25, 659.25, 523.25
  ];

  function toggleBgm() {
    init();
    bgmPlaying = !bgmPlaying;
    if (bgmPlaying) {
      if (bgmTimer) clearInterval(bgmTimer);
      bgmTimer = setInterval(() => {
        if (!bgmPlaying || sfxMuted) return;
        const note = MELODY[bgmStep % MELODY.length];
        playTone(note, 'triangle', 0.15, 0.04);
        if (bgmStep % 6 === 0) {
          playTone(note / 2, 'square', 0.20, 0.03);
        }
        bgmStep++;
      }, 200);
    } else {
      if (bgmTimer) clearInterval(bgmTimer);
      bgmTimer = null;
    }
    return bgmPlaying;
  }

  function toggleMute() {
    sfxMuted = !sfxMuted;
    return sfxMuted;
  }

  return {
    init,
    shoot,
    hit,
    coin,
    upgrade,
    achievement,
    bossWarning,
    skill,
    toggleBgm,
    toggleMute,
    isMuted: () => sfxMuted,
    isBgmPlaying: () => bgmPlaying
  };
})();
