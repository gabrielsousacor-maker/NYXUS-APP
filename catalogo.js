// catalogo.js — Catálogo de jogos NYXUS

// ============================================================
// Proteção de rota
// ============================================================
function verificarSessao() {
  const usuario = localStorage.getItem('nyxus_user');
  if (!usuario) {
    window.location.href = 'login.html';
  }
}

// ============================================================
// Carrega dados do usuário na navbar
// ============================================================
function carregarSessao() {
  const email = localStorage.getItem('nyxus_user');
  const nome  = localStorage.getItem('nyxus_nome');
  const plano = localStorage.getItem('nyxus_plano') || 'gratis';

  const exibir   = nome || (email ? email.split('@')[0] : 'Usuário');
  const avatarEl = document.getElementById('avatarLetter');
  const nameEl   = document.getElementById('userName');
  const badgeEl  = document.getElementById('planoBadge');

  if (avatarEl) avatarEl.textContent = exibir[0].toUpperCase();
  if (nameEl)   nameEl.textContent   = exibir;
  if (badgeEl)  badgeEl.textContent  = plano === 'premium' ? '⭐ Premium' : 'Grátis';

  return plano;
}

// Logout
function sair() {
  localStorage.removeItem('nyxus_user');
  localStorage.removeItem('nyxus_nome');
  localStorage.removeItem('nyxus_plano');
  window.location.href = 'login.html';
}

// ============================================================
// Catálogo de jogos
// ============================================================
const jogos = [
  { id: 1, nome: 'FIFA Soccer 96', categoria: 'futebol', categoriaLabel: '⚽ Futebol', emoji: '⚽', cor: '#0d2b0d', desc: 'O ancestral direto da série que hoje é o EA Sports FC. Times e jogadores licenciados de verdade, de 1995. Jogável direto no navegador (Internet Archive).', url: 'https://archive.org/embed/msdos_FIFA_Soccer_96_1995', premium: false },
  { id: 2, nome: 'SuperTuxKart', categoria: 'corrida', categoriaLabel: '🏎️ Corrida', emoji: '🏎️', cor: '#0d0d2b', desc: 'Corrida de kart open source. Pistas incríveis estilo Mario Kart.', url: 'https://online.supertuxkart.net', premium: false },
  { id: 3, nome: 'Fightingame JS', categoria: 'luta', categoriaLabel: '🥊 Luta', emoji: '🥊', cor: '#2b0d0d', desc: 'Luta estilo Street Fighter direto no navegador. Sem instalação.', url: 'https://www.fightingame.net', premium: false },
  { id: 4, nome: 'SimCity Classic', categoria: 'construcao', categoriaLabel: '🧱 Construção', emoji: '🧱', cor: '#2b1a0d', desc: 'O clássico de 1993 de construir e gerenciar sua própria cidade. Jogável direto no navegador via emulação (Internet Archive).', url: 'https://archive.org/embed/msdos_SimCity_Classic_1994', premium: true },
  { id: 5, nome: 'Speed Dreams', categoria: 'corrida', categoriaLabel: '🏎️ Corrida', emoji: '🚀', cor: '#0d1a2b', desc: 'Simulador de corrida open source com física realista e várias pistas.', url: 'https://www.speed-dreams.net', premium: true },
  { id: 6, nome: 'Prince of Persia', categoria: 'luta', categoriaLabel: '🥊 Luta', emoji: '⚔️', cor: '#2b0d1a', desc: 'O clássico de ação e plataforma de 1994. Salve a princesa das garras de Jaffar. Jogável direto no navegador (Internet Archive).', url: 'https://archive.org/embed/msdos_4D_Prince_of_Persia_1994', premium: true },
  { id: 7, nome: 'SOC Workspace', categoria: 'cyber', categoriaLabel: '🛡️ Cyber', emoji: '🛡️', cor: '#0d2b2b', desc: 'Simulação de treino de analista de SOC. Investigue ocórrencias, use o terminal e bloqueie ameaças com a ajuda do Nyxus AI.', url: 'soc-workspace/index.html', premium: false }];

// ============================================================
// Renderiza os cards
// ============================================================
function renderizarJogos(filtro = 'todos', plano) {
  const gridGratis  = document.getElementById('gridGratis');
  const gridPremium = document.getElementById('gridPremium');
  if (!gridGratis || !gridPremium) return;

  gridGratis.innerHTML  = '';
  gridPremium.innerHTML = '';

  jogos.forEach(jogo => {
    const visivel = filtro === 'todos' || jogo.categoria === filtro;
    const card    = criarCard(jogo, plano, visivel);
    if (jogo.premium) gridPremium.appendChild(card);
    else gridGratis.appendChild(card);
  });
}

function criarCard(jogo, plano, visivel) {
  const bloqueado = jogo.premium && plano !== 'premium';
  const card      = document.createElement('div');
  card.className  = `jogo-card ${bloqueado ? 'bloqueado' : ''} ${!visivel ? 'oculto' : ''}`;
  card.dataset.categoria = jogo.categoria;

  card.innerHTML = `
    <div class="jogo-capa" style="background: ${jogo.cor}">
      <span>${jogo.emoji}</span>
      ${bloqueado ? '<div class="cadeado-overlay">🔒</div>' : ''}
    </div>
    <div class="jogo-info">
      <span class="jogo-categoria">${jogo.categoriaLabel}</span>
      <div class="jogo-nome">${jogo.nome}</div>
      <div class="jogo-desc">${jogo.desc}</div>
      ${bloqueado
        ? `<button class="jogo-btn-bloqueado" onclick="abrirModal()">🔒 Ver planos</button>`
        : `<button class="primary-button jogo-btn" onclick="jogar('${jogo.url}', '${jogo.nome}')">▶ Jogar agora</button>`
      }
    </div>
  `;
  return card;
}

// ============================================================
// Pré-carregamento: deixa os jogos reais já carregando escondidos
// assim que a página abre, pra abrir na hora quando clicar em Jogar
// ============================================================
function preCarregarJogos() {
  const preload = document.getElementById('jogoPreloadContainer');
  if (!preload) return;

  jogos.forEach(jogo => {
    // Só pré-carrega o que sabemos que funciona embutido: jogos do
    // Internet Archive e arquivos do próprio site (ex: SOC Workspace).
    const podePrecarregar = jogo.url.startsWith('https://archive.org/embed/') || !jogo.url.startsWith('http');
    if (!podePrecarregar) return;

    const iframe = document.createElement('iframe');
    iframe.src = jogo.url;
    iframe.dataset.jogoUrl = jogo.url;
    iframe.className = 'jogo-preload-frame';
    iframe.allowFullscreen = true;
    preload.appendChild(iframe);
  });
}

// ============================================================
// Abre o jogo embutido, sem sair do catálogo
// ============================================================
function jogar(url, nome) {
  const container = document.getElementById('jogoEmbedFrame');
  container.innerHTML = '';

  // Se já tem um iframe pré-carregado pra esse jogo, reaproveita ele
  // (já está carregado/carregando, não recomeça do zero).
  let iframe = document.querySelector(`.jogo-preload-frame[data-jogo-url="${url}"]`);
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allowFullscreen = true;
  }

  container.appendChild(iframe);
  document.getElementById('jogoEmbedNome').textContent = nome || '';
  document.getElementById('modalJogoEmbed').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharJogoEmbed() {
  const container = document.getElementById('jogoEmbedFrame');
  const preload = document.getElementById('jogoPreloadContainer');
  const iframe = container.querySelector('iframe');

  if (iframe && iframe.classList.contains('jogo-preload-frame')) {
    // Devolve pro "estoque" escondido — continua carregado, pronto pra
    // abrir instantâneo da próxima vez.
    preload.appendChild(iframe);
  } else if (iframe) {
    iframe.remove();
  }

  document.getElementById('modalJogoEmbed').classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================================
// Modal de assinatura
// ============================================================
function abrirModal() {
  document.getElementById('modalAssinatura').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function fecharModal() {
  document.getElementById('modalAssinatura').classList.remove('open');
  document.body.style.overflow = '';
}
function assinarPlano(tipo) {
  localStorage.setItem('nyxus_plano', 'premium');
  alert(`Você assinou o plano ${tipo}! Agora tem acesso aos jogos premium.`);
  fecharModal();
  const planoAtual = carregarSessao();
  renderizarJogos('todos', planoAtual);
}

// ============================================================
// Modal de introdução do jogo (opcional)
// ============================================================
function abrirModalJogo(id) {
  const jogo = jogos.find(j => j.id === id);
  if (!jogo) return;
  document.getElementById('modalJogoNome').textContent = jogo.nome;
  document.getElementById('modalJogoDesc').textContent = jogo.desc;
  const btn = document.getElementById('modalJogoBtn');
  btn.onclick = () => jogar(jogo.url, jogo.nome);
  document.getElementById('modalJogo').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function fecharModalJogo() {
  document.getElementById('modalJogo').classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================================
// Filtros
// ============================================================
function iniciarFiltros(plano) {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderizarJogos(btn.dataset.filtro, plano);
    });
  });
}

// ============================================================
// Fundo animado
// ============================================================
function iniciarFundo() {
  const one   = document.getElementById('animationOne');
  const two   = document.getElementById('animationTwo');
  const three = document.getElementById('animationThree');
  if (one)   { one.style.background   = '#D6FF00'; one.style.animation   = 'moveOne 7s infinite alternate ease-in-out'; }
  if (two)   { two.style.background   = '#a8cc00'; two.style.animation   = 'moveTwo 8s infinite alternate ease-in-out'; }
  if (three) { three.style.background = '#e6ff66'; three.style.animation = 'moveThree 9s infinite alternate ease-in-out'; }
}

// ============================================================
// Inicialização
// ============================================================
verificarSessao();
const planoAtual = carregarSessao();
renderizarJogos('todos', planoAtual);
iniciarFiltros(planoAtual);
iniciarFundo();
preCarregarJogos();

function assinarPlano(tipo) {
  // Se já está no plano mensal, não deixa assinar de novo
  const planoAtual = localStorage.getItem('nyxus_plano');
  if (planoAtual === 'mensal' && tipo === 'mensal') {
    alert('Você já possui o plano mensal ativo.');
    return;
  }

  // Atualiza para premium (mensal ou anual)
  localStorage.setItem('nyxus_plano', 'premium');
  alert(`Plano ${tipo} ativado com sucesso!`);
  fecharModal();
  const novoPlano = carregarSessao();
  renderizarJogos('todos', novoPlano);
}