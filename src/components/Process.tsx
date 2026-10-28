import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
} from "framer-motion";
import { processSteps } from "../data/extras";
import { EASE } from "../lib/utils";
import { SectionHead } from "./Section";

/** Linha do tempo: o trilho se enche de latão conforme a pessoa rola. */
export default function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 78%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  return (
    <section id="processo" aria-labelledby="processo-title" className="anchor">
      <SectionHead
        id="processo-title"
        n="05"
        title="Como funciona"
        sub="Do primeiro oi ao site no ar — sem surpresa no caminho."
      />
      <ol ref={ref} className="relative pl-12">
        <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
        <m.span
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute bottom-3 left-[15px] top-3 w-px origin-top bg-gradient-to-b from-brass via-brass to-jade"
        />
        {processSteps.map((s) => (
          <m.li
            key={s.n}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -22% 0px" }}
            className="relative pb-8 last:pb-0"
          >
            <m.span
              aria-hidden
              variants={{
                hidden: { scale: 0.6, backgroundColor: "#080f14", color: "#7a8b8e", borderColor: "#24404a" },
                show: {
                  scale: 1,
                  backgroundColor: "#e0ac5c",
                  color: "#02050a",
                  borderColor: "#e0ac5c",
                  transition: { type: "spring", stiffness: 380, damping: 16 },
                },
              }}
              className="absolute -left-12 top-0 flex h-[31px] w-[31px] items-center justify-center rounded-full border font-mono text-[0.6875rem] font-medium"
            >
              {s.n}
            </m.span>
            <m.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.08 } },
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-[1.35rem]">{s.title}</h3>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-jade">{s.time}</span>
              </div>
              <p className="mt-1.5 text-[0.9rem] leading-relaxed text-mist">{s.body}</p>
            </m.div>
          </m.li>
        ))}
      </ol>
    </section>
  );
}
