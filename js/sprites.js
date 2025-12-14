// 12x12 高精細像素精靈圖與環境貼圖引擎 (Procedural 16-Bit Pixel Art)
window.PixelSprites = (function() {
  const PALETTE = {
    '.': null,
    'W': '#ffffff',
    'K': '#090a10',
    'G': '#22c55e', // Bright Green
    'g': '#15803d', // Forest Green
    'd': '#0f5132', // Deep Green
    'L': '#86efac', // Mint Green
    'R': '#ff2a55', // Crimson Red
    'r': '#991b1b', // Dark Red
    'O': '#ff7b00', // Flame Orange
    'Y': '#ffd700', // Gold
    'y': '#b45309', // Bronze/Wood
    'w': '#78350f', // Dark Wood
    'B': '#00f0ff', // Ice Cyan
    'b': '#0284c7', // Ocean Blue
    'n': '#1e3a8a', // Navy Blue
    'P': '#d946ef', // Neon Purple
    'p': '#6b21a8', // Dark Purple
    'S': '#cbd5e1', // Light Steel
    's': '#64748b', // Mid Steel
    'k': '#334155', // Dark Slate
    'C': '#fde047', // Bright Yellow
    'M': '#f43f5e'  // Ruby Core
  };

  // 12x12 Detailed Pixel Towers
  const TOWERS = {
    archer: [
      "....YYYY....",
      "...YWWWWY...",
      "..YyGGGGyY..",
      ".YyGLLLLGyY.",
      "..y.sSSs.y..",
      "...sSGGSs...",
      "...sSGGSs...",
      "..wySSSSyw..",
      ".wyySSSSyyw.",
      ".w.sSSSSs.w.",
      "..kkkkkkkk..",
      ".KKKKKKKKKK."
    ],
    cannon: [
      "....KKKK....",
      "...KSSSSK...",
      "..KSSRRSSK..",
      ".KSRROORRSK.",
      ".KSRROORRSK.",
      "..KSSRRSSK..",
      "...kSSSSk...",
      "..yyYYYYyy..",
      ".wykkkkkkyw.",
      ".wkkkkkkkkw.",
      ".KKKKKKKKKK.",
      "............"
    ],
    frost: [
      ".....BB.....",
      "....BWWB....",
      "...BWBBWB...",
      "..BWBBBBWB..",
      ".BWWBWWBWWB.",
      "..bBBBBBBb..",
      "...nBBBBn...",
      "..snbBBbns..",
      ".ssnBBBBnss.",
      ".s.nBBBBn.s.",
      "..kkkkkkkk..",
      ".KKKKKKKKKK."
    ],
    tesla: [
      "....YYYY....",
      "...YWWWWY...",
      "....PPPP....",
      ".YY.PWWP.YY.",
      "YWWPPWWPPWWY",
      ".YY.PPPP.YY.",
      "...sPPPPs...",
      "..ksSSSSsk..",
      "..kYYYYYYk..",
      ".skSSSSSSks.",
      "..kkkkkkkk..",
      ".KKKKKKKKKK."
    ],
    sniper: [
      ".....YY.....",
      "....YWWY....",
      "....YMMY....",
      "...YMMMMY...",
      "..yYYYYYYy..",
      "..ySMMMMSy..",
      ".yySYYYYSyy.",
      ".y.sSMMSs.y.",
      "..ysYYYYsy..",
      ".yySSSSSSyy.",
      ".YYYYYYYYYY.",
      ".KKKKKKKKKK."
    ]
  };

  // 10x10 Animated Enemies (2 frames each)
  const ENEMIES = {
    slime: [
      [
        "..........",
        "...GGGG...",
        "..GLLLLG..",
        ".GLLLLLLG.",
        "GLKW..WKLG",
        "GLK....KLG",
        "GGGGGGGGGG",
        "GggggggggG",
        ".gggggggg.",
        ".........."
      ],
      [
        "..........",
        "..........",
        "...GGGG...",
        "..GLLLLG..",
        "GLKW..WKLG",
        "GLK....KLG",
        "GGGGGGGGGG",
        "gggggggggg",
        ".dddddddd.",
        ".........."
      ]
    ],
    goblin: [
      [
        "...GGGG...",
        "..GYYYYG..",
        "GG.K..K.GG",
        "..GGGGGG..",
        "...yyyy...",
        "..yYYYYy..",
        ".y.yyyy.y.",
        "...G..G...",
        "..y....y..",
        ".........."
      ],
      [
        "...GGGG...",
        "..GYYYYG..",
        "GG.K..K.GG",
        "..GGGGGG..",
        "...yyyy...",
        "..yYYYYy..",
        ".y.yyyy.y.",
        "..G....G..",
        "...y..y...",
        ".........."
      ]
    ],
    orc: [
      [
        "...SSSS...",
        "..SRRRRS..",
        ".SSKWWKSS.",
        ".gggggggg.",
        "ggSSSSSSgg",
        "gSSSSSSSSg",
        ".sSSSSSSs.",
        "..g.ss.g..",
        "..s....s..",
        ".........."
      ],
      [
        "...SSSS...",
        "..SRRRRS..",
        ".SSKWWKSS.",
        ".gggggggg.",
        "ggSSSSSSgg",
        "gSSSSSSSSg",
        ".sSSSSSSs.",
        "...gssg...",
        "...s..s...",
        ".........."
      ]
    ],
    necro: [
      [
        "...pppp...",
        "..pPPPPp..",
        ".ppKMMKpp.",
        "..ppPPpp..",
        ".pppMMppp.",
        "pPPPPPPPPp",
        "p.pppppp.p",
        "..pppppp..",
        "...p..p...",
        ".........."
      ],
      [
        "...pppp...",
        "..pPPPPp..",
        ".ppKWWKpp.",
        "..ppPPpp..",
        ".pppMMppp.",
        "pPPPPPPPPp",
        "p.pppppp.p",
        "..pppppp..",
        "..p....p..",
        ".........."
      ]
    ],
    mimic: [
      [
        ".YYYYYYYY.",
        "YyyyyyyyyY",
        "YWWWWWWWWY",
        "YRRRRRRRRY",
        "YYYYYYYYYY",
        "YyYYYYYYyY",
        "YyyyyyyyyY",
        ".YYYYYYYY.",
        "..........",
        ".........."
      ],
      [
        "YYYYYYYYYY",
        "YyyyyyyyyY",
        "YWKWWWWKWY",
        "YRRRRRRRRY",
        "YWWWWWWWWY",
        "YYYYYYYYYY",
        "YyYYYYYYyY",
        ".YYYYYYYY.",
        "..........",
        ".........."
      ]
    ],
    boss: [
      [
        "R..RRRR..R",
        "RRrRRRRrRR",
        ".RRRRRRRR.",
        " RYYRRYYR ",
        "RRRRRRRRRR",
        "rROOOOOORr",
        "rROWWWOORr",
        ".rRRRRRRr.",
        "..RR..RR..",
        ".KK....KK."
      ],
      [
        "R..RRRR..R",
        "RRrRRRRrRR",
        ".RRRRRRRR.",
        " RWWROOWR ",
        "RRRRRRRRRR",
        "rROOOOOORr",
        "rROWWWOORr",
        ".rRRRRRRr.",
        ".RR....RR.",
        "KK......KK"
      ]
    ]
  };

  function drawMatrix(ctx, matrix, x, y, size, flashWhite = false) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const px = size / cols;
    const py = size / rows;
    const startX = x - size / 2;
    const startY = y - size / 2;

    for (let r = 0; r < rows; r++) {
      const rowStr = matrix[r];
      for (let c = 0; c < cols; c++) {
        const ch = rowStr[c];
        const color = PALETTE[ch];
        if (color) {
          ctx.fillStyle = flashWhite ? '#ffffff' : color;
          ctx.fillRect(
            Math.floor(startX + c * px),
            Math.floor(startY + r * py),
            Math.ceil(px),
            Math.ceil(py)
          );
        }
      }
    }
  }

  return {
    TOWERS,
    ENEMIES,
    drawMatrix
  };
})();
