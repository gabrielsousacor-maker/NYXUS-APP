// login.js - separado do seu app.js
const form = document.getElementById('loginForm');
const box = document.getElementById('resultBox');
const msg = document.getElementById('loginMsg');
const title = document.getElementById('resultTitle');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  box.classList.add('show');
  
  // simulação - troque pelo seu fetch
  if (senha.length < 4) {
    box.className = 'login-result show error';
    title.textContent = 'ERRO';
    msg.textContent = 'Senha muito curta.';
  } else {
    box.className = 'login-result show success';
    title.textContent = 'SUCESSO';
    msg.textContent = `Logado como ${email}`;
  }
});