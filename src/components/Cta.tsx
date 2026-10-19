import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Check, Share2, UserPlus } from "lucide-react";
import { defaultMessage, site, whatsappLink } from "../data/links";
import { useStage } from "../lib/stage";
import { EASE, haptic, lanternHandlers, shareSelf, useFinePointer } from "../lib/utils";
import { WhatsappIcon } from "./icons";
import { useToast } from "./Toast";

type Ripple = { id: number; x: number; y: number };

/** O botão principal: magnético no mouse, com onda no toque e brilho que passa. */
export function PrimaryCta({ compact = false }: { compact?: boolean }) {
  const fine = useFinePointer();
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.5 });
  const y = useSpring(my, { stiffness: 260, damping: 18, mass: 0.5 });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const onMove = (e: React.PointerEvent) => {
    if (!fine) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.12);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };
  const onDown = (e: React.PointerEvent) => {
    haptic(12);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const id = Date.now();
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    window.setTimeout(() => setRipples((rs) => rs.filter((p) => p.id !== id)), 800);
  };

  return (
    <motion.a
      ref={ref}
      href={whatsappLink(defaultMessage)}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="conversar"
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerDown={onDown}
      whileTap={{ scale: 0.97 }}
      style={{ x, y }}
      className={`group relative flex items-center overflow-hidden rounded-2xl bg-brass text-abyss shadow-[0_18px_50px_-18px_rgba(224,172,92,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] ${compact ? "gap-2.5 py-1.5 pl-1.5 pr-3.5" : "gap-4 px-5 py-4"}`}
    >
      {/* brilho que atravessa */}
      <span
        aria-hidden
        className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />
      {/* ondas do toque */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.75, ease: EASE }}
          className="pointer-events-none absolute h-[28rem] w-[28rem] rounded-full bg-white"
          style={{ left: r.x - 224, top: r.y - 224 }}
        />
      ))}

      <span
        className={`relative flex shrink-0 items-center justify-center rounded-xl bg-abyss text-brass transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-110 ${compact ? "h-8 w-8" : "h-11 w-11"}`}
      >
        <WhatsappIcon size={compact ? 16 : 22} />
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span className={`font-medium leading-tight ${compact ? "text-sm" : "text-[1.05rem]"}`}>
          {compact ? "Orçamento" : "Pedir orçamento no WhatsApp"}
        </span>
        {!compact && (
          <span className="mt-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-abyss/65">
            resposta em até 2 horas
          </span>
        )}
      </span>
      {!compact && (
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-abyss/20">
          <ArrowUpRight
            size={18}
            className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-6 group-hover:translate-x-6"
          />
          <ArrowUpRight
            size={18}
            className="absolute -translate-x-6 translate-y-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0"
          />
        </span>
      )}
    </motion.a>
  );
}

/** Salvar contato + compartilhar, lado a lado. */
export function QuickActions() {
  const toast = useToast();
  const [saved, setSaved] = useState(false);

  const share = async () => {
    haptic();
    const r = await shareSelf();
    if (r === "copied") toast({ message: "Link copiado — é só colar" });
    if (r === "failed") toast({ message: "Não deu para copiar o link" });
  };

  const onSave = () => {
    haptic();
    setSaved(true);
    toast({ message: "Contato pronto para salvar" });
    window.setTimeout(() => setSaved(false), 2400);
  };

  const cls =
    "lantern group flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm text-bone";

  return (
    <div className="flex gap-3">
      <motion.a
        href={site.vcard}
        download="Neto Frazao.vcf"
        onClick={onSave}
        whileTap={{ scale: 0.96 }}
        data-cursor="salvar"
        className={cls}
        {...lanternHandlers}
      >
        <span className="relative h-4 w-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={saved ? "ok" : "add"}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute inset-0 text-brass"
            >
              {saved ? <Check size={16} strokeWidth={2.6} /> : <UserPlus size={16} />}
            </motion.span>
          </AnimatePresence>
        </span>
        Salvar contato
      </motion.a>
      <motion.button
        type="button"
        onClick={share}
        whileTap={{ scale: 0.96 }}
        data-cursor="enviar"
        className={cls}
        {...lanternHandlers}
      >
        <Share2 size={16} className="text-jade transition-transform duration-500 group-hover:rotate-12" />
        Compartilhar
      </motion.button>
    </div>
  );
}

/** Bloco de ação do topo, com entrada coreografada. */
export default function Cta() {
  const ready = useStage();
  return (
    <motion.div
      initial="hidden"
      animate={ready ? "show" : "hidden"}
      variants={{ show: { transition: { delayChildren: 0.95, staggerChildren: 0.12 } } }}
      className="flex flex-col gap-3"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" },
          show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
        }}
      >
        <PrimaryCta />
      </motion.div>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
        }}
      >
        <QuickActions />
      </motion.div>
    </motion.div>
  );
}
