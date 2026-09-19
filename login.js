// login.js — login + cadastro em uma tela só

// Códigos de acesso válidos gerados por vocês
const codigosValidos = [
  'NYXUS-A1B2-C3D4',
  'NYXUS-E5F6-G7H8',
  'NYXUS-I9J0-K1L2',
  'NYXUS-M3N4-O5P6',
  'NYXUS-Q7R8-S9T0',
];

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
// Formulário de Login
// ============================================================
document.getElementById('loginForm').addEventListener('submit', (e) => {
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

  box.className    = 'login-result show success';
  title.textContent= 'SUCESSO';
  msg.textContent  = `Logado como ${email}. Redirecionando...`;

  localStorage.setItem('nyxus_user', email);

  setTimeout(() => {
    window.location.href = 'catalogo.html';
  }, 1500);
});

// ============================================================
// Formulário de Cadastro
// ============================================================
document.getElementById('cadastroForm').addEventListener('submit', (e) => {
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

  if (!codigosValidos.includes(codigo)) {
    box.className    = 'login-result show error';
    title.textContent= 'CÓDIGO INVÁLIDO';
    msg.textContent  = 'O código informado não existe ou já foi utilizado.';
    return;
  }

  box.className    = 'login-result show success';
  title.textContent= 'SUCESSO';
  msg.textContent  = `Bem-vindo, ${nome}! Redirecionando...`;

  localStorage.setItem('nyxus_user', email);
  localStorage.setItem('nyxus_nome', nome);
  localStorage.setItem('nyxus_plano', 'premium');

  setTimeout(() => {
    window.location.href = 'catalogo.html';
  }, 1500);
});
