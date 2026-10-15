import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

const erro = (status, mensagem) => new Response(JSON.stringify({ erro: mensagem }), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(status === 405 ? { Allow: "POST" } : {}) },
});

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return erro(405, "Use o método POST.");
  let corpo;
  try { corpo = await request.json(); }
  catch { return erro(400, "Envie um corpo JSON válido com o número."); }
  if (!corpo || !numeroValido(corpo.numero)) return erro(400, "Digite um inteiro entre 1 e 100.");

  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("Authorization") || "")?.[1];
  if (!token) return erro(401, "Entre com sua conta Google para gerar o desenho.");
  try {
    const resposta = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token));
    if (resposta.status !== 200) return erro(401, "Login inválido ou expirado. Entre novamente.");
    const dados = await resposta.json();
    if (!env.GOOGLE_CLIENT_ID || dados.aud !== env.GOOGLE_CLIENT_ID || dados.email_verified !== "true" ||
        typeof dados.email !== "string" || !dados.email || !Number.isFinite(Number(dados.exp)) || Number(dados.exp) <= Date.now() / 1000) {
      return erro(401, "Login inválido, expirado ou e-mail não verificado. Entre novamente.");
    }
    return new Response(gerarDesenho(corpo.numero, dados.email), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  } catch { return erro(401, "Não foi possível verificar o login Google. Entre novamente."); }
}
