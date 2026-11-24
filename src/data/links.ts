/**
 * Todo o conteúdo da página mora aqui. Edite este arquivo para mudar texto,
 * link, projeto ou preço sem encostar em nenhum componente.
 */

export const site = {
  name: "Neto Frazão",
  role: "Desenvolvedor web e de sistemas",
  city: "Breves",
  state: "PA",
  region: "Marajó",
  coords: "01°40′56″S · 50°28′48″O",
  timeZone: "America/Belem",

  /** Endereço público desta página (usado no QR Code e no compartilhar). */
  url: "https://netofrazao.vercel.app",

  whatsapp: "5591992625811",
  email: "frazaoneto307@gmail.com",
  github: "https://github.com/netofrazao-dev",
  githubHandle: "netofrazao-dev",
  instagram: "https://www.instagram.com/sites.neto_dev/",
  instagramHandle: "@sites.neto_dev",

  /**
   * Portfólio completo. Deixe "" enquanto o site não estiver no ar —
   * o card "Portfólio completo" e os links de estudo de caso somem sozinhos.
   * Quando publicar, escreva: "https://netofrazao.com.br"
   */
  portfolio: "",

  /** Cartão de contato em /public. Se mudar telefone ou e-mail, edite lá também. */
  vcard: "/neto-frazao.vcf",

  /** Foto em três tamanhos (o navegador escolhe o menor que fica nítido). */
  photo: "/neto.webp",
  photoSet: "/neto-240.webp 240w, /neto-360.webp 360w, /neto.webp 480w",

  /** Janela em que você costuma responder rápido (horário de Breves). */
  hours: { from: 8, to: 21 },

  /**
   * O que você está fazendo agora — aparece num card "AGORA" no topo.
   * Deixe "" para esconder.
   */
  now: "",
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const defaultMessage =
  "Oi, Neto! Vi seu link no Instagram e quero um orçamento para o meu negócio.";

/** Frases que giram embaixo do nome — negócios reais de Breves. */
export const heroNouns = [
  "a sua padaria",
  "o seu mercadinho",
  "a sua loja de roupas",
  "o seu restaurante",
  "a sua barbearia",
  "o seu açaí",
  "a sua farmácia",
  "a sua pousada",
] as const;

export type LinkKind = "instagram" | "portfolio" | "github" | "email";

export type LinkItem = {
  kind: LinkKind;
  title: string;
  detail: string;
  href: string;
  /** Texto do cursor no desktop. */
  cursor: string;
};

export const links: LinkItem[] = [
  {
    kind: "instagram",
    title: "Instagram",
    detail: `${site.instagramHandle} · bastidores e entregas`,
    href: site.instagram,
    cursor: "seguir",
  },
  {
    kind: "portfolio",
    title: "Portfólio completo",
    detail: "processo e estudos de caso",
    href: site.portfolio,
    cursor: "abrir",
  },
  {
    kind: "github",
    title: "GitHub",
    detail: `${site.githubHandle} · código aberto`,
    href: site.github,
    cursor: "código",
  },
  {
    kind: "email",
    title: "E-mail",
    detail: site.email,
    href: `mailto:${site.email}`,
    cursor: "copiar",
  },
].filter((l) => l.href !== "") as LinkItem[];

/* ------------------------------------------------------------------ */
/* projetos                                                            */
/* ------------------------------------------------------------------ */

export type Category = "site" | "loja" | "sistema";

export const categories: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "site", label: "Sites" },
  { id: "loja", label: "Lojas" },
  { id: "sistema", label: "Sistemas" },
];

export type Project = {
  slug: string;
  name: string;
  kicker: string;
  type: string;
  category: Category;
  client: string;
  summary: string;
  /** Print do computador em /public/projetos (1000px de largura). */
  cover?: string;
  /** Mesmo print com 640px — o celular baixa este. Opcional. */
  coverSmall?: string;
  /** Print do celular (página rolável dentro do telefone). Opcional. */
  mobile?: string;
  hues: [string, string];
  /** Link do projeto no ar. Deixe sem para esconder o botão. */
  live?: string;
  /**
   * Sistema interno de cliente: ganha o selo "Privado" e nunca mostra link. Prints
   * só com dados fictícios (a gaveta avisa); sem `cover`, usa a capa desenhada.
   */
  private?: boolean;
  solution: { title: string; body: string }[];
  stack: string[];
  results: { value: string; label: string }[];
};

export const projects: Project[] = [
  /*
   * Modelo para um sistema interno (de cliente que não pode ter link) — é só
   * tirar o comentário e ajustar o texto. `private: true` esconde qualquer link.
   *
  {
    slug: "sistema-interno",
    name: "Nome do sistema",
    kicker: "…",
    type: "Sistema interno",
    category: "sistema",
    client: "Cliente · Breves, PA",
    summary: "…",
    hues: ["#3fb79f", "#1d5b52"],
    private: true,
    solution: [{ title: "…", body: "…" }],
    stack: ["React", "TypeScript", "Supabase"],
    results: [{ value: "…", label: "…" }],
  },
  */
  {
    slug: "apham",
    name: "APHAM",
    kicker: "Site da associação com loja que entrega em todo o Brasil",
    type: "Site + marketplace",
    category: "loja",
    client: "Associação de handebol · Breves, PA",
    summary:
      "O site da Associação de Praticantes de Handebol do Marajó: notícias, competições, transmissões ao vivo e uma loja onde a APHAM e outros vendedores anunciam os próprios produtos — com frete calculado pelo CEP, pagamento confirmado automaticamente e entrega para todo o Brasil. A associação cuida de tudo por um painel, sem mexer em código.",
    cover: "/projetos/apham.webp",
    coverSmall: "/projetos/apham-640.webp",
    mobile: "/projetos/apham-mobile.webp",
    hues: ["#38BDF8", "#84CC16"],
    live: "https://www.handebolmarajo.org",
    solution: [
      {
        title: "Uma loja, vários vendedores",
        body: "A APHAM e lojistas parceiros vendem no mesmo lugar, cada um com seus produtos, e o cliente acompanha o pedido por uma página própria.",
      },
      {
        title: "Frete e pagamento no automático",
        body: "O cliente digita o CEP e já vê o frete para qualquer lugar do Brasil. O pagamento é confirmado sozinho: ninguém precisa conferir comprovante para liberar o pedido.",
      },
      {
        title: "Painel para a associação",
        body: "Novidades, eventos, produtos, pedidos e mensagens editados pelo painel — o site muda sem depender de mim.",
      },
      {
        title: "Jogo ao vivo dentro do site",
        body: "Basta colar o link do YouTube: a transmissão aparece na página com o selo AO VIVO.",
      },
    ],
    stack: ["React", "Vite", "Tailwind", "Supabase", "Resend", "Vercel"],
    results: [
      { value: "Brasil", label: "entrega em todo o país" },
      { value: "CEP", label: "frete calculado na hora" },
      { value: "0", label: "comprovante para conferir" },
    ],
  },
  {
    slug: "regulacao-breves",
    name: "Regulação Breves",
    kicker: "Os pacientes que precisam de leito, acompanhados em tempo real",
    type: "Sistema de saúde",
    category: "sistema",
    client: "UPA 24h e Hospital Municipal · Breves, PA",
    summary:
      "Sistema da UPA 24h e do Hospital Municipal de Breves para acompanhar cada paciente que precisa de leito em outro hospital: cadastro, painel ao vivo, agendamento de exames, relatórios no timbre da Secretaria de Saúde e indicadores. Cada unidade vê só os próprios pacientes, e tudo o que muda fica registrado.",
    cover: "/projetos/regulacao-breves.webp",
    coverSmall: "/projetos/regulacao-breves-640.webp",
    mobile: "/projetos/regulacao-breves-mobile.webp",
    hues: ["#2f8f6f", "#1d4f91"],
    private: true,
    solution: [
      {
        title: "Painel de leitos ao vivo",
        body: "O quadro \"Controle de Leitos Cadastrados\" se atualiza sozinho em todos os aparelhos quando alguém muda a situação de um paciente, e sai impresso numa folha A4.",
      },
      {
        title: "Duas unidades, dados separados",
        body: "UPA e Hospital Municipal usam o mesmo sistema, cada um com a sua cor e só com os seus pacientes. As permissões ficam no banco de dados, não só na tela.",
      },
      {
        title: "Relatórios e indicadores",
        body: "Relação mensal em PDF e Excel no timbre oficial, protocolo de exames com duas vias e gráficos de espera e transferências, sem nome de paciente nos indicadores.",
      },
      {
        title: "Tudo registrado e guardado",
        body: "Quem cadastrou, atualizou ou excluiu cada coisa, com o antes e o depois. Backup diário criptografado e instalável no celular como app.",
      },
    ],
    stack: ["React", "TypeScript", "Supabase", "Realtime", "jsPDF", "Vercel"],
    results: [
      { value: "2", label: "unidades de saúde" },
      { value: "Ao vivo", label: "painel em todos os aparelhos" },
      { value: "PDF", label: "relatório no timbre oficial" },
    ],
  },
  {
    slug: "diversus-shop",
    name: "Diversus Shop",
    kicker: "Uma loja que vende de madrugada",
    type: "Loja virtual",
    category: "loja",
    client: "Loja de acessórios · Breves, PA",
    summary:
      "Catálogo completo, carrinho, PIX com QR Code e o pedido chegando formatado no WhatsApp da loja. Estoque controlado direto no banco de dados.",
    cover: "/projetos/diversus-shop.webp",
    coverSmall: "/projetos/diversus-shop-640.webp",
    mobile: "/projetos/diversus-shop-mobile.webp",
    hues: ["#7B5CD6", "#3E9C8F"],
    live: "https://diversus-shop.vercel.app",
    solution: [
      {
        title: "Checkout que termina no WhatsApp",
        body: "PIX com QR Code gerado na hora e o pedido cai pronto: itens, tamanhos, valor e endereço.",
      },
      {
        title: "Estoque à prova de venda dupla",
        body: "Baixa por trigger no banco, dentro da transação do pedido.",
      },
      {
        title: "Instalável como aplicativo",
        body: "PWA: o cliente adiciona na tela inicial e abre como app.",
      },
    ],
    stack: ["React", "TypeScript", "Tailwind", "Zustand", "React Query", "Supabase", "PWA"],
    results: [
      { value: "24h", label: "de loja aberta" },
      { value: "PIX", label: "pago antes do pedido" },
      { value: "PWA", label: "instalável no celular" },
    ],
  },
  {
    slug: "estante-livre",
    name: "Estante Livre",
    kicker: "Aluguel de livros com régua financeira",
    type: "Plataforma completa",
    category: "sistema",
    client: "Livraria física · Breves, PA",
    summary:
      "Portal do leitor, backoffice do dono, multa por atraso, aviso automático por e-mail e LGPD. Uma livraria de bairro com sistema de biblioteca grande.",
    cover: "/projetos/estante-livre.webp",
    coverSmall: "/projetos/estante-livre-640.webp",
    mobile: "/projetos/estante-livre-mobile.webp",
    hues: ["#3E9C8F", "#D6A756"],
    live: "https://estande-livre.vercel.app",
    solution: [
      {
        title: "Motor financeiro configurável",
        body: "Faixas de preço, multa por dia e desconto por condição do exemplar, sem depender de quem está no caixa.",
      },
      {
        title: "Avisos que chegam sozinhos",
        body: "E-mail automático antes do vencimento, no dia e depois do atraso.",
      },
      {
        title: "Sustentação levada a sério",
        body: "Backup diário, monitoramento de erros e política de dados para a LGPD.",
      },
    ],
    stack: ["React", "TypeScript", "Supabase", "Edge Functions", "Resend", "Sentry"],
    results: [
      { value: "3", label: "avisos por locação" },
      { value: "LGPD", label: "no fluxo do leitor" },
      { value: "Diário", label: "backup automático" },
    ],
  },
  {
    slug: "chamada-escolar",
    name: "Challenger Presença",
    kicker: "Chamada, frequência e horas dos professores de uma escola de idiomas",
    type: "Sistema escolar",
    category: "sistema",
    client: "Challenger Language School",
    summary:
      "Sistema de chamadas da Challenger Language School, instalável no celular como app. O professor vê as aulas do dia e faz a chamada com um toque por aluno; a coordenação acompanha professores, turmas e horas, com relatórios em PDF e Excel.",
    cover: "/projetos/challenger-presenca.webp",
    coverSmall: "/projetos/challenger-presenca-640.webp",
    mobile: "/projetos/challenger-presenca-mobile.webp",
    hues: ["#1f3a93", "#e53935"],
    private: true,
    solution: [
      {
        title: "Chamada em segundos",
        body: "As aulas de hoje aparecem logo na entrada. Um toque por aluno, botão de todos presentes e aviso se sair sem salvar.",
      },
      {
        title: "Aulas do jeito que acontecem",
        body: "Reforço e reposição, professor substituto e aula que não aconteceu (sem falta para ninguém), tudo contando certo nas horas.",
      },
      {
        title: "Relatórios para a coordenação",
        body: "Frequência por aluno com alerta abaixo de 75%, calendário do mês, horas de cada professor e relatório mensal em PDF e Excel.",
      },
      {
        title: "App no celular",
        body: "Instala no Android e no iPhone, funciona com internet fraca e tem tema claro e escuro.",
      },
    ],
    stack: ["JavaScript", "Supabase", "PWA", "GitHub Pages"],
    results: [
      { value: "1 toque", label: "por aluno na chamada" },
      { value: "Horas", label: "de cada professor no mês" },
      { value: "PDF", label: "e Excel prontos" },
    ],
  },
  {
    slug: "jonatan-castro-fotografia",
    name: "Jonatan Castro",
    kicker: "Portfólio escuro e editorial que leva direto ao WhatsApp",
    type: "Site com portfólio",
    category: "site",
    client: "Estúdio fotográfico · Breves, PA",
    summary:
      "Site do estúdio Jonatan Castro Fotografia: topo em tela cheia com as fotos do estúdio, portfólio com filtro e visualizador que desliza no celular, serviços com preço e um formulário que abre o WhatsApp com a mensagem pronta. As fotos foram otimizadas para abrir rápido até no 4G.",
    cover: "/projetos/jonatan-castro.webp",
    coverSmall: "/projetos/jonatan-castro-640.webp",
    mobile: "/projetos/jonatan-castro-mobile.webp",
    live: "https://jcfotografia.vercel.app",
    hues: ["#C9A45C", "#1A1712"],
    solution: [
      {
        title: "Portfólio que valoriza a foto",
        body: "Filtro por Ensaios, Família & kids e Eventos, e visualizador em tela cheia com setas, teclado e o deslizar do dedo.",
      },
      {
        title: "Do serviço ao WhatsApp",
        body: "Cada serviço tem preço e um botão que já escolhe o ensaio no formulário. A mensagem chega pronta no WhatsApp, com a data desejada.",
      },
      {
        title: "Leve até no 4G",
        body: "Fotos de até 6000 px viraram versões de 640, 1200 e 2000 px: o celular baixa só o tamanho de que precisa.",
      },
    ],
    stack: ["HTML", "CSS", "JavaScript", "Vercel"],
    results: [
      { value: "WhatsApp", label: "mensagem pronta com o ensaio" },
      { value: "Filtro", label: "portfólio por tipo de ensaio" },
      { value: "4G", label: "fotos otimizadas, abre rápido" },
    ],
  },
  {
    slug: "king-style",
    name: "King Style",
    kicker: "O dono cadastra, o cliente compra",
    type: "Loja virtual",
    category: "loja",
    client: "Loja de streetwear e calçados",
    summary:
      "Roupas, relógios e calçados num catálogo com tamanho, numeração e estoque por variação, painel onde o dono configura tudo sozinho e o pedido chegando formatado no WhatsApp.",
    cover: "/projetos/king-style.webp",
    coverSmall: "/projetos/king-style-640.webp",
    mobile: "/projetos/king-style-mobile.webp",
    live: "https://king-style.netlify.app",
    hues: ["#D64F7A", "#F2B33D"],
    solution: [
      {
        title: "Painel que o dono usa sem manual",
        body: "Foto, preço e grade de numeração. Cada variação tem o próprio estoque.",
      },
      {
        title: "Só entra no carrinho o que existe",
        body: "Número e cor escolhidos antes — acabou a conversa de disponibilidade.",
      },
      {
        title: "Pedido pronto no WhatsApp",
        body: "Modelo, numeração, cor, total e entrega, sem digitar nada de novo.",
      },
    ],
    stack: ["React", "TypeScript", "Tailwind", "Zustand", "Supabase"],
    results: [
      { value: "Estoque", label: "por número e cor" },
      { value: "0", label: "dependência de mim" },
      { value: "WhatsApp", label: "pedido formatado" },
    ],
  },
];

/** Números do topo. "Projetos no ar" é contado sozinho a partir da lista. */
export const proof = [
  {
    num: projects.filter((p) => p.live && !p.private).length,
    suffix: "",
    label: "projetos no ar",
  },
  { num: 2, suffix: "h", label: "para responder" },
  { num: 30, suffix: "d", label: "de ajuste inclusos" },
];

export const stack = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "PostgreSQL",
  "Prisma",
  "React Query",
  "Zustand",
  "Vite",
  "Node.js",
  "Vercel",
  "PWA",
  "LGPD",
];
