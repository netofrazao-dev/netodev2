# Neto Frazão — link da bio

Página única para o link do Instagram e das redes: primeira impressão do trabalho,
com o WhatsApp sempre a um toque. Mesma identidade "DELTA" do portfólio.

React + Vite + TypeScript + Tailwind v4 + Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera /dist
npm run preview  # serve o build
```

## O que a página faz

- **Topo**: foto com anel animado (inclina junto com o celular no Android), nome letra
  a letra, relógio de Breves com "online/fora do horário", card **AGORA** e números.
- **Botões rápidos**: WhatsApp, salvar contato (.vcf), **QR Code** (gerado no celular,
  dá para baixar ou mandar a imagem) e compartilhar.
- **Projetos**: filtro Sites / Lojas / Sistemas, carrossel de arrastar e gaveta com
  **o site rolando dentro de um celular**, botão "próximo projeto" e link direto
  (`…/#projeto=apham`).
- **Simulador** "Seu negócio, online": a pessoa digita o nome, escolhe o ramo e a cor e
  vê uma prévia do site; manda pronto no WhatsApp ou compartilha a prévia por link
  (`…/?nome=…&tipo=…&cor=…#simular`).
- **Orçamento** em 30 segundos: tipo, recursos e prazo, com o resumo preso no rodapé da
  tela. Não mostra valores — a pessoa manda tudo no WhatsApp e o preço é combinado na conversa.
- **Como funciona**, **Dúvidas**, fita de tecnologias e o convite final.
- **Dock** no celular (atalhos + WhatsApp no centro) e **"voltar" do celular** fechando
  qualquer gaveta.
- Instalável como app e abre **sem internet** depois da primeira visita.

## Onde mexer

- **`src/data/links.ts`** — contatos, frases do topo, card "AGORA" (`site.now`), links e
  **projetos** (prints em `public/projetos/`).
- **`src/data/extras.ts`** — simulador (ramos e cores), orçamento (tipos, recursos e
  prazos), passos do "Como funciona" e dúvidas.

Detalhes dos projetos:

- `live`: link do projeto no ar (botão "Ver no ar" e selo "No ar").
- `cover` + `coverSmall`: print do computador em 1000px e 640px (o celular baixa o menor).
- `mobile`: print do celular (página longa) — aparece rolável dentro do celular na gaveta.
- `category`: `site`, `loja` ou `sistema` (filtro).
- `private: true`: sistema interno — selo "Privado", sem link e sem print real. Há um
  modelo comentado no topo da lista.
- **Salvar contato**: o cartão é o arquivo `public/neto-frazao.vcf`.
- **Portfólio completo**: quando o netofrazao.com.br estiver no ar, preencha
  `portfolio: "https://netofrazao.com.br"` — o card e os botões "Estudo de caso" aparecem.

## Animações e "reduzir movimento"

A página respeita a opção de acessibilidade "reduzir movimento" do aparelho: nesse caso
fica só com transições suaves, sem deslizes, abertura ou parallax.

Se no seu PC as animações não aparecem, é porque o Windows está com
**Configurações → Acessibilidade → Efeitos visuais → Efeitos de animação** desligado.
Para ver tudo sem mexer no sistema, abra a página com **`?movimento`** no fim.

A abertura (cortina com o monograma) roda uma vez por sessão e vem desenhada no próprio
HTML — aparece antes do JavaScript.

## Leveza

- Fontes servidas pela própria página (sem Google Fonts) e pré-carregadas.
- CSS embutido no HTML; seções interativas e gavetas carregam depois, quando o navegador
  fica livre; recursos pesados do Framer Motion chegam em paralelo.
- Sem desfoque animado nem `backdrop-filter` em elementos que rolam; o fundo animado
  roda em resolução 1x no celular, pausa com gaveta aberta e começa só depois do load.
- Lighthouse (celular, 4G simulado): desempenho ~90, acessibilidade, boas práticas e SEO 100.

## Publicação

No ar em **https://netofrazao.vercel.app** (projeto `neto-links` na Vercel), ligado ao
GitHub `netofrazao-dev/netodev2`: push no `main` publica sozinho; outras branches
geram prévia.

Se trocar de domínio, atualize `og:url`, `og:image`, `twitter:image`, `canonical` e o
JSON-LD no `index.html`, `site.url` em `links.ts`, `robots.txt` e `sitemap.xml` —
WhatsApp e Instagram só mostram a prévia com URL absoluta.

`vercel.json` cuida dos cabeçalhos de segurança, do cache e do tipo do `.vcf`.
