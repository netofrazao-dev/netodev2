import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { services, whatsappLink, type Service } from "../data/links";
import { EASE, brl, haptic, lanternHandlers } from "../lib/utils";
import { SectionHead } from "./Section";

function Row({ s, i, open, onToggle }: { s: Service; i: number; open: boolean; onToggle: () => void }) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
      }}
      layout
      transition={{ layout: { type: "spring", stiffness: 300, damping: 34 } }}
      className="lantern overflow-hidden rounded-2xl"
      style={{ ["--lit" as string]: open ? 0.55 : undefined }}
      {...lanternHandlers}
    >
      <button
        type="button"
        onClick={() => {
          haptic(6);
          onToggle();
        }}
        aria-expanded={open}
        aria-controls={`svc-${s.id}`}
        data-cursor={open ? "fechar" : "detalhes"}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="font-mono text-[0.6875rem] text-brass">0{i + 1}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[1.3rem] leading-tight text-bone">{s.title}</span>
          <span className="mt-1 block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-dim">
            a partir de <span className="text-mist">{brl(s.from)}</span> · {s.deadline}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 135 : 0, backgroundColor: open ? "#e0ac5c" : "rgba(0,0,0,0)" }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${open ? "border-brass text-abyss" : "border-line-hot text-brass"}`}
        >
          <Plus size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`svc-${s.id}`}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: "spring", stiffness: 300, damping: 34 }, opacity: { duration: 0.25 } }}
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
              className="px-4 pb-4 pl-[3.1rem]"
            >
              <motion.p
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="text-[0.9rem] leading-relaxed text-mist"
              >
                {s.pitch}
              </motion.p>
              <ul className="mt-3 space-y-1.5">
                {s.includes.map((inc) => (
                  <motion.li
                    key={inc}
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                    className="flex items-start gap-2.5 text-[0.85rem] text-bone/90"
                  >
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 rotate-45 bg-jade" />
                    {inc}
                  </motion.li>
                ))}
              </ul>
              <motion.a
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                href={whatsappLink(`Oi, Neto! Quero um orçamento de ${s.title.toLowerCase()}.`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => haptic(10)}
                data-cursor="pedir"
                className="group mt-4 inline-flex items-center gap-1.5 border-b border-brass/40 pb-0.5 text-sm text-brass"
              >
                Pedir orçamento de {s.title.toLowerCase()}
                <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function Services() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section aria-labelledby="servicos-title">
      <SectionHead id="servicos-title" n="03" title="O que eu faço" />
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="flex flex-col gap-2.5"
      >
        {services.map((s, i) => (
          <Row
            key={s.id}
            s={s}
            i={i}
            open={open === s.id}
            onToggle={() => setOpen((o) => (o === s.id ? null : s.id))}
          />
        ))}
      </motion.ul>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-dim">
        Preço fechado por escrito antes de começar. Metade no início, metade na entrega.
      </p>
    </section>
  );
}
