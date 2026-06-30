// ============================================================
// ADAPTIA 3D — Dados do sistema (portados do Livro de Regras v1)
// ============================================================

export const ATTRS = [
  'analise', 'precisao', 'labia', 'criatividade',
  'resiliencia', 'instinto', 'improviso', 'empatia'
];

export const ATTR_LABELS = {
  analise: 'Análise',
  precisao: 'Precisão',
  labia: 'Lábia',
  criatividade: 'Criatividade',
  resiliencia: 'Resiliência',
  instinto: 'Instinto',
  improviso: 'Improviso',
  empatia: 'Empatia'
};

export const LINEAGES = [
  { id: 'trafego', nome: 'Tráfego Pago', cor: '#2dd4bf', bonus: { improviso: 3, analise: 2, precisao: 2, labia: 1 } },
  { id: 'copy', nome: 'Copywriting', cor: '#f59e0b', bonus: { criatividade: 3, empatia: 2, labia: 2, analise: 1 } },
  { id: 'design', nome: 'Design', cor: '#a78bfa', bonus: { criatividade: 3, precisao: 2, instinto: 2, empatia: 1 } },
  { id: 'cs', nome: 'CS / Atendimento', cor: '#34d399', bonus: { empatia: 3, resiliencia: 2, labia: 2, instinto: 1 } },
  { id: 'comercial', nome: 'Comercial', cor: '#fb7185', bonus: { labia: 3, instinto: 2, resiliencia: 2, empatia: 1 } },
  { id: 'rh', nome: 'RH', cor: '#60a5fa', bonus: { empatia: 3, resiliencia: 2, labia: 2, analise: 1 } },
  { id: 'audiovisual', nome: 'Audiovisual', cor: '#f472b6', bonus: { criatividade: 3, precisao: 2, improviso: 2, instinto: 1 } },
  { id: 'sites', nome: 'Sites', cor: '#facc15', bonus: { analise: 3, precisao: 2, resiliencia: 2, instinto: 1 } }
];

// weapon: tipo de prop 3D gerado proceduralmente para a classe
export const CLASSES = [
  { id: 'guerreiro', nome: 'Guerreiro', bonus: { resiliencia: 3, precisao: 2 }, pv: 8, conjurador: false, item: 'Espada Longa', weapon: 'sword', corBase: '#9ca3af' },
  { id: 'barbaro', nome: 'Bárbaro', bonus: { resiliencia: 3, improviso: 2 }, pv: 8, conjurador: false, item: 'Machado de Batalha', weapon: 'axe', corBase: '#b45309' },
  { id: 'paladino', nome: 'Paladino', bonus: { precisao: 3, analise: 2 }, pv: 6, conjurador: false, item: 'Escudo Sagrado', weapon: 'shield', corBase: '#fde68a' },
  { id: 'monge', nome: 'Monge', bonus: { instinto: 3, resiliencia: 2 }, pv: 6, conjurador: false, item: 'Manoplas de Combate', weapon: 'fists', corBase: '#fb923c' },
  { id: 'mago', nome: 'Mago', bonus: { analise: 3, precisao: 2 }, pv: 0, conjurador: true, item: 'Cajado Arcano', weapon: 'staff', corBase: '#60a5fa' },
  { id: 'bruxo', nome: 'Bruxo', bonus: { improviso: 3, analise: 2 }, pv: 0, conjurador: true, item: 'Adaga de Pacto', weapon: 'dagger', corBase: '#7c3aed' },
  { id: 'arqueiro', nome: 'Arqueiro', bonus: { precisao: 3, instinto: 2 }, pv: 2, conjurador: false, item: 'Arco Longo', weapon: 'bow', corBase: '#15803d' },
  { id: 'bardo', nome: 'Bardo', bonus: { labia: 3, criatividade: 2 }, pv: 0, conjurador: true, item: 'Alaúde', weapon: 'lute', corBase: '#db2777' },
  { id: 'feiticeiro', nome: 'Feiticeiro', bonus: { instinto: 3, improviso: 2 }, pv: 0, conjurador: true, item: 'Anel de Foco', weapon: 'orb', corBase: '#06b6d4' },
  { id: 'ladino', nome: 'Ladino', bonus: { improviso: 3, labia: 2 }, pv: 2, conjurador: false, item: 'Adagas Duplas', weapon: 'daggers', corBase: '#374151' },
  { id: 'sacerdote', nome: 'Sacerdote', bonus: { labia: 3, resiliencia: 2 }, pv: 4, conjurador: true, item: 'Cajado Sagrado', weapon: 'holystaff', corBase: '#fef3c7' },
  { id: 'druida', nome: 'Druida', bonus: { criatividade: 3, instinto: 2 }, pv: 4, conjurador: true, item: 'Cajado de Carvalho', weapon: 'woodstaff', corBase: '#4d7c0f' }
];

export const SYNERGIES = [
  { lineage: 'trafego', class: 'arqueiro', attr: 'precisao', nome: 'Mira Calibrada', efeito: 'Refaz 1 rolagem de execução por sessão.' },
  { lineage: 'copy', class: 'bardo', attr: 'labia', nome: 'Discurso Afiado', efeito: 'Vence empate de persuasão automaticamente.' },
  { lineage: 'design', class: 'druida', attr: 'criatividade', nome: 'Forma Perfeita', efeito: 'Refaz 1 resultado visual por sessão.' },
  { lineage: 'cs', class: 'sacerdote', attr: 'resiliencia', nome: 'Voz que Acalma', efeito: 'Cura 1 efeito ruim de um colega por sessão.' },
  { lineage: 'comercial', class: 'ladino', attr: 'labia', nome: 'Fechador Nato', efeito: 'Vantagem em qualquer negociação do jogo.' },
  { lineage: 'rh', class: 'monge', attr: 'resiliencia', nome: 'Mediador Zen', efeito: 'Ignora 1 efeito de caos do grupo por sessão.' },
  { lineage: 'audiovisual', class: 'feiticeiro', attr: 'improviso', nome: 'Take Único', efeito: 'Refaz 1 rolagem ruim por sessão.' },
  { lineage: 'sites', class: 'mago', attr: 'precisao', nome: 'Código Impecável', efeito: 'Ignora 1 "bug"/falha por sessão.' }
];

// Habilidade inicial (nível 1)
export const INITIAL_SKILLS = {
  guerreiro: { nome: 'Golpe Decisivo', efeito: '+1d6 de dano num ataque.', recurso: 'Recarga: 2 eventos' },
  barbaro: { nome: 'Avanço Bruto', efeito: 'Ignora uma Desvantagem.', recurso: 'Recarga: 2 eventos' },
  paladino: { nome: 'Postura Defensiva', efeito: 'Reduz à metade o próximo dano recebido.', recurso: 'Recarga: 2 eventos' },
  monge: { nome: 'Passo Leve', efeito: 'Repete um teste de Improviso ou Instinto.', recurso: 'Recarga: 2 eventos' },
  arqueiro: { nome: 'Tiro Calculado', efeito: 'Vê o resultado do dado antes de decidir usar ou re-rolar.', recurso: 'Recarga: 2 eventos' },
  ladino: { nome: 'Esquiva Ágil', efeito: 'Anula totalmente um dano recebido.', recurso: 'Recarga: 2 eventos' },
  mago: { nome: 'Disparo Arcano', efeito: 'Causa dano fixo igual ao modificador de Análise.', recurso: 'Custo: 4 Mana' },
  bruxo: { nome: 'Distorção', efeito: 'Força um reroll em qualquer teste.', recurso: 'Custo: 4 Mana' },
  feiticeiro: { nome: 'Centelha Instável', efeito: 'Rola 2d20 e soma; risco em natural 1.', recurso: 'Custo: 5 Mana' },
  druida: { nome: 'Forma Adaptativa', efeito: 'Troca o atributo usado num teste por outro.', recurso: 'Custo: 3 Mana' },
  sacerdote: { nome: 'Cura Leve', efeito: 'Recupera PV igual ao modificador de Empatia.', recurso: 'Custo: 4 Mana' },
  bardo: { nome: 'Verso Inspirador', efeito: 'Dá Vantagem a um colega no próximo teste.', recurso: 'Custo: 3 Mana' }
};

// Tier 1 de classe — desbloqueia no nível 4
export const CLASS_TIER1 = {
  guerreiro: { nome: 'Fôlego de Aço', efeito: 'Ignora um dano recebido.' },
  barbaro: { nome: 'Furor', efeito: 'Dobra o dano de um ataque.' },
  paladino: { nome: 'Escudo do Processo', efeito: 'Recebe um dano no lugar de um colega.' },
  monge: { nome: 'Respiração Zen', efeito: 'Recupera PV igual ao modificador de Instinto.' },
  mago: { nome: 'Cálculo Preciso', efeito: 'Troca o resultado do d20 por um 15 fixo.' },
  bruxo: { nome: 'Pacto Sombrio', efeito: 'Vantagem agora, Desvantagem no próximo teste.' },
  arqueiro: { nome: 'Tiro Certeiro', efeito: 'Acerto automático contra DD ≤16.' },
  bardo: { nome: 'Plateia a Favor', efeito: 'Dá Vantagem para o grupo num teste social.' },
  feiticeiro: { nome: 'Explosão Instável', efeito: 'Rola 2d20 e soma; risco em natural 1.' },
  ladino: { nome: 'Golpe Furtivo', efeito: 'Dobra o dano num ataque surpresa.' },
  sacerdote: { nome: 'Bênção Rápida', efeito: 'Cura PV igual ao modificador de Empatia.' },
  druida: { nome: 'Forma Adaptada', efeito: 'Troca o atributo usado num teste por outro.' }
};

// Tier 1 de linhagem — desbloqueia no nível 6
export const LINEAGE_TIER1 = {
  trafego: { nome: 'Otimização em Tempo Real', efeito: 'Refaz um teste de Improviso.' },
  copy: { nome: 'Storytelling', efeito: 'Transforma um fracasso social em sucesso parcial.' },
  design: { nome: 'Pixel Perfeito', efeito: 'Garante um crítico num teste de Criatividade.' },
  cs: { nome: 'Jogo de Cintura', efeito: 'Reanima um colega sem teste, volta com 1/4 do PV.' },
  comercial: { nome: 'Fechamento', efeito: 'Vence automaticamente um teste de negociação.' },
  rh: { nome: 'Mediação', efeito: 'Anula o contra-ataque de um chefão contra qualquer jogador.' },
  audiovisual: { nome: 'Corte Perfeito', efeito: 'Ignora o fracasso crítico de um colega.' },
  sites: { nome: 'Debug Express', efeito: 'Refaz um teste de Análise ou Precisão.' }
};

export const SKIN_TONES = ['#ffe0bd', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5a3825'];
export const HAIR_COLORS = ['#2b1b0e', '#5c3a21', '#8a5a32', '#d4af37', '#a83232', '#1f2937', '#e5e7eb', '#ffffff'];
export const HAIR_STYLES = ['careca', 'curto', 'longo', 'moicano'];

export function attrMod(value) {
  return Math.floor(value / 2);
}

export function computeSheet(state) {
  const { lineageId, classId, points } = state;
  const lineage = LINEAGES.find(l => l.id === lineageId);
  const klass = CLASSES.find(c => c.id === classId);
  const synergy = SYNERGIES.find(s => s.lineage === lineageId && s.class === classId);

  const attrs = {};
  ATTRS.forEach(a => { attrs[a] = 3; });
  if (lineage) ATTRS.forEach(a => { attrs[a] += (lineage.bonus[a] || 0); });
  if (klass) ATTRS.forEach(a => { attrs[a] += (klass.bonus[a] || 0); });
  if (synergy) attrs[synergy.attr] += 1;
  ATTRS.forEach(a => { attrs[a] += (points[a] || 0); attrs[a] = Math.min(20, attrs[a]); });

  const pv = klass ? (klass.conjurador ? 0 : 10 + attrMod(attrs.resiliencia) * 2 + klass.pv) : 0;
  const pvConjurador = klass && klass.conjurador ? 10 + attrMod(attrs.resiliencia) * 2 + klass.pv : null;
  const mana = klass && klass.conjurador ? 8 + attrMod(mainAttr(klass, attrs)) * 2 : 0;

  return { lineage, klass, synergy, attrs, pv: klass && klass.conjurador ? pvConjurador : pv, mana };
}

function mainAttr(klass, attrs) {
  const keys = Object.keys(klass.bonus);
  let best = keys[0];
  keys.forEach(k => { if (klass.bonus[k] > klass.bonus[best]) best = k; });
  return attrs[best];
}

export function xpForLevel(level) {
  return level * 20;
}
