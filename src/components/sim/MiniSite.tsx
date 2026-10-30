import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCheck,
  House,
  LayoutGrid,
  Lock,
  Menu,
  Mic,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Video,
} from "lucide-react";
import type { Segment, StyleId } from "../../data/extras";
import { EASE, useBrevesClock } from "../../lib/utils";
import { WhatsappIcon } from "../icons";
import { ICONS, money, parsePrice, type Cart } from "./shared";

export type Screen = "inicio" | "catalogo" | "sacola" | "zap";
/** 0 = nada, 1 = pedido chegou, 2 = resposta enviada, 3 = resposta lida */
export type Phase = 0 | 1 | 2 | 3;

type Props = {
  display: string;
  initials: string;
  domain: string;
  seg: Segment;
  look: StyleId;
  screen: Screen;
  cart: Cart;
  slot: number;
  phase: Phase;
  chat: { order: string; reply: string } | null;
  flash: { key: number; text: string } | null;
  onScreen: (s: Screen) => void;
  onAdd: (label: string) => void;
  onRemove: (label: string) => void;
  onSlot: (i: number) => void;
  onSend: () => void;
  onHello: () => void;
  onBack: () => void;
};

export const DESIGN_W = 360;
export const DESIGN_H = 746;

const H = "sim-h"; // fonte, peso e caixa dos títulos (variam com o estilo)
const slide = {
  initial: { opacity: 0, x: 36 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -36 },
  transition: { duration: 0.32, ease: EASE },
};

export default function MiniSite(p: Props) {
  const { time } = useBrevesClock();
  const count = Object.values(p.cart).reduce((a, b) => a + b, 0);
  const zap = p.screen === "zap";

  return (
    <div
      className="sim-site relative flex flex-col overflow-hidden bg-[var(--bg)] font-sans text-[var(--fg)]"
      style={{ width: DESIGN_W, height: DESIGN_H }}
    >
      {/* barra de status */}
      <div className={`flex h-9 shrink-0 items-center justify-between px-6 text-[13px] font-semibold ${zap ? "bg-[#008069] text-white" : ""}`}>
        <span className="tabular">{time}</span>
        <span className="flex items-center gap-1.5">
          <span className="flex items-end gap-[2px]">
            {[5, 7, 9, 11].map((h) => (
              <span key={h} className="w-[3px] rounded-sm bg-current" style={{ height: h }} />
            ))}
          </span>
          <span className="ml-1 h-[11px] w-[22px] rounded-[3px] border-[1.5px] border-current p-[1.5px]">
            <span className="block h-full w-[70%] rounded-[1px] bg-current" />
          </span>
        </span>
      </div>

      {/* barra de endereço */}
      {!zap && (
        <div className="shrink-0 px-3 pb-1.5">
          <div className="flex h-[30px] items-center justify-center gap-1.5 rounded-full bg-[var(--soft)] px-3 text-[12.5px] text-[var(--muted)]">
            <Lock size={11} className="shrink-0" />
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={p.domain}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                {p.domain}
              </m.span>
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.div key={p.screen} {...slide} className="sim-scroll absolute inset-0">
            {p.screen === "inicio" && <Home {...p} />}
            {p.screen === "catalogo" && <Catalog {...p} />}
            {p.screen === "sacola" && <Bag {...p} count={count} />}
            {p.screen === "zap" && <Zap {...p} time={time} />}
          </m.div>
        </AnimatePresence>

        {/* aviso de item adicionado */}
        <AnimatePresence>
          {p.flash && !zap && (
            <m.div
              key={p.flash.key}
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center"
            >
              <span className="flex max-w-[86%] items-center gap-2 rounded-full bg-[#14181b] px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                <Check size={15} className="shrink-0 text-[#4ade80]" />
                <span className="truncate">{p.flash.text}</span>
              </span>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* barra inferior */}
      {!zap && <TabBar {...p} count={count} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TabBar({ seg, screen, onScreen, count }: Props & { count: number }) {
  const BagIcon = seg.bag === "Agenda" || seg.bag === "Reserva" ? CalendarDays : ShoppingBag;
  const tabs: { id: Screen; label: string; icon: typeof House; demo?: string }[] = [
    { id: "inicio", label: "Início", icon: House },
    { id: "catalogo", label: seg.catalog, icon: LayoutGrid },
    { id: "sacola", label: seg.bag, icon: BagIcon, demo: "tab-bag" },
  ];
  return (
    <div className="flex h-[64px] shrink-0 items-stretch justify-around border-t border-[var(--line)] bg-[var(--card)] pb-1.5">
      {tabs.map((t) => {
        const on = screen === t.id;
        return (
          <button
            key={t.id}
            type="button"
            data-demo={t.demo}
            onClick={() => onScreen(t.id)}
            aria-current={on ? "page" : undefined}
            className={`relative flex w-24 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${on ? "text-[var(--a)]" : "text-[var(--muted)]"}`}
          >
            <span className="relative">
              <t.icon size={22} />
              {t.id === "sacola" && count > 0 && (
                <m.span
                  key={count}
                  initial={{ scale: 1.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--a)] px-1 text-[11px] font-bold text-[var(--on-a)]"
                >
                  {count}
                </m.span>
              )}
            </span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Home(p: Props) {
  const { seg, look } = p;
  const Icon = ICONS[seg.icon];
  return (
    <div className="pb-6">
      <div className="flex h-14 items-center gap-3 px-4">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={p.initials}
            initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className={`${H} flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[var(--pill)] bg-[var(--a)] text-[13px] text-[var(--on-a)]`}
          >
            {p.initials}
          </m.span>
        </AnimatePresence>
        <span className={`${H} min-w-0 flex-1 truncate text-[17px]`}>{p.display}</span>
        <m.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={p.onHello}
          aria-label="Chamar no WhatsApp"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_16px_-6px_rgba(37,211,102,0.9)]"
        >
          <WhatsappIcon size={19} />
        </m.button>
        <Menu size={22} className="shrink-0" />
      </div>

      {/* destaque */}
      <div className="relative mx-3 overflow-hidden rounded-[var(--r)] bg-[var(--a)] p-[22px] text-[var(--on-a)]">
        <HeroDecor look={look} />
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={seg.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[var(--pill)] bg-[var(--on-a)] text-[var(--a)]">
              <Icon size={22} />
            </span>
            <p className={`${H} mt-4 text-[29px] leading-[1.04]`}>{seg.headline}</p>
            <p className="mt-2 text-[14px] leading-snug opacity-85">{seg.sub}</p>
            <button
              type="button"
              onClick={() => p.onScreen("catalogo")}
              className="mt-5 inline-flex items-center gap-2 rounded-[var(--pill)] bg-[var(--on-a)] px-4 py-2.5 text-[14px] font-semibold text-[var(--a)]"
            >
              <WhatsappIcon size={16} /> {seg.cta}
            </button>
          </m.div>
        </AnimatePresence>
      </div>

      {/* selos */}
      <div className="mt-4 flex gap-2 px-3 text-[12px] font-medium">
        <span className="flex items-center gap-1.5 rounded-[var(--pill)] bg-[#22a55a]/15 px-3 py-1.5 text-[#22a55a]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22a55a]" /> Aberto agora
        </span>
        <span className="rounded-[var(--pill)] bg-[var(--soft)] px-3 py-1.5">Entrega no bairro</span>
        <span className="rounded-[var(--pill)] bg-[var(--soft)] px-3 py-1.5">PIX</span>
      </div>

      <div className="mt-5 flex items-baseline justify-between px-4">
        <span className={`${H} text-[16px]`}>{seg.section}</span>
        <button type="button" onClick={() => p.onScreen("catalogo")} className="text-[13px] font-semibold text-[var(--a)]">
          ver tudo
        </button>
      </div>
      <Items {...p} list={seg.items.slice(0, 3)} />
    </div>
  );
}

function HeroDecor({ look }: { look: StyleId }) {
  if (look === "ousado")
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 14px)", maskImage: "linear-gradient(to left, black, transparent 70%)" }}
      />
    );
  if (look === "classico")
    return <div aria-hidden className="pointer-events-none absolute inset-[7px] rounded-[6px] border border-current opacity-30" />;
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/25" />
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
    </>
  );
}

function Items(p: Props & { list: [string, string][] }) {
  const Icon = ICONS[p.seg.icon];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.ul
        key={p.seg.id}
        initial="hidden"
        animate="show"
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
        className="mt-2 flex flex-col gap-2 px-3"
      >
        {p.list.map(([label, price], i) => {
          const qty = p.cart[label] ?? 0;
          return (
            <m.li
              key={label}
              variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } } }}
              className="flex items-center gap-3 rounded-[var(--rs)] bg-[var(--card)] p-2.5 shadow-[var(--shadow)]"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--rs)] text-[var(--a)]"
                style={{ backgroundColor: "color-mix(in oklab, var(--a) 16%, var(--card))" }}
              >
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{label}</span>
                <span className="block text-[13px] font-semibold text-[var(--a)]">{price}</span>
              </span>
              <Stepper qty={qty} label={label} demo={`add-${i}`} onAdd={p.onAdd} onRemove={p.onRemove} />
            </m.li>
          );
        })}
      </m.ul>
    </AnimatePresence>
  );
}

function Stepper({
  qty,
  label,
  demo,
  onAdd,
  onRemove,
}: {
  qty: number;
  label: string;
  demo?: string;
  onAdd: (l: string) => void;
  onRemove: (l: string) => void;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <AnimatePresence initial={false}>
        {qty > 0 && (
          <m.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1.5 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => onRemove(label)}
              aria-label={`Tirar um: ${label}`}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--pill)] bg-[var(--soft)]"
            >
              <Minus size={16} />
            </button>
            <m.span key={qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center text-[15px] font-bold tabular">
              {qty}
            </m.span>
          </m.span>
        )}
      </AnimatePresence>
      <m.button
        type="button"
        data-demo={demo}
        whileTap={{ scale: 0.85 }}
        onClick={() => onAdd(label)}
        aria-label={`Adicionar: ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--pill)] bg-[var(--a)] text-[var(--on-a)]"
      >
        <Plus size={17} />
      </m.button>
    </span>
  );
}

/* ------------------------------------------------------------------ */

function Catalog(p: Props) {
  return (
    <div className="pb-6 pt-2">
      <div className="flex items-baseline justify-between px-4">
        <p className={`${H} text-[24px]`}>{p.seg.catalog}</p>
        <span className="text-[12px] text-[var(--muted)]">{p.seg.items.length} opções</span>
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden px-3 text-[12px] font-semibold">
        {["Tudo", "Mais pedidos", "Novidades"].map((c, i) => (
          <span
            key={c}
            className={`shrink-0 rounded-[var(--pill)] px-3 py-1.5 ${i ? "bg-[var(--soft)]" : "bg-[var(--fg)] text-[var(--bg)]"}`}
          >
            {c}
          </span>
        ))}
      </div>
      <Items {...p} list={p.seg.items} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Bag(p: Props & { count: number }) {
  const { seg, cart } = p;
  const lines = seg.items.filter(([label]) => cart[label]);
  const total = lines.reduce((sum, [label, price]) => sum + parsePrice(price) * cart[label], 0);
  return (
    <div className="px-4 pb-6 pt-2">
      <p className={`${H} text-[24px]`}>{seg.bag}</p>
      {!lines.length ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-[var(--pill)] bg-[var(--soft)] text-[var(--muted)]">
            <ShoppingBag size={28} />
          </span>
          <p className="mt-4 text-[15px] font-semibold">Nada aqui ainda</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Toque no + para escolher.</p>
          <button
            type="button"
            onClick={() => p.onScreen("catalogo")}
            className="mt-5 rounded-[var(--pill)] bg-[var(--a)] px-5 py-2.5 text-[14px] font-semibold text-[var(--on-a)]"
          >
            Ver {seg.catalog.toLowerCase()}
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-[var(--line)] rounded-[var(--rs)] bg-[var(--card)] px-3 shadow-[var(--shadow)]">
            <AnimatePresence initial={false}>
              {lines.map(([label, price]) => (
                <m.li
                  key={label}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 overflow-hidden py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{label}</span>
                    <span className="block text-[12.5px] text-[var(--muted)] tabular">{money(parsePrice(price) * cart[label])}</span>
                  </span>
                  <Stepper qty={cart[label]} label={label} onAdd={p.onAdd} onRemove={p.onRemove} />
                </m.li>
              ))}
            </AnimatePresence>
          </ul>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{seg.slot.label}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {seg.slot.options.map((o, i) => (
              <button
                key={o}
                type="button"
                data-demo={`slot-${i}`}
                onClick={() => p.onSlot(i)}
                aria-pressed={p.slot === i}
                className={`rounded-[var(--pill)] border px-3.5 py-2 text-[13px] font-semibold ${p.slot === i ? "border-[var(--a)] bg-[var(--a)] text-[var(--on-a)]" : "border-[var(--line)] bg-[var(--card)]"}`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-[14px] text-[var(--muted)]">Total ({p.count} {p.count > 1 ? "itens" : "item"})</span>
            <m.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className={`${H} text-[24px] tabular`}>
              {money(total)}
            </m.span>
          </div>
          <m.button
            type="button"
            data-demo="send"
            whileTap={{ scale: 0.96 }}
            onClick={p.onSend}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[var(--r)] bg-[#25D366] py-3.5 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(37,211,102,0.9)]"
          >
            <WhatsappIcon size={19} /> {seg.action}
          </m.button>
          <p className="mt-2 text-center text-[11.5px] text-[var(--muted)]">O pedido chega pronto, sem precisar digitar nada.</p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Zap({ chat, phase, time, onBack }: Props & { time: string }) {
  return (
    <div className="flex min-h-full flex-col bg-[#efeae2] text-[#111b21]">
      <div className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-[#008069] px-2 text-white">
        <button type="button" onClick={onBack} aria-label="Voltar ao site" className="flex h-10 w-9 items-center justify-center">
          <ArrowLeft size={22} />
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfe5e7] text-[15px] font-bold text-[#54656f]">C</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[16px] font-semibold">Cliente novo</span>
          <span className="block text-[12px] text-white/80">pedido pelo seu site</span>
        </span>
        <Video size={21} className="mx-2" />
        <Phone size={19} className="mx-2" />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 py-3">
        <span className="mx-auto rounded-md bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-[#54656f] shadow-sm">HOJE</span>
        <span className="mx-auto max-w-[90%] rounded-md bg-[#ffeecd] px-3 py-1.5 text-center text-[12px] leading-snug text-[#54656f]">
          É assim que o pedido chega no <b>seu</b> WhatsApp
        </span>
        {chat && phase >= 1 && (
          <Bubble side="in" time={time}>
            {chat.order}
          </Bubble>
        )}
        {chat && phase >= 2 && (
          <Bubble side="out" time={time} read={phase >= 3}>
            {chat.reply}
          </Bubble>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 px-2 pb-3 pt-1">
        <span className="flex h-11 flex-1 items-center rounded-full bg-white px-4 text-[15px] text-[#8696a0]">Mensagem</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-white">
          <Mic size={20} />
        </span>
      </div>
    </div>
  );
}

function Bubble({ side, time, read, children }: { side: "in" | "out"; time: string; read?: boolean; children: ReactNode }) {
  const out = side === "out";
  return (
    <m.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, delay: out ? 0 : 0.3 }}
      style={{ transformOrigin: out ? "100% 100%" : "0% 100%" } as CSSProperties}
      className={`max-w-[86%] rounded-lg px-2.5 pb-1 pt-1.5 text-[14px] leading-[1.35] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] ${out ? "self-end rounded-tr-none bg-[#d9fdd3]" : "self-start rounded-tl-none bg-white"}`}
    >
      <p className="whitespace-pre-line">{children}</p>
      <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-[#667781]">
        {time}
        {out && (read ? <CheckCheck size={15} className="text-[#53bdeb]" /> : <Check size={15} />)}
      </span>
    </m.div>
  );
}
