import type { ReactNode } from "react";
import {
  m,
} from "framer-motion";
import { EASE } from "../lib/utils";
import Scramble from "./Scramble";

/** Cabeçalho de seção: número que decodifica, título e uma régua que se desenha. */
export function SectionHead({
  n,
  title,
  sub,
  aside,
  id,
}: {
  id?: string;
  n: string;
  title: string;
  sub?: string;
  aside?: ReactNode;
}) {
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      className="mb-5"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <Scramble text={n} className="eyebrow shrink-0" />
          <m.h2
            id={id}
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.06 } },
            }}
            className="text-[1.65rem]"
          >
            {title}
          </m.h2>
        </div>
        {aside && (
          <m.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.35, duration: 0.6 } } }}
            className="shrink-0"
          >
            {aside}
          </m.div>
        )}
      </div>
      <m.div
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 0.12 } } }}
        className="mt-3 h-px origin-left bg-gradient-to-r from-brass/70 via-line-hot to-transparent"
      />
      {sub && (
        <m.p
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.25, duration: 0.7 } } }}
          className="mt-3 text-[0.9rem] leading-relaxed text-mist"
        >
          {sub}
        </m.p>
      )}
    </m.div>
  );
}
