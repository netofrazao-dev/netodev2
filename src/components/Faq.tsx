import { useState } from "react";
import {
  AnimatePresence,
  m,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { whatsappLink } from "../data/links";
import { faq } from "../data/extras";
import { EASE, haptic } from "../lib/utils";
import { SectionHead } from "./Section";

/** Dúvidas frequentes — uma aberta por vez. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="duvidas" aria-labelledby="duvidas-title" className="anchor">
      <SectionHead id="duvidas-title" n="06" title="Dúvidas" />
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="divide-y divide-line border-y border-line"
      >
        {faq.map((f, i) => {
          const on = open === i;
          return (
            <m.div
              key={f.q}
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
            >
              <h3 className="font-sans text-base tracking-normal">
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={on}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => {
                    haptic(5);
                    setOpen(on ? null : i);
                  }}
                  data-cursor={on ? "fechar" : "abrir"}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className={`text-[0.98rem] font-medium transition-colors ${on ? "text-brass" : "text-bone"}`}>{f.q}</span>
                  <m.span
                    animate={{ rotate: on ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${on ? "border-brass text-brass" : "border-line-hot text-mist"}`}
                  >
                    <Plus size={15} />
                  </m.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {on && (
                  <m.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.25 } }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-10 text-[0.9rem] leading-relaxed text-mist">{f.a}</p>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          );
        })}
      </m.div>

      <a
        href={whatsappLink("Oi, Neto! Vi seu link e fiquei com uma dúvida:")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic(8)}
        data-cursor="perguntar"
        className="group mt-5 inline-flex items-center gap-1.5 border-b border-brass/40 pb-0.5 text-sm text-brass"
      >
        Ainda com dúvida? Pergunte no WhatsApp
        <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </section>
  );
}
