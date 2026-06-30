import * as THREE from 'three';
import { LINEAGES } from './data.js';

function makeLabelSprite(text, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
  ctx.font = '700 48px Barlow Condensed, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(10,12,16,0.55)';
  roundRect(ctx, 8, 24, 496, 80, 16);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.6, 0.9, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function buildBuilding(lineage) {
  const g = new THREE.Group();
  const baseColor = new THREE.Color(lineage.cor);
  const wallColor = baseColor.clone().lerp(new THREE.Color('#1a1c22'), 0.55);

  const w = 3.2 + Math.random() * 0.6;
  const d = 3.2 + Math.random() * 0.6;
  const h = 2.6 + Math.random() * 0.6;

  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  walls.position.y = h / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  g.add(walls);

  const roofMat = new THREE.MeshStandardMaterial({ color: lineage.cor, roughness: 0.5, metalness: 0.1 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.85, 1.5, 4), roofMat);
  roof.position.y = h + 0.75;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  const doorMat = new THREE.MeshStandardMaterial({ color: '#2b2f38' });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.1), doorMat);
  door.position.set(0, 0.65, d / 2 + 0.01);
  g.add(door);

  const torchGlow = new THREE.PointLight(lineage.cor, 1.4, 4.5, 2);
  torchGlow.position.set(0, 1.4, d / 2 + 0.3);
  g.add(torchGlow);

  const label = makeLabelSprite(lineage.nome, lineage.cor);
  label.position.set(0, h + 1.9, 0);
  g.add(label);

  g.userData.lineage = lineage;
  g.userData.radius = Math.max(w, d) * 0.75;
  return g;
}

function buildSkillTreeTotem() {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.9 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 3.2, 8), trunkMat);
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  g.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#7c5e0a', emissiveIntensity: 0.4, roughness: 0.6 });
  const positions = [
    [0, 3.4, 0, 1.3], [1.0, 3.0, 0.6, 0.85], [-1.0, 3.1, -0.5, 0.9],
    [0.6, 3.8, -0.9, 0.75], [-0.8, 3.7, 0.8, 0.8]
  ];
  positions.forEach(([x, y, z, r]) => {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), foliageMat);
    s.position.set(x, y, z);
    s.castShadow = true;
    g.add(s);
  });

  const glow = new THREE.PointLight('#facc15', 2.2, 7, 2);
  glow.position.set(0, 3.4, 0);
  g.add(glow);

  const label = makeLabelSprite('Árvore das Habilidades', '#facc15');
  label.position.set(0, 5.3, 0);
  g.add(label);

  g.userData.isSkillTreeTotem = true;
  g.userData.radius = 1.6;
  return g;
}

function buildTree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6),
    new THREE.MeshStandardMaterial({ color: '#4a3320', roughness: 0.9 })
  );
  trunk.position.y = 0.7;
  trunk.castShadow = true;
  const leaves = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 0),
    new THREE.MeshStandardMaterial({ color: '#1f6b3a', roughness: 0.8 })
  );
  leaves.position.y = 1.7;
  leaves.castShadow = true;
  g.add(trunk, leaves);
  g.position.set(x, 0, z);
  return g;
}

export function buildVillage(scene) {
  const village = new THREE.Group();
  scene.add(village);

  // ground
  const groundMat = new THREE.MeshStandardMaterial({ color: '#2c3a2f', roughness: 1 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(34, 48), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  village.add(ground);

  // plaza
  const plazaMat = new THREE.MeshStandardMaterial({ color: '#3a3a3f', roughness: 0.9 });
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(9, 32), plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.01;
  plaza.receiveShadow = true;
  village.add(plaza);

  // ring path
  const pathMat = new THREE.MeshStandardMaterial({ color: '#4b4540', roughness: 0.95 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(13.5, 14.5, 48), pathMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.receiveShadow = true;
  village.add(ring);

  // totem central — abre a árvore de habilidades
  const totem = buildSkillTreeTotem();
  village.add(totem);

  // buildings in circle — 8 setores (linhagens)
  const buildings = [];
  const radius = 14;
  LINEAGES.forEach((lineage, i) => {
    const angle = (i / LINEAGES.length) * Math.PI * 2;
    const b = buildBuilding(lineage);
    b.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    b.lookAt(0, 0, 0);
    b.rotateY(Math.PI);
    village.add(b);
    buildings.push(b);
  });

  // decorative trees scattered outside ring
  const trees = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 13;
    const t = buildTree(Math.cos(a) * r, Math.sin(a) * r);
    village.add(t);
    trees.push(t);
  }

  // fountain at very center, slightly offset so totem reads as the focal piece
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.6, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: '#55585f', roughness: 0.6 })
  );
  fountainBase.position.set(0, 0.2, 6.5);
  fountainBase.castShadow = true;
  fountainBase.receiveShadow = true;
  village.add(fountainBase);
  const fountainWater = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: '#2dd4bf', emissive: '#0f766e', emissiveIntensity: 0.3, roughness: 0.2 })
  );
  fountainWater.position.set(0, 0.42, 6.5);
  village.add(fountainWater);

  return { village, buildings, totem, bounds: 32 };
}
