import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { site, whatsappLink } from "../data/links";
import { EASE, haptic } from "../lib/utils";
import { WhatsappIcon } from "./icons";

const strokes = ["M18 46V18", "M18 18l28 28", "M46 46V18"];

export default function Footer() {
  return (
    <footer className="flex flex-col gap-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      {/* o convite final — com borda que gira */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative overflow-hidden rounded-[1.6rem] p-px"
      >
        <div
          aria-hidden
          className="animate-spin-slow absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, var(--color-brass) 50deg, transparent 110deg, transparent 180deg, var(--color-jade) 230deg, transparent 290deg)",
          }}
        />
        <div className="relative overflow-hidden rounded-[calc(1.6rem-1px)] bg-surface/95 p-6 backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(224,172,92,0.25), transparent)" }}
          />
          <p className="eyebrow">Gostou desta página?</p>
          <h2 className="mt-3 text-[2.1rem] leading-[1.02]">
            Eu faço uma assim <em className="text-brass">pro seu negócio.</em>
          </h2>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-mist">
            Do link da bio ao sistema completo. A conversa é de graça e a proposta chega por escrito.
          </p>
          <motion.a
            href={whatsappLink("Oi, Neto! Gostei do seu link da bio e quero um assim para o meu negócio.")}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => haptic(10)}
            data-cursor="bora"
            className="relative mt-6 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-bone px-5 py-3 text-sm font-medium text-abyss"
          >
            <span
              aria-hidden
              className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brass/50 to-transparent"
            />
            <WhatsappIcon size={17} />
            Quero a minha
          </motion.a>
        </div>
      </motion.div>

      {/* assinatura */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.svg
            width="38"
            height="38"
            viewBox="0 0 64 64"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-brass"
            aria-hidden
          >
            <g fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="square">
              {strokes.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  variants={{
                    hidden: { pathLength: 0 },
                    show: { pathLength: 1, transition: { duration: 0.5, delay: 0.2 + i * 0.22, ease: [0.65, 0, 0.35, 1] } },
                  }}
                />
              ))}
            </g>
            <motion.circle
              cx="46"
              cy="18"
              r="4.5"
              fill="var(--color-jade)"
              style={{ transformOrigin: "46px 18px" }}
              variants={{ hidden: { scale: 0 }, show: { scale: [0, 1.6, 1], transition: { delay: 0.95, duration: 0.5 } } }}
            />
          </motion.svg>
          <div>
            <p className="text-sm text-bone">Feito à mão em {site.city}</p>
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-dim">
              {site.region} · {site.state} · {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            haptic(6);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          whileTap={{ scale: 0.88 }}
          whileHover={{ y: -3 }}
          data-cursor="topo"
          aria-label="Voltar ao topo"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mist transition-colors hover:border-brass/60 hover:text-brass"
        >
          <ArrowUp size={16} />
        </motion.button>
      </div>
    </footer>
  );
}
