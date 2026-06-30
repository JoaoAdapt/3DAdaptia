import * as THREE from 'three';
import { INITIAL_SKILLS, CLASS_TIER1, LINEAGE_TIER1 } from './data.js';

function nodeLabel(text, sub, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.font = '700 34px Barlow Condensed, Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(8,9,13,0.6)';
  drawRoundRect(ctx, 8, 8, 368, 144, 18);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, 192, 64);
  ctx.font = '400 24px DM Sans, Arial';
  ctx.fillStyle = '#cbd5e1';
  wrapText(ctx, sub, 192, 100, 340, 26);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(2.6, 1.1, 1);
  return sp;
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, yy);
}

function makeNode(position, color, data) {
  const g = new THREE.Group();
  g.position.copy(position);

  const geo = new THREE.IcosahedronGeometry(0.4, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    color, emissive: color, emissiveIntensity: 0.35,
    roughness: 0.15, metalness: 0.05,
    transmission: 0.45, thickness: 0.6, clearcoat: 0.6, clearcoatRoughness: 0.2
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  g.add(mesh);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.16, 0),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.1 })
  );
  g.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.03, 8, 28),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.3 })
  );
  ring.rotation.x = Math.PI / 2;
  g.add(ring);

  const nodeLight = new THREE.PointLight(color, 0.9, 3.2, 2);
  g.add(nodeLight);

  const label = nodeLabel(data.nome, data.efeito, color);
  label.position.set(0, 0.95, 0);
  g.add(label);

  const lvlBadge = nodeLabel(`Nível ${data.level}`, data.tag, '#ffffff');
  lvlBadge.scale.set(1.4, 0.6, 1);
  lvlBadge.position.set(0, -0.85, 0);
  g.add(lvlBadge);

  g.userData = { mesh, ring, core, mat, light: nodeLight, ...data };
  return g;
}

function beam(a, b, color) {
  const points = [a, new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.3, (a.z + b.z) / 2), b];
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 16, 0.035, 6, false);
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.65 });
  return new THREE.Mesh(geo, mat);
}

export function buildSkillTree(classId, lineageId, classNome, lineageNome) {
  const group = new THREE.Group();
  const nodes = [];

  const colorRoot = '#facc15';
  const colorClass = '#2dd4bf';
  const colorLineage = '#f472b6';

  const root = makeNode(new THREE.Vector3(0, 0, 0), colorRoot, {
    nome: INITIAL_SKILLS[classId].nome,
    efeito: INITIAL_SKILLS[classId].efeito,
    level: 1,
    tag: 'Habilidade Inicial',
    branch: 'root'
  });
  group.add(root);
  nodes.push(root);

  const c1 = makeNode(new THREE.Vector3(2.6, 1.6, 0), colorClass, {
    nome: CLASS_TIER1[classId].nome,
    efeito: CLASS_TIER1[classId].efeito,
    level: 4,
    tag: `Classe — ${classNome}`,
    branch: 'class'
  });
  group.add(c1);
  nodes.push(c1);

  const l1 = makeNode(new THREE.Vector3(-2.6, 2.4, 0), colorLineage, {
    nome: LINEAGE_TIER1[lineageId].nome,
    efeito: LINEAGE_TIER1[lineageId].efeito,
    level: 6,
    tag: `Setor — ${lineageNome}`,
    branch: 'lineage'
  });
  group.add(l1);
  nodes.push(l1);

  const c2 = makeNode(new THREE.Vector3(4.6, 3.6, -0.6), colorClass, {
    nome: '???', efeito: 'Desbloqueia no nível 8. Continue a campanha para revelar.', level: 8, tag: `Classe — ${classNome}`, branch: 'class', locked: true
  });
  group.add(c2);
  nodes.push(c2);

  const l2 = makeNode(new THREE.Vector3(-4.6, 4.6, -0.6), colorLineage, {
    nome: '???', efeito: 'Desbloqueia no nível 12. Continue a campanha para revelar.', level: 12, tag: `Setor — ${lineageNome}`, branch: 'lineage', locked: true
  });
  group.add(l2);
  nodes.push(l2);

  const c3 = makeNode(new THREE.Vector3(6.2, 5.8, -1.2), colorClass, {
    nome: '???', efeito: 'Desbloqueia no nível 12. Continue a campanha para revelar.', level: 12, tag: `Classe — ${classNome}`, branch: 'class', locked: true
  });
  group.add(c3);
  nodes.push(c3);

  const l3 = makeNode(new THREE.Vector3(-6.2, 7.0, -1.2), colorLineage, {
    nome: '???', efeito: 'Desbloqueia no nível 18. Continue a campanha para revelar.', level: 18, tag: `Setor — ${lineageNome}`, branch: 'lineage', locked: true
  });
  group.add(l3);
  nodes.push(l3);

  const beams = new THREE.Group();
  beams.add(beam(root.position, c1.position, colorClass));
  beams.add(beam(root.position, l1.position, colorLineage));
  beams.add(beam(c1.position, c2.position, colorClass));
  beams.add(beam(c2.position, c3.position, colorClass));
  beams.add(beam(l1.position, l2.position, colorLineage));
  beams.add(beam(l2.position, l3.position, colorLineage));
  group.add(beams);

  return { group, nodes };
}

export function updateNodeStates(nodes, level) {
  nodes.forEach(n => {
    const unlocked = level >= n.userData.level;
    const mat = n.userData.mat;
    mat.emissiveIntensity = unlocked ? 0.55 : 0.08;
    mat.transmission = unlocked ? 0.45 : 0.7;
    n.userData.core.material.emissiveIntensity = unlocked ? 1.3 : 0.25;
    n.userData.light.intensity = unlocked ? 1.1 : 0.15;
    const scale = unlocked ? 1 : 0.76;
    n.userData.mesh.scale.setScalar(scale);
    n.userData.ring.scale.setScalar(scale);
    n.userData.unlocked = unlocked;
  });
}

export function spinTree(group, dt, nodes) {
  group.rotation.y += dt * 0.06;
  if (nodes) {
    const t = performance.now() * 0.001;
    nodes.forEach((n, i) => {
      n.userData.mesh.rotation.y += dt * 0.4;
      n.userData.mesh.rotation.x += dt * 0.15;
      if (n.userData.baseY === undefined) n.userData.baseY = n.position.y;
      n.position.y = n.userData.baseY + Math.sin(t * 1.4 + i) * 0.08;
    });
  }
}
