import * as THREE from 'three';
import { LINEAGES } from './data.js';
import {
  grassTexture, dirtPathTexture, cobbleTexture, stoneWallTexture,
  plasterTexture, woodTexture, thatchTexture, glowSpriteTexture
} from './textures.js';

function makeSignTexture(text, color = '#f4ead0') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(0, 0, 512, 200);
  ctx.fillStyle = '#3f2a14';
  ctx.fillRect(8, 8, 496, 184);
  ctx.fillStyle = color;
  ctx.font = '700 56px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  wrapCentered(ctx, text, 256, 100, 460, 60);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function wrapCentered(ctx, text, cx, cy, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = w + ' ';
    } else line = test;
  }
  lines.push(line.trim());
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineHeight));
}

function makeLabelSprite(text, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
  ctx.font = '700 46px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawRoundRect(ctx, 8, 24, 496, 80, 16);
  ctx.fillStyle = 'rgba(8,9,13,0.6)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.4, 0.85, 1);
  return sprite;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function buildTorch() {
  const g = new THREE.Group();
  const bracket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.5, 6),
    new THREE.MeshStandardMaterial({ color: '#2b2118', roughness: 0.9 })
  );
  bracket.castShadow = true;
  g.add(bracket);
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.05, 0.08, 8),
    new THREE.MeshStandardMaterial({ color: '#1c1c1c', metalness: 0.6, roughness: 0.5 })
  );
  bowl.position.y = 0.27;
  g.add(bowl);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: '#ffb347', emissive: '#ff8a1f', emissiveIntensity: 1.6, roughness: 0.4 })
  );
  flame.position.y = 0.38;
  g.add(flame);
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowSpriteTexture('#ffb04d'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glowSprite.position.y = 0.36;
  glowSprite.scale.set(0.9, 0.9, 1);
  g.add(glowSprite);
  const light = new THREE.PointLight('#ffa544', 1.6, 5.5, 2.2);
  light.position.y = 0.36;
  g.add(light);
  g.userData.flame = flame;
  return g;
}

function buildBuilding(lineage, texCache) {
  const g = new THREE.Group();
  const size = 3.4 + Math.random() * 0.5; // footprint quadrado — evita telhado torto
  const wallH = 2.3 + Math.random() * 0.35;
  const plinthH = 0.32;

  // alicerce de pedra
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(size + 0.18, plinthH, size + 0.18),
    new THREE.MeshStandardMaterial({ map: texCache.stone, roughness: 0.95 })
  );
  plinth.position.y = plinthH / 2;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  g.add(plinth);

  // paredes de taipa (plaster) com viga aparente
  const wallColor = new THREE.Color(lineage.cor).lerp(new THREE.Color('#f3ead2'), 0.82);
  const plasterMat = new THREE.MeshStandardMaterial({ map: texCache.plaster, color: wallColor, roughness: 0.92 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(size, wallH, size), plasterMat);
  walls.position.y = plinthH + wallH / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  g.add(walls);

  // vigas de madeira (enxaimel) nas 4 faces
  const beamMat = new THREE.MeshStandardMaterial({ map: texCache.wood, roughness: 0.85 });
  const half = size / 2;
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
    const beamGroup = new THREE.Group();
    beamGroup.rotation.y = rot;
    beamGroup.position.y = plinthH + wallH / 2;
    const vBeamL = new THREE.Mesh(new THREE.BoxGeometry(0.08, wallH, 0.04), beamMat);
    vBeamL.position.set(-half * 0.55, 0, half + 0.005);
    const vBeamR = vBeamL.clone();
    vBeamR.position.x = half * 0.55;
    const hBeamTop = new THREE.Mesh(new THREE.BoxGeometry(size * 0.96, 0.08, 0.04), beamMat);
    hBeamTop.position.set(0, wallH * 0.42, half + 0.005);
    const diag1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, size * 0.55, 0.04), beamMat);
    diag1.position.set(-half * 0.3, wallH * 0.05, half + 0.005);
    diag1.rotation.z = 0.5;
    const diag2 = diag1.clone();
    diag2.position.x = half * 0.3;
    diag2.rotation.z = -0.5;
    beamGroup.add(vBeamL, vBeamR, hBeamTop, diag1, diag2);
    beamGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.add(beamGroup);
  });

  // janela com floreira na fachada (face +Z)
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.06), new THREE.MeshStandardMaterial({ map: texCache.wood, roughness: 0.85 }));
  windowFrame.position.set(0, plinthH + wallH * 0.62, half + 0.02);
  g.add(windowFrame);
  const glassMat = new THREE.MeshStandardMaterial({ color: lineage.cor, emissive: lineage.cor, emissiveIntensity: 0.5, roughness: 0.3 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.02), glassMat);
  glass.position.set(0, plinthH + wallH * 0.62, half + 0.045);
  g.add(glass);
  const flowerBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.16), new THREE.MeshStandardMaterial({ color: '#5a3a1e', roughness: 0.9 }));
  flowerBox.position.set(0, plinthH + wallH * 0.62 - 0.33, half + 0.1);
  g.add(flowerBox);
  for (let i = 0; i < 4; i++) {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? '#f87171' : '#fde68a', roughness: 0.6 }));
    flower.position.set(-0.18 + i * 0.12, plinthH + wallH * 0.62 - 0.24, half + 0.1 + (Math.random() - 0.5) * 0.05);
    g.add(flower);
  }

  // porta
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.25, 0.07), new THREE.MeshStandardMaterial({ map: texCache.wood, roughness: 0.85 }));
  door.position.set(0, plinthH + 0.63, half + 0.02);
  g.add(door);
  const doorArch = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.07, 12, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ map: texCache.stone, roughness: 0.9 }));
  doorArch.rotation.z = Math.PI / 2;
  doorArch.position.set(0, plinthH + 1.255, half + 0.02);
  g.add(doorArch);

  // telhado — base quadrada, sem distorção entre paredes e telhado
  const roofOverhang = 0.55;
  const roofRadius = (size + roofOverhang * 2) / Math.SQRT2;
  const roofH = 1.15 + Math.random() * 0.25;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofRadius, roofH, 4, 1),
    new THREE.MeshStandardMaterial({ map: texCache.thatch, roughness: 0.95 })
  );
  roof.position.y = plinthH + wallH + roofH / 2 - 0.05;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  // friso na base do telhado pra esconder a costura parede/telhado
  const trim = new THREE.Mesh(
    new THREE.CylinderGeometry(roofRadius * 0.74, roofRadius * 0.74, 0.1, 4),
    new THREE.MeshStandardMaterial({ map: texCache.wood, roughness: 0.85 })
  );
  trim.rotation.y = Math.PI / 4;
  trim.position.y = plinthH + wallH;
  g.add(trim);

  // chaminé
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), new THREE.MeshStandardMaterial({ map: texCache.stone, roughness: 0.95 }));
  chimney.position.set(half * 0.5, plinthH + wallH + 0.45, -half * 0.4);
  chimney.castShadow = true;
  g.add(chimney);

  // tocha ao lado da porta
  const torch = buildTorch();
  torch.position.set(half * 0.62, plinthH + 0.9, half + 0.08);
  g.add(torch);

  // placa pendurada
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6), new THREE.MeshStandardMaterial({ map: texCache.wood, roughness: 0.85 }));
  signPost.position.set(-half * 0.62, plinthH + 1.55, half + 0.05);
  g.add(signPost);
  const signArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6), new THREE.MeshStandardMaterial({ map: texCache.wood, roughness: 0.85 }));
  signArm.rotation.z = Math.PI / 2;
  signArm.position.set(-half * 0.62 + 0.17, plinthH + 1.78, half + 0.05);
  g.add(signArm);
  const signBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.3),
    new THREE.MeshStandardMaterial({ map: makeSignTexture(lineage.nome), roughness: 0.8, side: THREE.DoubleSide })
  );
  signBoard.position.set(-half * 0.62 + 0.36, plinthH + 1.55, half + 0.05);
  g.add(signBoard);

  // placa flutuante (legibilidade à distância)
  const label = makeLabelSprite(lineage.nome, lineage.cor);
  label.position.set(0, plinthH + wallH + roofH + 0.7, 0);
  g.add(label);

  g.userData.lineage = lineage;
  g.userData.radius = size * 0.78;
  g.userData.torchFlame = torch.userData.flame;
  return g;
}

function buildSkillTreeTotem(texCache) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ map: texCache.wood, color: '#8a6a45', roughness: 0.95 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.6, 3.0, 9), trunkMat);
  trunk.position.y = 1.5;
  trunk.castShadow = true;
  g.add(trunk);

  // raízes visíveis pra evitar o tronco "flutuando" no chão
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.9, 5), trunkMat);
    root.position.set(Math.cos(a) * 0.5, 0.2, Math.sin(a) * 0.5);
    root.rotation.z = Math.cos(a) * 0.5;
    root.rotation.x = -Math.sin(a) * 0.5;
    g.add(root);
  }

  const foliageMat = new THREE.MeshStandardMaterial({ color: '#e0b73a', emissive: '#caa12a', emissiveIntensity: 0.45, roughness: 0.65 });
  const positions = [
    [0, 3.3, 0, 1.25], [1.0, 2.95, 0.55, 0.85], [-1.0, 3.05, -0.5, 0.88],
    [0.55, 3.75, -0.85, 0.72], [-0.75, 3.65, 0.78, 0.78], [0.05, 4.15, 0.05, 0.7]
  ];
  positions.forEach(([x, y, z, r]) => {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), foliageMat);
    s.position.set(x, y, z);
    s.castShadow = true;
    g.add(s);
  });

  const glow = new THREE.PointLight('#f4cb4a', 2.4, 8, 2);
  glow.position.set(0, 3.4, 0);
  g.add(glow);

  // partículas flutuantes em volta da copa
  const sparkTex = glowSpriteTexture('#fff2b8');
  const sparkGroup = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 1.4;
    sp.position.set(Math.cos(a) * r, 2.6 + Math.random() * 2, Math.sin(a) * r);
    sp.scale.setScalar(0.12 + Math.random() * 0.1);
    sp.userData.baseY = sp.position.y;
    sp.userData.phase = Math.random() * Math.PI * 2;
    sparkGroup.add(sp);
  }
  g.add(sparkGroup);

  const label = makeLabelSprite('Árvore das Habilidades', '#f4cb4a');
  label.position.set(0, 5.4, 0);
  g.add(label);

  g.userData.isSkillTreeTotem = true;
  g.userData.radius = 1.7;
  g.userData.sparks = sparkGroup;
  return g;
}

function buildTree(x, z, texCache) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.16, 1.3, 6),
    new THREE.MeshStandardMaterial({ map: texCache.wood, color: '#8a6a45', roughness: 0.95 })
  );
  trunk.position.y = 0.65;
  trunk.castShadow = true;
  const leafColors = ['#2f6b3a', '#27532f', '#3a7a42'];
  const leafMat = new THREE.MeshStandardMaterial({ color: leafColors[Math.floor(Math.random() * leafColors.length)], roughness: 0.85 });
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65 + Math.random() * 0.2, 0), leafMat);
  leaves.position.y = 1.6;
  leaves.castShadow = true;
  const leaves2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), leafMat);
  leaves2.position.set(0.3, 1.9, 0.1);
  g.add(trunk, leaves, leaves2);
  g.position.set(x, 0, z);
  g.rotation.y = Math.random() * Math.PI;
  return g;
}

export function buildVillage(scene) {
  const village = new THREE.Group();
  scene.add(village);

  const texCache = {
    grass: grassTexture(28),
    path: dirtPathTexture(8),
    cobble: cobbleTexture(14),
    stone: stoneWallTexture('#857f72', 5),
    plaster: plasterTexture('#e7dcc0', 3),
    wood: woodTexture('#5a3a1e', 1),
    thatch: thatchTexture(4)
  };

  // chão
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(34, 56),
    new THREE.MeshStandardMaterial({ map: texCache.grass, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  village.add(ground);

  // praça central em pedra
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(9, 36),
    new THREE.MeshStandardMaterial({ map: texCache.cobble, roughness: 0.9 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.015;
  plaza.receiveShadow = true;
  village.add(plaza);

  // caminho em anel até os prédios
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(13, 15, 56),
    new THREE.MeshStandardMaterial({ map: texCache.path, roughness: 0.95 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.013;
  ring.receiveShadow = true;
  village.add(ring);

  // trilhas radiais conectando a praça aos prédios
  LINEAGES.forEach((lineage, i) => {
    const angle = (i / LINEAGES.length) * Math.PI * 2;
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 6),
      new THREE.MeshStandardMaterial({ map: texCache.path, roughness: 0.95 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(Math.cos(angle) * 11, 0.014, Math.sin(angle) * 11);
    path.rotation.z = -angle;
    path.receiveShadow = true;
    village.add(path);
  });

  // totem central — abre a árvore de habilidades
  const totem = buildSkillTreeTotem(texCache);
  village.add(totem);

  // prédios em círculo — 8 setores (linhagens)
  const buildings = [];
  const radius = 15.5;
  LINEAGES.forEach((lineage, i) => {
    const angle = (i / LINEAGES.length) * Math.PI * 2;
    const b = buildBuilding(lineage, texCache);
    b.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    b.lookAt(0, 0, 0);
    b.rotateY(Math.PI);
    village.add(b);
    buildings.push(b);
  });

  // árvores decorativas fora do anel
  const trees = [];
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 13;
    const t = buildTree(Math.cos(a) * r, Math.sin(a) * r, texCache);
    village.add(t);
    trees.push(t);
  }

  // fonte de pedra
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.5, 0.4, 16),
    new THREE.MeshStandardMaterial({ map: texCache.stone, roughness: 0.85 })
  );
  fountainBase.position.set(0, 0.2, 6.2);
  fountainBase.castShadow = true;
  fountainBase.receiveShadow = true;
  village.add(fountainBase);
  const fountainPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.7, 10),
    new THREE.MeshStandardMaterial({ map: texCache.stone, roughness: 0.85 })
  );
  fountainPillar.position.set(0, 0.4 + 0.35, 6.2);
  village.add(fountainPillar);
  const fountainBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.5, 0.18, 16),
    new THREE.MeshStandardMaterial({ map: texCache.stone, roughness: 0.85 })
  );
  fountainBowl.position.set(0, 0.4 + 0.7, 6.2);
  village.add(fountainBowl);
  const fountainWater = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.0, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: '#2dd4bf', emissive: '#0f766e', emissiveIntensity: 0.35, roughness: 0.15, metalness: 0.2 })
  );
  fountainWater.position.set(0, 0.41, 6.2);
  village.add(fountainWater);

  return { village, buildings, totem, bounds: 32 };
}
