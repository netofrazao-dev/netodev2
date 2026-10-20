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

## Onde mexer

Todo o conteúdo fica em **`src/data/links.ts`**: contatos, frases do topo, números,
links, projetos (com prints em `public/projetos/`), serviços e preços, tecnologias.

- **Portfólio completo**: quando o netofrazao.com.br estiver no ar, preencha
  `portfolio: "https://netofrazao.com.br"`. O card "Portfólio completo" e os botões
  "Estudo de caso" aparecem sozinhos.
- **"Ver no ar"** nos projetos: campo `live` de cada projeto. Sem ele, o botão some.
- **Salvar contato**: o cartão é o arquivo `public/neto-frazao.vcf`. Se mudar telefone
  ou e-mail, edite lá também.
- **Horário de "Online"**: `site.hours` (horário de Breves).

## Animações e "reduzir movimento"

A página respeita a opção de acessibilidade "reduzir movimento" do aparelho: nesse caso
ela fica só com transições suaves, sem deslizes, abertura ou parallax.

Se no seu PC as animações não aparecem, é porque o Windows está com
**Configurações → Acessibilidade → Efeitos visuais → Efeitos de animação** desligado.
Para ver tudo sem mexer no sistema, abra a página com **`?movimento`** no fim:

```
http://localhost:5173/?movimento
```

A abertura (cortina com o monograma) roda uma vez por sessão. Para rever, feche a aba
ou rode `sessionStorage.clear()` no console.

## Publicação

No ar em **https://netofrazao.vercel.app** (projeto `neto-links` na Vercel).
Se trocar de domínio, atualize `og:url`, `og:image`, `twitter:image` e `canonical`
no `index.html` — WhatsApp e Instagram só mostram a prévia com URL absoluta.

`vercel.json` já cuida do cache dos assets e do tipo do arquivo `.vcf`.
