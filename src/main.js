import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { buildCharacter, animateCharacter } from './character.js';
import { buildVillage } from './village.js';
import { buildSkillTree, updateNodeStates, spinTree } from './skilltree.js';
import { CreatorUI } from './ui.js';
import { CLASSES, LINEAGES, xpForLevel } from './data.js';
import { skyGradientTexture, glowSpriteTexture } from './textures.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 220);

function makeComposer(scene, bloomStrength, bloomThreshold, bloomRadius) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), bloomStrength, bloomRadius, bloomThreshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return composer;
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  [creatorComposer, villageComposer, skillComposer].forEach(c => c && c.setSize(w, h));
}
window.addEventListener('resize', resize);

// ============================================================
// Estado global
// ============================================================
let mode = 'start'; // start | creator | village | skilltree
let charCfg = null;
let demoLevel = 1;

// ============================================================
// CENA: Criador de personagem — salão dos heróis, à luz de velas
// ============================================================
const creatorScene = new THREE.Scene();
creatorScene.background = new THREE.Color('#100c10');
creatorScene.fog = new THREE.Fog('#100c10', 6, 15);

const creatorAmbient = new THREE.HemisphereLight('#5d5a72', '#1a1410', 0.55);
const creatorKey = new THREE.DirectionalLight('#ffe2ad', 1.6);
creatorKey.position.set(3, 5.5, 4);
creatorKey.castShadow = true;
creatorKey.shadow.mapSize.set(1024, 1024);
creatorKey.shadow.camera.left = -5;
creatorKey.shadow.camera.right = 5;
creatorKey.shadow.camera.top = 5;
creatorKey.shadow.camera.bottom = -5;
const creatorRim = new THREE.PointLight('#7c5cff', 1.4, 9, 2);
creatorRim.position.set(-3, 2.2, -3);
const creatorFill = new THREE.PointLight('#ffb04d', 0.9, 8, 2);
creatorFill.position.set(2.4, 1.2, -2.2);
creatorScene.add(creatorAmbient, creatorKey, creatorRim, creatorFill);

// piso do salão
const hallFloor = new THREE.Mesh(
  new THREE.CircleGeometry(6, 40),
  new THREE.MeshStandardMaterial({ color: '#1a1620', roughness: 0.85, metalness: 0.1 })
);
hallFloor.rotation.x = -Math.PI / 2;
hallFloor.receiveShadow = true;
creatorScene.add(hallFloor);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.05, 1.3, 0.32, 28),
  new THREE.MeshStandardMaterial({ color: '#26222c', roughness: 0.55, metalness: 0.35 })
);
pedestal.receiveShadow = true;
pedestal.castShadow = true;
creatorScene.add(pedestal);
const pedestalRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.1, 0.045, 10, 36),
  new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: 1.1, roughness: 0.3, metalness: 0.6 })
);
pedestalRing.rotation.x = Math.PI / 2;
pedestalRing.position.y = 0.17;
creatorScene.add(pedestalRing);

// pilares decorativos ao fundo
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 3.4, 10),
    new THREE.MeshStandardMaterial({ color: '#211c28', roughness: 0.8 })
  );
  pillar.position.set(Math.cos(a) * 5.4, 1.7, Math.sin(a) * 5.4);
  pillar.castShadow = true;
  creatorScene.add(pillar);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: '#ffb04d', emissive: '#ff8a1f', emissiveIntensity: 1.8 })
  );
  flame.position.set(Math.cos(a) * 5.4, 3.55, Math.sin(a) * 5.4);
  creatorScene.add(flame);
  const torchLight = new THREE.PointLight('#ffa544', 1.0, 6, 2.2);
  torchLight.position.copy(flame.position);
  creatorScene.add(torchLight);
}

let creatorChar = null;
let creatorYaw = 0.6;
const creatorCamera = camera;

function setCreatorCharacter(cfg) {
  if (creatorChar) creatorScene.remove(creatorChar);
  creatorChar = buildCharacter(cfg);
  creatorChar.position.y = 0.16;
  creatorScene.add(creatorChar);
}

const creatorComposer = makeComposer(creatorScene, 0.55, 0.35, 0.6);

// orbit-drag para girar a câmera (criador e vila)
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
// CENA: Vila inicial — entardecer dourado
// ============================================================
const villageScene = new THREE.Scene();
const skyTex = skyGradientTexture('#2c3a63', '#e8865c', '#fbd49b');
villageScene.fog = new THREE.Fog('#e3a87a', 22, 50);

const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(120, 24, 16),
  new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
);
villageScene.add(skyDome);

const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowSpriteTexture('#ffd9a0'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
}));
sunGlow.scale.set(22, 22, 1);
sunGlow.position.set(-40, 22, -70);
villageScene.add(sunGlow);

// nuvens simples (sprites suaves)
const cloudTex = glowSpriteTexture('#fff3e0');
for (let i = 0; i < 10; i++) {
  const cloud = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.5, depthWrite: false }));
  const a = Math.random() * Math.PI * 2;
  const r = 50 + Math.random() * 40;
  cloud.position.set(Math.cos(a) * r, 18 + Math.random() * 10, Math.sin(a) * r);
  cloud.scale.set(14 + Math.random() * 10, 6 + Math.random() * 3, 1);
  villageScene.add(cloud);
}

const villageAmbient = new THREE.HemisphereLight('#8fa3d6', '#5a4326', 0.7);
const villageSun = new THREE.DirectionalLight('#ffcf9c', 1.85);
villageSun.position.set(-20, 16, -28);
villageSun.castShadow = true;
villageSun.shadow.mapSize.set(2048, 2048);
villageSun.shadow.camera.left = -36;
villageSun.shadow.camera.right = 36;
villageSun.shadow.camera.top = 36;
villageSun.shadow.camera.bottom = -36;
villageSun.shadow.camera.far = 70;
villageSun.shadow.bias = -0.0015;
const villageBounce = new THREE.PointLight('#ff9d52', 0.5, 30, 2);
villageBounce.position.set(0, 4, 0);
villageScene.add(villageAmbient, villageSun, villageBounce);

const { village, buildings, totem, bounds } = buildVillage(villageScene);

const villageComposer = makeComposer(villageScene, 0.42, 0.55, 0.7);

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
// CENA: Árvore de habilidades — vazio místico estrelado
// ============================================================
const skillScene = new THREE.Scene();
skillScene.background = new THREE.Color('#080810');
skillScene.fog = new THREE.Fog('#080810', 11, 28);
const skillAmbient = new THREE.AmbientLight('#5a5570', 0.6);
const skillKey = new THREE.PointLight('#facc15', 1.8, 32, 2);
skillKey.position.set(0, 6, 6);
const skillFill = new THREE.PointLight('#7c5cff', 1.1, 26, 2);
skillFill.position.set(-6, 3, -4);
skillScene.add(skillAmbient, skillKey, skillFill);

const starGeo = new THREE.BufferGeometry();
const starCount = 600;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 30 + Math.random() * 30;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 + 2;
  starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#fff6da', size: 0.18, transparent: true, opacity: 0.85, sizeAttenuation: true }));
skillScene.add(stars);

const skillGround = new THREE.Mesh(
  new THREE.CircleGeometry(14, 32),
  new THREE.MeshStandardMaterial({ color: '#15141f', roughness: 0.9 })
);
skillGround.rotation.x = -Math.PI / 2;
skillGround.position.y = -3;
skillGround.receiveShadow = true;
skillScene.add(skillGround);

let skillTreeData = null;
let skillCamYaw = 0;
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let hoveredNode = null;

const skillComposer = makeComposer(skillScene, 0.85, 0.25, 0.85);

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
  const radius = 3.3;
  creatorCamera.position.set(Math.sin(creatorYaw) * radius, 1.55, Math.cos(creatorYaw) * radius);
  creatorCamera.lookAt(0, 1.0, 0);
  if (creatorChar) {
    creatorChar.rotation.y += dt * 0.25;
  }
  creatorComposer.render();
}

const moveDir = new THREE.Vector3();
const camOffset = new THREE.Vector3();
const desiredCamPos = new THREE.Vector3();
let camInit = false;

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

  camOffset.set(Math.sin(villageYaw) * -5.4, 2.7 + villagePitch * 4, Math.cos(villageYaw) * -5.4);
  desiredCamPos.set(playerPos.x + camOffset.x, 1.4 + camOffset.y, playerPos.z + camOffset.z);
  if (!camInit) { camera.position.copy(desiredCamPos); camInit = true; }
  else camera.position.lerp(desiredCamPos, Math.min(1, dt * 9));
  camera.lookAt(playerPos.x, 1.3, playerPos.z);

  animateAmbience(dt);

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

  villageComposer.render();
}

let ambienceT = 0;
function animateAmbience(dt) {
  ambienceT += dt;
  totem.rotation.y += dt * 0.1;
  if (totem.userData.sparks) {
    totem.userData.sparks.children.forEach((sp, i) => {
      sp.position.y = sp.userData.baseY + Math.sin(ambienceT * 1.2 + sp.userData.phase) * 0.3;
      sp.material.opacity = 0.5 + Math.sin(ambienceT * 2 + sp.userData.phase) * 0.4;
    });
  }
  buildings.forEach((b, i) => {
    if (b.userData.torchFlame) {
      const flick = 1 + Math.sin(ambienceT * 9 + i * 3.1) * 0.18 + Math.sin(ambienceT * 23 + i) * 0.08;
      b.userData.torchFlame.scale.setScalar(flick);
    }
  });
}

function updateSkillTree(dt) {
  if (skillTreeData) spinTree(skillTreeData.group, dt, skillTreeData.nodes);
  skillCamYaw += dt * 0.05;
  const r = 9;
  camera.position.set(Math.sin(skillCamYaw) * r, 2.6, Math.cos(skillCamYaw) * r);
  camera.lookAt(0, 1.5, 0);
  stars.rotation.y += dt * 0.004;
  skillComposer.render();
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
