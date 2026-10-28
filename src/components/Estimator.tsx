import { useMemo, useState } from "react";
import {
  AnimatePresence,
  m,
} from "framer-motion";
import { Check, LayoutDashboard, Monitor, Plus, ShoppingBag } from "lucide-react";
import { whatsappLink } from "../data/links";
import { features, kinds, RUSH, type Kind } from "../data/extras";
import { EASE, brl, haptic } from "../lib/utils";
import { WhatsappIcon } from "./icons";
import Rolling from "./Rolling";
import { SectionHead } from "./Section";

const KIND_ICON = { site: Monitor, loja: ShoppingBag, sistema: LayoutDashboard } as const;
const round10 = (n: number) => Math.round(n / 10) * 10;

/**
 * Orçamento em 30 segundos — mesmos preços e recursos do portfólio. O
 * resultado fica preso no rodapé da tela enquanto a pessoa marca as opções.
 */
export default function Estimator() {
  const [kind, setKind] = useState<Kind>("loja");
  const [picked, setPicked] = useState<string[]>(["whats", "admin"]);
  const [rush, setRush] = useState(false);

  const cfg = kinds.find((k) => k.id === kind)!;
  const available = useMemo(() => features.filter((f) => f.for.includes(kind)), [kind]);
  const active = useMemo(() => available.filter((f) => picked.includes(f.id)), [available, picked]);

  const estimate = useMemo(() => {
    const raw = cfg.base + active.reduce((sum, f) => sum + f.price, 0);
    const total = rush ? raw * RUSH : raw;
    const extra = Math.floor(active.length / 4);
    const min = Math.max(1, cfg.weeks[0] + extra - (rush ? 1 : 0));
    const max = Math.max(min + 1, cfg.weeks[1] + extra - (rush ? 1 : 0));
    return { low: round10(total), high: round10(total * 1.2), weeks: [min, max] as const };
  }, [cfg, active, rush]);

  const toggle = (id: string) => {
    haptic(6);
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const message = [
    "Oi, Neto! Montei um orçamento no seu link:",
    "",
    `• Tipo: ${cfg.label}`,
    `• Recursos: ${active.length ? active.map((f) => f.label).join(", ") : "o básico mesmo"}`,
    `• Prazo: ${rush ? "preciso pra ontem" : "prazo normal"}`,
    `• Faixa que apareceu: ${brl(estimate.low)} a ${brl(estimate.high)}`,
    "",
    "Podemos conversar?",
  ].join("\n");

  return (
    <section id="orcamento" aria-labelledby="orcamento-title" className="anchor">
      <SectionHead
        id="orcamento-title"
        n="04"
        title="Quanto custa"
        sub="Marque o que o seu negócio precisa. Em 30 segundos você tem uma faixa de valor e de prazo — e manda tudo pronto no meu WhatsApp."
      />

      {/* tipo */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de projeto">
        {kinds.map((k) => {
          const Icon = KIND_ICON[k.id];
          const on = k.id === kind;
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                if (on) return;
                haptic(8);
                setKind(k.id);
              }}
              className={`relative flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-colors duration-300 ${on ? "border-brass" : "border-line hover:border-line-hot"}`}
            >
              {on && (
                <m.span
                  layoutId="kind-pill"
                  className="absolute inset-0 rounded-2xl bg-brass-wash"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={18} className={`relative ${on ? "text-brass" : "text-mist"}`} />
              <span className={`relative text-[0.95rem] font-medium ${on ? "text-brass" : "text-bone"}`}>{k.short}</span>
              <span className="relative font-mono text-[0.625rem] tracking-[0.04em] text-dim">{brl(k.base)}+</span>
            </button>
          );
        })}
      </div>

      {/* o que é e o que já vem */}
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={kind}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-4"
        >
          <p className="text-[0.9rem] leading-relaxed text-mist">{cfg.pitch}</p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {cfg.includes.map((inc) => (
              <li key={inc} className="flex items-start gap-2 text-[0.8125rem] text-bone/90">
                <Check size={14} className="mt-0.5 shrink-0 text-jade" />
                {inc}
              </li>
            ))}
          </ul>
        </m.div>
      </AnimatePresence>

      {/* recursos */}
      <p className="eyebrow-mist mt-6" id="orc-recursos">
        Recursos
      </p>
      <p className="mt-1 text-[0.75rem] text-dim">Toque para marcar. Dá pra mudar depois, na conversa.</p>
      <m.div layout className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="orc-recursos">
        <AnimatePresence mode="popLayout" initial={false}>
          {available.map((f) => {
            const on = picked.includes(f.id);
            return (
              <m.button
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.id)}
                className="chip"
              >
                <span className="relative h-3.5 w-3.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <m.span
                      key={on ? "on" : "off"}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      className="absolute inset-0"
                    >
                      {on ? <Check size={14} strokeWidth={2.6} /> : <Plus size={14} />}
                    </m.span>
                  </AnimatePresence>
                </span>
                {f.label}
                <span className={`font-mono text-[0.625rem] ${on ? "text-abyss/70" : "text-dim"}`}>+{f.price}</span>
              </m.button>
            );
          })}
        </AnimatePresence>
      </m.div>

      {/* prazo */}
      <p className="eyebrow-mist mt-6" id="orc-prazo">
        Prazo
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="orc-prazo">
        {[
          { id: false, label: "Prazo normal" },
          { id: true, label: "Preciso pra ontem (+25%)" },
        ].map((o) => (
          <button
            key={String(o.id)}
            type="button"
            aria-pressed={rush === o.id}
            onClick={() => {
              haptic(6);
              setRush(o.id);
            }}
            className="chip"
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* resultado — preso no rodapé enquanto a pessoa escolhe */}
      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mt-7 lg:bottom-6">
        <div className="relative overflow-hidden rounded-2xl border border-brass/40 bg-raised p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(224,172,92,0.18), transparent)" }}
          />
          <div className="relative flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow-mist">Faixa estimada</p>
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 font-display text-[1.65rem] leading-none text-brass">
                <Rolling text={brl(estimate.low)} />
                <span className="text-[1rem] text-mist">a</span>
                <Rolling text={brl(estimate.high)} className="text-bone" />
              </p>
              <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-dim">
                {estimate.weeks[0]} a {estimate.weeks[1]} semanas · 50% + 50%
              </p>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            Estimativa de {brl(estimate.low)} a {brl(estimate.high)}, em {estimate.weeks[0]} a {estimate.weeks[1]} semanas.
          </p>
          <m.a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.97 }}
            onClick={() => haptic(10)}
            data-cursor="mandar"
            className="relative mt-3.5 flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-brass px-5 py-3 font-medium text-abyss"
          >
            <span
              aria-hidden
              className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
            <WhatsappIcon size={17} /> Mandar este orçamento
          </m.a>
        </div>
      </div>
      <p className="mt-3 text-[0.6875rem] leading-relaxed text-dim">
        Estimativa automática, só para você se situar. O valor fechado sai por escrito depois da conversa — e não muda depois.
      </p>
    </section>
  );
}
