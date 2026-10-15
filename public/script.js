const form = document.getElementById('formulario');
const area = document.getElementById('desenho');
const mensagem = document.getElementById('mensagem');
const baixar = document.getElementById('baixar');
let token = '';
let svgAtual = '';
async function iniciarLogin() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Login Google ainda não configurado.');
    const { clientId } = await res.json();
    if (!window.google?.accounts?.id) throw new Error('Atualize a página para carregar o login Google.');
    google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => {
      token = credential;
      document.getElementById('conta').textContent = 'Login recebido. Sua conta será verificada pelo servidor ao desenhar.';
      mensagem.textContent = '';
    }});
    google.accounts.id.renderButton(document.getElementById('login-google'), { theme: 'outline', size: 'large' });
    document.getElementById('conta').textContent = 'Entre com sua conta Google para assinar o desenho.';
  } catch (e) { document.getElementById('conta').textContent = e.message; }
}
if (document.readyState === 'complete') iniciarLogin();
else window.addEventListener('load', iniciarLogin, { once: true });
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.textContent = '';
  svgAtual = '';
  baixar.hidden = true;
  area.replaceChildren();
  const numero = Number(document.getElementById('numero').value);
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = 'Digite um inteiro entre 1 e 100.';
    return;
  }
  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  try {
    const res = await fetch('/api/desenho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ numero }),
    });
    if (!res.ok) {
      if (res.status === 401) token = '';
      const dados = await res.json().catch(() => ({}));
      throw new Error(dados.erro || (res.status === 400 ? 'Digite um inteiro entre 1 e 100.' : res.status === 401 ? 'Entre novamente com sua conta Google.' : 'Não foi possível gerar o desenho.'));
    }
    svgAtual = await res.text();
    area.innerHTML = svgAtual;
    baixar.hidden = false;
  } catch (erro) { mensagem.textContent = erro.message; }
  finally { botao.disabled = false; }
});
baixar.addEventListener('click', () => {
  if (!svgAtual) return;
  const url = URL.createObjectURL(new Blob([svgAtual], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'exemplo.svg';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
