import * as THREE from 'three';

// ============================================================
// Construção procedural do personagem 3D (low-poly, sem assets externos)
// ============================================================

function box(w, h, d, color, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: opts.metal ? 0.6 : 0.05 });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, color, seg = 8, opts = {}) {
  const geo = new THREE.CylinderGeometry(rt, rb, h, seg);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: opts.metal ? 0.6 : 0.05 });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function sph(r, color, seg = 10, opts = {}) {
  const geo = new THREE.SphereGeometry(r, seg, seg);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: opts.metal ? 0.6 : 0.05 });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function buildWeapon(type, accent) {
  const g = new THREE.Group();
  const metal = '#cbd5e1';
  const wood = '#7c4a23';
  switch (type) {
    case 'sword': {
      const blade = box(0.06, 0.85, 0.02, metal, { metal: true });
      blade.position.y = 0.5;
      const guard = box(0.22, 0.05, 0.05, accent, { metal: true });
      guard.position.y = 0.05;
      const grip = cyl(0.04, 0.04, 0.22, wood, 8);
      grip.position.y = -0.12;
      g.add(blade, guard, grip);
      break;
    }
    case 'axe': {
      const handle = cyl(0.035, 0.035, 0.95, wood, 8);
      handle.position.y = 0.3;
      const head = box(0.32, 0.26, 0.05, metal, { metal: true });
      head.position.set(0.12, 0.62, 0);
      head.rotation.z = 0.3;
      g.add(handle, head);
      break;
    }
    case 'shield': {
      const body = cyl(0.28, 0.28, 0.06, accent, 8, { metal: true });
      body.rotation.x = Math.PI / 2;
      const boss = sph(0.08, metal, 8, { metal: true });
      boss.position.z = 0.04;
      g.add(body, boss);
      break;
    }
    case 'fists': {
      const wrap1 = cyl(0.07, 0.07, 0.12, accent, 8);
      g.add(wrap1);
      break;
    }
    case 'staff': case 'holystaff': case 'woodstaff': {
      const handle = cyl(0.03, 0.03, 1.1, type === 'woodstaff' ? '#4d3319' : wood, 8);
      handle.position.y = 0.4;
      const orb = sph(0.1, accent, 10, { metal: type !== 'woodstaff' });
      orb.position.y = 1.0;
      g.add(handle, orb);
      break;
    }
    case 'dagger': case 'daggers': {
      const blade = box(0.045, 0.34, 0.018, metal, { metal: true });
      blade.position.y = 0.22;
      const grip = cyl(0.03, 0.03, 0.12, '#1f1f1f', 8);
      g.add(blade, grip);
      break;
    }
    case 'bow': {
      const curve = new THREE.TorusGeometry(0.4, 0.025, 6, 12, Math.PI);
      const mat = new THREE.MeshStandardMaterial({ color: wood, roughness: 0.7 });
      const m = new THREE.Mesh(curve, mat);
      m.rotation.z = Math.PI / 2;
      m.castShadow = true;
      g.add(m);
      break;
    }
    case 'lute': {
      const body = cyl(0.16, 0.2, 0.1, '#a8742a', 10);
      body.rotation.x = Math.PI / 2;
      const neck = box(0.04, 0.5, 0.03, '#7c4a23');
      neck.position.y = 0.35;
      g.add(body, neck);
      break;
    }
    case 'orb': {
      const ring = new THREE.TorusGeometry(0.13, 0.015, 6, 16);
      const m = new THREE.Mesh(ring, new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.6, metalness: 0.4 }));
      g.add(m);
      break;
    }
    default: break;
  }
  return g;
}

export function buildCharacter(cfg) {
  // cfg: { skin, hairColor, hairStyle, outfit, accent, weapon }
  const root = new THREE.Group();
  root.name = 'characterRoot';

  const skin = cfg.skin || '#e0ac69';
  const outfit = cfg.outfit || '#2dd4bf';
  const accent = cfg.accent || '#facc15';
  const hairColor = cfg.hairColor || '#2b1b0e';

  // pelvis pivot (for body bob)
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  root.add(pelvis);

  // torso
  const torso = box(0.42, 0.5, 0.26, outfit);
  torso.position.y = 0.3;
  pelvis.add(torso);

  const belt = box(0.44, 0.08, 0.28, accent, { metal: true });
  belt.position.y = 0.05;
  pelvis.add(belt);

  // head group
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.62;
  pelvis.add(headGroup);

  const head = sph(0.18, skin, 10);
  headGroup.add(head);

  // hair
  if (cfg.hairStyle !== 'careca') {
    let hair;
    if (cfg.hairStyle === 'longo') {
      hair = cyl(0.19, 0.12, 0.5, hairColor, 10);
      hair.position.set(0, -0.08, -0.05);
    } else if (cfg.hairStyle === 'moicano') {
      hair = box(0.08, 0.18, 0.4, hairColor);
      hair.position.set(0, 0.18, 0);
    } else {
      hair = sph(0.2, hairColor, 10);
      hair.scale.set(1, 0.7, 1.05);
      hair.position.y = 0.05;
    }
    headGroup.add(hair);
  }

  // simple face accent (visor line) for flavor
  const visor = box(0.2, 0.03, 0.02, '#1f2937');
  visor.position.set(0, 0.02, 0.17);
  headGroup.add(visor);

  // arms
  function buildArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.26, 0.5, 0);
    const upper = cyl(0.06, 0.06, 0.26, skin);
    upper.position.y = -0.13;
    shoulder.add(upper);
    const sleeve = cyl(0.07, 0.07, 0.14, outfit);
    sleeve.position.y = -0.04;
    shoulder.add(sleeve);
    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = -0.26;
    const lower = cyl(0.05, 0.05, 0.24, skin);
    lower.position.y = -0.12;
    lowerGroup.add(lower);
    const hand = sph(0.06, skin, 8);
    hand.position.y = -0.24;
    lowerGroup.add(hand);
    shoulder.add(lowerGroup);
    pelvis.add(shoulder);
    return { shoulder, lowerGroup, hand };
  }
  const armL = buildArm(-1);
  const armR = buildArm(1);

  // weapon attached to right hand
  const weapon = buildWeapon(cfg.weapon, accent);
  weapon.position.copy(armR.hand.position);
  weapon.rotation.x = -0.3;
  armR.shoulder.add(weapon);

  // legs
  function buildLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.12, 0, 0);
    const upper = cyl(0.07, 0.07, 0.3, '#374151');
    upper.position.y = -0.15;
    hip.add(upper);
    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = -0.3;
    const lower = cyl(0.06, 0.06, 0.28, '#374151');
    lower.position.y = -0.14;
    lowerGroup.add(lower);
    const foot = box(0.1, 0.06, 0.18, accent, { metal: true });
    foot.position.set(0, -0.29, 0.04);
    lowerGroup.add(foot);
    hip.add(lowerGroup);
    pelvis.add(hip);
    return { hip, lowerGroup };
  }
  const legL = buildLeg(-1);
  const legR = buildLeg(1);

  root.userData.anim = { pelvis, headGroup, armL, armR, legL, legR, t: 0 };
  return root;
}

export function animateCharacter(root, dt, speed) {
  const a = root.userData.anim;
  if (!a) return;
  if (speed > 0.01) {
    a.t += dt * 8 * Math.min(speed, 1.6);
    const swing = Math.sin(a.t) * 0.6;
    a.legL.hip.rotation.x = swing;
    a.legR.hip.rotation.x = -swing;
    a.armL.shoulder.rotation.x = -swing * 0.8;
    a.armR.shoulder.rotation.x = swing * 0.5;
    a.pelvis.position.y = 0.95 + Math.abs(Math.sin(a.t * 2)) * 0.03;
  } else {
    a.t += dt * 2;
    a.legL.hip.rotation.x *= 0.85;
    a.legR.hip.rotation.x *= 0.85;
    a.armL.shoulder.rotation.x *= 0.85;
    a.armR.shoulder.rotation.x *= 0.85;
    a.pelvis.position.y = 0.95 + Math.sin(a.t) * 0.01;
  }
}
