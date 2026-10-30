/**
 * Conteúdo das seções interativas (simulador, orçamento, processo e dúvidas).
 * Fica separado de links.ts para chegar junto com essas seções, depois da
 * primeira tela — edite aqui do mesmo jeito.
 */

/* ------------------------------------------------------------------ */
/* orçamento — tipo, recursos e prazo; o valor é combinado na conversa */
/* ------------------------------------------------------------------ */

export type Kind = "site" | "loja" | "sistema";

export const kinds: {
  id: Kind;
  label: string;
  short: string;
  hint: string;
  pitch: string;
  includes: string[];
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
    weeks: [3, 6],
  },
];

export const features: { id: string; label: string; for: Kind[] }[] = [
  { id: "catalogo", label: "Catálogo de produtos", for: ["site", "loja"] },
  { id: "pix", label: "Pagamento por PIX", for: ["loja", "sistema"] },
  { id: "whats", label: "Pedido direto no WhatsApp", for: ["site", "loja"] },
  { id: "admin", label: "Painel para você mesmo editar", for: ["site", "loja", "sistema"] },
  { id: "login", label: "Área de login para clientes", for: ["loja", "sistema"] },
  { id: "estoque", label: "Controle de estoque", for: ["loja", "sistema"] },
  { id: "relatorios", label: "Relatórios e gráficos", for: ["loja", "sistema"] },
  { id: "agenda", label: "Agendamento de horário", for: ["site", "sistema"] },
  { id: "blog", label: "Blog ou página de notícias", for: ["site"] },
  { id: "equipe", label: "Vários usuários com permissões", for: ["sistema"] },
];


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

export type StyleId = "moderno" | "classico" | "ousado";

export const looks: { id: StyleId; label: string }[] = [
  { id: "moderno", label: "Moderno" },
  { id: "classico", label: "Clássico" },
  { id: "ousado", label: "Ousado" },
];

export type Segment = {
  id: string;
  label: string;
  /** Nome do ícone (ver Simulator.tsx). */
  icon: "padaria" | "acai" | "roupas" | "barbearia" | "restaurante" | "mercadinho" | "farmacia" | "pousada";
  /** Nome usado pelo "Surpreenda-me". */
  example: string;
  headline: string;
  sub: string;
  cta: string;
  section: string;
  /** Aba da lista completa e aba do pedido, dentro do celular. */
  catalog: string;
  bag: string;
  /** Botão que manda o pedido. */
  action: string;
  /** Primeira linha da mensagem que o cliente manda. */
  intro: string;
  /** Escolha extra no fim do pedido (horário, entrega, chegada). */
  slot: { label: string; options: string[] };
  /** Resposta do negócio — `{slot}` vira a escolha do cliente. */
  reply: string;
  items: [string, string][];
  swatch: SwatchId;
};

/** Os preços aqui são só ilustração da prévia — não é cardápio de ninguém. */
export const segments: Segment[] = [
  {
    id: "padaria",
    label: "Padaria",
    icon: "padaria",
    example: "Padaria Pão Dourado",
    headline: "Pão quentinho toda manhã",
    sub: "Encomende pelo WhatsApp e retire sem fila.",
    cta: "Encomendar",
    section: "Saindo do forno",
    catalog: "Cardápio",
    bag: "Sacola",
    action: "Encomendar no WhatsApp",
    intro: "Oi! Vim pelo site e quero encomendar:",
    slot: { label: "Retirar às", options: ["06:30", "07:30", "17:00"] },
    reply: "Encomenda anotada! Às {slot} está tudo quentinho te esperando. 🥖",
    items: [
      ["Pão francês (kg)", "R$ 16,90"],
      ["Bolo de chocolate", "R$ 35,00"],
      ["Café da manhã completo", "R$ 18,00"],
      ["Pão de queijo (10 un.)", "R$ 12,00"],
      ["Torta de frango (fatia)", "R$ 9,50"],
      ["Sonho recheado", "R$ 6,00"],
    ],
    swatch: "latao",
  },
  {
    id: "acai",
    label: "Açaí",
    icon: "acai",
    example: "Açaí da Ilha",
    headline: "Açaí grosso, do jeito do Marajó",
    sub: "Peça o litro e receba em casa, geladinho.",
    cta: "Pedir agora",
    section: "Mais pedidos",
    catalog: "Cardápio",
    bag: "Sacola",
    action: "Pedir no WhatsApp",
    intro: "Oi! Vim pelo site e quero pedir:",
    slot: { label: "Entrega", options: ["Agora", "Em 1 hora", "À noite"] },
    reply: "Pedido recebido! Já tá saindo daqui geladinho. 💜",
    items: [
      ["Açaí 1 litro", "R$ 25,00"],
      ["Tigela 500 ml", "R$ 15,00"],
      ["Açaí com farinha", "R$ 18,00"],
      ["Açaí 2 litros", "R$ 48,00"],
      ["Tigela com frutas", "R$ 22,00"],
      ["Farinha de tapioca", "R$ 8,00"],
    ],
    swatch: "acai",
  },
  {
    id: "roupas",
    label: "Loja de roupas",
    icon: "roupas",
    example: "Ateliê Flor de Breves",
    headline: "Moda nova toda semana",
    sub: "Veja o catálogo e separe pelo WhatsApp.",
    cta: "Ver catálogo",
    section: "Chegou agora",
    catalog: "Catálogo",
    bag: "Sacola",
    action: "Separar no WhatsApp",
    intro: "Oi! Vi no site e quero separar:",
    slot: { label: "Receber", options: ["Retirar na loja", "Entrega em casa"] },
    reply: "Separado! Já deixei tudo guardado com o seu nome. 🛍️",
    items: [
      ["Camiseta básica", "R$ 49,90"],
      ["Vestido midi", "R$ 89,90"],
      ["Bermuda jeans", "R$ 69,90"],
      ["Blusa cropped", "R$ 39,90"],
      ["Calça wide leg", "R$ 119,90"],
      ["Sandália rasteira", "R$ 59,90"],
    ],
    swatch: "rosa",
  },
  {
    id: "barbearia",
    label: "Barbearia",
    icon: "barbearia",
    example: "Barbearia do Zé",
    headline: "Corte marcado, sem espera",
    sub: "Escolha o horário e chegue na hora certa.",
    cta: "Agendar horário",
    section: "Serviços",
    catalog: "Serviços",
    bag: "Agenda",
    action: "Agendar no WhatsApp",
    intro: "Oi! Quero agendar pelo site:",
    slot: { label: "Horário", options: ["09:00", "10:30", "14:00", "16:30"] },
    reply: "Fechado! Seu horário das {slot} tá garantido. ✂️",
    items: [
      ["Corte", "R$ 25,00"],
      ["Barba", "R$ 15,00"],
      ["Corte + barba", "R$ 35,00"],
      ["Pigmentação", "R$ 20,00"],
      ["Sobrancelha", "R$ 10,00"],
      ["Corte infantil", "R$ 20,00"],
    ],
    swatch: "jade",
  },
  {
    id: "restaurante",
    label: "Restaurante",
    icon: "restaurante",
    example: "Sabor do Marajó",
    headline: "Almoço caseiro todo dia",
    sub: "Cardápio do dia com entrega no bairro.",
    cta: "Ver cardápio",
    section: "Hoje tem",
    catalog: "Cardápio",
    bag: "Pedido",
    action: "Pedir no WhatsApp",
    intro: "Oi! Vim pelo site e quero pedir:",
    slot: { label: "Entregar às", options: ["11:30", "12:00", "12:30"] },
    reply: "Pedido anotado! Sai às {slot} quentinho. 🍽️",
    items: [
      ["Prato feito", "R$ 20,00"],
      ["Peixe frito", "R$ 35,00"],
      ["Suco natural", "R$ 8,00"],
      ["Frango assado", "R$ 30,00"],
      ["Vatapá", "R$ 25,00"],
      ["Pudim", "R$ 7,00"],
    ],
    swatch: "coral",
  },
  {
    id: "mercadinho",
    label: "Mercadinho",
    icon: "mercadinho",
    example: "Mercadinho Bom Preço",
    headline: "A compra do mês sem sair de casa",
    sub: "Monte a lista e receba na porta.",
    cta: "Fazer pedido",
    section: "Ofertas da semana",
    catalog: "Ofertas",
    bag: "Lista",
    action: "Mandar a lista",
    intro: "Oi! Montei minha lista no site:",
    slot: { label: "Entrega", options: ["Hoje à tarde", "Amanhã cedo"] },
    reply: "Lista recebida! Já estamos separando a sua compra. 🛒",
    items: [
      ["Arroz 5 kg", "R$ 27,90"],
      ["Café 500 g", "R$ 19,90"],
      ["Óleo de soja", "R$ 8,90"],
      ["Feijão 1 kg", "R$ 9,90"],
      ["Açúcar 2 kg", "R$ 10,90"],
      ["Leite 1 litro", "R$ 6,50"],
    ],
    swatch: "jade",
  },
  {
    id: "farmacia",
    label: "Farmácia",
    icon: "farmacia",
    example: "Farmácia Vida",
    headline: "Saúde pertinho de você",
    sub: "Peça e receba em casa, com atendimento rápido.",
    cta: "Falar com a farmácia",
    section: "Mais procurados",
    catalog: "Produtos",
    bag: "Sacola",
    action: "Pedir no WhatsApp",
    intro: "Oi! Vim pelo site e preciso de:",
    slot: { label: "Entrega", options: ["Agora", "Retirar no balcão"] },
    reply: "Recebido! Já estamos separando o seu pedido. 💊",
    items: [
      ["Vitamina C", "R$ 22,90"],
      ["Protetor solar", "R$ 49,90"],
      ["Kit primeiros socorros", "R$ 39,90"],
      ["Repelente", "R$ 24,90"],
      ["Soro fisiológico", "R$ 6,90"],
      ["Termômetro digital", "R$ 29,90"],
    ],
    swatch: "azul",
  },
  {
    id: "pousada",
    label: "Pousada",
    icon: "pousada",
    example: "Pousada Rio Pará",
    headline: "Seu descanso no Marajó",
    sub: "Veja os quartos e reserve direto com a gente.",
    cta: "Reservar",
    section: "Quartos",
    catalog: "Quartos",
    bag: "Reserva",
    action: "Reservar no WhatsApp",
    intro: "Oi! Quero reservar pelo site:",
    slot: { label: "Chegada", options: ["Sexta", "Sábado", "Domingo"] },
    reply: "Reserva anotada para {slot}! Já te mando a confirmação. 🌴",
    items: [
      ["Quarto casal (diária)", "R$ 160,00"],
      ["Quarto família (diária)", "R$ 240,00"],
      ["Suíte com varanda", "R$ 200,00"],
      ["Passeio de barco", "R$ 80,00"],
      ["Translado do porto", "R$ 30,00"],
      ["Jantar regional", "R$ 45,00"],
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
    a: "Depende do que o seu negócio precisa, por isso o valor é sempre combinado comigo depois de uma conversa rápida. Você recebe a proposta por escrito, com o preço fechado, antes de qualquer coisa começar. Monte o seu projeto aqui em cima e me mande no WhatsApp.",
  },
  {
    q: "Em quanto tempo fica pronto?",
    a: "Site institucional: 1 a 2 semanas. Loja virtual: 2 a 3 semanas. Sistema sob medida: 3 a 6 semanas, dependendo do tamanho. O prazo entra por escrito na proposta.",
  },
  {
    q: "Tem mensalidade?",
    a: "O site é seu, pago uma vez. O único custo fixo é o domínio próprio (seunegocio.com.br), pago uma vez por ano. Se quiser que eu cuide de tudo e faça alterações quando precisar, tem a manutenção mensal — opcional, sem fidelidade e com valor combinado comigo.",
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
