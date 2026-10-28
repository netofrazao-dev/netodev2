/**
 * Conteúdo das seções interativas (simulador, orçamento, processo e dúvidas).
 * Fica separado de links.ts para chegar junto com essas seções, depois da
 * primeira tela — edite aqui do mesmo jeito.
 */

/* ------------------------------------------------------------------ */
/* orçamento — mesmos preços do portfólio                              */
/* ------------------------------------------------------------------ */

export type Kind = "site" | "loja" | "sistema";

export const kinds: {
  id: Kind;
  label: string;
  short: string;
  hint: string;
  pitch: string;
  includes: string[];
  base: number;
  weeks: [number, number];
}[] = [
  {
    id: "site",
    label: "Site institucional",
    short: "Site",
    hint: "aparecer no Google e levar pro WhatsApp",
    pitch:
      "Seu negócio no Google, com uma página que abre rápido até no 4G daqui e leva o cliente direto pro seu WhatsApp.",
    includes: [
      "Design exclusivo, feito pro seu ramo",
      "Botão de WhatsApp em toda a página",
      "Cadastro no Google Meu Negócio",
      "Abre bem no celular e no computador",
    ],
    base: 350,
    weeks: [1, 2],
  },
  {
    id: "loja",
    label: "Loja virtual",
    short: "Loja",
    hint: "vender com carrinho e PIX",
    pitch:
      "Catálogo organizado, carrinho, PIX na hora e o pedido caindo pronto no seu WhatsApp, com endereço e tudo.",
    includes: [
      "Catálogo com fotos, preços e estoque",
      "Carrinho e checkout completo",
      "Pedido formatado direto no WhatsApp",
      "Abre bem no celular e no computador",
    ],
    base: 520,
    weeks: [2, 3],
  },
  {
    id: "sistema",
    label: "Sistema sob medida",
    short: "Sistema",
    hint: "organizar caixa, estoque e equipe",
    pitch:
      "Aquilo que hoje é planilha, caderno ou combinado de cabeça vira um sistema que qualquer funcionário consegue usar.",
    includes: [
      "Telas pensadas pra quem usa no balcão",
      "Acesso pelo celular e pelo computador",
      "Treino da equipe na entrega",
      "30 dias de ajuste inclusos",
    ],
    base: 700,
    weeks: [3, 6],
  },
];

export const features: { id: string; label: string; price: number; for: Kind[] }[] = [
  { id: "catalogo", label: "Catálogo de produtos", price: 70, for: ["site", "loja"] },
  { id: "pix", label: "Pagamento por PIX", price: 55, for: ["loja", "sistema"] },
  { id: "whats", label: "Pedido direto no WhatsApp", price: 40, for: ["site", "loja"] },
  { id: "admin", label: "Painel para você mesmo editar", price: 90, for: ["site", "loja", "sistema"] },
  { id: "login", label: "Área de login para clientes", price: 80, for: ["loja", "sistema"] },
  { id: "estoque", label: "Controle de estoque", price: 110, for: ["loja", "sistema"] },
  { id: "relatorios", label: "Relatórios e gráficos", price: 95, for: ["loja", "sistema"] },
  { id: "agenda", label: "Agendamento de horário", price: 90, for: ["site", "sistema"] },
  { id: "blog", label: "Blog ou página de notícias", price: 50, for: ["site"] },
  { id: "equipe", label: "Vários usuários com permissões", price: 85, for: ["sistema"] },
];

/** Urgência: +25% no preço e uma semana a menos. */
export const RUSH = 1.25;

/* ------------------------------------------------------------------ */
/* simulador "seu negócio online"                                      */
/* ------------------------------------------------------------------ */

export const swatches = [
  { id: "latao", label: "Latão", color: "#e0ac5c" },
  { id: "jade", label: "Jade", color: "#3fb79f" },
  { id: "acai", label: "Açaí", color: "#9b4fd9" },
  { id: "rosa", label: "Rosa", color: "#e0567f" },
  { id: "azul", label: "Azul", color: "#3b8de0" },
  { id: "coral", label: "Coral", color: "#ec6b3d" },
] as const;

export type SwatchId = (typeof swatches)[number]["id"];

export type Segment = {
  id: string;
  label: string;
  /** Nome do ícone (ver Simulator.tsx). */
  icon: "padaria" | "acai" | "roupas" | "barbearia" | "restaurante" | "mercadinho" | "farmacia" | "pousada";
  headline: string;
  sub: string;
  cta: string;
  section: string;
  items: [string, string][];
  swatch: SwatchId;
};

/** Os preços aqui são só ilustração da prévia — não é cardápio de ninguém. */
export const segments: Segment[] = [
  {
    id: "padaria",
    label: "Padaria",
    icon: "padaria",
    headline: "Pão quentinho toda manhã",
    sub: "Encomende pelo WhatsApp e retire sem fila.",
    cta: "Encomendar",
    section: "Saindo do forno",
    items: [
      ["Pão francês (kg)", "R$ 16,90"],
      ["Bolo de chocolate", "R$ 35,00"],
      ["Café da manhã completo", "R$ 18,00"],
    ],
    swatch: "latao",
  },
  {
    id: "acai",
    label: "Açaí",
    icon: "acai",
    headline: "Açaí grosso, do jeito do Marajó",
    sub: "Peça o litro e receba em casa, geladinho.",
    cta: "Pedir agora",
    section: "Mais pedidos",
    items: [
      ["Açaí 1 litro", "R$ 25,00"],
      ["Tigela 500 ml", "R$ 15,00"],
      ["Açaí com farinha", "R$ 18,00"],
    ],
    swatch: "acai",
  },
  {
    id: "roupas",
    label: "Loja de roupas",
    icon: "roupas",
    headline: "Moda nova toda semana",
    sub: "Veja o catálogo e separe pelo WhatsApp.",
    cta: "Ver catálogo",
    section: "Chegou agora",
    items: [
      ["Camiseta básica", "R$ 49,90"],
      ["Vestido midi", "R$ 89,90"],
      ["Bermuda jeans", "R$ 69,90"],
    ],
    swatch: "rosa",
  },
  {
    id: "barbearia",
    label: "Barbearia",
    icon: "barbearia",
    headline: "Corte marcado, sem espera",
    sub: "Escolha o horário e chegue na hora certa.",
    cta: "Agendar horário",
    section: "Serviços",
    items: [
      ["Corte", "R$ 25,00"],
      ["Barba", "R$ 15,00"],
      ["Corte + barba", "R$ 35,00"],
    ],
    swatch: "jade",
  },
  {
    id: "restaurante",
    label: "Restaurante",
    icon: "restaurante",
    headline: "Almoço caseiro todo dia",
    sub: "Cardápio do dia com entrega no bairro.",
    cta: "Ver cardápio",
    section: "Hoje tem",
    items: [
      ["Prato feito", "R$ 20,00"],
      ["Peixe frito", "R$ 35,00"],
      ["Suco natural", "R$ 8,00"],
    ],
    swatch: "coral",
  },
  {
    id: "mercadinho",
    label: "Mercadinho",
    icon: "mercadinho",
    headline: "A compra do mês sem sair de casa",
    sub: "Monte a lista e receba na porta.",
    cta: "Fazer pedido",
    section: "Ofertas da semana",
    items: [
      ["Arroz 5 kg", "R$ 27,90"],
      ["Café 500 g", "R$ 19,90"],
      ["Óleo de soja", "R$ 8,90"],
    ],
    swatch: "jade",
  },
  {
    id: "farmacia",
    label: "Farmácia",
    icon: "farmacia",
    headline: "Saúde pertinho de você",
    sub: "Peça e receba em casa, com atendimento rápido.",
    cta: "Falar com a farmácia",
    section: "Mais procurados",
    items: [
      ["Vitamina C", "R$ 22,90"],
      ["Protetor solar", "R$ 49,90"],
      ["Kit primeiros socorros", "R$ 39,90"],
    ],
    swatch: "azul",
  },
  {
    id: "pousada",
    label: "Pousada",
    icon: "pousada",
    headline: "Seu descanso no Marajó",
    sub: "Veja os quartos e reserve direto com a gente.",
    cta: "Reservar",
    section: "Quartos",
    items: [
      ["Quarto casal (diária)", "R$ 160,00"],
      ["Quarto família", "R$ 240,00"],
      ["Café da manhã", "incluso"],
    ],
    swatch: "latao",
  },
];

/* ------------------------------------------------------------------ */
/* processo e dúvidas — mesmos textos do portfólio                     */
/* ------------------------------------------------------------------ */

export const processSteps = [
  {
    n: "01",
    title: "Conversa",
    time: "30 minutos",
    body: "No WhatsApp ou tomando um café aqui em Breves. Eu pergunto como o negócio funciona hoje, o que dá trabalho e o que você quer resolver. Sem termo técnico.",
  },
  {
    n: "02",
    title: "Proposta",
    time: "até 2 dias",
    body: "Você recebe por escrito o que será feito, o prazo e o preço fechado. Se algo mudar no meio do caminho, a gente conversa antes — nunca depois da conta.",
  },
  {
    n: "03",
    title: "Construção",
    time: "1 a 6 semanas",
    body: "Eu te mando um link que atualiza sozinho conforme o trabalho anda. Você vê o site nascendo e pede ajuste na hora, não no final.",
  },
  {
    n: "04",
    title: "Entrega e treino",
    time: "1 dia + 30 dias",
    body: "Publico no ar, ensino você e sua equipe a mexer, e fico 30 dias fazendo ajustes sem cobrar nada a mais.",
  },
];

export const faq = [
  {
    q: "Quanto custa?",
    a: "Site institucional começa em R$ 350 e costuma fechar perto de R$ 500. Loja virtual começa em R$ 520, com média de R$ 850. Sistema sob medida começa em R$ 700, com média de R$ 1.100. Monte o seu no orçamento aqui em cima e tenha uma faixa em 30 segundos.",
  },
  {
    q: "Em quanto tempo fica pronto?",
    a: "Site institucional: 1 a 2 semanas. Loja virtual: 2 a 3 semanas. Sistema sob medida: 3 a 6 semanas, dependendo do tamanho. O prazo entra por escrito na proposta.",
  },
  {
    q: "Tem mensalidade?",
    a: "O site é seu, pago uma vez. O único custo fixo é o domínio próprio (seunegocio.com.br), cerca de R$ 40 por ano. Se quiser que eu cuide de tudo e faça alterações quando precisar, a manutenção é R$ 60 por mês — opcional e sem fidelidade.",
  },
  {
    q: "Você atende pessoalmente?",
    a: "Sim. Moro em Breves, então dá pra marcar no seu comércio mesmo. Para outras cidades do Marajó e do resto do Brasil, tudo funciona por WhatsApp e chamada de vídeo.",
  },
  {
    q: "Eu não entendo nada de computador. Vai dar certo?",
    a: "Vai. Metade do meu trabalho é justamente traduzir. Eu monto tudo pensando em quem vai usar no balcão, com botão grande e nome em português, e treino sua equipe na entrega.",
  },
  {
    q: "Meu negócio é pequeno. Vale a pena?",
    a: "Na maioria das vezes, sim — em negócio pequeno o retorno costuma aparecer mais rápido, porque uma venda a mais por dia já paga o investimento. Se eu achar que não vale para o seu caso, eu falo na primeira conversa.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Metade para começar e metade na entrega. Aceito PIX, transferência e parcelamento combinado.",
  },
  {
    q: "E se eu quiser mexer no site depois?",
    a: "Todo projeto entrega um painel onde você troca texto, foto e preço sozinho. O que exige código, eu faço — no plano de manutenção ou cobrado por hora, como preferir.",
  },
];
