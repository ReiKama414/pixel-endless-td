// 像素無盡塔防 - 16-Bit 街機畫布與固定解析度自適應引擎
(function() {
  // Fixed internal pixel resolution (640x400 = 16x10 tiles of 40x40 pixels)
  // Scales cleanly to ANY screen size via CSS object-contain + image-rendering: pixelated
  const GRID_COLS = 16;
  const GRID_ROWS = 10;
  const CELL_SIZE = 40;
  const INTERNAL_W = GRID_COLS * CELL_SIZE; // 640
  const INTERNAL_H = GRID_ROWS * CELL_SIZE; // 400

  const MAPS = {
    plains: {
      name: "蜿蜒翡翠平原",
      bg1: "#152a20",
      bg2: "#12231b",
      decor: "#224232",
      pathBase: "#5c4433",
      pathStone: "#735640",
      pathEdge: "#38281d",
      waypoints: [
        [0, 2], [4, 2], [4, 7], [8, 7], [8, 1], [12, 1], [12, 8], [15, 8]
      ]
    },
    crossroads: {
      name: "雙子星熔岩迷宮",
      bg1: "#261519",
      bg2: "#1f1114",
      decor: "#3d1e24",
      pathBase: "#4f333b",
      pathStone: "#69454f",
      pathEdge: "#2e1b20",
      waypoints: [
        [0, 1], [13, 1], [13, 4], [2, 4], [2, 8], [15, 8]
      ]
    },
    spiral: {
      name: "無盡虛空迴廊",
      bg1: "#14182e",
      bg2: "#101324",
      decor: "#22294d",
      pathBase: "#39416e",
      pathStone: "#4c568f",
      pathEdge: "#1f2442",
      waypoints: [
        [0, 1], [14, 1], [14, 8], [2, 8], [2, 3], [11, 3], [11, 6], [6, 6]
      ]
    }
  };

  const TOWER_DEFS = {
    archer: {
      id: "archer",
      key: "1",
      name: "精靈神弓塔",
      shortName: "神弓塔",
      cost: 60,
      color: "#22c55e",
      range: 3.3,
      damage: 18,
      fireRate: 0.44,
      critChance: 0.22,
      projSpeed: 12,
      desc: "高速連射・高暴擊",
      evo5: "Lv.5 雙重神箭 (同時射 2 箭)",
      evo10: "Lv.10 破甲風暴 (暴擊率+25%)"
    },
    cannon: {
      id: "cannon",
      key: "2",
      name: "煉獄火砲塔",
      shortName: "火砲塔",
      cost: 100,
      color: "#ff7b00",
      range: 2.8,
      damage: 44,
      fireRate: 1.20,
      critChance: 0.14,
      splash: 1.4,
      projSpeed: 7.5,
      desc: "範圍轟炸・群傷燃燒",
      evo5: "Lv.5 集束炸彈 (範圍+40%&灼燒)",
      evo10: "Lv.10 毀滅核彈 (爆炸傷害翻倍)"
    },
    frost: {
      id: "frost",
      key: "3",
      name: "極寒冰晶塔",
      shortName: "冰晶塔",
      cost: 85,
      color: "#00f0ff",
      range: 2.75,
      damage: 15,
      fireRate: 0.82,
      critChance: 0.12,
      slowAmount: 0.45,
      slowDuration: 2.6,
      projSpeed: 9.5,
      desc: "極寒減速・冰封控場",
      evo5: "Lv.5 寒霜光環 (範圍全體緩速)",
      evo10: "Lv.10 絕對零度 (30%機率冰封)"
    },
    tesla: {
      id: "tesla",
      key: "4",
      name: "雷神磁暴塔",
      shortName: "磁暴塔",
      cost: 130,
      color: "#d946ef",
      range: 3.05,
      damage: 32,
      fireRate: 0.78,
      critChance: 0.20,
      chainCount: 3,
      projSpeed: 16,
      desc: "連鎖閃電・多目標彈跳",
      evo5: "Lv.5 超載電網 (彈跳 5 目標)",
      evo10: "Lv.10 雷神降臨 (附帶麻痺雷擊)"
    },
    sniper: {
      id: "sniper",
      key: "5",
      name: "黃金聖殿塔",
      shortName: "聖殿塔",
      cost: 175,
      color: "#ffd700",
      range: 5.3,
      damage: 98,
      fireRate: 1.55,
      critChance: 0.35,
      bountyBonus: 0.25,
      projSpeed: 19,
      desc: "全圖狙擊・產出額外賞金",
      evo5: "Lv.5 黃金賞金 (擊殺金幣+50%)",
      evo10: "Lv.10 天罰聖光 (對BOSS雙倍傷)"
    }
  };

  const TECH_DEFS = {
    dmg: { id: "dmg", name: "利刃鍛造", desc: "全塔傷害 +15% / 級", baseCost: 3, costMult: 1.5, bonusPerLv: 0.15 },
    spd: { id: "spd", name: "超載齒輪", desc: "全塔攻速 +10% / 級", baseCost: 4, costMult: 1.6, bonusPerLv: 0.10 },
    crit: { id: "crit", name: "鷹眼弱點", desc: "暴擊率 +4% & 暴傷 +20% / 級", baseCost: 4, costMult: 1.6, bonusPerLv: 0.04 },
    gold: { id: "gold", name: "貪婪聖物", desc: "金幣收益 +18% / 級", baseCost: 3, costMult: 1.5, bonusPerLv: 0.18 },
    castle: { id: "castle", name: "皇家聖盾", desc: "主堡生命 +25 & 每波回血", baseCost: 3, costMult: 1.5, bonusPerLv: 25 }
  };

  const ACHIEVEMENTS = [
    { id: "first_blood", name: "初出茅廬", desc: "擊殺第 1 隻入侵魔物", rewardGems: 2, check: s => s.totalKills >= 1 },
    { id: "builder_5", name: "防線成形", desc: "場上同時擁有 5 座防禦塔", rewardGems: 3, check: s => s.towers.length >= 5 },
    { id: "wave_5", name: "屠龍勇士", desc: "成功突破第 5 波首領戰", rewardGems: 5, check: s => s.wave > 5 },
    { id: "lv5_tower", name: "進階覺醒", desc: "將任意防禦塔升級至 Lv.5", rewardGems: 4, check: s => s.towers.some(t => t.level >= 5) },
    { id: "lv10_tower", name: "終極神塔", desc: "將任意防禦塔升級至 Lv.10 滿階覺醒", rewardGems: 8, check: s => s.towers.some(t => t.level >= 10) },
    { id: "rich_1000", name: "黃金大亨", desc: "單局累積持有超過 1,000 金幣", rewardGems: 4, check: s => s.gold >= 1000 },
    { id: "combo_30", name: "無雙連斬", desc: "達成 30 連殺 Combo", rewardGems: 5, check: s => s.maxCombo >= 30 },
    { id: "mimic_hunt", name: "寶箱獵人", desc: "擊殺黃金寶箱怪獲得巨額賞金", rewardGems: 5, check: s => s.mimicsKilled >= 1 },
    { id: "wave_15", name: "無盡守望者", desc: "在無盡模式存活至第 15 波", rewardGems: 10, check: s => s.wave >= 15 },
    { id: "dmg_100k", name: "百萬軍火庫", desc: "單局累積造成 100,000 點總傷害", rewardGems: 8, check: s => s.totalDamage >= 100000 }
  ];

  let savedData = {
    bestWave: 1,
    gems: 8,
    tech: { dmg: 0, spd: 0, crit: 0, gold: 0, castle: 0 },
    unlockedAch: {}
  };

  function loadSave() {
    try {
      const raw = localStorage.getItem("PIXEL_ENDLESS_TD_SAVE_V1");
      if (raw) {
        const parsed = JSON.parse(raw);
        const gems = Number(parsed.gems);
        const bestWave = Number(parsed.bestWave);
        savedData.gems = Number.isFinite(gems) && gems >= 0 ? Math.floor(gems) : savedData.gems;
        savedData.bestWave = Number.isFinite(bestWave) && bestWave >= 1 ? Math.floor(bestWave) : savedData.bestWave;
        const techIn = parsed.tech && typeof parsed.tech === "object" ? parsed.tech : {};
        savedData.tech = { dmg: 0, spd: 0, crit: 0, gold: 0, castle: 0 };
        Object.keys(savedData.tech).forEach(k => {
          const v = Number(techIn[k]);
          savedData.tech[k] = Number.isFinite(v) && v >= 0 ? Math.min(99, Math.floor(v)) : 0;
        });
        savedData.unlockedAch = (parsed.unlockedAch && typeof parsed.unlockedAch === "object")
          ? parsed.unlockedAch
          : {};
      }
    } catch (e) {}
  }

  function writeSave() {
    try {
      localStorage.setItem("PIXEL_ENDLESS_TD_SAVE_V1", JSON.stringify(savedData));
    } catch (e) {}
  }

  loadSave();

  let canvas, ctx;
  let bgCacheCanvas = null;
  let currentMapKey = "plains";
  let pathCells = new Set();
  let pathPoints = [];
  let animTick = 0;

  let state = {
    gold: 240,
    hp: 100,
    maxHp: 100,
    wave: 1,
    waveActive: false,
    autoWave: false,
    autoUpgrade: false,
    speedMult: 1,
    paused: false,
    gameOver: false,
    selectedTowerType: "archer",
    selectedTowerInst: null,
    hoverCell: null,
    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    shockwaves: [],
    floatingTexts: [],
    lightningBeams: [],
    spawnQueue: [],
    spawnTimer: 0,
    waveCooldown: 1.5,
    bannerText: "",
    bannerSub: "",
    bannerTimer: 0,
    bannerColor: "#ffd700",
    totalKills: 0,
    totalDamage: 0,
    mimicsKilled: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    screenShake: 0,
    skills: {
      meteor: { cd: 0, maxCd: 25, active: 0 },
      frenzy: { cd: 0, maxCd: 22, active: 0 },
      freeze: { cd: 0, maxCd: 20, active: 0 }
    }
  };

  function buildPath(mapKey) {
    pathCells.clear();
    pathPoints = [];
    const wps = MAPS[mapKey].waypoints;
    for (let i = 0; i < wps.length; i++) {
      const [c1, r1] = wps[i];
      pathPoints.push({ c: c1, r: r1 });
      pathCells.add(`${c1},${r1}`);
      if (i < wps.length - 1) {
        const [c2, r2] = wps[i + 1];
        const dc = Math.sign(c2 - c1);
        const dr = Math.sign(r2 - r1);
        let cc = c1, rr = r1;
        while (cc !== c2 || rr !== r2) {
          cc += dc;
          rr += dr;
          pathCells.add(`${cc},${rr}`);
        }
      }
    }
    prerenderTilemap(mapKey);
  }

  function prerenderTilemap(mapKey) {
    const mapCfg = MAPS[mapKey];
    bgCacheCanvas = document.createElement("canvas");
    bgCacheCanvas.width = INTERNAL_W;
    bgCacheCanvas.height = INTERNAL_H;
    const bctx = bgCacheCanvas.getContext("2d");
    bctx.imageSmoothingEnabled = false;

    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;
        const seed = (c * 31 + r * 17) % 100;

        if (pathCells.has(`${c},${r}`)) {
          bctx.fillStyle = mapCfg.pathBase;
          bctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

          bctx.fillStyle = mapCfg.pathEdge;
          if (!pathCells.has(`${c},${r - 1}`)) bctx.fillRect(x, y, CELL_SIZE, 4);
          if (!pathCells.has(`${c},${r + 1}`)) bctx.fillRect(x, y + CELL_SIZE - 4, CELL_SIZE, 4);
          if (!pathCells.has(`${c - 1},${r}`)) bctx.fillRect(x, y, 4, CELL_SIZE);
          if (!pathCells.has(`${c + 1},${r}`)) bctx.fillRect(x + CELL_SIZE - 4, y, 4, CELL_SIZE);

          bctx.fillStyle = mapCfg.pathStone;
          bctx.fillRect(x + 6, y + 6, 10, 6);
          bctx.fillRect(x + 20, y + 8, 12, 6);
          bctx.fillRect(x + 10, y + 18, 14, 6);
          bctx.fillRect(x + 26, y + 22, 8, 6);
          bctx.fillRect(x + 6, y + 28, 12, 6);
        } else {
          bctx.fillStyle = (c + r) % 2 === 0 ? mapCfg.bg1 : mapCfg.bg2;
          bctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

          bctx.fillStyle = mapCfg.decor;
          if (seed % 3 === 0) {
            bctx.fillRect(x + 6, y + 8, 2, 4);
            bctx.fillRect(x + 8, y + 6, 2, 6);
            bctx.fillRect(x + 28, y + 26, 2, 4);
          }
          if (seed % 7 === 0) {
            bctx.fillStyle = mapKey === "plains" ? "#fde047" : (mapKey === "crossroads" ? "#f97316" : "#38bdf8");
            bctx.fillRect(x + 18, y + 14, 3, 3);
          }

          bctx.fillStyle = "rgba(255, 255, 255, 0.07)";
          bctx.fillRect(x + 2, y + 2, 4, 1);
          bctx.fillRect(x + 2, y + 2, 1, 4);
          bctx.fillRect(x + CELL_SIZE - 6, y + CELL_SIZE - 3, 4, 1);
          bctx.fillRect(x + CELL_SIZE - 3, y + CELL_SIZE - 6, 1, 4);
        }
      }
    }
  }

  function showArcadeBanner(title, sub, color = "#ffd700") {
    state.bannerText = title;
    state.bannerSub = sub;
    state.bannerColor = color;
    state.bannerTimer = 2.2;
  }

  function getMaxHp() {
    return 100 + (savedData.tech.castle || 0) * TECH_DEFS.castle.bonusPerLv;
  }

  function resetGame(mapKey) {
    if (mapKey) currentMapKey = mapKey;
    buildPath(currentMapKey);
    const maxHp = getMaxHp();
    state = {
      gold: 240,
      hp: maxHp,
      maxHp: maxHp,
      wave: 1,
      waveActive: false,
      autoWave: false,
      autoUpgrade: state ? state.autoUpgrade : false,
      speedMult: state ? state.speedMult : 1,
      paused: false,
      gameOver: false,
      selectedTowerType: state ? state.selectedTowerType : "archer",
      selectedTowerInst: null,
      hoverCell: null,
      towers: [],
      enemies: [],
      projectiles: [],
      particles: [],
      shockwaves: [],
      floatingTexts: [],
      lightningBeams: [],
      spawnQueue: [],
      spawnTimer: 0,
      waveCooldown: 1.5,
      bannerText: "PREPARE DEFENSES",
      bannerSub: "不限時間自由佈陣，準備好再按右下角【迎戰】！",
      bannerTimer: 3.2,
      bannerColor: "#10b981",
      totalKills: 0,
      totalDamage: 0,
      mimicsKilled: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      screenShake: 0,
      skills: {
        meteor: { cd: 0, maxCd: 25, active: 0 },
        frenzy: { cd: 0, maxCd: 22, active: 0 },
        freeze: { cd: 0, maxCd: 20, active: 0 }
      }
    };
    hideGameOverModal();
    const pauseBtn = document.getElementById("btn-pause");
    if (pauseBtn) {
      pauseBtn.textContent = "⏸️ 暫停";
      pauseBtn.setAttribute("aria-pressed", "false");
    }
    const speedBtn = document.getElementById("btn-speed");
    if (speedBtn) speedBtn.textContent = `⏩ 速度: ${state.speedMult}x`;
    updateUI();
  }

  function getDmgMult() {
    return 1 + (savedData.tech.dmg || 0) * TECH_DEFS.dmg.bonusPerLv;
  }
  function getSpdMult() {
    let m = 1 + (savedData.tech.spd || 0) * TECH_DEFS.spd.bonusPerLv;
    if (state.skills.frenzy.active > 0) m *= 2.0;
    return m;
  }
  function getCritBonus() {
    let c = (savedData.tech.crit || 0) * TECH_DEFS.crit.bonusPerLv;
    if (state.skills.frenzy.active > 0) c += 0.35;
    return c;
  }
  function getCritDmgMult() {
    return 1.75 + (savedData.tech.crit || 0) * 0.20;
  }
  function getGoldMult() {
    let m = 1 + (savedData.tech.gold || 0) * TECH_DEFS.gold.bonusPerLv;
    if (state.combo >= 10) m *= Math.min(2.0, 1 + Math.floor(state.combo / 10) * 0.1);
    return m;
  }

  function getTowerStats(tower) {
    const def = TOWER_DEFS[tower.type];
    const lv = tower.level;
    const lvScale = Math.pow(1.24, lv - 1);
    let dmg = Math.round(def.damage * lvScale * getDmgMult());
    let range = def.range + (lv - 1) * 0.12;
    let fireRate = Math.max(0.14, def.fireRate / (1 + (lv - 1) * 0.08) / getSpdMult());
    let critChance = Math.min(0.85, def.critChance + (lv >= 10 && tower.type === 'archer' ? 0.25 : 0) + getCritBonus());
    let upgradeCost = Math.round(def.cost * 0.75 * Math.pow(1.38, lv - 1));
    return { dmg, range, fireRate, critChance, upgradeCost };
  }

  function startNextWave() {
    if (state.waveActive || state.gameOver) return;
    state.waveActive = true;
    const w = state.wave;
    const queue = [];
    const count = 7 + Math.floor(w * 2.2);
    const hpBase = Math.round(32 * Math.pow(1.23, w - 1));
    const rewardBase = Math.max(6, Math.round(7 + w * 1.4));

    for (let i = 0; i < count; i++) {
      let type = "slime";
      let hp = hpBase;
      let speed = 1.35 + Math.min(1.2, w * 0.03);
      let reward = rewardBase;
      let isBoss = false;

      if (w >= 2 && i % 4 === 1) {
        type = "goblin";
        hp = Math.round(hpBase * 0.72);
        speed = 2.15 + Math.min(1.4, w * 0.04);
      } else if (w >= 3 && i % 5 === 2) {
        type = "orc";
        hp = Math.round(hpBase * 1.85);
        speed = 0.95 + Math.min(0.8, w * 0.02);
        reward = Math.round(rewardBase * 1.5);
      } else if (w >= 4 && i % 6 === 4) {
        type = "necro";
        hp = Math.round(hpBase * 1.25);
        speed = 1.25;
        reward = Math.round(rewardBase * 1.6);
      }

      queue.push({ type, hp, maxHp: hp, speed, reward, isBoss });
    }

    if (w % 3 === 0) {
      const mimicHp = Math.round(hpBase * 2.6);
      queue.splice(Math.floor(queue.length / 2), 0, {
        type: "mimic",
        hp: mimicHp,
        maxHp: mimicHp,
        speed: 1.9,
        reward: rewardBase * 6,
        isBoss: false
      });
    }

    if (w % 5 === 0) {
      const bossHp = Math.round(hpBase * 8.5);
      const bossName = w % 15 === 0 ? "虛空毀滅泰坦" : (w % 10 === 0 ? "深淵煉獄魔王" : "烈焰紅龍領主");
      queue.push({
        type: "boss",
        hp: bossHp,
        maxHp: bossHp,
        speed: 0.78,
        reward: rewardBase * 10,
        isBoss: true,
        bossName
      });
      PixelAudio.bossWarning();
      showArcadeBanner(`WARNING! BOSS WAVE ${w}`, `首領【${bossName}】降臨戰場！`, "#ff2a55");
      showToast(`⚠️ 第 ${w} 波首領【${bossName}】來襲！`, "boss");
    } else {
      showArcadeBanner(`WAVE ${w < 10 ? '0' + w : w} START!`, `魔物大軍入侵中 (${queue.length} 隻)`, "#ffd700");
    }

    state.spawnQueue = queue;
    state.spawnTimer = 0.2;
    updateUI();
  }

  function spawnEnemy(data) {
    const start = pathPoints[0];
    state.enemies.push({
      id: Math.random().toString(36).slice(2),
      type: data.type,
      bossName: data.bossName || null,
      isBoss: data.isBoss,
      hp: data.hp,
      maxHp: data.maxHp,
      baseSpeed: data.speed,
      reward: data.reward,
      wpIndex: 0,
      x: start.c + 0.5,
      y: start.r + 0.5,
      slowTimer: 0,
      slowFactor: 0,
      freezeTimer: 0,
      burnTimer: 0,
      burnDmg: 0,
      hitFlash: 0,
      animFrame: 0,
      animTimer: 0
    });
  }

  function addFloatingText(x, y, text, color, scale = 1) {
    if (state.floatingTexts.length > 50) state.floatingTexts.shift();
    state.floatingTexts.push({
      x, y, text, color, scale,
      life: 0.85,
      maxLife: 0.85,
      vy: -1.45
    });
  }

  function spawnParticles(x, y, color, count = 8, speed = 2.5) {
    if (state.particles.length > 150) state.particles.splice(0, count);
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (0.3 + Math.random() * 0.85) * speed;
      state.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: 3 + Math.floor(Math.random() * 4),
        life: 0.32 + Math.random() * 0.28
      });
    }
  }

  function addShockwave(x, y, maxRadius, color) {
    state.shockwaves.push({
      x, y,
      radius: 0.1,
      maxRadius,
      color,
      life: 0.22,
      maxLife: 0.22
    });
  }

  function damageEnemy(enemy, rawDmg, sourceTower, isCrit = false) {
    if (enemy.hp <= 0) return;
    let dmg = rawDmg;
    if (state.skills.freeze.active > 0 || enemy.freezeTimer > 0) {
      dmg = Math.round(dmg * 1.3);
    }
    if (sourceTower && sourceTower.type === "sniper" && sourceTower.level >= 10 && enemy.isBoss) {
      dmg *= 2;
    }

    enemy.hp -= dmg;
    enemy.hitFlash = 0.08;
    state.totalDamage += dmg;
    if (sourceTower) sourceTower.totalDamage = (sourceTower.totalDamage || 0) + dmg;

    if (isCrit) {
      addFloatingText(enemy.x, enemy.y - 0.35, `CRIT ${dmg}!`, "#ffd700", 1.25);
    } else {
      addFloatingText(enemy.x, enemy.y - 0.28, `${dmg}`, "#ffffff", 0.95);
    }

    if (enemy.hp <= 0) {
      killEnemy(enemy, sourceTower);
    }
  }

  function killEnemy(enemy, sourceTower) {
    state.totalKills++;
    state.combo++;
    state.comboTimer = 4.2;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;

    let bountyMult = getGoldMult();
    if (sourceTower && sourceTower.type === "sniper") {
      bountyMult += sourceTower.level >= 5 ? 0.50 : 0.25;
    }

    const goldEarned = Math.max(1, Math.round(enemy.reward * bountyMult));
    state.gold += goldEarned;

    spawnParticles(enemy.x, enemy.y, enemy.type === "mimic" ? "#ffd700" : "#ff2a55", enemy.isBoss ? 28 : 11, enemy.isBoss ? 4.2 : 2.6);
    addShockwave(enemy.x, enemy.y, enemy.isBoss ? 2.2 : 0.85, enemy.isBoss ? "#ffd700" : "#ffffff");
    addFloatingText(enemy.x, enemy.y - 0.55, `+${goldEarned}G`, "#ffd700", 1.1);

    if (enemy.type === "mimic") {
      state.mimicsKilled++;
      savedData.gems += 2;
      PixelAudio.coin();
      addFloatingText(enemy.x, enemy.y - 0.9, `SOUL +2!`, "#d946ef", 1.3);
      showToast("💰 擊殺黃金寶箱怪！獲得巨額賞金與 +2 靈魂結晶！", "gold");
    } else if (enemy.isBoss) {
      const bossGems = 3 + Math.floor(state.wave / 5);
      savedData.gems += bossGems;
      state.screenShake = 0.5;
      PixelAudio.achievement();
      showArcadeBanner(`BOSS DEFEATED!`, `獲得 +${bossGems} 靈魂結晶！`, "#d946ef");
      showToast(`🏆 擊敗首領【${enemy.bossName}】！獲得 +${bossGems} 靈魂結晶！`, "gold");
      writeSave();
    } else if (sourceTower && sourceTower.type === "sniper" && Math.random() < 0.08) {
      savedData.gems += 1;
      addFloatingText(enemy.x, enemy.y - 0.85, `SOUL +1`, "#d946ef", 1.15);
    }

    checkAchievements();
    updateUI();
  }

  function checkAchievements() {
    let changed = false;
    ACHIEVEMENTS.forEach(ach => {
      if (!savedData.unlockedAch[ach.id] && ach.check(state)) {
        savedData.unlockedAch[ach.id] = true;
        savedData.gems += ach.rewardGems;
        changed = true;
        PixelAudio.achievement();
        showToast(`🎖️ 成就解鎖【${ach.name}】💎+${ach.rewardGems}`, "ach");
      }
    });
    if (changed) {
      writeSave();
      renderAchievementsList();
    }
  }

  function triggerAutoUpgrade() {
    if (!state.autoUpgrade || state.towers.length === 0) return;
    const sorted = [...state.towers].sort((a, b) => a.level - b.level);
    for (const t of sorted) {
      const st = getTowerStats(t);
      if (state.gold >= st.upgradeCost) {
        state.gold -= st.upgradeCost;
        t.level++;
        t.invested += st.upgradeCost;
        spawnParticles(t.c + 0.5, t.r + 0.5, "#ffd700", 12, 2.4);
        addFloatingText(t.c + 0.5, t.r + 0.2, `LV.${t.level} UP!`, "#00f0ff", 1.1);
        checkAchievements();
        break;
      }
    }
  }

  function updateGame(dt) {
    animTick += dt;
    if (state.paused || state.gameOver) return;
    const effDt = dt * state.speedMult;

    if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - dt);
    if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - dt);

    if (state.combo > 0) {
      state.comboTimer -= effDt;
      if (state.comboTimer <= 0) {
        state.combo = 0;
        updateUI();
      }
    }

    Object.keys(state.skills).forEach(k => {
      const sk = state.skills[k];
      if (sk.cd > 0) sk.cd = Math.max(0, sk.cd - effDt);
      if (sk.active > 0) sk.active = Math.max(0, sk.active - effDt);
    });

    if (state.waveActive) {
      if (state.spawnQueue.length > 0) {
        state.spawnTimer -= effDt;
        if (state.spawnTimer <= 0) {
          const nextE = state.spawnQueue.shift();
          spawnEnemy(nextE);
          state.spawnTimer = Math.max(0.24, 0.72 - state.wave * 0.015);
        }
      } else if (state.enemies.length === 0) {
        state.waveActive = false;
        const waveBonusGold = Math.round((35 + state.wave * 12) * getGoldMult());
        state.gold += waveBonusGold;
        savedData.gems += 1;

        const healAmt = (savedData.tech.castle || 0) * 3;
        if (healAmt > 0 && state.hp < state.maxHp) {
          state.hp = Math.min(state.maxHp, state.hp + healAmt);
        }

        if (state.wave > savedData.bestWave) {
          savedData.bestWave = state.wave;
        }
        writeSave();
        PixelAudio.coin();
        showArcadeBanner(`WAVE ${state.wave} CLEAR!`, `過關賞金 +${waveBonusGold}G / 靈魂結晶 +1`, "#10b981");
        state.wave++;
        checkAchievements();
        triggerAutoUpgrade();
        state.waveCooldown = 2.0;
        updateUI();
      }
    } else if (state.autoWave && state.wave > 1) {
      state.waveCooldown -= effDt;
      if (state.waveCooldown <= 0) {
        startNextWave();
      }
    }

    state.towers.forEach(t => {
      if (t.type === "frost" && t.level >= 5) {
        const st = getTowerStats(t);
        const tx = t.c + 0.5, ty = t.r + 0.5;
        state.enemies.forEach(e => {
          if (Math.hypot(e.x - tx, e.y - ty) <= st.range) {
            e.slowTimer = Math.max(e.slowTimer, 0.25);
            e.slowFactor = Math.max(e.slowFactor, 0.55);
          }
        });
      }
    });

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.animTimer += effDt;
      if (e.animTimer >= 0.20) {
        e.animTimer = 0;
        e.animFrame = 1 - e.animFrame;
      }

      if (e.burnTimer > 0) {
        e.burnTimer -= effDt;
        damageEnemy(e, Math.max(1, Math.round(e.burnDmg * effDt)), null, false);
        if (e.hp <= 0) {
          state.enemies.splice(i, 1);
          continue;
        }
      }

      if (e.freezeTimer > 0) {
        e.freezeTimer -= effDt;
        continue;
      }
      if (state.skills.freeze.active > 0) continue;

      let spd = e.baseSpeed;
      if (e.slowTimer > 0) {
        e.slowTimer -= effDt;
        spd *= (1 - e.slowFactor);
      }

      const nextWp = pathPoints[e.wpIndex + 1];
      if (!nextWp) {
        const castleDmg = e.isBoss ? 25 : 10;
        state.hp = Math.max(0, state.hp - castleDmg);
        state.screenShake = 0.4;
        addFloatingText(e.x, e.y, `-${castleDmg} HP`, "#ff2a55", 1.35);
        state.enemies.splice(i, 1);
        updateUI();
        if (state.hp <= 0 && !state.gameOver) {
          state.gameOver = true;
          showGameOverModal();
        }
        continue;
      }

      const tx = nextWp.c + 0.5;
      const ty = nextWp.r + 0.5;
      const dx = tx - e.x;
      const dy = ty - e.y;
      const dist = Math.hypot(dx, dy);
      const step = spd * effDt;

      if (dist <= step) {
        e.x = tx;
        e.y = ty;
        e.wpIndex++;
      } else {
        e.x += (dx / dist) * step;
        e.y += (dy / dist) * step;
      }
    }

    state.enemies = state.enemies.filter(e => e.hp > 0);

    state.towers.forEach(t => {
      if (t.recoil > 0) t.recoil = Math.max(0, t.recoil - effDt * 4.5);
      t.cooldown = (t.cooldown || 0) - effDt;
      if (t.cooldown > 0) return;

      const st = getTowerStats(t);
      const tx = t.c + 0.5;
      const ty = t.r + 0.5;

      let candidates = state.enemies.filter(e => Math.hypot(e.x - tx, e.y - ty) <= st.range);
      if (candidates.length === 0) return;

      candidates.sort((a, b) => (b.wpIndex - a.wpIndex) || (b.hp - a.hp));

      t.cooldown = st.fireRate;
      t.recoil = 0.25;
      PixelAudio.shoot(t.type);

      const shotCount = (t.type === "archer" && t.level >= 5) ? 2 : 1;
      for (let s = 0; s < shotCount; s++) {
        const tgt = candidates[s % candidates.length];
        if (t.type === "tesla") {
          fireTeslaChain(t, st, tgt);
        } else {
          state.projectiles.push({
            x: tx,
            y: ty,
            target: tgt,
            tower: t,
            stats: st,
            type: t.type,
            speed: TOWER_DEFS[t.type].projSpeed
          });
        }
      }
    });

    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      if (!p.target || p.target.hp <= 0) {
        state.projectiles.splice(i, 1);
        continue;
      }
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * effDt;

      if (dist <= step) {
        resolveProjectileHit(p);
        state.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }

    for (let i = state.lightningBeams.length - 1; i >= 0; i--) {
      state.lightningBeams[i].life -= effDt;
      if (state.lightningBeams[i].life <= 0) state.lightningBeams.splice(i, 1);
    }

    for (let i = state.shockwaves.length - 1; i >= 0; i--) {
      const sw = state.shockwaves[i];
      sw.life -= effDt;
      sw.radius = sw.maxRadius * (1 - sw.life / sw.maxLife);
      if (sw.life <= 0) state.shockwaves.splice(i, 1);
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * effDt;
      pt.y += pt.vy * effDt;
      pt.life -= effDt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y += ft.vy * effDt;
      ft.life -= effDt;
      if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }
  }

  function fireTeslaChain(tower, stats, firstTarget) {
    const maxTargets = tower.level >= 5 ? 5 : 3;
    const hitSet = new Set([firstTarget.id]);
    let currX = tower.c + 0.5;
    let currY = tower.r + 0.5;
    let currentTarget = firstTarget;

    for (let c = 0; c < maxTargets && currentTarget; c++) {
      const isCrit = Math.random() < stats.critChance;
      const dmg = Math.round(stats.dmg * (isCrit ? getCritDmgMult() : 1) * Math.pow(0.85, c));
      state.lightningBeams.push({
        x1: currX, y1: currY,
        x2: currentTarget.x, y2: currentTarget.y,
        life: 0.14
      });
      if (tower.level >= 10 && Math.random() < 0.25) {
        currentTarget.freezeTimer = Math.max(currentTarget.freezeTimer, 0.7);
      }
      damageEnemy(currentTarget, dmg, tower, isCrit);
      currX = currentTarget.x;
      currY = currentTarget.y;

      let nextCandidate = null;
      let bestDist = 2.5;
      state.enemies.forEach(e => {
        if (e.hp > 0 && !hitSet.has(e.id)) {
          const d = Math.hypot(e.x - currX, e.y - currY);
          if (d <= bestDist) {
            bestDist = d;
            nextCandidate = e;
          }
        }
      });
      if (nextCandidate) hitSet.add(nextCandidate.id);
      currentTarget = nextCandidate;
    }
  }

  function resolveProjectileHit(p) {
    const { target, tower, stats, type } = p;
    const isCrit = Math.random() < stats.critChance;
    let finalDmg = Math.round(stats.dmg * (isCrit ? getCritDmgMult() : 1));
    if (type === "cannon" && tower.level >= 10) finalDmg = Math.round(finalDmg * 1.6);
    PixelAudio.hit(isCrit);

    if (type === "cannon") {
      const splashRadius = TOWER_DEFS.cannon.splash * (tower.level >= 5 ? 1.4 : 1.0);
      spawnParticles(target.x, target.y, "#ff7b00", 14, 3.2);
      addShockwave(target.x, target.y, splashRadius, "#ff7b00");
      state.enemies.forEach(e => {
        if (e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) <= splashRadius) {
          damageEnemy(e, finalDmg, tower, isCrit);
          if (tower.level >= 5) {
            e.burnTimer = 3.0;
            e.burnDmg = Math.max(5, Math.round(finalDmg * 0.25));
          }
        }
      });
    } else if (type === "frost") {
      spawnParticles(target.x, target.y, "#00f0ff", 7, 1.9);
      target.slowTimer = TOWER_DEFS.frost.slowDuration;
      target.slowFactor = TOWER_DEFS.frost.slowAmount;
      if (tower.level >= 10 && Math.random() < 0.30) {
        target.freezeTimer = 1.25;
        addFloatingText(target.x, target.y - 0.4, "FREEZE!", "#00f0ff", 1.05);
      }
      damageEnemy(target, finalDmg, tower, isCrit);
    } else {
      spawnParticles(target.x, target.y, TOWER_DEFS[type].color, 6, 1.9);
      damageEnemy(target, finalDmg, tower, isCrit);
    }
  }

  function useSkill(skillName) {
    if (state.gameOver) return;
    const sk = state.skills[skillName];
    if (!sk || sk.cd > 0) return;

    sk.cd = sk.maxCd;
    PixelAudio.skill();

    if (skillName === "meteor") {
      state.screenShake = 0.6;
      const dmg = Math.round((90 + state.wave * 40) * getDmgMult());
      state.enemies.forEach(e => {
        if (e.hp > 0) {
          spawnParticles(e.x, e.y, "#ff7b00", 15, 3.8);
          addShockwave(e.x, e.y, 1.4, "#ff2a55");
          damageEnemy(e, dmg, null, true);
        }
      });
      showArcadeBanner("METEOR STRIKE!", "全場毀滅性流星轟炸！", "#ff7b00");
    } else if (skillName === "frenzy") {
      sk.active = 8.0;
      showArcadeBanner("OVERDRIVE FRENZY!", "全軍攻速翻倍・暴擊飆升 (8秒)", "#ffd700");
    } else if (skillName === "freeze") {
      sk.active = 5.0;
      showArcadeBanner("ABSOLUTE ZERO!", "全場魔物時間凍結・易傷+30%", "#00f0ff");
    }
    updateUI();
  }

  function drawPixelText(ctx, text, x, y, font, fill, stroke = "#000000", align = "center") {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillStyle = stroke;
    ctx.fillText(text, x - 2, y);
    ctx.fillText(text, x + 2, y);
    ctx.fillText(text, x, y - 2);
    ctx.fillText(text, x, y + 2);
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function renderGame() {
    if (!ctx || !canvas) return;
    const w = INTERNAL_W;
    const h = INTERNAL_H;

    ctx.save();
    if (state.screenShake > 0 && !reduceMotion) {
      const dx = Math.round((Math.random() - 0.5) * 8);
      const dy = Math.round((Math.random() - 0.5) * 8);
      ctx.translate(dx, dy);
    }

    if (bgCacheCanvas) {
      ctx.drawImage(bgCacheCanvas, 0, 0);
    }

    ctx.fillStyle = "rgba(255, 215, 0, 0.14)";
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];
      const mx = ((p1.c + p2.c) / 2 + 0.5) * CELL_SIZE;
      const my = ((p1.r + p2.r) / 2 + 0.5) * CELL_SIZE;
      ctx.fillRect(mx - 3, my - 3, 6, 6);
    }

    if (pathPoints.length >= 2) {
      const sp = pathPoints[0];
      const ep = pathPoints[pathPoints.length - 1];
      drawDemonPortal((sp.c + 0.5) * CELL_SIZE, (sp.r + 0.5) * CELL_SIZE);
      drawRoyalCastle((ep.c + 0.5) * CELL_SIZE, (ep.r + 0.5) * CELL_SIZE);
    }

    if (state.hoverCell && !state.selectedTowerInst) {
      const { c, r } = state.hoverCell;
      if (c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS) {
        const occupied = pathCells.has(`${c},${r}`) || state.towers.some(t => t.c === c && t.r === r);
        const def = TOWER_DEFS[state.selectedTowerType];
        const cx = (c + 0.5) * CELL_SIZE;
        const cy = (r + 0.5) * CELL_SIZE;

        ctx.beginPath();
        ctx.arc(cx, cy, def.range * CELL_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = occupied ? "rgba(255, 42, 85, 0.15)" : "rgba(0, 240, 255, 0.12)";
        ctx.fill();
        ctx.strokeStyle = occupied ? "#ff2a55" : "#00f0ff";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;
        ctx.strokeStyle = occupied ? "#ff2a55" : "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    }

    if (state.selectedTowerInst) {
      const t = state.selectedTowerInst;
      const st = getTowerStats(t);
      const cx = (t.c + 0.5) * CELL_SIZE;
      const cy = (t.r + 0.5) * CELL_SIZE;
      ctx.beginPath();
      ctx.arc(cx, cy, st.range * CELL_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 215, 0, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    state.towers.forEach(t => {
      const x = t.c * CELL_SIZE;
      const y = t.r * CELL_SIZE;
      const cx = x + CELL_SIZE / 2;
      const cy = y + CELL_SIZE / 2 - (t.recoil || 0) * 7;

      ctx.fillStyle = t.level >= 10 ? "#451a03" : (t.level >= 5 ? "#172554" : "#1e293b");
      ctx.fillRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
      ctx.strokeStyle = t.level >= 10 ? "#ffd700" : (t.level >= 5 ? "#00f0ff" : "#64748b");
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);

      if (state.skills.frenzy.active > 0) {
        ctx.strokeStyle = "#ffd700";
        ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }

      PixelSprites.drawMatrix(ctx, PixelSprites.TOWERS[t.type], cx, cy, CELL_SIZE * 0.78);

      ctx.fillStyle = "#000000";
      ctx.fillRect(x + 3, y + CELL_SIZE - 13, 24, 10);
      const lvColor = t.level >= 10 ? "#ffd700" : (t.level >= 5 ? "#00f0ff" : "#ffffff");
      ctx.fillStyle = lvColor;
      ctx.font = "bold 9px 'Press Start 2P', 'DotGothic16', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`L${t.level}`, x + 5, y + CELL_SIZE - 4);
    });

    state.enemies.forEach(e => {
      const ex = e.x * CELL_SIZE;
      const ey = e.y * CELL_SIZE;
      const sprList = PixelSprites.ENEMIES[e.type] || PixelSprites.ENEMIES.slime;
      const mat = sprList[e.animFrame % sprList.length];
      const sprSize = e.isBoss ? CELL_SIZE * 1.05 : CELL_SIZE * 0.72;

      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(ex - sprSize * 0.35, ey + sprSize * 0.32, sprSize * 0.7, 4);

      PixelSprites.drawMatrix(ctx, mat, ex, ey, sprSize, e.hitFlash > 0);

      if (e.freezeTimer > 0 || state.skills.freeze.active > 0) {
        ctx.fillStyle = "rgba(0, 240, 255, 0.45)";
        ctx.fillRect(ex - sprSize / 2, ey - sprSize / 2, sprSize, sprSize);
      }

      const bw = e.isBoss ? 44 : 28;
      const bh = e.isBoss ? 6 : 4;
      const bx = Math.floor(ex - bw / 2);
      const by = Math.floor(ey - sprSize / 2 - 7);
      ctx.fillStyle = "#000000";
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      const ratio = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = e.isBoss ? "#ff2a55" : (ratio > 0.5 ? "#10b981" : (ratio > 0.25 ? "#ffd700" : "#ff2a55"));
      ctx.fillRect(bx, by, Math.ceil(bw * ratio), bh);
    });

    state.shockwaves.forEach(sw => {
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sw.x * CELL_SIZE, sw.y * CELL_SIZE, sw.radius * CELL_SIZE, 0, Math.PI * 2);
      ctx.stroke();
    });

    state.projectiles.forEach(p => {
      const px = Math.floor(p.x * CELL_SIZE);
      const py = Math.floor(p.y * CELL_SIZE);
      ctx.fillStyle = "#000000";
      ctx.fillRect(px - 4, py - 4, 8, 8);
      ctx.fillStyle = TOWER_DEFS[p.type].color;
      ctx.fillRect(px - 3, py - 3, 6, 6);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(px - 1, py - 1, 2, 2);
    });

    state.lightningBeams.forEach(b => {
      ctx.strokeStyle = "#d946ef";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x1 * CELL_SIZE, b.y1 * CELL_SIZE);
      const midX = ((b.x1 + b.x2) / 2 + (Math.random() - 0.5) * 0.35) * CELL_SIZE;
      const midY = ((b.y1 + b.y2) / 2 + (Math.random() - 0.5) * 0.35) * CELL_SIZE;
      ctx.lineTo(midX, midY);
      ctx.lineTo(b.x2 * CELL_SIZE, b.y2 * CELL_SIZE);
      ctx.stroke();
    });

    state.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.floor(pt.x * CELL_SIZE), Math.floor(pt.y * CELL_SIZE), pt.size, pt.size);
    });

    state.floatingTexts.forEach(ft => {
      const px = Math.floor(ft.x * CELL_SIZE);
      const py = Math.floor(ft.y * CELL_SIZE);
      drawPixelText(
        ctx,
        ft.text,
        px,
        py,
        `bold ${Math.round(11 * ft.scale)}px 'DotGothic16', 'Press Start 2P', monospace`,
        ft.color
      );
    });

    const activeBoss = state.enemies.find(e => e.isBoss && e.hp > 0);
    if (activeBoss) {
      const barW = 360;
      const barH = 14;
      const bx = Math.floor((w - barW) / 2);
      const by = 8;
      ctx.fillStyle = "#090a10";
      ctx.fillRect(bx - 4, by - 4, barW + 8, barH + 8);
      ctx.strokeStyle = "#ff2a55";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 4, by - 4, barW + 8, barH + 8);

      const ratio = Math.max(0, activeBoss.hp / activeBoss.maxHp);
      ctx.fillStyle = "#ff2a55";
      ctx.fillRect(bx, by, Math.floor(barW * ratio), barH);

      drawPixelText(
        ctx,
        `BOSS: ${activeBoss.bossName} (${activeBoss.hp}/${activeBoss.maxHp})`,
        w / 2,
        by + 11,
        "bold 11px 'DotGothic16', monospace",
        "#ffffff"
      );
    }

    if (state.bannerTimer > 0) {
      const bannerH = 54;
      const by = Math.floor(h / 2 - bannerH / 2);
      ctx.fillStyle = "rgba(7, 8, 16, 0.88)";
      ctx.fillRect(0, by, w, bannerH);
      ctx.fillStyle = state.bannerColor;
      ctx.fillRect(0, by, w, 3);
      ctx.fillRect(0, by + bannerH - 3, w, 3);

      drawPixelText(
        ctx,
        state.bannerText,
        w / 2,
        by + 24,
        "bold 18px 'Press Start 2P', 'DotGothic16', monospace",
        state.bannerColor
      );
      drawPixelText(
        ctx,
        state.bannerSub,
        w / 2,
        by + 44,
        "bold 13px 'DotGothic16', monospace",
        "#ffffff"
      );
    }

    ctx.restore();
  }

  function drawDemonPortal(cx, cy) {
    const pulse = Math.sin(animTick * 6) * 3;
    ctx.fillStyle = "#4c0519";
    ctx.fillRect(cx - 16, cy - 16, 32, 32);
    ctx.fillStyle = "#ff2a55";
    ctx.fillRect(cx - 12 - pulse / 2, cy - 12 - pulse / 2, 24 + pulse, 24 + pulse);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(cx - 5, cy - 5, 10, 10);
    drawPixelText(ctx, "魔界入口", cx, cy + 16, "bold 10px 'DotGothic16', monospace", "#ff2a55");
  }

  function drawRoyalCastle(cx, cy) {
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(cx - 16, cy - 14, 32, 28);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(cx - 16, cy - 16, 6, 6);
    ctx.fillRect(cx - 3, cy - 16, 6, 6);
    ctx.fillRect(cx + 10, cy - 16, 6, 6);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(cx - 6, cy - 2, 12, 16);
    drawPixelText(ctx, "王國主堡", cx, cy + 16, "bold 10px 'DotGothic16', monospace", "#00f0ff");
  }

  function canvasPointFromEvent(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = evt.changedTouches && evt.changedTouches[0]
      ? evt.changedTouches[0]
      : (evt.touches && evt.touches[0] ? evt.touches[0] : evt);
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY
    };
  }

  let lastPointerAt = 0;
  function handleCanvasClick(evt) {
    PixelAudio.init();
    if (state.gameOver) return;
    const now = performance.now();
    if (evt.type === "click" && now - lastPointerAt < 400) return;
    if (evt.type === "touchend") lastPointerAt = now;
    if (evt.cancelable) evt.preventDefault();
    const { x, y } = canvasPointFromEvent(evt);
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);

    if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return;

    const existing = state.towers.find(t => t.c === c && t.r === r);
    if (existing) {
      if (state.selectedTowerInst && state.selectedTowerInst.id === existing.id) {
        state.selectedTowerInst = null;
      } else {
        state.selectedTowerInst = existing;
      }
      updateUI();
      return;
    }

    if (pathCells.has(`${c},${r}`)) {
      addFloatingText(c + 0.5, r + 0.5, "禁止建在路徑!", "#ff2a55", 1.0);
      return;
    }

    const def = TOWER_DEFS[state.selectedTowerType];
    if (!def) return;
    if (state.gold < def.cost) {
      addFloatingText(c + 0.5, r + 0.5, "金幣不足!", "#ff2a55", 1.0);
      return;
    }

    state.gold -= def.cost;
    const newTower = {
      id: Math.random().toString(36).slice(2),
      type: def.id,
      c, r,
      level: 1,
      invested: def.cost,
      totalDamage: 0,
      cooldown: 0,
      recoil: 0
    };
    state.towers.push(newTower);
    state.selectedTowerInst = newTower;
    PixelAudio.upgrade();
    spawnParticles(c + 0.5, r + 0.5, def.color, 12, 2.2);
    checkAchievements();
    updateUI();
  }

  function upgradeSelectedTower() {
    const t = state.selectedTowerInst;
    if (!t) return;
    const st = getTowerStats(t);
    if (state.gold < st.upgradeCost) {
      addFloatingText(t.c + 0.5, t.r + 0.3, "金幣不足!", "#ff2a55", 1.05);
      return;
    }
    state.gold -= st.upgradeCost;
    t.level++;
    t.invested += st.upgradeCost;
    PixelAudio.upgrade();
    spawnParticles(t.c + 0.5, t.r + 0.5, "#ffd700", 16, 2.8);
    addShockwave(t.c + 0.5, t.r + 0.5, 1.1, "#ffd700");
    addFloatingText(t.c + 0.5, t.r + 0.2, `LV.${t.level} 覺醒!`, "#ffd700", 1.2);
    if (t.level === 5 || t.level === 10) {
      showArcadeBanner(`${TOWER_DEFS[t.type].name} LV.${t.level}!`, t.level === 5 ? TOWER_DEFS[t.type].evo5 : TOWER_DEFS[t.type].evo10, "#00f0ff");
    }
    checkAchievements();
    updateUI();
  }

  function sellSelectedTower() {
    const t = state.selectedTowerInst;
    if (!t) return;
    const rate = state.waveActive ? 0.75 : 1.0;
    const refund = Math.round(t.invested * rate);
    state.gold += refund;
    state.towers = state.towers.filter(item => item.id !== t.id);
    state.selectedTowerInst = null;
    PixelAudio.coin();
    addFloatingText(t.c + 0.5, t.r + 0.4, `+${refund}G ${ rate === 1 ? '全額退費' : '回收' }`, "#ffd700", 1.1);
    updateUI();
  }

  function buyTech(techId) {
    const def = TECH_DEFS[techId];
    const curLv = savedData.tech[techId] || 0;
    const cost = Math.round(def.baseCost * Math.pow(def.costMult, curLv));
    if (savedData.gems < cost) {
      showToast("💎 靈魂結晶不足，擊殺首領或解鎖成就可獲得", "boss");
      return;
    }
    savedData.gems -= cost;
    savedData.tech[techId] = curLv + 1;
    if (techId === "castle") {
      state.maxHp = getMaxHp();
      state.hp += TECH_DEFS.castle.bonusPerLv;
    }
    writeSave();
    PixelAudio.upgrade();
    showToast(`🔮 永久科技【${def.name}】升至 Lv.${curLv + 1}！`, "ach");
    renderTechList();
    updateUI();
  }

  let toastTimeout = null;
  function showToast(msg, styleType = "ach") {
    const el = document.getElementById("toast-banner");
    if (!el) return;
    el.textContent = msg;
    el.className = "fixed top-14 right-3 z-50 px-3 py-2 pixel-box text-xs font-bold transition-all duration-150 ";
    if (styleType === "boss") el.className += "border-red-500 text-red-200";
    else if (styleType === "gold") el.className += "border-amber-400 text-amber-200";
    else if (styleType === "wave") el.className += "border-sky-400 text-sky-200";
    else el.className += "border-purple-400 text-purple-200";

    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-8px)";
    }, 3000);
  }

  function showGameOverModal() {
    const modal = document.getElementById("gameover-modal");
    if (!modal) return;
    if (state.wave > savedData.bestWave) {
      savedData.bestWave = state.wave;
    }
    writeSave();
    document.getElementById("go-wave").textContent = state.wave;
    document.getElementById("go-best").textContent = savedData.bestWave;
    document.getElementById("go-kills").textContent = state.totalKills;
    document.getElementById("go-dmg").textContent = state.totalDamage.toLocaleString();
    modal.classList.remove("hidden");
    pushUiHistory("gameover");
  }

  function hideGameOverModal() {
    const modal = document.getElementById("gameover-modal");
    if (modal) modal.classList.add("hidden");
    clearUiHistoryIf("gameover");
  }

  let shopSignature = "";
  function renderTowerShop(force = false) {
    const container = document.getElementById("tower-shop-list");
    if (!container) return;
    const signature = `${state.selectedTowerType}|${state.selectedTowerInst ? "1" : "0"}|${Object.values(TOWER_DEFS).map(d => state.gold >= d.cost ? "1" : "0").join("")}`;
    if (!force && signature === shopSignature && container.childElementCount > 0) return;
    shopSignature = signature;
    container.innerHTML = "";
    Object.values(TOWER_DEFS).forEach(def => {
      const btn = document.createElement("button");
      const isSelected = state.selectedTowerType === def.id && !state.selectedTowerInst;
      const canAfford = state.gold >= def.cost;
      btn.type = "button";
      btn.className = `pixel-card px-2 py-1.5 flex items-center gap-2 shrink-0 min-w-[136px] sm:min-w-[152px] ${isSelected ? 'selected' : ''} ${!canAfford ? 'opacity-60' : ''}`;
      btn.setAttribute("aria-label", `選擇${def.name}，費用 ${def.cost}`);
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
      btn.innerHTML = `
        <canvas class="tower-icon-canvas w-8 h-8 shrink-0 bg-black/50 border border-slate-700" width="32" height="32" aria-hidden="true"></canvas>
        <div class="text-left leading-tight flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <span class="font-bold text-xs truncate" style="color:${def.color}">[${def.key}]${def.shortName}</span>
            <span class="text-xs font-bold text-amber-300">$${def.cost}</span>
          </div>
          <div class="text-[10px] text-slate-300 truncate mt-0.5">${def.desc}</div>
          <div class="text-[10px] text-slate-400">ATK:${def.damage} RNG:${def.range}</div>
        </div>
      `;
      const iconCanvas = btn.querySelector("canvas");
      const ictx = iconCanvas.getContext("2d");
      ictx.imageSmoothingEnabled = false;
      PixelSprites.drawMatrix(ictx, PixelSprites.TOWERS[def.id], 16, 16, 26);

      btn.addEventListener("click", () => {
        state.selectedTowerType = def.id;
        state.selectedTowerInst = null;
        updateUI();
      });
      container.appendChild(btn);
    });
  }

  function renderTechList() {
    const container = document.getElementById("tech-list");
    if (!container) return;
    container.innerHTML = "";
    Object.values(TECH_DEFS).forEach(def => {
      const lv = savedData.tech[def.id] || 0;
      const cost = Math.round(def.baseCost * Math.pow(def.costMult, lv));
      const row = document.createElement("div");
      row.className = "pixel-card p-2.5 flex items-center justify-between gap-2";
      row.innerHTML = `
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs sm:text-sm text-purple-300">${def.name}</span>
            <span class="text-[11px] px-1.5 py-0.5 bg-purple-950 border border-purple-500 text-purple-200">LV.${lv}</span>
          </div>
          <p class="text-xs text-slate-300 mt-0.5">${def.desc}</p>
        </div>
        <button type="button" class="pixel-btn px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-xs font-bold text-white shrink-0">
          💎 ${cost} 升級
        </button>
      `;
      row.querySelector("button").addEventListener("click", () => buyTech(def.id));
      container.appendChild(row);
    });
  }

  function renderAchievementsList() {
    const container = document.getElementById("ach-list");
    if (!container) return;
    container.innerHTML = "";
    ACHIEVEMENTS.forEach(ach => {
      const unlocked = !!savedData.unlockedAch[ach.id];
      const card = document.createElement("div");
      card.className = `pixel-card p-2.5 flex items-center justify-between gap-2 ${unlocked ? 'border-amber-400 bg-amber-950/30' : 'opacity-65'}`;
      card.innerHTML = `
        <div>
          <div class="flex items-center gap-1.5">
            <span>${unlocked ? '🏆' : '🔒'}</span>
            <span class="font-bold text-xs sm:text-sm ${unlocked ? 'text-amber-300' : 'text-slate-300'}">${ach.name}</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">${ach.desc}</p>
        </div>
        <span class="text-xs font-bold px-2 py-1 ${unlocked ? 'bg-amber-500/20 text-amber-300 border border-amber-400' : 'bg-slate-800 text-purple-300'} shrink-0">
          ${unlocked ? '已達成' : `💎+${ach.rewardGems}`}
        </span>
      `;
      container.appendChild(card);
    });
  }

  function updateUI() {
    document.getElementById("hud-gold").textContent = state.gold.toLocaleString();
    document.getElementById("hud-gems").textContent = savedData.gems.toLocaleString();
    document.getElementById("hud-hp").textContent = `${state.hp}/${state.maxHp}`;
    document.getElementById("hud-wave").textContent = state.wave;
    document.getElementById("hud-best").textContent = savedData.bestWave;
    document.getElementById("hud-combo").textContent = state.combo > 1 ? `x${state.combo}` : "0";

    const nextWaveBtn = document.getElementById("btn-next-wave");
    if (nextWaveBtn) {
      nextWaveBtn.disabled = state.waveActive;
      nextWaveBtn.textContent = state.waveActive ? `⚔️ 第 ${state.wave} 波交戰中` : `▶️ 立即迎戰第 ${state.wave} 波`;
    }

    const autoWaveBtn = document.getElementById("btn-auto-wave");
    if (autoWaveBtn) {
      autoWaveBtn.textContent = `自動波次: ${state.autoWave ? '開啟' : '關閉'}`;
      autoWaveBtn.className = `pixel-btn px-2 py-1 text-[11px] font-bold ${state.autoWave ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'}`;
    }

    const autoUpBtn = document.getElementById("btn-auto-up");
    if (autoUpBtn) {
      autoUpBtn.textContent = `自動升塔: ${state.autoUpgrade ? '開啟' : '關閉'}`;
      autoUpBtn.className = `pixel-btn px-2 py-1 text-[11px] font-bold ${state.autoUpgrade ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-300'}`;
    }

    ["meteor", "frenzy", "freeze"].forEach(k => {
      const btn = document.getElementById(`skill-${k}`);
      const sk = state.skills[k];
      if (btn && sk) {
        btn.disabled = sk.cd > 0;
        const cdSpan = btn.querySelector(".skill-cd");
        if (cdSpan) {
          cdSpan.textContent = sk.cd > 0 ? `${Math.ceil(sk.cd)}s` : "就緒";
        }
      }
    });

    renderTowerShop();

    const inspEmpty = document.getElementById("inspector-empty");
    const inspDetail = document.getElementById("inspector-detail");
    if (state.selectedTowerInst) {
      const t = state.selectedTowerInst;
      const def = TOWER_DEFS[t.type];
      const st = getTowerStats(t);
      inspEmpty.classList.add("hidden");
      inspDetail.classList.remove("hidden");

      document.getElementById("insp-name").textContent = `${def.name} LV.${t.level}`;
      document.getElementById("insp-name").style.color = def.color;
      document.getElementById("insp-dmg").textContent = st.dmg;
      document.getElementById("insp-rate").textContent = `${(1 / st.fireRate).toFixed(1)}/s`;
      document.getElementById("insp-crit").textContent = `${Math.round(st.critChance * 100)}%`;
      document.getElementById("insp-total-dmg").textContent = (t.totalDamage || 0).toLocaleString();
      document.getElementById("insp-evo5").textContent = def.evo5;
      document.getElementById("insp-evo5").className = `text-[11px] ${t.level >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`;
      document.getElementById("insp-evo10").textContent = def.evo10;
      document.getElementById("insp-evo10").className = `text-[11px] ${t.level >= 10 ? 'text-amber-300 font-bold' : 'text-slate-400'}`;

      const upBtn = document.getElementById("btn-upgrade-tower");
      upBtn.textContent = `⬆️ 強化升級 ($${st.upgradeCost})`;
      upBtn.disabled = state.gold < st.upgradeCost;

      const sellBtn = document.getElementById("btn-sell-tower");
      const refundRate = state.waveActive ? 0.75 : 1.0;
      sellBtn.textContent = `♻️ ${state.waveActive ? '回收' : '無損拆塔'} (+$${Math.round(t.invested * refundRate)})`;
    } else {
      inspEmpty.classList.remove("hidden");
      inspDetail.classList.add("hidden");
      const def = TOWER_DEFS[state.selectedTowerType];
      const phaseText = state.waveActive ? `⚔️ 第 ${state.wave} 波防守中` : `🛡️ 戰前準備中（不限時、拆塔100%退費）`;
      document.getElementById("selected-build-tip").textContent = `${phaseText}｜建造【${def.name} $${def.cost}】— 佈陣完畢請按右下角【迎戰】`;
    }
  }

  let lastTime = 0;
  let reduceMotion = false;
  function gameLoop(ts) {
    const dt = Math.min(0.1, (ts - lastTime) / 1000 || 0.016);
    lastTime = ts;
    if (isBlockingModalOpen()) {
      renderGame();
      requestAnimationFrame(gameLoop);
      return;
    }
    updateGame(dt);
    renderGame();
    requestAnimationFrame(gameLoop);
  }

  const UI_HISTORY_KEY = "pixel-endless-td-ui";
  let uiHistoryKind = null;
  let ignoringPopstate = false;

  function isBlockingModalOpen() {
    const drawer = document.getElementById("rpg-drawer-modal");
    const start = document.getElementById("start-screen-modal");
    const over = document.getElementById("gameover-modal");
    return (drawer && !drawer.classList.contains("hidden"))
      || (start && !start.classList.contains("hidden"))
      || (over && !over.classList.contains("hidden"));
  }

  function setTabHighlight(activeTabId) {
    document.querySelectorAll(".tab-btn").forEach(b => {
      const isActive = b.getAttribute("data-tab") === activeTabId;
      b.classList.toggle("bg-amber-400", isActive);
      b.classList.toggle("text-slate-950", isActive);
      b.classList.toggle("bg-slate-800", !isActive);
      b.classList.toggle("text-slate-200", !isActive);
      b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function pushUiHistory(kind) {
    if (uiHistoryKind === kind) return;
    uiHistoryKind = kind;
    try {
      history.pushState({ [UI_HISTORY_KEY]: kind }, "");
    } catch (e) {}
  }

  function clearUiHistoryIf(kind) {
    if (uiHistoryKind !== kind) return;
    uiHistoryKind = null;
    ignoringPopstate = true;
    try {
      if (history.state && history.state[UI_HISTORY_KEY] === kind) {
        history.back();
      }
    } catch (e) {}
    setTimeout(() => { ignoringPopstate = false; }, 0);
  }

  function closeDrawer(options = {}) {
    const drawerModal = document.getElementById("rpg-drawer-modal");
    if (!drawerModal) return;
    drawerModal.classList.add("hidden");
    setTabHighlight("tab-shop");
    if (!options.keepHistory) clearUiHistoryIf("drawer");
  }

  function openDrawer(targetId) {
    const drawerModal = document.getElementById("rpg-drawer-modal");
    if (!drawerModal) return;
    drawerModal.classList.remove("hidden");
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.remove("hidden");
    setTabHighlight(targetId);
    pushUiHistory("drawer");
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
  }

  window.addEventListener("load", () => {
    reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    canvas = document.getElementById("td-canvas");
    canvas.width = INTERNAL_W;
    canvas.height = INTERNAL_H;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    buildPath(currentMapKey);

    canvas.addEventListener("mousemove", e => {
      const { x, y } = canvasPointFromEvent(e);
      state.hoverCell = { c: Math.floor(x / CELL_SIZE), r: Math.floor(y / CELL_SIZE) };
    });
    canvas.addEventListener("mouseleave", () => { state.hoverCell = null; });
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchend", handleCanvasClick, { passive: false });

    document.getElementById("btn-next-wave").addEventListener("click", startNextWave);
    document.getElementById("btn-auto-wave").addEventListener("click", () => {
      state.autoWave = !state.autoWave;
      updateUI();
    });
    document.getElementById("btn-auto-up").addEventListener("click", () => {
      state.autoUpgrade = !state.autoUpgrade;
      updateUI();
    });
    document.getElementById("btn-speed").addEventListener("click", e => {
      state.speedMult = state.speedMult === 1 ? 2 : (state.speedMult === 2 ? 3 : 1);
      e.currentTarget.textContent = `⏩ 速度: ${state.speedMult}x`;
    });
    document.getElementById("btn-pause").addEventListener("click", e => {
      state.paused = !state.paused;
      e.currentTarget.textContent = state.paused ? "▶️ 繼續" : "⏸️ 暫停";
      e.currentTarget.setAttribute("aria-pressed", state.paused ? "true" : "false");
    });
    document.getElementById("btn-sfx").addEventListener("click", e => {
      const muted = PixelAudio.toggleMute();
      e.currentTarget.textContent = muted ? "🔇 音效: 關" : "🔊 音效: 開";
      e.currentTarget.setAttribute("aria-pressed", muted ? "true" : "false");
    });
    document.getElementById("btn-bgm").addEventListener("click", e => {
      const playing = PixelAudio.toggleBgm();
      e.currentTarget.textContent = playing ? "🎵 音樂: 開" : "🎵 音樂: 關";
      e.currentTarget.setAttribute("aria-pressed", playing ? "true" : "false");
    });

    document.getElementById("map-select").addEventListener("change", e => {
      resetGame(e.target.value);
    });
    document.getElementById("btn-restart").addEventListener("click", () => resetGame());
    document.getElementById("btn-modal-restart").addEventListener("click", () => {
      hideGameOverModal();
      resetGame();
    });

    document.getElementById("btn-upgrade-tower").addEventListener("click", upgradeSelectedTower);
    document.getElementById("btn-sell-tower").addEventListener("click", sellSelectedTower);
    document.getElementById("btn-deselect-tower").addEventListener("click", () => {
      state.selectedTowerInst = null;
      updateUI();
    });

    document.getElementById("skill-meteor").addEventListener("click", () => useSkill("meteor"));
    document.getElementById("skill-frenzy").addEventListener("click", () => useSkill("frenzy"));
    document.getElementById("skill-freeze").addEventListener("click", () => useSkill("freeze"));

    const drawerModal = document.getElementById("rpg-drawer-modal");
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab");
        if (targetId === "tab-shop") {
          closeDrawer();
        } else {
          openDrawer(targetId);
        }
      });
    });

    document.getElementById("btn-close-drawer").addEventListener("click", () => closeDrawer());
    if (drawerModal) {
      drawerModal.addEventListener("click", e => {
        if (e.target === drawerModal) closeDrawer();
      });
      const drawerPanel = document.getElementById("rpg-drawer-panel");
      if (drawerPanel) {
        drawerPanel.addEventListener("click", e => e.stopPropagation());
      }
    }

    window.addEventListener("popstate", () => {
      if (ignoringPopstate) return;
      const startModal = document.getElementById("start-screen-modal");
      if (drawerModal && !drawerModal.classList.contains("hidden")) {
        closeDrawer({ keepHistory: true });
        uiHistoryKind = null;
        return;
      }
      const over = document.getElementById("gameover-modal");
      if (over && !over.classList.contains("hidden")) {
        // Keep game-over visible; back should not dismiss permanent defeat without restart
        uiHistoryKind = null;
        return;
      }
      if (startModal && !startModal.classList.contains("hidden")) {
        uiHistoryKind = null;
      }
    });

    window.addEventListener("keydown", e => {
      if (isTypingTarget(e.target)) return;
      const startOpen = (() => {
        const m = document.getElementById("start-screen-modal");
        return m && !m.classList.contains("hidden");
      })();
      if (startOpen) return;

      if (e.key === "Escape") {
        if (drawerModal && !drawerModal.classList.contains("hidden")) {
          closeDrawer();
          return;
        }
        state.selectedTowerInst = null;
        updateUI();
        return;
      }

      if (isBlockingModalOpen()) return;

      if (e.key === "1") { state.selectedTowerType = "archer"; state.selectedTowerInst = null; updateUI(); }
      if (e.key === "2") { state.selectedTowerType = "cannon"; state.selectedTowerInst = null; updateUI(); }
      if (e.key === "3") { state.selectedTowerType = "frost"; state.selectedTowerInst = null; updateUI(); }
      if (e.key === "4") { state.selectedTowerType = "tesla"; state.selectedTowerInst = null; updateUI(); }
      if (e.key === "5") { state.selectedTowerType = "sniper"; state.selectedTowerInst = null; updateUI(); }
      if (e.key.toLowerCase() === "q") useSkill("meteor");
      if (e.key.toLowerCase() === "w") useSkill("frenzy");
      if (e.key.toLowerCase() === "e") useSkill("freeze");
      if (e.key === " ") { e.preventDefault(); startNextWave(); }
    });

    const startModal = document.getElementById("start-screen-modal");
    const startMapSel = document.getElementById("start-map-select");
    const topMapSel = document.getElementById("map-select");
    document.getElementById("btn-start-game").addEventListener("click", () => {
      PixelAudio.init();
      PixelAudio.upgrade();
      const chosenMap = startMapSel ? startMapSel.value : "plains";
      if (topMapSel) topMapSel.value = chosenMap;
      resetGame(chosenMap);
      if (startModal) startModal.classList.add("hidden");
      clearUiHistoryIf("start");
    });

    if (startModal && !startModal.classList.contains("hidden")) {
      pushUiHistory("start");
    }

    renderTechList();
    renderAchievementsList();
    resetGame("plains");
    setTabHighlight("tab-shop");
    requestAnimationFrame(gameLoop);
  });
})();
