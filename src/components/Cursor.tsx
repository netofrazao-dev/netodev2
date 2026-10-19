import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useFinePointer } from "../lib/utils";

/**
 * Cursor próprio (só mouse): ponto preciso + anel com mola que cresce e
 * mostra o que o clique vai fazer — "abrir", "copiar", "arrastar".
 * Qualquer elemento com data-cursor="texto" ativa o rótulo.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 420, damping: 34, mass: 0.6 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");

    const pick = (target: Element | null) => {
      const t = target?.closest<HTMLElement>("[data-cursor], a, button");
      setHover(!!t);
      setLabel(t?.dataset.cursor ?? null);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      pick(e.target as Element | null);
    };
    // a página rola por baixo do mouse parado: relê o que está sob ele
    const scroll = () => pick(document.elementFromPoint(x.get(), y.get()));
    const leave = () => setVisible(false);
    const pd = () => setDown(true);
    const pu = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const size = label ? 76 : hover ? 46 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
      <motion.div
        className="absolute left-0 top-0"
        style={{ x: rx, y: ry }}
        animate={{ opacity: visible ? 1 : 0 }}
      >
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brass/60"
          animate={{
            width: size,
            height: size,
            scale: down ? 0.82 : 1,
            backgroundColor: label ? "rgba(224,172,92,0.95)" : "rgba(224,172,92,0)",
            borderColor: label ? "rgba(224,172,92,0)" : "rgba(224,172,92,0.6)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          <AnimatePresence mode="wait">
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.18 }}
                className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-abyss"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute left-0 top-0"
        style={{ x, y }}
        animate={{ opacity: visible && !label ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass-hot" />
      </motion.div>
    </div>
  );
}
