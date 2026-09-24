// login.js — login + cadastro em uma tela só

// Endereço do backend (ajuste se o servidor rodar em outra porta/host).
const API_BASE = 'http://127.0.0.1:8000';

// ============================================================
// Troca de aba — Entrar / Criar conta
// ============================================================
function trocarAba(aba) {
  const painelEntrar   = document.getElementById('painelEntrar');
  const painelCadastro = document.getElementById('painelCadastro');
  const tabEntrar      = document.getElementById('tabEntrar');
  const tabCadastro    = document.getElementById('tabCadastro');

  if (aba === 'entrar') {
    painelEntrar.style.display   = 'block';
    painelCadastro.style.display = 'none';
    tabEntrar.classList.add('active');
    tabCadastro.classList.remove('active');
  } else {
    painelEntrar.style.display   = 'none';
    painelCadastro.style.display = 'block';
    tabCadastro.classList.add('active');
    tabEntrar.classList.remove('active');
  }
}

// ============================================================
// Toggle olho — Login
// ============================================================
document.getElementById('toggleLogin').addEventListener('click', () => {
  const input    = document.getElementById('loginSenha');
  const visivel  = input.type === 'text';
  input.type     = visivel ? 'password' : 'text';
  document.getElementById('iconShowLogin').style.display = visivel ? 'block' : 'none';
  document.getElementById('iconHideLogin').style.display = visivel ? 'none'  : 'block';
});

// ============================================================
// Toggle olho — Cadastro senha
// ============================================================
document.getElementById('toggleCadastro').addEventListener('click', () => {
  const input   = document.getElementById('cadastroSenha');
  const visivel = input.type === 'text';
  input.type    = visivel ? 'password' : 'text';
  document.getElementById('iconShowCadastro').style.display = visivel ? 'block' : 'none';
  document.getElementById('iconHideCadastro').style.display = visivel ? 'none'  : 'block';
});

// ============================================================
// Toggle olho — Cadastro confirmar senha
// ============================================================
document.getElementById('toggleConfirmar').addEventListener('click', () => {
  const input   = document.getElementById('cadastroConfirmar');
  const visivel = input.type === 'text';
  input.type    = visivel ? 'password' : 'text';
  document.getElementById('iconShowConfirmar').style.display = visivel ? 'block' : 'none';
  document.getElementById('iconHideConfirmar').style.display = visivel ? 'none'  : 'block';
});

// ============================================================
// Guarda os dados da conta (inclui o selo BETA) e redireciona
// ============================================================
function entrarComConta(conta) {
  localStorage.setItem('nyxus_user', conta.email);
  localStorage.setItem('nyxus_nome', conta.nome);
  localStorage.setItem('nyxus_plano', conta.plano);
  localStorage.setItem('nyxus_beta', conta.flags.beta ? '1' : '0');
  localStorage.setItem('nyxus_vitalicio', conta.flags.vitalicio ? '1' : '0');
  localStorage.setItem('nyxus_atendimento_especial', conta.flags.atendimento_especial ? '1' : '0');

  setTimeout(() => {
    window.location.href = 'catalogo.html';
  }, 1500);
}

// ============================================================
// Formulário de Login
// ============================================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;
  const box   = document.getElementById('resultBoxLogin');
  const title = document.getElementById('resultTitleLogin');
  const msg   = document.getElementById('loginMsg');

  box.classList.add('show');

  if (senha.length < 6) {
    box.className    = 'login-result show error';
    title.textContent= 'ERRO';
    msg.textContent  = 'Senha muito curta.';
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      box.className    = 'login-result show error';
      title.textContent= 'ERRO';
      msg.textContent  = dados.detail || 'E-mail ou senha incorretos.';
      return;
    }

    box.className    = 'login-result show success';
    title.textContent= dados.flags.beta ? 'SUCESSO (BETA)' : 'SUCESSO';
    msg.textContent  = `Logado como ${dados.email}. Redirecionando...`;

    entrarComConta(dados);
  } catch (erro) {
    box.className    = 'login-result show error';
    title.textContent= 'ERRO';
    msg.textContent  = 'Não foi possível conectar ao servidor. Tente novamente.';
  }
});

// ============================================================
// Formulário de Cadastro
// ============================================================
document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome     = document.getElementById('cadastroNome').value.trim();
  const email    = document.getElementById('cadastroEmail').value.trim();
  const senha    = document.getElementById('cadastroSenha').value;
  const confirmar= document.getElementById('cadastroConfirmar').value;
  const codigo   = document.getElementById('cadastroCodigo').value.trim().toUpperCase();
  const box      = document.getElementById('resultBoxCadastro');
  const title    = document.getElementById('resultTitleCadastro');
  const msg      = document.getElementById('cadastroMsg');

  box.classList.add('show');

  if (senha.length < 6) {
    box.className    = 'login-result show error';
    title.textContent= 'ERRO';
    msg.textContent  = 'A senha precisa ter pelo menos 6 caracteres.';
    return;
  }

  if (senha !== confirmar) {
    box.className    = 'login-result show error';
    title.textContent= 'ERRO';
    msg.textContent  = 'As senhas não coincidem.';
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, codigo }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      box.className    = 'login-result show error';
      title.textContent= resposta.status === 409 ? 'E-MAIL JÁ EXISTE' : 'CÓDIGO INVÁLIDO';
      msg.textContent  = dados.detail || 'O código informado não existe ou já foi utilizado.';
      return;
    }

    box.className    = 'login-result show success';
    title.textContent= dados.flags.beta ? 'BEM-VINDO (BETA)' : 'SUCESSO';
    msg.textContent  = `Bem-vindo, ${dados.nome}! Redirecionando...`;

    entrarComConta(dados);
  } catch (erro) {
    box.className    = 'login-result show error';
    title.textContent= 'ERRO';
    msg.textContent  = 'Não foi possível conectar ao servidor. Tente novamente.';
  }
});
