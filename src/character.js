import * as THREE from 'three';
import { woodTexture } from './textures.js';

// ============================================================
// Construção procedural do personagem 3D — proporções calculadas
// de baixo pra cima (pés tocam o chão em y=0) com esferas nas
// juntas pra esconder as costuras entre as peças, capa e cinto
// pra dar leitura medieval e nenhuma peça flutuando ou
// atravessando outra.
// ============================================================

const SEG = 10;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metal ? 0.65 : 0.04,
    emissive: opts.emissive || 0x000000,
    emissiveIntensity: opts.emissiveIntensity || 0,
    map: opts.map || null
  });
}

function mesh(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function box(w, h, d, color, opts = {}) {
  return mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
}
function cyl(rt, rb, h, color, seg = SEG, opts = {}) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts));
}
function sph(r, color, seg = SEG, opts = {}) {
  return mesh(new THREE.SphereGeometry(r, seg, seg), mat(color, opts));
}

let woodTex = null;
function getWoodTex() {
  if (!woodTex) woodTex = woodTexture('#5a3a1e', 1);
  return woodTex;
}

function buildWeapon(type, accent) {
  const g = new THREE.Group();
  const metal = '#d7dde6';
  const darkMetal = '#9aa3b0';
  const wood = '#6b4423';

  switch (type) {
    case 'sword': {
      const blade = box(0.055, 0.78, 0.018, metal, { metal: true, roughness: 0.3 });
      blade.position.y = 0.46;
      const tip = mesh(new THREE.ConeGeometry(0.04, 0.1, 4), mat(metal, { metal: true, roughness: 0.3 }));
      tip.position.y = 0.9;
      tip.rotation.y = Math.PI / 4;
      const guard = box(0.24, 0.045, 0.05, accent, { metal: true });
      guard.position.y = 0.04;
      const grip = cyl(0.032, 0.034, 0.22, wood, 8);
      grip.position.y = -0.1;
      const pommel = sph(0.045, accent, 8, { metal: true });
      pommel.position.y = -0.22;
      g.add(blade, tip, guard, grip, pommel);
      break;
    }
    case 'axe': {
      const handle = cyl(0.03, 0.035, 0.85, wood, 8);
      handle.position.y = 0.25;
      const head = box(0.05, 0.3, 0.05, darkMetal, { metal: true });
      head.position.set(0, 0.58, 0);
      const bladeGeo = new THREE.ConeGeometry(0.22, 0.16, 3);
      const blade1 = mesh(bladeGeo, mat(metal, { metal: true }));
      blade1.rotation.z = Math.PI / 2;
      blade1.position.set(0.12, 0.58, 0);
      g.add(handle, head, blade1);
      break;
    }
    case 'shield': {
      const body = cyl(0.27, 0.29, 0.06, accent, 8, { metal: true });
      body.rotation.x = Math.PI / 2;
      const rim = mesh(new THREE.TorusGeometry(0.28, 0.025, 6, 16), mat(darkMetal, { metal: true }));
      rim.rotation.x = Math.PI / 2;
      const boss = sph(0.08, darkMetal, 8, { metal: true });
      boss.position.z = 0.05;
      g.add(body, rim, boss);
      break;
    }
    case 'fists': {
      const wrap1 = cyl(0.075, 0.075, 0.1, accent, 8);
      g.add(wrap1);
      break;
    }
    case 'staff': case 'holystaff': case 'woodstaff': {
      const handle = cyl(0.028, 0.03, 1.05, type === 'woodstaff' ? '#3f2a14' : wood, 8, { map: getWoodTex() });
      handle.position.y = 0.4;
      const cap = cyl(0.045, 0.028, 0.08, '#6b4423', 8);
      cap.position.y = 0.92;
      const orbMat = type === 'woodstaff'
        ? mat(accent, { roughness: 0.5 })
        : new THREE.MeshPhysicalMaterial({ color: accent, roughness: 0.1, metalness: 0.1, transmission: 0.55, thickness: 0.3, emissive: accent, emissiveIntensity: 0.3 });
      const orb = mesh(new THREE.IcosahedronGeometry(0.1, 1), orbMat);
      orb.position.y = 1.0;
      g.add(handle, cap, orb);
      break;
    }
    case 'dagger': case 'daggers': {
      const blade = box(0.04, 0.3, 0.014, metal, { metal: true, roughness: 0.3 });
      blade.position.y = 0.2;
      const grip = cyl(0.026, 0.026, 0.12, '#2a2a2a', 8);
      const guard = box(0.1, 0.025, 0.03, accent, { metal: true });
      guard.position.y = 0.07;
      g.add(blade, grip, guard);
      break;
    }
    case 'bow': {
      const curve = new THREE.TorusGeometry(0.38, 0.022, 6, 12, Math.PI);
      const m1 = mesh(curve, mat(wood, { map: getWoodTex() }));
      m1.rotation.z = Math.PI / 2;
      const string = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.76, 4), mat('#e8e3d3'));
      string.position.x = 0;
      g.add(m1, string);
      break;
    }
    case 'lute': {
      const body = cyl(0.15, 0.19, 0.09, '#a8742a', 10, { map: getWoodTex() });
      body.rotation.x = Math.PI / 2;
      const neck = box(0.035, 0.46, 0.028, '#5a3a1e');
      neck.position.y = 0.32;
      const head = box(0.07, 0.06, 0.03, accent, { metal: true });
      head.position.y = 0.56;
      g.add(body, neck, head);
      break;
    }
    case 'orb': {
      const ring1 = mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), mat(accent, { emissive: accent, emissiveIntensity: 0.7, metal: true }));
      const ring2 = mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), mat(accent, { emissive: accent, emissiveIntensity: 0.7, metal: true }));
      ring2.rotation.x = Math.PI / 2;
      const core = mesh(new THREE.IcosahedronGeometry(0.06, 1), new THREE.MeshPhysicalMaterial({ color: accent, transmission: 0.6, roughness: 0.1, emissive: accent, emissiveIntensity: 0.5 }));
      g.add(ring1, ring2, core);
      break;
    }
    default: break;
  }
  return g;
}

export function buildCharacter(cfg) {
  const root = new THREE.Group();
  root.name = 'characterRoot';

  const skin = cfg.skin || '#e0ac69';
  const outfit = cfg.outfit || '#2dd4bf';
  const accent = cfg.accent || '#facc15';
  const hairColor = cfg.hairColor || '#2b1b0e';
  const cloakColor = shade(outfit, -38);
  const trimColor = shade(accent, -10);
  const bootColor = '#3a2c1f';

  // ---------- pernas (de baixo pra cima, pés sempre em y=0) ----------
  const upperLegLen = 0.46;
  const lowerLegLen = 0.4;
  const footHeight = 0.09;
  const pelvisY = upperLegLen + lowerLegLen + footHeight - 0.03;

  const pelvis = new THREE.Group();
  pelvis.position.y = pelvisY;
  pelvis.userData.baseY = pelvisY;
  root.add(pelvis);

  function buildLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.13, 0, 0);
    pelvis.add(hip);

    const upper = cyl(0.075, 0.065, upperLegLen, '#4b4138');
    upper.position.y = -upperLegLen / 2;
    hip.add(upper);

    const knee = sph(0.065, '#4b4138');
    knee.position.y = -upperLegLen;
    hip.add(knee);

    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = -upperLegLen;
    hip.add(lowerGroup);

    const lower = cyl(0.06, 0.05, lowerLegLen, '#3c352e');
    lower.position.y = -lowerLegLen / 2;
    lowerGroup.add(lower);

    const cuff = cyl(0.065, 0.065, 0.06, trimColor, SEG, { metal: true });
    cuff.position.y = -lowerLegLen + 0.05;
    lowerGroup.add(cuff);

    const foot = box(0.12, footHeight, 0.22, bootColor, { roughness: 0.9 });
    foot.position.set(0, -lowerLegLen - footHeight / 2 + 0.03, 0.04);
    lowerGroup.add(foot);

    return { hip, lowerGroup, foot };
  }
  const legL = buildLeg(-1);
  const legR = buildLeg(1);

  // ---------- tronco ----------
  const torsoH = 0.54;
  const torsoW = 0.42;
  const torsoD = 0.26;

  const skirt = cyl(0.27, 0.2, 0.16, outfit);
  skirt.position.y = 0.08;
  pelvis.add(skirt);

  const torso = box(torsoW, torsoH, torsoD, outfit, { roughness: 0.85 });
  torso.position.y = 0.16 + torsoH / 2;
  pelvis.add(torso);

  const chestPlate = box(torsoW * 0.62, torsoH * 0.5, torsoD + 0.02, trimColor, { metal: true, roughness: 0.4 });
  chestPlate.position.set(0, 0.16 + torsoH * 0.62, 0.005);
  pelvis.add(chestPlate);

  const belt = cyl(0.255, 0.255, 0.09, '#2c2117', SEG, { roughness: 0.85 });
  belt.position.y = 0.155;
  pelvis.add(belt);
  const buckle = box(0.09, 0.07, 0.03, accent, { metal: true, roughness: 0.3 });
  buckle.position.set(0, 0.155, 0.27);
  pelvis.add(buckle);

  // capa — forma plana em trapézio, sem risco de geometria quebrada
  const shoulderYForCape = 0.16 + torsoH - 0.04;
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.15, 0);
  capeShape.lineTo(0.15, 0);
  capeShape.lineTo(0.23, -0.62);
  capeShape.lineTo(-0.23, -0.62);
  capeShape.closePath();
  const cloak = mesh(new THREE.ShapeGeometry(capeShape, 6), mat(cloakColor, { roughness: 0.95 }));
  cloak.material.side = THREE.DoubleSide;
  cloak.position.set(0, shoulderYForCape, -torsoD / 2 - 0.05);
  pelvis.add(cloak);
  const clasp = box(0.07, 0.05, 0.02, accent, { metal: true, roughness: 0.3 });
  clasp.position.set(0, shoulderYForCape + 0.02, -torsoD / 2 - 0.015);
  pelvis.add(clasp);

  // ---------- pescoço / cabeça ----------
  const neck = cyl(0.075, 0.085, 0.1, skin);
  neck.position.y = 0.16 + torsoH + 0.02;
  pelvis.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.16 + torsoH + 0.08;
  pelvis.add(headGroup);

  const head = sph(0.175, skin);
  headGroup.add(head);

  const jaw = box(0.15, 0.07, 0.13, skin);
  jaw.position.y = -0.13;
  headGroup.add(jaw);

  if (cfg.hairStyle !== 'careca') {
    let hair;
    if (cfg.hairStyle === 'longo') {
      hair = cyl(0.185, 0.1, 0.42, hairColor, SEG);
      hair.position.set(0, -0.16, -0.03);
    } else if (cfg.hairStyle === 'moicano') {
      hair = box(0.07, 0.16, 0.36, hairColor);
      hair.position.set(0, 0.2, 0);
    } else {
      hair = sph(0.19, hairColor, SEG);
      hair.scale.set(1, 0.68, 1.04);
      hair.position.y = 0.06;
    }
    headGroup.add(hair);
  }

  const browL = box(0.06, 0.018, 0.02, shade(hairColor, -10));
  browL.position.set(-0.07, 0.04, 0.16);
  headGroup.add(browL);
  const browR = browL.clone();
  browR.position.x = 0.07;
  headGroup.add(browR);

  // ---------- braços ----------
  const upperArmLen = 0.3;
  const lowerArmLen = 0.27;
  const shoulderY = 0.16 + torsoH - 0.05;
  const shoulderX = torsoW / 2 + 0.03;

  function buildArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * shoulderX, shoulderY, 0);
    pelvis.add(shoulder);

    const pad = sph(0.1, trimColor, SEG, { metal: true, roughness: 0.4 });
    shoulder.add(pad);

    const upper = cyl(0.062, 0.058, upperArmLen, outfit);
    upper.position.y = -upperArmLen / 2;
    shoulder.add(upper);

    const elbow = sph(0.058, skin);
    elbow.position.y = -upperArmLen;
    shoulder.add(elbow);

    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = -upperArmLen;
    shoulder.add(lowerGroup);

    const lower = cyl(0.052, 0.045, lowerArmLen, skin);
    lower.position.y = -lowerArmLen / 2;
    lowerGroup.add(lower);

    const handPos = new THREE.Vector3(0, -lowerArmLen - 0.02, 0);
    const hand = sph(0.06, skin, SEG);
    hand.position.copy(handPos);
    lowerGroup.add(hand);

    return { shoulder, lowerGroup, handPos };
  }
  const armL = buildArm(-1);
  const armR = buildArm(1);

  const weapon = buildWeapon(cfg.weapon, accent);
  weapon.position.copy(armR.handPos);
  weapon.rotation.set(-0.25, 0, side_tilt(cfg.weapon));
  armR.lowerGroup.add(weapon);

  if (cfg.weapon === 'shield') {
    const offhand = buildWeapon('fists', accent);
    offhand.position.copy(armL.handPos);
    armL.lowerGroup.add(offhand);
  }

  root.userData.anim = { pelvis, headGroup, armL, armR, legL, legR, t: 0 };
  return root;
}

function side_tilt(weapon) {
  return weapon === 'shield' ? 0 : 0.08;
}

export function animateCharacter(root, dt, speed) {
  const a = root.userData.anim;
  if (!a) return;
  if (speed > 0.01) {
    a.t += dt * 8 * Math.min(speed, 1.6);
    const swing = Math.sin(a.t) * 0.55;
    a.legL.hip.rotation.x = swing;
    a.legR.hip.rotation.x = -swing;
    a.armL.shoulder.rotation.x = -swing * 0.75;
    a.armR.shoulder.rotation.x = swing * 0.45;
  } else {
    a.t += dt * 2;
    a.legL.hip.rotation.x *= 0.85;
    a.legR.hip.rotation.x *= 0.85;
    a.armL.shoulder.rotation.x *= 0.85;
    a.armR.shoulder.rotation.x *= 0.85;
  }
  const bob = speed > 0.01 ? Math.abs(Math.sin(a.t * 2)) * 0.025 : Math.sin(a.t) * 0.008;
  a.pelvis.position.y = a.pelvis.userData.baseY + bob;
}

function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  const l = Math.max(0, Math.min(1, hsl.l + amt / 255));
  const out = new THREE.Color();
  out.setHSL(hsl.h, hsl.s, l);
  return '#' + out.getHexString();
}
