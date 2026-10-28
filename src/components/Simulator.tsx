import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BedDouble,
  Croissant,
  Grape,
  House,
  LayoutGrid,
  Menu,
  Pill,
  Plus,
  Scissors,
  Share2,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { whatsappLink } from "../data/links";
import { segments, swatches, type Segment, type SwatchId } from "../data/extras";
import { EASE, haptic, pageUrl, shareUrl, useBrevesClock } from "../lib/utils";
import { WhatsappIcon } from "./icons";
import { SectionHead } from "./Section";
import { useToast } from "./Toast";

const ICONS = {
  padaria: Croissant,
  acai: Grape,
  roupas: Shirt,
  barbearia: Scissors,
  restaurante: UtensilsCrossed,
  mercadinho: ShoppingBasket,
  farmacia: Pill,
  pousada: BedDouble,
} as const;

type State = { name: string; seg: string; swatch: SwatchId };
const KEY = "nf:simulador";
const DEFAULT: State = { name: "", seg: "padaria", swatch: "latao" };

/** Começa do link compartilhado (?nome=&tipo=&cor=), da sessão ou do padrão. */
function initialState(): State {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.has("nome") || q.has("tipo")) {
      const seg = segments.find((s) => s.id === q.get("tipo"))?.id ?? DEFAULT.seg;
      const sw = swatches.find((s) => s.id === q.get("cor"))?.id ?? segments.find((s) => s.id === seg)!.swatch;
      return { name: (q.get("nome") ?? "").slice(0, 30), seg, swatch: sw };
    }
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as State | null;
    if (saved && segments.some((s) => s.id === saved.seg)) return saved;
  } catch {
    /* sem armazenamento — tudo bem */
  }
  return DEFAULT;
}

const SCREEN_W = 224; // largura útil da tela do celular (15rem − bordas)
const DESIGN_W = 360; // o mini-site é desenhado em 360px e reduzido
const S = SCREEN_W / DESIGN_W;

/* ------------------------------------------------------------------ */
/* o mini-site dentro do celular                                       */
/* ------------------------------------------------------------------ */

function MiniSite({ name, seg }: { name: string; seg: Segment }) {
  const { time } = useBrevesClock();
  const Icon = ICONS[seg.icon];
  const display = name.trim() || "Seu negócio";
  const initials =
    display
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "SN";

  return (
    <div className="relative font-sans text-[#14181b]" style={{ width: DESIGN_W, height: 746 }}>
      {/* barra de status */}
      <div className="flex h-9 items-center justify-between px-6 text-[13px] font-semibold">
        <span className="tabular">{time}</span>
        <span className="flex items-center gap-1.5">
          <span className="flex items-end gap-[2px]">
            {[5, 7, 9, 11].map((h) => (
              <span key={h} className="w-[3px] rounded-sm bg-[#14181b]" style={{ height: h }} />
            ))}
          </span>
          <span className="ml-1 h-[11px] w-[22px] rounded-[3px] border-[1.5px] border-[#14181b] p-[1.5px]">
            <span className="block h-full w-[70%] rounded-[1px] bg-[#14181b]" />
          </span>
        </span>
      </div>

      {/* cabeçalho */}
      <div className="flex h-14 items-center gap-3 px-4">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={initials}
            initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white transition-colors duration-500"
            style={{ backgroundColor: "var(--a)" }}
          >
            {initials}
          </m.span>
        </AnimatePresence>
        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.01em]">{display}</span>
        <Menu size={22} />
      </div>

      {/* destaque */}
      <div className="relative mx-3 overflow-hidden rounded-[22px] p-[22px] text-white transition-colors duration-500" style={{ backgroundColor: "var(--a)" }}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={seg.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95" style={{ color: "var(--a)" }}>
              <Icon size={22} />
            </span>
            <p className="mt-4 font-display text-[29px] font-semibold leading-[1.04] tracking-[-0.02em]">{seg.headline}</p>
            <p className="mt-2 text-[14px] leading-snug text-white/85">{seg.sub}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold" style={{ color: "var(--a)" }}>
              <WhatsappIcon size={16} /> {seg.cta}
            </span>
          </m.div>
        </AnimatePresence>
      </div>

      {/* selos */}
      <div className="mt-4 flex gap-2 px-3 text-[12px] font-medium">
        <span className="flex items-center gap-1.5 rounded-full bg-[#e7f6ee] px-3 py-1.5 text-[#1d7a46]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22a55a]" /> Aberto agora
        </span>
        <span className="rounded-full bg-black/[0.05] px-3 py-1.5">Entrega no bairro</span>
        <span className="rounded-full bg-black/[0.05] px-3 py-1.5">PIX</span>
      </div>

      {/* itens */}
      <div className="mt-5 flex items-baseline justify-between px-4">
        <span className="text-[16px] font-semibold">{seg.section}</span>
        <span className="text-[13px] font-semibold transition-colors duration-500" style={{ color: "var(--a)" }}>
          ver tudo
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <m.ul
          key={seg.id}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
          className="mt-2 flex flex-col gap-2 px-3"
        >
          {seg.items.map(([label, price]) => (
            <m.li
              key={label}
              variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } } }}
              className="flex items-center gap-3 rounded-[16px] bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_20px_-14px_rgba(0,0,0,0.35)]"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] transition-colors duration-500"
                style={{ backgroundColor: "color-mix(in oklab, var(--a) 16%, white)", color: "var(--a)" }}
              >
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{label}</span>
                <span className="block text-[13px] font-semibold transition-colors duration-500" style={{ color: "var(--a)" }}>
                  {price}
                </span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors duration-500" style={{ backgroundColor: "var(--a)" }}>
                <Plus size={16} />
              </span>
            </m.li>
          ))}
        </m.ul>
      </AnimatePresence>

      {/* barra inferior + botão do WhatsApp */}
      <div className="absolute inset-x-0 bottom-0 flex h-[66px] items-center justify-around border-t border-black/[0.06] bg-white/95 pb-2 text-black/40">
        <House size={22} className="transition-colors duration-500" style={{ color: "var(--a)" }} />
        <LayoutGrid size={22} />
        <ShoppingBag size={22} />
      </div>
      <span className="absolute bottom-[82px] right-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgba(37,211,102,0.8)]">
        <WhatsappIcon size={26} />
      </span>
    </div>
  );
}

/** Faíscas quando o nome aparece pela primeira vez. */
function Sparkles({ burst }: { burst: number }) {
  if (!burst) return null;
  return (
    <div key={burst} aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <m.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * 150, y: Math.sin(a) * 210, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.9, ease: EASE }}
            className={`absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${i % 2 ? "bg-brass" : "bg-jade"}`}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Simulator() {
  const toast = useToast();
  const [state, setState] = useState<State>(initialState);
  const [pulse, setPulse] = useState(0);
  const [burst, setBurst] = useState(0);
  const named = useRef(state.name.trim().length >= 2);
  const seg = segments.find((s) => s.id === state.seg) ?? segments[0];
  const swatch = swatches.find((s) => s.id === state.swatch) ?? swatches[0];

  // inclina o celular com o mouse (desktop)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 160, damping: 18 });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 160, damping: 18 });

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ok */
    }
  }, [state]);

  const update = (patch: Partial<State>, flash = true) => {
    setState((s) => ({ ...s, ...patch }));
    if (flash) setPulse((n) => n + 1);
  };

  const onName = (v: string) => {
    update({ name: v.slice(0, 30) }, false);
    if (!named.current && v.trim().length >= 2) {
      named.current = true;
      setBurst((n) => n + 1);
      setPulse((n) => n + 1);
      haptic([8, 40, 8]);
    }
  };

  const display = state.name.trim() || "meu negócio";
  const message = `Oi, Neto! Montei no seu link uma prévia de site para ${display} (${seg.label.toLowerCase()}, cor ${swatch.label.toLowerCase()}) e quero um assim.`;

  const sharePreview = async () => {
    haptic();
    const q = new URLSearchParams({ nome: state.name.trim(), tipo: seg.id, cor: swatch.id });
    const r = await shareUrl(`${pageUrl()}?${q}#simular`, `Prévia do site — ${display}`, "Olha como ficaria o site:");
    if (r === "copied") toast({ message: "Link da prévia copiado" });
  };

  return (
    <section id="simular" aria-labelledby="simular-title" className="anchor">
      <SectionHead
        id="simular-title"
        n="03"
        title="Seu negócio, online"
        sub="Escreva o nome do seu negócio e veja na hora uma prévia do site. Leva cinco segundos."
      />

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* o celular */}
        <div
          className="relative mx-auto w-fit py-2"
          style={{ perspective: 1000 }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width - 0.5);
            py.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            px.set(0);
            py.set(0);
          }}
        >
          <div className="animate-float">
            <m.div
              initial={{ opacity: 0, y: 40, rotateX: 18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1, ease: EASE }}
              style={{ rotateX: rotX, rotateY: rotY, ["--glow" as string]: `${swatch.color}66` }}
              className="relative w-[15rem] rounded-[2.5rem] border border-line-hot bg-abyss p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_0_60px_-20px_var(--glow)]"
            >
              <div
                className="relative h-[29rem] overflow-hidden rounded-[2rem] bg-[#f6f4ef]"
                style={{ ["--a" as string]: swatch.color }}
                role="img"
                aria-label={`Prévia do site de ${display}: ${seg.headline}`}
              >
                <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${S})` }}>
                  <MiniSite name={state.name} seg={seg} />
                </div>
                <div aria-hidden className="absolute left-1/2 top-[7px] z-10 h-[1.05rem] w-[4.3rem] -translate-x-1/2 rounded-full bg-abyss" />
                {pulse > 0 && (
                  <div
                    key={pulse}
                    aria-hidden
                    className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-white/45 to-transparent"
                  />
                )}
              </div>
            </m.div>
          </div>
          <Sparkles burst={burst} />
        </div>

        {/* controles */}
        <div className="mt-6 lg:mt-1">
          <label htmlFor="sim-nome" className="eyebrow-mist">
            Nome do seu negócio
          </label>
          <div className="relative mt-2">
            <input
              id="sim-nome"
              value={state.name}
              onChange={(e) => onName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              maxLength={30}
              placeholder="Ex.: Padaria Pão Dourado"
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="done"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 pr-11 text-[1rem] text-bone outline-none transition-colors focus:border-brass"
            />
            <AnimatePresence>
              {state.name && (
                <m.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  onClick={() => update({ name: "" }, false)}
                  aria-label="Apagar nome"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dim hover:text-bone"
                >
                  <X size={16} />
                </m.button>
              )}
            </AnimatePresence>
          </div>

          <p className="eyebrow-mist mt-5" id="sim-ramo">
            Ramo
          </p>
          <div className="rail -mx-4 mt-2 px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-labelledby="sim-ramo">
            {segments.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === seg.id}
                  onClick={() => {
                    if (s.id === seg.id) return;
                    haptic(6);
                    update({ seg: s.id, swatch: s.swatch });
                  }}
                  className="chip shrink-0"
                >
                  <Icon size={14} /> {s.label}
                </button>
              );
            })}
          </div>

          <p className="eyebrow-mist mt-5" id="sim-cor">
            Cor da marca
          </p>
          <div className="mt-2.5 flex flex-wrap gap-3" role="group" aria-labelledby="sim-cor">
            {swatches.map((sw) => {
              const on = sw.id === swatch.id;
              return (
                <button
                  key={sw.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={sw.label}
                  onClick={() => {
                    if (on) return;
                    haptic(6);
                    update({ swatch: sw.id });
                  }}
                  className="relative h-9 w-9 rounded-full transition-transform active:scale-90"
                  style={{ backgroundColor: sw.color }}
                >
                  {on && (
                    <m.span
                      layoutId="swatch-ring"
                      className="absolute -inset-[5px] rounded-full border-2 border-bone"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2.5">
            <m.a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.97 }}
              onClick={() => haptic(10)}
              data-cursor="quero"
              className="relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-brass px-5 py-3.5 font-medium text-abyss"
            >
              <span
                aria-hidden
                className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
              <WhatsappIcon size={18} /> Quero esse site
            </m.a>
            <m.button
              type="button"
              onClick={sharePreview}
              whileTap={{ scale: 0.92 }}
              aria-label="Compartilhar esta prévia"
              data-cursor="enviar"
              className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-line-hot text-bone transition-colors hover:border-brass hover:text-brass"
            >
              <Share2 size={17} />
            </m.button>
          </div>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-dim">
            É só uma prévia: o seu site de verdade é desenhado do zero para o seu negócio.
          </p>
        </div>
      </div>
    </section>
  );
}
