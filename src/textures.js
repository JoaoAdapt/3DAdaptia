import * as THREE from 'three';

// ============================================================
// Texturas procedurais (canvas) — sem nenhum arquivo externo,
// mantém o projeto 100% offline e leve.
// ============================================================

function ctx2d(size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  return { c, ctx: c.getContext('2d') };
}

function mottle(ctx, size, baseColor, variants, count, minR, maxR) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < count; i++) {
    const color = variants[Math.floor(Math.random() * variants.length)];
    ctx.globalAlpha = 0.18 + Math.random() * 0.25;
    ctx.fillStyle = color;
    const x = Math.random() * size, y = Math.random() * size;
    const r = minR + Math.random() * (maxR - minR);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.6), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function makeTexture(canvas, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function grassTexture(repeat = 26) {
  const { c, ctx } = ctx2d(256);
  mottle(ctx, 256, '#3b5a32', ['#2f4827', '#4d6e3e', '#284022', '#56794a'], 260, 1.5, 5);
  // blade strokes
  ctx.strokeStyle = 'rgba(20,40,18,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, y - 4 - Math.random() * 5);
    ctx.stroke();
  }
  return makeTexture(c, repeat, repeat);
}

export function dirtPathTexture(repeat = 10) {
  const { c, ctx } = ctx2d(256);
  mottle(ctx, 256, '#6b5436', ['#7a6244', '#5a432a', '#8a7250', '#4f3b22'], 220, 2, 7);
  return makeTexture(c, repeat, repeat);
}

export function cobbleTexture(repeat = 12) {
  const { c, ctx } = ctx2d(256);
  ctx.fillStyle = '#46484f';
  ctx.fillRect(0, 0, 256, 256);
  const rows = 8;
  for (let row = 0; row < rows; row++) {
    const offset = (row % 2) * 16;
    for (let col = -1; col < rows; col++) {
      const x = col * 32 + offset + 16;
      const y = row * 32 + 16;
      const r = 13 + Math.random() * 3;
      const shade = 50 + Math.floor(Math.random() * 35);
      ctx.fillStyle = `rgb(${shade + 20},${shade + 20},${shade + 26})`;
      ctx.beginPath();
      ctx.ellipse(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4, r, r * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,20,24,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  return makeTexture(c, repeat, repeat);
}

export function stoneWallTexture(baseColor = '#7c7a72', repeat = 4) {
  const { c, ctx } = ctx2d(256);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);
  const rowH = 24;
  for (let row = 0; row * rowH < 256; row++) {
    const offset = (row % 2) * 36;
    const y = row * rowH;
    for (let x = -40; x < 256; x += 72) {
      const w = 64 + Math.random() * 10;
      const shadeShift = Math.floor((Math.random() - 0.5) * 30);
      ctx.fillStyle = shadeAdjust(baseColor, shadeShift);
      ctx.fillRect(x + offset, y, w - 4, rowH - 4);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 3;
  for (let row = 0; row * rowH < 256; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * rowH);
    ctx.lineTo(256, row * rowH);
    ctx.stroke();
  }
  return makeTexture(c, repeat, repeat);
}

export function plasterTexture(baseColor = '#cdbb96', repeat = 2) {
  const { c, ctx } = ctx2d(256);
  mottle(ctx, 256, baseColor, [shadeAdjust(baseColor, 14), shadeAdjust(baseColor, -14), shadeAdjust(baseColor, 22)], 140, 3, 9);
  return makeTexture(c, repeat, repeat);
}

export function woodTexture(baseColor = '#4a2f18', repeat = 1) {
  const { c, ctx } = ctx2d(128);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 128;
    ctx.strokeStyle = shadeAdjust(baseColor, (Math.random() - 0.5) * 36);
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 4, 40, x - 4, 90, x + (Math.random() - 0.5) * 8, 128);
    ctx.stroke();
  }
  return makeTexture(c, repeat, repeat);
}

export function thatchTexture(repeat = 3) {
  const { c, ctx } = ctx2d(256);
  ctx.fillStyle = '#a9853f';
  ctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 34; row++) {
    const y = row * 8 + (Math.random() * 2);
    ctx.strokeStyle = `rgba(${110 + Math.random() * 40},${80 + Math.random() * 30},${30},0.55)`;
    ctx.lineWidth = 3 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 16) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 4);
    }
    ctx.stroke();
  }
  return makeTexture(c, repeat, repeat);
}

export function skyGradientTexture(top = '#1c3a63', mid = '#e8865c', bottom = '#fbd49b') {
  const w = 4, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, top);
  grad.addColorStop(0.55, mid);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function glowSpriteTexture(color = '#ffd27a') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function shadeAdjust(hex, amt) {
  const c = new THREE.Color(hex);
  const h = { r: c.r * 255, g: c.g * 255, b: c.b * 255 };
  const clamp = (v) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${clamp(h.r)},${clamp(h.g)},${clamp(h.b)})`;
}
