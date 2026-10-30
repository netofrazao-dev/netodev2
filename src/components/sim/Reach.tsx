import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { CheckCheck, Globe, Lock, Monitor, Search } from "lucide-react";
import type { Segment, StyleId } from "../../data/extras";
import { EASE, haptic } from "../../lib/utils";
import { WhatsappIcon } from "../icons";
import { ICONS, lookVars, type Theme } from "./shared";

type Props = {
  display: string;
  initials: string;
  domain: string;
  seg: Segment;
  look: StyleId;
  theme: Theme;
  color: string;
};

const TABS = [
  { id: "busca", label: "Busca", icon: Search },
  { id: "link", label: "WhatsApp", icon: WhatsappIcon },
  { id: "pc", label: "Computador", icon: Monitor },
] as const;
type Tab = (typeof TABS)[number]["id"];

/**
 * "Onde o seu negócio aparece": o mesmo site visto numa busca, num link
 * mandado no WhatsApp e no computador — tudo com o nome e a cor escolhidos.
 */
export default function Reach(props: Props) {
  const [tab, setTab] = useState<Tab>("busca");
  return (
    <div className="mt-10 xl:col-start-2">
      <p className="eyebrow-mist" id="sim-onde">
        Onde o seu negócio aparece
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1" role="tablist" aria-labelledby="sim-onde">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`sim-tab-${t.id}`}
              aria-selected={on}
              aria-controls="sim-onde-painel"
              onClick={() => {
                haptic(6);
                setTab(t.id);
              }}
              className={`relative flex items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 text-[0.78rem] font-medium transition-colors ${on ? "text-abyss" : "text-mist hover:text-bone"}`}
            >
              {on && (
                <m.span
                  layoutId="reach-pill"
                  className="absolute inset-0 rounded-lg bg-brass"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <t.icon size={14} className="relative shrink-0" />
              <span className="relative truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div id="sim-onde-painel" role="tabpanel" aria-labelledby={`sim-tab-${tab}`} className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {tab === "busca" && <SearchCard {...props} />}
            {tab === "link" && <LinkCard {...props} />}
            {tab === "pc" && <Desktop {...props} />}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = window.setInterval(() => setN((v) => (v >= text.length ? (window.clearInterval(id), v) : v + 1)), 55);
    return () => window.clearInterval(id);
  }, [text]);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, n)}
        <span className="ml-px inline-block h-[1.05em] w-px translate-y-[0.15em] animate-pulse bg-[#1a73e8]" />
      </span>
    </>
  );
}

function SearchCard({ display, initials, domain, seg, color, look, theme }: Props) {
  const query = `${seg.label.toLowerCase()} em breves`;
  return (
    <div className="overflow-hidden rounded-2xl bg-white p-4 font-sans text-[#202124] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5 rounded-full border border-[#dfe1e5] px-4 py-2.5 text-[0.9rem] shadow-[0_1px_6px_rgba(32,33,36,0.12)]">
        <Search size={16} className="shrink-0 text-[#9aa0a6]" />
        <span className="min-w-0 flex-1 truncate">
          <Typed text={query} />
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2.5">
          <span
            className="sim-h flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.62rem]"
            style={{ ...lookVars(look, theme, color), backgroundColor: color, color: "var(--on-a)" }}
          >
            {initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[0.85rem]">{display}</span>
            <span className="block truncate text-[0.72rem] text-[#4d5156]">https://{domain}</span>
          </span>
        </div>
        <p className="mt-1.5 text-[1.12rem] leading-snug text-[#1a0dab]">
          {display} — {seg.headline}
        </p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-[#4d5156]">
          <span className="text-[#70757a]">Aberto agora · </span>
          {seg.sub} Atendimento pelo WhatsApp em Breves, PA.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[#ebebeb] pt-2.5 text-[0.82rem] text-[#1a0dab]">
          <span>{seg.catalog}</span>
          <span>{seg.cta}</span>
          <span>Como chegar</span>
          <span>Horário de atendimento</span>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-1.5 text-[0.72rem] leading-snug text-[#70757a]">
        <Globe size={13} className="mt-0.5 shrink-0" />
        Site rápido e bem descrito aparece melhor para quem procura na cidade.
      </p>
    </div>
  );
}

function LinkCard({ display, initials, domain, seg, color, look, theme }: Props) {
  const Icon = ICONS[seg.icon];
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#0b141a] p-3 font-sans shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[80%] self-start rounded-lg rounded-tl-none bg-[#202c33] px-2.5 py-1.5 text-[0.9rem] text-[#e9edef]"
      >
        Onde é que eu peço?
        <span className="ml-2 text-[0.66rem] text-[#8696a0]">10:41</span>
      </m.div>
      <m.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 26 }}
        className="w-[88%] max-w-[22rem] self-end rounded-lg rounded-tr-none bg-[#005c4b] p-1 text-[#e9edef]"
      >
        <div className="overflow-hidden rounded-md bg-[#025144]">
          <div
            className="relative flex h-32 items-center gap-3 overflow-hidden px-4"
            style={{ ...lookVars(look, theme, color), backgroundColor: color, color: "var(--on-a)" }}
          >
            <div aria-hidden className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <span className="sim-h flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--pill)] bg-[var(--on-a)] text-[1rem] text-[var(--a)]">
              {initials}
            </span>
            <span className="relative min-w-0">
              <span className="sim-h block truncate text-[1.25rem] leading-tight">{display}</span>
              <span className="mt-1 flex items-center gap-1.5 text-[0.75rem] opacity-85">
                <Icon size={13} /> {seg.label} · Breves
              </span>
            </span>
          </div>
          <div className="px-2.5 py-2">
            <p className="truncate text-[0.85rem] font-semibold">{display}</p>
            <p className="truncate text-[0.75rem] text-[#e9edef]/70">{seg.headline}</p>
            <p className="mt-0.5 truncate text-[0.7rem] text-[#e9edef]/50">{domain}</p>
          </div>
        </div>
        <p className="px-1.5 pt-1.5 text-[0.9rem]">
          Pede por aqui, chega pronto no WhatsApp: <span className="text-[#53bdeb]">https://{domain}</span>
        </p>
        <span className="flex items-center justify-end gap-1 px-1.5 text-[0.66rem] text-[#e9edef]/60">
          10:42 <CheckCheck size={14} className="text-[#53bdeb]" />
        </span>
      </m.div>
      <p className="mt-1 px-1 text-[0.72rem] leading-snug text-[#8696a0]">
        Quando alguém manda o seu link, aparece essa prévia com o nome, a cor e a foto do seu negócio.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const PC_W = 1024;
const PC_H = 600;

function Desktop({ display, initials, domain, seg, look, theme, color }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.32);
  const Icon = ICONS[seg.icon];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / PC_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-line-hot bg-[#1b1f23] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex h-8 items-center gap-1.5 px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
        <span className="mx-auto flex h-5 max-w-[70%] items-center gap-1.5 truncate rounded-md bg-white/[0.07] px-3 font-sans text-[0.65rem] text-white/60">
          <Lock size={9} className="shrink-0" /> {domain}
        </span>
      </div>
      <div ref={box} className="relative w-full overflow-hidden" style={{ height: PC_H * k }}>
        <div
          className="sim-site absolute left-0 top-0 origin-top-left bg-[var(--bg)] font-sans text-[var(--fg)]"
          style={{ ...lookVars(look, theme, color), width: PC_W, height: PC_H, transform: `scale(${k})` }}
        >
          <div className="flex h-[76px] items-center gap-4 border-b border-[var(--line)] px-12">
            <span className="sim-h flex h-11 w-11 items-center justify-center rounded-[var(--pill)] bg-[var(--a)] text-[17px] text-[var(--on-a)]">
              {initials}
            </span>
            <span className="sim-h text-[22px]">{display}</span>
            <span className="ml-auto flex gap-8 text-[16px] text-[var(--muted)]">
              <span className="text-[var(--fg)]">Início</span>
              <span>{seg.catalog}</span>
              <span>Contato</span>
            </span>
            <span className="ml-6 flex items-center gap-2 rounded-[var(--pill)] bg-[#25D366] px-5 py-3 text-[15px] font-bold text-white">
              <WhatsappIcon size={18} /> WhatsApp
            </span>
          </div>
          <div className="grid grid-cols-[1.05fr_1fr] gap-12 px-12 pt-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-[var(--pill)] bg-[#22a55a]/15 px-4 py-2 text-[14px] font-semibold text-[#22a55a]">
                <span className="h-2 w-2 rounded-full bg-[#22a55a]" /> Aberto agora · Breves, PA
              </span>
              <p className="sim-h mt-6 text-[54px] leading-[1.02]">{seg.headline}</p>
              <p className="mt-5 max-w-[26rem] text-[19px] leading-relaxed text-[var(--muted)]">{seg.sub}</p>
              <div className="mt-8 flex gap-3">
                <span className="flex items-center gap-2.5 rounded-[var(--r)] bg-[var(--a)] px-7 py-4 text-[17px] font-bold text-[var(--on-a)]">
                  <WhatsappIcon size={20} /> {seg.cta}
                </span>
                <span className="rounded-[var(--r)] border-2 border-[var(--line)] px-7 py-4 text-[17px] font-semibold">
                  Ver {seg.catalog.toLowerCase()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {seg.items.slice(0, 4).map(([label, price]) => (
                <div key={label} className="rounded-[var(--r)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
                  <span
                    className="flex h-[92px] items-center justify-center rounded-[var(--rs)] text-[var(--a)]"
                    style={{ backgroundColor: "color-mix(in oklab, var(--a) 16%, var(--card))" }}
                  >
                    <Icon size={40} />
                  </span>
                  <p className="mt-4 truncate text-[16px] font-semibold">{label}</p>
                  <p className="mt-1 text-[15px] font-bold text-[var(--a)]">{price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
