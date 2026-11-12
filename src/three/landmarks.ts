export type SkylineKind = 'dubai' | 'paris';
export type SkylineLayer = 'far' | 'mid' | 'near';

export type SkylineLayerSpec = {
  layer: SkylineLayer;
  depth: number;
  worldWidth: number;
  worldHeight: number;
  opacity: number;
};

export const SKYLINE_LAYERS: Record<SkylineKind, SkylineLayerSpec[]> = {
  dubai: [
    { layer: 'far', depth: 1200, worldWidth: 1800, worldHeight: 112, opacity: 0.78 },
    { layer: 'mid', depth: 980, worldWidth: 1600, worldHeight: 128, opacity: 0.92 },
    { layer: 'near', depth: 760, worldWidth: 1400, worldHeight: 146, opacity: 1 },
  ],
  paris: [
    { layer: 'far', depth: 1200, worldWidth: 1800, worldHeight: 110, opacity: 0.78 },
    { layer: 'mid', depth: 980, worldWidth: 1600, worldHeight: 126, opacity: 0.92 },
    { layer: 'near', depth: 760, worldWidth: 1400, worldHeight: 144, opacity: 1 },
  ],
};

const VIEW_HEIGHT = 1000;
const BURJ_CENTER = 120;
const BURJ_VIEW_WIDTH = 240;
const BURJ_TIERS = [
  { hw: 32, y0: 1000, y1: 860 },
  { hw: 28, y0: 860, y1: 740 },
  { hw: 24, y0: 740, y1: 630 },
  { hw: 20, y0: 630, y1: 530 },
  { hw: 16, y0: 530, y1: 440 },
  { hw: 12.5, y0: 440, y1: 355 },
  { hw: 9.5, y0: 355, y1: 280 },
  { hw: 7, y0: 280, y1: 210 },
  { hw: 5, y0: 210, y1: 150 },
  { hw: 3.2, y0: 150, y1: 100 },
];

export const BURJ_KHALIFA = {
  viewWidth: BURJ_VIEW_WIDTH,
  tiers: BURJ_TIERS.map(({ hw, y0, y1 }) => [BURJ_CENTER - hw, y0, BURJ_CENTER + hw, y0, BURJ_CENTER + hw, y1, BURJ_CENTER - hw, y1]),
  spire: [BURJ_CENTER - 1.6, 100, BURJ_CENTER + 1.6, 100, BURJ_CENTER, 12],
};

export const BURJ_AL_ARAB = {
  viewWidth: 360,
  polygons: [
    // island/base platform
    [20, 1000, 340, 1000, 320, 968, 40, 968],
    [56, 968, 304, 968, 292, 946, 68, 946],
    // main sail building (iconic curved sail silhouette)
    [
      78, 946,
      92, 820,
      108, 700,
      128, 590,
      154, 500,
      186, 430,
      222, 388,
      246, 420,
      262, 480,
      276, 560,
      286, 660,
      294, 760,
      296, 860,
      286, 946,
    ],
    // atrium/inner wall inset
    [
      120, 946,
      132, 820,
      148, 700,
      168, 610,
      194, 540,
      224, 490,
      244, 520,
      258, 600,
      268, 700,
      274, 820,
      272, 946,
    ],
    // mast
    [52, 946, 52, 220, 66, 220, 70, 946],
    // mast taper top
    [54, 220, 64, 220, 62, 150, 56, 150],
    // upper cantilever support
    [66, 360, 122, 334, 126, 348, 70, 374],
    // helipad deck
    [110, 316, 188, 306, 192, 324, 114, 334],
    // helipad edge/rail
    [108, 306, 190, 296, 194, 306, 112, 316],
  ],
};

export const EIFFEL_TOWER = {
  viewWidth: 460,
  polygons: [
    // base legs with arch
    [34, 1000, 120, 1000, 152, 760, 178, 560, 186, 520, 164, 560, 138, 760, 108, 1000],
    [426, 1000, 340, 1000, 308, 760, 282, 560, 274, 520, 296, 560, 322, 760, 352, 1000],
    // lower platform
    [140, 560, 320, 560, 312, 520, 148, 520],
    // middle section
    [160, 520, 300, 520, 284, 380, 176, 380],
    // middle platform
    [164, 380, 296, 380, 290, 350, 170, 350],
    // upper section
    [182, 350, 278, 350, 254, 220, 206, 220],
    // top platform
    [200, 220, 260, 220, 256, 200, 204, 200],
    // top shaft and spire
    [212, 200, 248, 200, 242, 90, 238, 40, 230, 8, 222, 40, 218, 90],
    // base beam
    [92, 980, 368, 980, 360, 960, 100, 960],
  ],
  lattice: [
    // left base lattice
    [60, 990, 118, 820],
    [118, 990, 78, 820],
    [78, 820, 138, 660],
    [138, 820, 100, 660],
    [100, 660, 158, 560],
    [158, 660, 130, 560],
    // right base lattice (mirrored)
    [400, 990, 342, 820],
    [342, 990, 382, 820],
    [382, 820, 322, 660],
    [322, 820, 360, 660],
    [360, 660, 302, 560],
    [302, 660, 330, 560],
    // arch curve hint
    [152, 760, 230, 820],
    [308, 760, 230, 820],
    [178, 560, 230, 620],
    [282, 560, 230, 620],
    // middle lattice
    [170, 520, 210, 430],
    [210, 520, 180, 430],
    [250, 520, 280, 430],
    [280, 520, 250, 430],
    [190, 430, 220, 360],
    [220, 430, 200, 360],
    [240, 430, 260, 360],
    [270, 430, 240, 360],
    // upper lattice
    [194, 350, 216, 270],
    [216, 350, 198, 270],
    [244, 350, 262, 270],
    [266, 350, 244, 270],
    [208, 270, 224, 210],
    [224, 270, 212, 210],
    [236, 270, 248, 210],
    [252, 270, 236, 210],
    // top shaft
    [220, 190, 240, 120],
    [240, 190, 220, 120],
    [224, 120, 236, 50],
    [236, 120, 224, 50],
  ],
};

const PANTHEON_CENTER = 260;
const PANTHEON_COLUMNS = [175, 209, 243, 277, 311, 345].map((x) => [x - 7, 860, x + 7, 860, x + 7, 760, x - 7, 760]);
const PANTHEON_DRUM_COLUMNS = [175, 199, 223, 247, 271, 295, 319, 343].map((x) => [x - 4, 668, x + 4, 668, x + 4, 432, x - 4, 432]);
const PANTHEON_DOME: number[] = [];
for (let i = 0; i <= 14; i += 1) {
  const angle = Math.PI - (i / 14) * Math.PI;
  PANTHEON_DOME.push(260 + Math.cos(angle) * 105, 395 - Math.sin(angle) * 118);
}

export const PANTHEON = {
  viewWidth: 520,
  polygons: [
    [70, 1000, 450, 1000, 450, 975, 70, 975],
    [90, 975, 430, 975, 430, 860, 90, 860],
    ...PANTHEON_COLUMNS,
    [100, 760, 420, 760, 420, 735, 100, 735],
    [100, 735, 420, 735, 260, 670],
    [165, 670, 355, 670, 355, 420, 165, 420],
    ...PANTHEON_DRUM_COLUMNS,
    [155, 420, 365, 420, 365, 395, 155, 395],
    PANTHEON_DOME,
    [248, 275, 272, 275, 272, 220, 248, 220],
    [242, 220, 278, 220, 260, 190],
  ],
  center: PANTHEON_CENTER,
};

export const LANDMARK_PATHS = {
  burjKhalifa: BURJ_KHALIFA,
  burjAlArab: BURJ_AL_ARAB,
  eiffelTower: EIFFEL_TOWER,
  pantheon: PANTHEON,
} as const;

type Palette = {
  fill: string;
  accent: string;
  window?: string;
};

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paletteFor(kind: SkylineKind, layer: SkylineLayer): Palette {
  if (kind === 'dubai') {
    if (layer === 'far') return { fill: '#4f6fe0', accent: '#9ec0ff', window: 'rgba(255,220,140,0.55)' };
    if (layer === 'mid') return { fill: '#3452c9', accent: '#7fd4ff', window: 'rgba(255,214,120,0.78)' };
    return { fill: '#1f3ea8', accent: '#52e0ff', window: 'rgba(255,230,150,0.98)' };
  }
  if (layer === 'far') return { fill: '#caa07a', accent: '#ffd9a8', window: 'rgba(255,220,150,0.5)' };
  if (layer === 'mid') return { fill: '#b07a55', accent: '#ffc98a', window: 'rgba(255,210,140,0.75)' };
  return { fill: '#8a5638', accent: '#ffcf8c', window: 'rgba(255,226,160,0.98)' };
}

function fillPolygon(ctx: CanvasRenderingContext2D, points: number[], fill: string) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function placeLandmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  viewWidth: number,
  draw: () => void,
  widthFactor = 1,
  heightFactor = 1,
) {
  const scale = height / VIEW_HEIGHT;
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale * widthFactor, scale * heightFactor);
  ctx.translate(-viewWidth / 2, -VIEW_HEIGHT);
  draw();
  ctx.restore();
}

function drawBurjKhalifa(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number, color: string, accent: string) {
  placeLandmark(ctx, x, baseY, height, BURJ_VIEW_WIDTH, () => {
    BURJ_KHALIFA.tiers.forEach((tier) => fillPolygon(ctx, tier, color));
    fillPolygon(ctx, BURJ_KHALIFA.spire, color);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(BURJ_CENTER - 3, 120, 2.4, 840);
    ctx.globalAlpha = 1;
  });
}

function drawBurjAlArab(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number, color: string, accent: string) {
  placeLandmark(ctx, x, baseY, height, BURJ_AL_ARAB.viewWidth, () => {
    // base, mast, deck, helipad (non-sail polygons)
    BURJ_AL_ARAB.polygons.forEach((polygon, idx) => {
      fillPolygon(ctx, polygon, idx === 3 ? accent : color);
    });

    // sail front edge highlight (curved membrane)
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(84, 946);
    ctx.quadraticCurveTo(116, 740, 156, 560);
    ctx.quadraticCurveTo(190, 440, 222, 388);
    ctx.stroke();

    // right/back sail edge
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(222, 388);
    ctx.quadraticCurveTo(272, 520, 290, 720);
    ctx.quadraticCurveTo(296, 840, 286, 946);
    ctx.stroke();

    // inner atrium curve
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(126, 946);
    ctx.quadraticCurveTo(150, 760, 184, 620);
    ctx.quadraticCurveTo(208, 530, 236, 498);
    ctx.quadraticCurveTo(262, 640, 272, 946);
    ctx.stroke();

    // horizontal structural bands on sail
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 2;
    const bands = [860, 780, 700, 620, 540, 470];
    bands.forEach((y, i) => {
      const t = (946 - y) / (946 - 388);
      const x1 = 84 + t * 138 - (i < 2 ? 6 : 2);
      const x2 = 286 - t * 64 + (i < 2 ? 4 : 0);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    });

    // mast/helipad details
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(59, 946);
    ctx.lineTo(59, 160);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(59, 348);
    ctx.lineTo(150, 316);
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.strokeRect(112, 308, 76, 18);
    ctx.beginPath();
    ctx.moveTo(150, 308);
    ctx.lineTo(150, 296);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(150, 317, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }, 0.78, 1.15);
}

function drawEiffel(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number, color: string, accent: string) {
  placeLandmark(ctx, x, baseY, height, EIFFEL_TOWER.viewWidth, () => {
    EIFFEL_TOWER.polygons.forEach((polygon) => fillPolygon(ctx, polygon, color));

    // structural outline
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 4;
    const outline = [34, 1000, 120, 1000, 152, 760, 178, 560, 186, 520, 176, 380, 182, 350, 206, 220, 212, 200, 218, 90, 222, 40, 230, 8, 238, 40, 242, 90, 248, 200, 254, 220, 278, 350, 284, 380, 274, 520, 282, 560, 308, 760, 340, 1000, 426, 1000];
    ctx.beginPath();
    ctx.moveTo(outline[0], outline[1]);
    for (let i = 2; i < outline.length; i += 2) ctx.lineTo(outline[i], outline[i + 1]);
    ctx.closePath();
    ctx.stroke();

    // lattice
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2.4;
    EIFFEL_TOWER.lattice.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // platforms highlight
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 3;
    [[140, 560, 320, 560], [148, 520, 312, 520], [164, 380, 296, 380], [170, 350, 290, 350], [200, 220, 260, 220], [204, 200, 256, 200]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // arch
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(152, 760);
    ctx.quadraticCurveTo(230, 900, 308, 760);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }, 0.82, 1);
}

function drawPantheon(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number, color: string, accent: string) {
  placeLandmark(ctx, x, baseY, height, PANTHEON.viewWidth, () => {
    PANTHEON.polygons.forEach((polygon) => fillPolygon(ctx, polygon, color));
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 3;
    for (let i = 1; i < 6; i += 1) {
      const angle = Math.PI * (i / 6);
      const dx = Math.cos(angle) * 103;
      const dy = Math.sin(angle) * 112;
      ctx.beginPath();
      ctx.moveTo(PANTHEON.center, 395);
      ctx.quadraticCurveTo(PANTHEON.center + dx * 0.55, 395 - dy - 8, PANTHEON.center + dx, 395 - dy);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = accent;
    ctx.fillRect(PANTHEON.center - 3, 190, 6, 210);
    ctx.fillRect(178, 742, 164, 4);
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(PANTHEON.center, 188, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawFillers(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  kind: SkylineKind,
  layer: SkylineLayer,
  mobile: boolean,
  palette: Palette,
  canvasHeight: number,
) {
  const rand = mulberry32(kind === 'dubai' ? 1301 + layer.length * 37 : 2903 + layer.length * 53);
  const count = mobile ? 20 : layer === 'far' ? 44 : 36;
  const isNear = layer === 'near';
  let x = -80;
  for (let i = 0; i < count; i += 1) {
    const buildingWidth = kind === 'dubai' ? 16 + rand() * 38 : 22 + rand() * 56;
    const ratio = kind === 'dubai' ? 0.14 + rand() * 0.4 : 0.08 + rand() * 0.22;
    const buildingHeight = canvasHeight * ratio * (layer === 'far' ? 0.9 : 1.04);
    const bx = x;
    const by = baseY - buildingHeight;

    const grad = ctx.createLinearGradient(bx, by, bx, baseY);
    if (kind === 'dubai') {
      grad.addColorStop(0, palette.accent);
      grad.addColorStop(0.35, palette.fill);
      grad.addColorStop(1, layer === 'far' ? '#3550b8' : '#162a78');
    } else {
      grad.addColorStop(0, palette.accent);
      grad.addColorStop(0.4, palette.fill);
      grad.addColorStop(1, layer === 'far' ? '#8b6246' : '#5a3524');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(bx, by, buildingWidth, buildingHeight);

    ctx.fillStyle = kind === 'dubai' ? 'rgba(200,235,255,0.18)' : 'rgba(255,240,210,0.16)';
    ctx.fillRect(bx, by, Math.max(2, buildingWidth * 0.08), buildingHeight);

    if (kind === 'dubai') {
      if (rand() > 0.45) {
        const capH = 8 + rand() * 18;
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(bx + buildingWidth * 0.18, by - capH, buildingWidth * 0.64, capH);
        ctx.globalAlpha = 1;
      }
      if (rand() > 0.6) {
        const spireH = 18 + rand() * 30;
        const spireW = Math.max(2, buildingWidth * 0.08);
        ctx.fillStyle = palette.accent;
        ctx.fillRect(bx + buildingWidth * 0.46, by - spireH, spireW, spireH);
        if (isNear) {
          ctx.fillStyle = 'rgba(120,240,255,0.95)';
          ctx.fillRect(bx + buildingWidth * 0.46 - 1, by - spireH - 2, spireW + 2, 2);
        }
      }
      if (palette.window && layer !== 'far') {
        ctx.fillStyle = palette.window;
        for (let wy = by + 10; wy < baseY - 6; wy += isNear ? 12 : 14) {
          for (let wx = bx + 4; wx < bx + buildingWidth - 4; wx += isNear ? 10 : 12) {
            if (rand() > (isNear ? 0.48 : 0.58)) ctx.fillRect(wx, wy, 2.2, 3.2);
          }
        }
      }
      if (isNear) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = 'rgba(120,230,255,0.9)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 0.5, by + 0.5, buildingWidth - 1, buildingHeight - 1);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = palette.accent;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(bx, by - 3, buildingWidth, 3);
      ctx.globalAlpha = 1;
      const roofLift = 10 + rand() * 16;
      ctx.beginPath();
      ctx.moveTo(bx - 2, by);
      ctx.lineTo(bx + buildingWidth * 0.16, by - roofLift);
      ctx.lineTo(bx + buildingWidth * 0.84, by - roofLift);
      ctx.lineTo(bx + buildingWidth + 2, by);
      ctx.closePath();
      ctx.fillStyle = palette.accent;
      ctx.fill();
      if (rand() > 0.4) {
        ctx.fillStyle = layer === 'near' ? '#5b3a2c' : '#6b4636';
        ctx.fillRect(bx + buildingWidth * (0.2 + rand() * 0.5), by - roofLift - 10, 2.8, 11);
      }
      if (!mobile) {
        ctx.fillStyle = 'rgba(58, 42, 54, 0.22)';
        for (let dx = 0.22; dx < 0.88; dx += 0.22) {
          ctx.fillRect(bx + buildingWidth * dx, by - roofLift * 0.7, 4, 6);
        }
      }
      if (palette.window && layer !== 'far') {
        ctx.fillStyle = palette.window;
        for (let wy = by + 12; wy < baseY - 8; wy += isNear ? 15 : 17) {
          for (let wx = bx + 5; wx < bx + buildingWidth - 4; wx += isNear ? 11 : 13) {
            if (rand() > (isNear ? 0.5 : 0.62)) ctx.fillRect(wx, wy, 2.6, 3.8);
          }
        }
        ctx.fillStyle = 'rgba(74, 50, 58, 0.35)';
        for (let wy = by + 12; wy < baseY - 8; wy += isNear ? 15 : 17) {
          ctx.fillRect(bx + 2, wy + 4.6, buildingWidth - 4, 1);
        }
      }
      if (isNear) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = 'rgba(255,220,150,0.35)';
        ctx.fillRect(bx, by + buildingHeight - 6, buildingWidth, 6);
        ctx.restore();
      }
    }

    if (isNear) {
      const halo = ctx.createRadialGradient(bx + buildingWidth / 2, baseY - 4, 2, bx + buildingWidth / 2, baseY - 4, buildingWidth * 0.9);
      halo.addColorStop(0, kind === 'dubai' ? 'rgba(120,220,255,0.22)' : 'rgba(255,210,140,0.22)');
      halo.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(bx - buildingWidth * 0.3, baseY - 30, buildingWidth * 1.6, 34);
    }

    x += buildingWidth + 4 + rand() * 14;
    if (x > width + 80) x = -80 - rand() * 40;
  }
}

export function createSkylineCanvas(kind: SkylineKind, layer: SkylineLayer, mobile: boolean): HTMLCanvasElement {
  const width = mobile ? 512 : 1024;
  const height = mobile ? (layer === 'near' ? 320 : 180) : layer === 'near' ? 560 : 360;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, width, height);

  const baseY = height - 8;
  const palette = paletteFor(kind, layer);
  drawFillers(ctx, width, baseY, kind, layer, mobile, palette, height);

  if (layer === 'near') {
    if (kind === 'dubai') {
      drawBurjAlArab(ctx, width * 0.23, baseY, height * 1.0, palette.fill, palette.accent);
      drawBurjKhalifa(ctx, width * 0.63, baseY, height * 0.98, palette.fill, palette.accent);
    } else {
      drawEiffel(ctx, width * 0.33, baseY, height * 0.98, palette.fill, palette.accent);
      drawPantheon(ctx, width * 0.63, baseY, height * 0.56, palette.fill, palette.accent);
    }
  }

  const glow = ctx.createLinearGradient(0, baseY, 0, baseY - height * 0.45);
  if (kind === 'dubai') {
    glow.addColorStop(0, 'rgba(120, 210, 255, 0.22)');
    glow.addColorStop(0.45, 'rgba(255, 210, 140, 0.12)');
    glow.addColorStop(1, 'rgba(255, 191, 150, 0)');
  } else {
    glow.addColorStop(0, 'rgba(255, 210, 150, 0.22)');
    glow.addColorStop(0.5, 'rgba(255, 180, 120, 0.1)');
    glow.addColorStop(1, 'rgba(255, 191, 150, 0)');
  }
  ctx.fillStyle = glow;
  ctx.fillRect(0, baseY - height * 0.45, width, height * 0.45);

  if (layer === 'near') {
    for (let i = 0; i < (mobile ? 10 : 18); i += 1) {
      const lx = (i / (mobile ? 9 : 17)) * width + (i % 2 ? 12 : -12);
      const ly = baseY - height * (0.08 + (i % 5) * 0.05);
      const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, mobile ? 26 : 34);
      rg.addColorStop(0, kind === 'dubai' ? 'rgba(170,245,255,0.22)' : 'rgba(255,230,170,0.22)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(lx, ly, mobile ? 26 : 34, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas;
}
