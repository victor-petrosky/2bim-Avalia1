# Desenho Assinado

Aplicação com login Google Identity Services e geração de SVG no servidor.
O navegador envia o número para POST /api/desenho com o ID token no cabeçalho Authorization: Bearer.
O servidor valida o token no Google, confere aud e email_verified e obtém o e-mail da assinatura.

## Estrutura

- public/: interface e cliente da API.
- lib/desenho.js: implementação original preservada.
- functions/api/desenho.js: validação e geração do SVG.
- functions/api/config.js: fornece o Client ID público ao navegador.

## Publicação

Cloudflare Pages conectado à branch main.
Framework: None. Comando de build: vazio. Diretório de saída: public.
Configurar GOOGLE_CLIENT_ID no ambiente de produção e reimplantar.

## Evidência

Após publicar e autenticar, gerar o número 79, baixar o SVG e adicionar em evidencias/exemplo.svg.

## Identificação

Nome: Victor Petrosky

RA: 2026108079

URL: https://2bim-avalia1-dek.pages.dev
