# Adaptia 3D

Versão 3D do RPG interno da Adapt. Mesmo sistema de fichas do Livro de Regras v1
(8 linhagens/setores, 12 classes, sinergias, atributos) — agora com criação de
personagem em 3D, árvore de habilidades em 3D e uma vila inicial explorável a
pé, com prédio para cada setor da agência.

Não depende de servidor, conta ou internet para rodar: tudo roda 100% no
navegador, com o Three.js já embutido em `bundle.js`. `npm`/internet só são
necessários se você quiser **editar o código-fonte** e gerar um novo bundle.

## Como jogar agora (sem instalar nada)

1. Baixe e extraia o `.zip`.
2. Dê duplo clique em `index.html`. Ele abre direto no navegador.
   - Se o navegador bloquear algo por segurança de arquivo local, rode um
     servidor simples (não precisa de internet):
     `python3 -m http.server 8080` dentro da pasta, depois abra
     `http://localhost:8080`.
3. Clique em **Criar Herói**, monte seu personagem (nome → linhagem → classe →
   atributos → aparência → resumo) e entre na vila.
4. Na vila: **WASD** ou setas para andar, **arraste o mouse** para girar a
   câmera, **E** (ou o botão na tela) perto da árvore dourada no centro para
   abrir a Árvore de Habilidades.
5. Use o slider **"Simular nível"** no HUD para ver quais habilidades vão
   desbloqueando conforme o personagem sobe de nível (réplica das regras:
   habilidade inicial no nível 1, habilidade de classe no nível 4, habilidade
   de linhagem no nível 6, e mais adiante).

Controles pensados para desktop (teclado + mouse). Sem suporte a touch/mobile
nesta versão.

## Subindo num projeto novo do GitHub

```bash
git init
git add .
git commit -m "Adaptia 3D"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Quer deixar jogável online depois (GitHub Pages)? Vá em
**Settings → Pages → Source: branch `main`, pasta `/ (root)`** no repositório.
Como tudo é estático (HTML/CSS/JS puro), não precisa de build step no Pages —
o `bundle.js` já vai versionado no repositório.

## Estrutura do projeto

```
index.html          tela base + overlays (criador, HUD da vila, árvore de habilidades)
style.css            identidade visual Adapt (fundo escuro, teal/dourado)
bundle.js             Three.js + todo o jogo, já compilado — é o que o navegador roda
src/
  data.js             tabelas do Livro de Regras v1 (linhagens, classes, sinergias, habilidades)
  character.js         construção procedural do personagem 3D + animação de andar
  village.js            geração da vila inicial (8 prédios de setor + árvore de habilidades)
  skilltree.js          cena 3D da árvore de habilidades (nós, conexões, estado bloqueado/desbloqueado)
  ui.js                 wizard de criação de personagem (HTML sobreposto ao canvas)
  main.js                ponto de entrada: câmera, controles, máquina de estados, loop de jogo
```

## Editando o código-fonte

Tudo em `src/` é o código real, legível, sem minificação. `bundle.js` é gerado
a partir dele.

```bash
npm install
# depois de editar algo em src/:
npm run build
```

Isso baixa o Three.js e o esbuild como dependências de desenvolvimento e gera
um novo `bundle.js` único, sem nenhuma dependência externa em tempo de
execução — o jogo final continua rodando offline.

`npm run watch` recompila automaticamente a cada alteração, útil durante o
desenvolvimento.

## O que está fiel ao RPG original e o que é novo

**Portado 1:1 do Livro de Regras v1:** os 8 atributos, as 8 linhagens com seus
bônus, as 12 classes com bônus/PV/item inicial, as 8 sinergias linhagem+classe,
a fórmula de PV/Mana, e as habilidades (inicial, tier 1 de classe no nível 4,
tier 1 de linhagem no nível 6).

**Novo nesta versão 3D:** todo o ambiente é renderizado em Three.js — modelo
de personagem construído proceduralmente (sem arquivos 3D externos, então o
projeto inteiro fica leve), customização visual (pele, cabelo, cor de roupa,
cor de detalhe) refletida ao vivo no modelo, vila com os 8 setores como
prédios explosáveis e árvore de habilidades como cena 3D navegável com nós
clicáveis.

**Fora do escopo desta entrega** (dá pra evoluir depois): combate real,
multiplayer/sessões compartilhadas, salvar progresso em servidor (hoje é só
local, dentro da sessão do navegador), e os tiers de habilidade acima do
nível 6, que ainda não estão fechados no Livro de Regras original.
