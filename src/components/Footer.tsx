import { useRef } from "react";
import { motion, stagger, useAnimate, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { site, whatsappLink } from "../data/links";
import { EASE, haptic, useBrevesClock } from "../lib/utils";
import { WhatsappIcon } from "./icons";

const strokes = ["M18 46V18", "M18 18l28 28", "M46 46V18"];

/** Uma linha do nome gigante: letras sobem de dentro de uma máscara. */
function WordLine({
  text,
  from,
  italic,
}: {
  text: string;
  from: number;
  italic?: boolean;
}) {
  return (
    <span className="block overflow-hidden pb-[0.1em] pr-[0.08em] pt-[0.04em]">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { y: "108%", rotate: italic ? 6 : -6 },
            show: {
              y: "0%",
              rotate: 0,
              transition: { duration: 1.05, ease: EASE, delay: (from + i) * 0.055 },
            },
          }}
        >
          <span data-sig className={`inline-block ${italic ? "italic text-brass" : ""}`}>
            {ch}
          </span>
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Assinatura do rodapé: o nome em tamanho de cartaz, ocupando a largura
 * toda. As linhas deslizam em sentidos opostos com a rolagem e as letras
 * fazem uma onda quando tocadas.
 */
function Signature() {
  const ref = useRef<HTMLDivElement>(null);
  const [scope, animateScope] = useAnimate();
  const { online } = useBrevesClock();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const xTop = useTransform(scrollYProgress, [0, 1], ["-14%", "0%"]);
  const xBottom = useTransform(scrollYProgress, [0, 1], ["14%", "0%"]);

  const wave = () => {
    haptic(6);
    animateScope(
      "[data-sig]",
      { y: [0, -18, 0], rotate: [0, -5, 0] },
      { duration: 0.65, delay: stagger(0.04), ease: "easeInOut" },
    );
  };

  return (
    <div ref={ref} className="@container">
      <div className="flex items-center justify-between gap-4 border-t border-line pt-5 font-mono text-[0.625rem] uppercase tracking-[0.16em]">
        <span className="flex items-center gap-2 text-mist">
          <span className="relative flex h-2 w-2">
            <span className={`animate-pulse-dot absolute inset-0 rounded-full ${online ? "bg-jade" : "bg-brass"}`} />
            <span className={`relative h-2 w-2 rounded-full ${online ? "bg-jade" : "bg-brass"}`} />
          </span>
          Aceitando novos projetos
        </span>
        <span className="text-dim">© {new Date().getFullYear()}</span>
      </div>

      <motion.p
        ref={scope}
        aria-label={site.name}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        onClick={wave}
        onPointerEnter={(e) => e.pointerType === "mouse" && wave()}
        className="mt-3 cursor-default select-none font-display text-[29cqw] font-[640] leading-[0.86] tracking-[-0.055em] text-bone"
        style={{ fontVariationSettings: '"opsz" 36' }}
      >
        <motion.span aria-hidden style={{ x: xTop }} className="block">
          <WordLine text="Neto" from={0} />
        </motion.span>
        <motion.span aria-hidden style={{ x: xBottom }} className="block text-right">
          <WordLine text="Frazão" from={3} italic />
        </motion.span>
      </motion.p>

      <div className="mt-6 flex items-center gap-4 border-t border-line pt-5">
        <motion.svg
          width="44"
          height="44"
          viewBox="0 0 64 64"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="shrink-0 text-brass drop-shadow-[0_0_14px_rgba(224,172,92,0.35)]"
          aria-hidden
        >
          <g fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="square">
            {strokes.map((d, i) => (
              <motion.path
                key={d}
                d={d}
                variants={{
                  hidden: { pathLength: 0 },
                  show: { pathLength: 1, transition: { duration: 0.5, delay: 0.3 + i * 0.22, ease: [0.65, 0, 0.35, 1] } },
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
            variants={{ hidden: { scale: 0 }, show: { scale: [0, 1.6, 1], transition: { delay: 1.05, duration: 0.5 } } }}
          />
        </motion.svg>

        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] font-medium leading-tight text-bone">
            Sites e sistemas feitos no {site.region}.
          </p>
          <p className="mt-1 truncate font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-dim">
            {site.city} · {site.state} · {site.coords}
          </p>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            haptic(6);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          whileTap={{ scale: 0.88 }}
          whileHover={{ y: -4 }}
          data-cursor="topo"
          aria-label="Voltar ao topo"
          className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brass/50 text-brass transition-colors duration-300 hover:bg-brass hover:text-abyss"
        >
          <ArrowUp size={18} className="transition-transform duration-500 group-hover:-translate-y-0.5" />
        </motion.button>
      </div>
    </div>
  );
}

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

      <Signature />
    </footer>
  );
}
