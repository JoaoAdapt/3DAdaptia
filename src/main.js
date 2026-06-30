import * as THREE from 'three';
import { buildCharacter, animateCharacter } from './character.js';
import { buildVillage } from './village.js';
import { buildSkillTree, updateNodeStates, spinTree } from './skilltree.js';
import { CreatorUI } from './ui.js';
import { CLASSES, LINEAGES, xpForLevel } from './data.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
window.addEventListener('resize', resize);

// ============================================================
// Estado global
// ============================================================
let mode = 'start'; // start | creator | village | skilltree
let charCfg = null;
let demoLevel = 1;

// ============================================================
// CENA: Criador de personagem
// ============================================================
const creatorScene = new THREE.Scene();
creatorScene.background = new THREE.Color('#11141a');
creatorScene.fog = new THREE.Fog('#11141a', 6, 16);

const creatorAmbient = new THREE.AmbientLight('#8899bb', 0.7);
const creatorKey = new THREE.DirectionalLight('#fff4da', 1.3);
creatorKey.position.set(3, 5, 4);
creatorKey.castShadow = true;
creatorKey.shadow.mapSize.set(1024, 1024);
const creatorRim = new THREE.PointLight('#2dd4bf', 1.2, 10);
creatorRim.position.set(-3, 2, -3);
creatorScene.add(creatorAmbient, creatorKey, creatorRim);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.3, 0.3, 24),
  new THREE.MeshStandardMaterial({ color: '#23262e', roughness: 0.6, metalness: 0.3 })
);
pedestal.position.y = 0.0;
pedestal.receiveShadow = true;
creatorScene.add(pedestal);
const pedestalRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.15, 0.04, 8, 32),
  new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: 0.6 })
);
pedestalRing.rotation.x = Math.PI / 2;
pedestalRing.position.y = 0.16;
creatorScene.add(pedestalRing);

let creatorChar = null;
let creatorYaw = 0.6;
const creatorCamera = camera;

function setCreatorCharacter(cfg) {
  if (creatorChar) creatorScene.remove(creatorChar);
  creatorChar = buildCharacter(cfg);
  creatorChar.position.y = 0.15;
  creatorScene.add(creatorChar);
}

// orbit-drag for creator preview
let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener('pointerdown', (e) => {
  if (mode !== 'creator' && mode !== 'village') return;
  dragging = true; lastX = e.clientX; lastY = e.clientY;
});
window.addEventListener('pointerup', () => dragging = false);
window.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  if (mode === 'creator') {
    creatorYaw += dx * 0.008;
  } else if (mode === 'village') {
    villageYaw -= dx * 0.008;
    villagePitch = Math.max(-0.5, Math.min(0.6, villagePitch - dy * 0.006));
  }
});

// ============================================================
// CENA: Vila inicial
// ============================================================
const villageScene = new THREE.Scene();
villageScene.background = new THREE.Color('#0d1117');
villageScene.fog = new THREE.Fog('#0d1117', 18, 46);

const villageAmbient = new THREE.HemisphereLight('#9fb4d6', '#202418', 0.85);
const villageSun = new THREE.DirectionalLight('#ffe8c2', 1.5);
villageSun.position.set(12, 18, 8);
villageSun.castShadow = true;
villageSun.shadow.mapSize.set(2048, 2048);
villageSun.shadow.camera.left = -36;
villageSun.shadow.camera.right = 36;
villageSun.shadow.camera.top = 36;
villageSun.shadow.camera.bottom = -36;
villageSun.shadow.camera.far = 60;
villageScene.add(villageAmbient, villageSun);

const { village, buildings, totem, bounds } = buildVillage(villageScene);

let villageChar = null;
let villageYaw = Math.PI;
let villagePitch = 0.18;
const playerPos = new THREE.Vector3(0, 0, 11);
let playerFacing = 0;
let playerSpeed = 0;
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e') tryInteract();
});
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function setVillageCharacter(cfg) {
  if (villageChar) village.remove(villageChar);
  villageChar = buildCharacter(cfg);
  village.add(villageChar);
}

function tryInteract() {
  if (mode !== 'village') return;
  const distTotem = playerPos.distanceTo(new THREE.Vector3(totem.position.x, 0, totem.position.z));
  if (distTotem < 3.2) openSkillTree();
}

// ============================================================
// CENA: Árvore de habilidades
// ============================================================
const skillScene = new THREE.Scene();
skillScene.background = new THREE.Color('#0a0a0f');
skillScene.fog = new THREE.Fog('#0a0a0f', 10, 30);
const skillAmbient = new THREE.AmbientLight('#445', 0.9);
const skillKey = new THREE.PointLight('#facc15', 1.6, 30);
skillKey.position.set(0, 6, 6);
skillScene.add(skillAmbient, skillKey);
let skillTreeData = null;
let skillCamYaw = 0;
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let hoveredNode = null;

function buildSkillSceneFor(cfg) {
  if (skillTreeData) skillScene.remove(skillTreeData.group);
  const klass = CLASSES.find(c => c.id === cfg.classId);
  const lineage = LINEAGES.find(l => l.id === cfg.lineageId);
  skillTreeData = buildSkillTree(cfg.classId, cfg.lineageId, klass.nome, lineage.nome);
  skillTreeData.group.position.set(0, -1.5, 0);
  skillScene.add(skillTreeData.group);
  updateNodeStates(skillTreeData.nodes, demoLevel);
}

canvas.addEventListener('pointermove', (e) => {
  if (mode !== 'skilltree' || !skillTreeData) return;
  pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const meshes = skillTreeData.nodes.map(n => n.userData.mesh);
  const hits = raycaster.intersectObjects(meshes);
  const tooltip = document.getElementById('skill-tooltip');
  if (hits.length) {
    const node = skillTreeData.nodes.find(n => n.userData.mesh === hits[0].object);
    hoveredNode = node;
    tooltip.style.display = 'block';
    tooltip.style.left = e.clientX + 16 + 'px';
    tooltip.style.top = e.clientY + 16 + 'px';
    tooltip.innerHTML = `<strong>${node.userData.nome}</strong><span class="tag">${node.userData.tag} · Nível ${node.userData.level} ${node.userData.unlocked ? '✓' : '🔒'}</span><p>${node.userData.efeito}</p>`;
  } else {
    hoveredNode = null;
    tooltip.style.display = 'none';
  }
});

// ============================================================
// UI: telas
// ============================================================
const startScreen = document.getElementById('screen-start');
const creatorScreen = document.getElementById('screen-creator');
const villageHud = document.getElementById('hud-village');
const skillScreen = document.getElementById('screen-skilltree');
const creatorPreviewLabel = document.getElementById('creator-preview-label');

document.getElementById('btn-start').addEventListener('click', () => {
  startScreen.classList.add('hidden');
  creatorScreen.classList.remove('hidden');
  mode = 'creator';
});

const creatorRoot = document.getElementById('creator-form');
const creatorUI = new CreatorUI(creatorRoot, (cfg) => {
  setCreatorCharacter(cfg);
  creatorPreviewLabel.textContent = cfg.name ? cfg.name : 'Seu herói';
}, (finalCfg) => {
  charCfg = finalCfg;
  setVillageCharacter(finalCfg);
  playerPos.set(0, 0, 11);
  enterVillage();
});

function enterVillage() {
  creatorScreen.classList.add('hidden');
  villageHud.classList.remove('hidden');
  mode = 'village';
  document.getElementById('hud-name').textContent = charCfg.name;
  const klass = CLASSES.find(c => c.id === charCfg.classId);
  const lineage = LINEAGES.find(l => l.id === charCfg.lineageId);
  document.getElementById('hud-class').textContent = `${lineage.nome} · ${klass.nome}`;
  document.getElementById('hud-pv').textContent = charCfg.sheet.pv;
  if (klass.conjurador) {
    document.getElementById('hud-mana-wrap').classList.remove('hidden');
    document.getElementById('hud-mana').textContent = charCfg.sheet.mana;
  }
  syncLevelUI();
}

function openSkillTree() {
  mode = 'skilltree';
  skillScreen.classList.remove('hidden');
  buildSkillSceneFor(charCfg);
}

document.getElementById('btn-close-skilltree').addEventListener('click', () => {
  skillScreen.classList.add('hidden');
  document.getElementById('skill-tooltip').style.display = 'none';
  mode = 'village';
});

document.getElementById('btn-interact-totem').addEventListener('click', openSkillTree);

const levelSlider = document.getElementById('level-slider');
levelSlider.addEventListener('input', () => {
  demoLevel = parseInt(levelSlider.value, 10);
  syncLevelUI();
  if (skillTreeData) updateNodeStates(skillTreeData.nodes, demoLevel);
});

function syncLevelUI() {
  document.getElementById('level-value').textContent = demoLevel;
  document.getElementById('xp-value').textContent = xpForLevel(demoLevel);
  document.getElementById('hud-level').textContent = demoLevel;
}

// ============================================================
// Loop principal
// ============================================================
const clock = new THREE.Clock();

function updateCreator(dt) {
  const radius = 3.4;
  creatorCamera.position.set(Math.sin(creatorYaw) * radius, 1.6, Math.cos(creatorYaw) * radius);
  creatorCamera.lookAt(0, 1.0, 0);
  if (creatorChar) {
    creatorChar.rotation.y += dt * 0.25;
  }
  renderer.render(creatorScene, creatorCamera);
}

const moveDir = new THREE.Vector3();
const camOffset = new THREE.Vector3();

function updateVillage(dt) {
  let forward = 0, strafe = 0;
  if (keys['w'] || keys['arrowup']) forward += 1;
  if (keys['s'] || keys['arrowdown']) forward -= 1;
  if (keys['d'] || keys['arrowright']) strafe += 1;
  if (keys['a'] || keys['arrowleft']) strafe -= 1;

  const speedMag = Math.hypot(forward, strafe);
  playerSpeed = speedMag;

  if (speedMag > 0) {
    const camForward = new THREE.Vector3(Math.sin(villageYaw), 0, Math.cos(villageYaw));
    const camRight = new THREE.Vector3(camForward.z, 0, -camForward.x);
    moveDir.set(0, 0, 0)
      .addScaledVector(camForward, forward)
      .addScaledVector(camRight, strafe)
      .normalize();
    const targetFacing = Math.atan2(moveDir.x, moveDir.z);
    let diff = targetFacing - playerFacing;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    playerFacing += diff * Math.min(1, dt * 10);
    playerPos.addScaledVector(moveDir, dt * 4.2);
    const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
    if (distFromCenter > bounds) {
      playerPos.x *= bounds / distFromCenter;
      playerPos.z *= bounds / distFromCenter;
    }
  }

  if (villageChar) {
    villageChar.position.set(playerPos.x, 0, playerPos.z);
    villageChar.rotation.y = playerFacing;
    animateCharacter(villageChar, dt, playerSpeed);
  }

  camOffset.set(Math.sin(villageYaw) * -5.2, 2.6 + villagePitch * 4, Math.cos(villageYaw) * -5.2);
  camera.position.set(playerPos.x + camOffset.x, 1.4 + camOffset.y, playerPos.z + camOffset.z);
  camera.lookAt(playerPos.x, 1.3, playerPos.z);

  spinTotemGlow(dt);

  const distTotem = playerPos.distanceTo(new THREE.Vector3(totem.position.x, 0, totem.position.z));
  document.getElementById('prompt-interact').classList.toggle('hidden', distTotem > 3.2);

  let nearBuilding = null;
  buildings.forEach(b => {
    const d = playerPos.distanceTo(new THREE.Vector3(b.position.x, 0, b.position.z));
    if (d < b.userData.radius + 1.4) nearBuilding = b.userData.lineage.nome;
  });
  const buildingLabel = document.getElementById('prompt-building');
  if (nearBuilding) {
    buildingLabel.textContent = `🏛 Setor de ${nearBuilding}`;
    buildingLabel.classList.remove('hidden');
  } else {
    buildingLabel.classList.add('hidden');
  }

  renderer.render(villageScene, camera);
}

let totemT = 0;
function spinTotemGlow(dt) {
  totemT += dt;
  totem.rotation.y += dt * 0.15;
}

function updateSkillTree(dt) {
  if (skillTreeData) spinTree(skillTreeData.group, dt);
  skillCamYaw += dt * 0.05;
  const r = 9;
  camera.position.set(Math.sin(skillCamYaw) * r, 2.6, Math.cos(skillCamYaw) * r);
  camera.lookAt(0, 1.5, 0);
  renderer.render(skillScene, camera);
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'creator' || mode === 'start') updateCreator(dt);
  else if (mode === 'village') updateVillage(dt);
  else if (mode === 'skilltree') updateSkillTree(dt);
}

resize();
loop();
