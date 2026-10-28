import {
  AnimatePresence,
  m,
} from "framer-motion";
import { EASE_IN_OUT } from "../lib/utils";

/**
 * Texto em que cada caractere rola sozinho quando muda — o relógio de
 * Breves e o preço do orçamento usam (efeito odômetro). Leitores de tela
 * recebem o texto inteiro, sem os pedaços animados.
 */
export default function Rolling({ text, className = "" }: { text: string; className?: string }) {
  const chars = text.split("");
  return (
    <span className={`relative inline-flex tabular ${className}`}>
      <span className="sr-only">{text}</span>
      {chars.map((ch, i) => (
        <span
          key={chars.length - i}
          aria-hidden
          className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={ch}
              className="inline-block whitespace-pre"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_IN_OUT, delay: (chars.length - i) * 0.025 }}
            >
              {ch}
            </m.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
