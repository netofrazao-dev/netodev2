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

  photo: "/neto.webp",

  /** Janela em que você costuma responder rápido (horário de Breves). */
  hours: { from: 8, to: 21 },
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
  "a sua farmácia",
  "a sua distribuidora",
  "a sua pousada",
] as const;

export const proof = [
  { num: 3, suffix: "", label: "sistemas em produção" },
  { num: 2, suffix: "h", label: "para responder" },
  { num: 30, suffix: "d", label: "de ajuste inclusos" },
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
    detail: "processo, preços e estudos de caso",
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

export type Project = {
  slug: string;
  name: string;
  kicker: string;
  year: string;
  type: string;
  client: string;
  summary: string;
  /** Print em /public/projetos. Sem isso, entra uma capa desenhada em CSS. */
  cover?: string;
  hues: [string, string];
  /** Link do projeto no ar. Deixe sem para esconder o botão. */
  live?: string;
  solution: { title: string; body: string }[];
  stack: string[];
  results: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    slug: "mapa-burger",
    name: "Mapa Burger",
    kicker: "O caderno do caixa virou sistema",
    year: "2026",
    type: "Sistema de gestão",
    client: "Hamburgueria · Breves, PA",
    summary:
      "Fechamento de caixa, sangria, suprimento, estoque e turnos em um só lugar. O gerente fecha o dia em três minutos e sabe exatamente onde faltou dinheiro.",
    hues: ["#D6A756", "#8C6E2F"],
    solution: [
      {
        title: "Fechamento guiado por etapas",
        body: "Contagem, sangrias, suprimentos e resultado. A divergência aparece na hora e exige justificativa.",
      },
      {
        title: "Vocabulário do balcão",
        body: "Turno, sangria, suprimento. Os nomes da tela são os que a equipe já usava — treino de vinte minutos.",
      },
      {
        title: "Estoque ligado à venda",
        body: "Baixa automática por item vendido, alerta de mínimo e histórico por fornecedor.",
      },
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "Supabase", "Tailwind", "Zod"],
    results: [
      { value: "3 min", label: "para fechar o caixa" },
      { value: "0", label: "planilhas paralelas" },
      { value: "100%", label: "divergências justificadas" },
    ],
  },
  {
    slug: "diversus-shop",
    name: "Diversus Shop",
    kicker: "Uma loja que vende de madrugada",
    year: "2025",
    type: "Loja virtual",
    client: "Loja de acessórios · Breves, PA",
    summary:
      "Catálogo completo, carrinho, PIX com QR Code e o pedido chegando formatado no WhatsApp da loja. Estoque controlado direto no banco de dados.",
    cover: "/projetos/diversus-shop.webp",
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
    year: "2025",
    type: "Plataforma completa",
    client: "Livraria física · Breves, PA",
    summary:
      "Portal do leitor, backoffice do dono, multa por atraso, aviso automático por e-mail e LGPD. Uma livraria de bairro com sistema de biblioteca grande.",
    cover: "/projetos/estante-livre.webp",
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
    slug: "jonatan-castro-fotografia",
    name: "Jonatan Castro",
    kicker: "O portfólio que fecha o ensaio na conversa",
    year: "2026",
    type: "Site com portfólio",
    client: "Estúdio fotográfico",
    summary:
      "Galeria de ensaios, apresentação do estúdio e um caminho curto até o WhatsApp. Quem gosta do trabalho fala com o fotógrafo na mesma tela.",
    cover: "/projetos/jonatan-castro.webp",
    hues: ["#E8E3DA", "#7C6A58"],
    solution: [
      {
        title: "Galeria pensada para a foto",
        body: "Fundo escuro, nenhuma moldura competindo e carregamento sob demanda.",
      },
      {
        title: "Separado por tipo de ensaio",
        body: "Cada seção termina no WhatsApp com o assunto já preenchido.",
      },
      {
        title: "Pronto para a busca local",
        body: "SEO e dados estruturados para quem pesquisa fotógrafo na região.",
      },
    ],
    stack: ["React", "Vite", "TypeScript", "Tailwind"],
    results: [
      { value: "WhatsApp", label: "com o ensaio citado" },
      { value: "Mobile", label: "galeria pensada primeiro" },
      { value: "SEO", label: "pronto para busca local" },
    ],
  },
  {
    slug: "king-style",
    name: "King Style",
    kicker: "O dono cadastra, o cliente compra",
    year: "2026",
    type: "Loja virtual",
    client: "Loja de sandálias",
    summary:
      "Catálogo com numeração, cor e estoque por variação, painel onde o dono configura tudo sozinho e o pedido chegando formatado no WhatsApp.",
    cover: "/projetos/king-style.webp",
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

export type Service = {
  id: string;
  title: string;
  pitch: string;
  includes: string[];
  from: number;
  deadline: string;
};

export const services: Service[] = [
  {
    id: "site",
    title: "Site institucional",
    pitch:
      "Seu negócio no Google, com uma página que abre rápido até no 4G daqui e leva o cliente direto pro seu WhatsApp.",
    includes: [
      "Design exclusivo, feito pro seu ramo",
      "Botão de WhatsApp em toda a página",
      "Cadastro no Google Meu Negócio",
      "Domínio próprio (seunegocio.com.br)",
    ],
    from: 350,
    deadline: "1 a 2 semanas",
  },
  {
    id: "loja",
    title: "Loja virtual",
    pitch:
      "Catálogo organizado, carrinho, PIX na hora e o pedido caindo pronto no seu WhatsApp, com endereço e tudo.",
    includes: [
      "Catálogo com fotos, preços e estoque",
      "Pagamento por PIX com QR Code",
      "Pedido formatado direto no WhatsApp",
      "Painel para você cadastrar produtos",
    ],
    from: 520,
    deadline: "2 a 3 semanas",
  },
  {
    id: "sistema",
    title: "Sistema sob medida",
    pitch:
      "Aquilo que hoje é planilha, caderno ou combinado de cabeça vira um sistema que qualquer funcionário consegue usar.",
    includes: [
      "Fechamento de caixa, sangria e suprimento",
      "Controle de estoque e fornecedores",
      "Relatórios que mostram onde está o lucro",
      "Acessos separados por função",
    ],
    from: 700,
    deadline: "3 a 6 semanas",
  },
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
