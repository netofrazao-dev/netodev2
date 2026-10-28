import { useEffect, useState } from "react";
import {
  AnimatePresence,
  m,
  useScroll,
  useSpring,
} from "framer-motion";
import { Calculator, CircleHelp, LayoutGrid, WandSparkles } from "lucide-react";
import { defaultMessage, whatsappLink } from "../data/links";
import { useAnyOverlayOpen } from "../lib/overlay";
import { haptic, scrollToId } from "../lib/utils";
import { WhatsappIcon } from "./icons";

/** Régua de progresso de leitura no topo. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <m.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-brass via-brass-hot to-jade"
    />
  );
}

const ITEMS = [
  { id: "projetos", label: "Projetos", icon: LayoutGrid },
  { id: "simular", label: "Simular", icon: WandSparkles },
  { id: "orcamento", label: "Orçar", icon: Calculator },
  { id: "duvidas", label: "Dúvidas", icon: CircleHelp },
] as const;

/** Qual seção está no meio da tela (só lê posições — sem observar o DOM inteiro). */
function useSpy(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const mid = window.innerHeight * 0.45;
      let current: string | null = null;
      for (const id of ["projetos", "simular", "orcamento", "processo", "duvidas"]) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) current = id;
      }
      // "como funciona" fica junto de "orçar" no dock
      setActive(current === "processo" ? "orcamento" : current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);
  return active;
}

/**
 * Dock do celular, no alcance do polegar: atalhos para as seções e o
 * WhatsApp no centro. Aparece quando o botão principal sai da tela e some
 * quando alguma gaveta está aberta.
 */
export function Dock({ show }: { show: boolean }) {
  const overlay = useAnyOverlayOpen();
  const visible = show && !overlay;
  const active = useSpy(visible);

  const go = (id: string) => {
    haptic(6);
    scrollToId(id);
  };

  const item = (it: (typeof ITEMS)[number]) => {
    const on = active === it.id;
    const Icon = it.icon;
    return (
      <button
        key={it.id}
        type="button"
        onClick={() => go(it.id)}
        aria-current={on ? "true" : undefined}
        className={`relative flex flex-1 flex-col items-center gap-1 py-2 transition-colors ${on ? "text-brass" : "text-mist"}`}
      >
        {on && (
          <m.span
            layoutId="dock-dot"
            className="absolute -top-px h-[2px] w-6 rounded-full bg-brass"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        )}
        <Icon size={19} strokeWidth={on ? 2.1 : 1.7} />
        <span className="text-[0.625rem] font-medium tracking-[0.02em]">{it.label}</span>
      </button>
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.nav
          aria-label="Atalhos"
          initial={{ y: "130%" }}
          animate={{ y: 0 }}
          exit={{ y: "130%" }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <div className="mx-auto flex max-w-[30rem] items-center rounded-2xl border border-line-hot bg-raised/95 px-1 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.95)]">
            {item(ITEMS[0])}
            {item(ITEMS[1])}
            <m.a
              href={whatsappLink(defaultMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic(12)}
              whileTap={{ scale: 0.9 }}
              aria-label="Pedir orçamento no WhatsApp"
              className="relative -mt-6 mx-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brass text-abyss shadow-[0_12px_30px_-8px_rgba(224,172,92,0.8)]"
            >
              <span aria-hidden className="animate-pulse-dot absolute inset-0 rounded-2xl border-2 border-brass" />
              <WhatsappIcon size={24} />
            </m.a>
            {item(ITEMS[2])}
            {item(ITEMS[3])}
          </div>
        </m.nav>
      )}
    </AnimatePresence>
  );
}
