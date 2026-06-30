import {
  LINEAGES, CLASSES, SYNERGIES, ATTRS, ATTR_LABELS,
  SKIN_TONES, HAIR_COLORS, HAIR_STYLES, computeSheet, attrMod
} from './data.js';

const STEP_NAMES = ['Nome', 'Linhagem', 'Classe', 'Atributos', 'Aparência', 'Resumo'];

export class CreatorUI {
  constructor(root, onUpdate, onFinish) {
    this.root = root;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.step = 0;
    this.state = {
      name: '',
      lineageId: LINEAGES[0].id,
      classId: CLASSES[0].id,
      points: Object.fromEntries(ATTRS.map(a => [a, 0])),
      skin: SKIN_TONES[2],
      hairColor: HAIR_COLORS[0],
      hairStyle: 'curto',
      outfitColor: null,
      accentColor: null
    };
    this.render();
    this.emit();
  }

  pointsUsed() {
    return ATTRS.reduce((s, a) => s + this.state.points[a], 0);
  }

  emit() {
    const klass = CLASSES.find(c => c.id === this.state.classId);
    const cfg = {
      ...this.state,
      outfit: this.state.outfitColor || klass.corBase,
      accent: this.state.accentColor || '#facc15',
      weapon: klass.weapon
    };
    this.onUpdate(cfg);
  }

  go(delta) {
    const next = this.step + delta;
    if (next < 0 || next > 5) return;
    this.step = next;
    this.render();
  }

  setStep(i) {
    this.step = i;
    this.render();
  }

  render() {
    const s = this.state;
    const klass = CLASSES.find(c => c.id === s.classId);
    const lineage = LINEAGES.find(l => l.id === s.lineageId);
    const synergy = SYNERGIES.find(syn => syn.lineage === s.lineageId && syn.class === s.classId);

    let body = '';

    if (this.step === 0) {
      body = `
        <p class="step-hint">Como seu herói vai ser chamado em Adaptia?</p>
        <input id="f-name" type="text" maxlength="24" placeholder="Nome do herói" value="${escapeHtml(s.name)}" class="text-input" />
      `;
    } else if (this.step === 1) {
      body = `
        <p class="step-hint">Linhagem representa seu setor de origem na Adapt. Todas somam +8 no total.</p>
        <div class="grid-cards" id="lineage-grid">
          ${LINEAGES.map(l => `
            <button class="opt-card ${l.id === s.lineageId ? 'selected' : ''}" data-id="${l.id}" style="--accent:${l.cor}">
              <strong>${l.nome}</strong>
              <span>${Object.entries(l.bonus).map(([k, v]) => `${ATTR_LABELS[k]} +${v}`).join(' · ')}</span>
            </button>
          `).join('')}
        </div>
      `;
    } else if (this.step === 2) {
      body = `
        <p class="step-hint">Classe define bônus de atributo, PV e item inicial.</p>
        <div class="grid-cards dense" id="class-grid">
          ${CLASSES.map(c => `
            <button class="opt-card ${c.id === s.classId ? 'selected' : ''}" data-id="${c.id}" style="--accent:${c.corBase}">
              <strong>${c.nome}</strong>
              <span>${Object.entries(c.bonus).map(([k, v]) => `${ATTR_LABELS[k]} +${v}`).join(' · ')}</span>
              <span class="muted">${c.conjurador ? 'Conjurador' : `PV +${c.pv}`} · ${c.item}</span>
            </button>
          `).join('')}
        </div>
        ${synergy ? `<div class="synergy-banner">✨ Sinergia ativa: <strong>${lineage.nome} + ${klass.nome}</strong> → +1 ${ATTR_LABELS[synergy.attr]} e a habilidade "${synergy.nome}" (${synergy.efeito})</div>` : ''}
      `;
    } else if (this.step === 3) {
      const sheet = computeSheet(s);
      const used = this.pointsUsed();
      body = `
        <p class="step-hint">Distribua 10 pontos livres entre os 8 atributos. Restam <strong id="pts-left">${10 - used}</strong> pontos. Teto de 20 por atributo.</p>
        <div class="attr-list">
          ${ATTRS.map(a => {
            const base = sheet.attrs[a] - s.points[a];
            return `
            <div class="attr-row" data-attr="${a}">
              <span class="attr-name">${ATTR_LABELS[a]}</span>
              <span class="attr-base">${base}</span>
              <button class="attr-btn minus" ${s.points[a] <= 0 ? 'disabled' : ''}>−</button>
              <span class="attr-val">${sheet.attrs[a]}</span>
              <button class="attr-btn plus" ${(used >= 10 || sheet.attrs[a] >= 20) ? 'disabled' : ''}>+</button>
            </div>`;
          }).join('')}
        </div>
        <div class="sheet-preview">
          <span>PV: <strong>${sheet.pv}</strong></span>
          ${klass.conjurador ? `<span>Mana: <strong>${sheet.mana}</strong></span>` : ''}
        </div>
      `;
    } else if (this.step === 4) {
      body = `
        <p class="step-hint">Personalize a aparência do seu herói. O equipamento já reflete a classe escolhida (${klass.item}).</p>
        <div class="swatch-block">
          <label>Tom de pele</label>
          <div class="swatch-row" data-field="skin">
            ${SKIN_TONES.map(c => `<button class="swatch ${c === s.skin ? 'selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
          </div>
        </div>
        <div class="swatch-block">
          <label>Cor do cabelo</label>
          <div class="swatch-row" data-field="hair">
            ${HAIR_COLORS.map(c => `<button class="swatch ${c === s.hairColor ? 'selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
          </div>
        </div>
        <div class="swatch-block">
          <label>Estilo de cabelo</label>
          <div class="swatch-row text-row" data-field="hairstyle">
            ${HAIR_STYLES.map(hsv => `<button class="chip ${hsv === s.hairStyle ? 'selected' : ''}" data-c="${hsv}">${hsv}</button>`).join('')}
          </div>
        </div>
        <div class="swatch-block">
          <label>Cor da vestimenta</label>
          <div class="swatch-row" data-field="outfit">
            ${[klass.corBase, '#1f2937', '#7c2d12', '#0f766e', '#581c87', '#991b1b', '#1e3a8a'].map(c => `<button class="swatch ${(s.outfitColor || klass.corBase) === c ? 'selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
          </div>
        </div>
        <div class="swatch-block">
          <label>Cor de detalhe (acessórios)</label>
          <div class="swatch-row" data-field="accent">
            ${['#facc15', '#2dd4bf', '#f472b6', '#f87171', '#a3e635', '#e5e7eb'].map(c => `<button class="swatch ${(s.accentColor || '#facc15') === c ? 'selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
          </div>
        </div>
      `;
    } else if (this.step === 5) {
      const sheet = computeSheet(s);
      body = `
        <p class="step-hint">Confira a ficha final antes de entrar na Vila Inicial.</p>
        <div class="summary">
          <h3>${escapeHtml(s.name) || 'Herói sem nome'}</h3>
          <p class="summary-sub">${lineage.nome} · ${klass.nome}${synergy ? ' · ✨ ' + synergy.nome : ''}</p>
          <div class="attr-grid-final">
            ${ATTRS.map(a => `<div><span>${ATTR_LABELS[a]}</span><strong>${sheet.attrs[a]}</strong><em>(mod ${attrMod(sheet.attrs[a]) >= 0 ? '+' : ''}${attrMod(sheet.attrs[a])})</em></div>`).join('')}
          </div>
          <div class="sheet-preview">
            <span>PV: <strong>${sheet.pv}</strong></span>
            ${klass.conjurador ? `<span>Mana: <strong>${sheet.mana}</strong></span>` : ''}
            <span>Item: <strong>${klass.item}</strong></span>
          </div>
        </div>
      `;
    }

    this.root.innerHTML = `
      <div class="creator-steps">
        ${STEP_NAMES.map((n, i) => `<div class="step-pill ${i === this.step ? 'active' : ''} ${i < this.step ? 'done' : ''}">${i}. ${n}</div>`).join('')}
      </div>
      <div class="creator-body">${body}</div>
      <div class="creator-nav">
        <button id="nav-back" ${this.step === 0 ? 'disabled' : ''}>← Voltar</button>
        ${this.step === 5
          ? `<button id="nav-finish" class="primary" ${!s.name.trim() ? 'disabled' : ''}>Entrar na Vila →</button>`
          : `<button id="nav-next" class="primary" ${this.step === 0 && !s.name.trim() ? 'disabled' : ''} ${this.step === 3 && this.pointsUsed() !== 10 ? 'disabled' : ''}>Próximo →</button>`}
      </div>
    `;

    this.bind();
  }

  bind() {
    const root = this.root;
    const backBtn = root.querySelector('#nav-back');
    if (backBtn) backBtn.onclick = () => this.go(-1);
    const nextBtn = root.querySelector('#nav-next');
    if (nextBtn) nextBtn.onclick = () => this.go(1);
    const finishBtn = root.querySelector('#nav-finish');
    if (finishBtn) finishBtn.onclick = () => this.onFinish(this.buildFinal());

    if (this.step === 0) {
      const input = root.querySelector('#f-name');
      input.oninput = (e) => {
        this.state.name = e.target.value;
        const nb = root.querySelector('#nav-next');
        if (nb) nb.disabled = !this.state.name.trim();
        this.emit();
      };
    }

    if (this.step === 1) {
      root.querySelectorAll('#lineage-grid .opt-card').forEach(btn => {
        btn.onclick = () => {
          this.state.lineageId = btn.dataset.id;
          this.render();
          this.emit();
        };
      });
    }

    if (this.step === 2) {
      root.querySelectorAll('#class-grid .opt-card').forEach(btn => {
        btn.onclick = () => {
          this.state.classId = btn.dataset.id;
          this.render();
          this.emit();
        };
      });
    }

    if (this.step === 3) {
      root.querySelectorAll('.attr-row').forEach(row => {
        const attr = row.dataset.attr;
        const minus = row.querySelector('.minus');
        const plus = row.querySelector('.plus');
        minus.onclick = () => {
          if (this.state.points[attr] > 0) {
            this.state.points[attr]--;
            this.render();
            this.emit();
          }
        };
        plus.onclick = () => {
          const sheet = computeSheet(this.state);
          if (this.pointsUsed() < 10 && sheet.attrs[attr] < 20) {
            this.state.points[attr]++;
            this.render();
            this.emit();
          }
        };
      });
    }

    if (this.step === 4) {
      root.querySelectorAll('.swatch-row').forEach(rowEl => {
        const field = rowEl.dataset.field;
        rowEl.querySelectorAll('button').forEach(b => {
          b.onclick = () => {
            const val = b.dataset.c;
            if (field === 'skin') this.state.skin = val;
            if (field === 'hair') this.state.hairColor = val;
            if (field === 'hairstyle') this.state.hairStyle = val;
            if (field === 'outfit') this.state.outfitColor = val;
            if (field === 'accent') this.state.accentColor = val;
            this.render();
            this.emit();
          };
        });
      });
    }
  }

  buildFinal() {
    const klass = CLASSES.find(c => c.id === this.state.classId);
    return {
      ...this.state,
      outfit: this.state.outfitColor || klass.corBase,
      accent: this.state.accentColor || '#facc15',
      weapon: klass.weapon,
      sheet: computeSheet(this.state)
    };
  }
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
