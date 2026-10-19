import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { EASE, EASE_IN_OUT } from "../lib/utils";

type Phase = "draw" | "open" | "done";

/**
 * Abertura: o monograma se desenha, a régua acende e a cortina se parte
 * ao meio. Curta de propósito (~1,1 s) — toque em qualquer lugar pula.
 */
export default function Intro({ onOpen }: { onOpen: () => void }) {
  const [phase, setPhase] = useState<Phase>("draw");
  const counter = useRef<HTMLSpanElement>(null);
  const opened = useRef(false);

  const open = () => {
    if (opened.current) return;
    opened.current = true;
    setPhase("open");
    onOpen();
    window.setTimeout(() => setPhase("done"), 950);
  };

  useEffect(() => {
    const ctrl = animate(0, 100, {
      duration: 1,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (counter.current)
          counter.current.textContent = String(Math.round(v)).padStart(3, "0");
      },
    });
    const id = window.setTimeout(open, 1150);
    return () => {
      ctrl.stop();
      window.clearTimeout(id);
    };
  }, []);

  const strokes = ["M18 46V18", "M18 18l28 28", "M46 46V18"];

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="intro"
          aria-hidden
          onPointerDown={open}
          className="fixed inset-0 z-[100] select-none"
        >
          {/* metades da cortina */}
          {(["top", "bottom"] as const).map((half) => (
            <motion.div
              key={half}
              className={`absolute inset-x-0 h-1/2 bg-abyss ${half === "top" ? "top-0" : "bottom-0"}`}
              initial={false}
              animate={
                phase === "open"
                  ? { y: half === "top" ? "-100%" : "100%" }
                  : { y: 0 }
              }
              transition={{ duration: 0.85, ease: EASE_IN_OUT, delay: 0.08 }}
            />
          ))}

          {/* a costura — régua de latão que acende antes de abrir */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-brass to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
              phase === "open"
                ? { scaleX: 1.4, opacity: 0 }
                : { scaleX: 1, opacity: 0.9 }
            }
            transition={
              phase === "open"
                ? { duration: 0.6, ease: EASE }
                : { duration: 0.9, ease: EASE_IN_OUT, delay: 0.15 }
            }
          />

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-7"
            animate={
              phase === "open"
                ? { opacity: 0, scale: 0.86, filter: "blur(6px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.45, ease: EASE }}
          >
            <svg
              width="76"
              height="76"
              viewBox="0 0 64 64"
              className="-translate-y-8 text-brass drop-shadow-[0_0_18px_rgba(224,172,92,0.45)]"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth={5}
                strokeLinecap="square"
              >
                {strokes.map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.38,
                      delay: 0.08 + i * 0.2,
                      ease: [0.65, 0, 0.35, 1],
                    }}
                  />
                ))}
              </g>
              <motion.circle
                cx="46"
                cy="18"
                r="4.5"
                fill="var(--color-jade)"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.6, 1] }}
                transition={{ duration: 0.5, delay: 0.72, ease: EASE }}
                style={{ transformOrigin: "46px 18px" }}
              />
            </svg>

            <div className="flex translate-y-8 items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-dim">
              <span>Breves · Marajó</span>
              <span className="text-brass tabular" ref={counter}>
                000
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
