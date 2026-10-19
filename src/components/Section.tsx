import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "../lib/utils";

/** Cabeçalho de seção: número, título e uma régua que se desenha. */
export function SectionHead({
  n,
  title,
  aside,
  id,
}: {
  id?: string;
  n: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      className="mb-5"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <motion.span
            variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } }}
            className="eyebrow"
          >
            {n}
          </motion.span>
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE, delay: 0.08 } },
            }}
            id={id}
            className="text-[1.65rem]"
          >
            {title}
          </motion.h2>
        </div>
        {aside && (
          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.4, duration: 0.6 } } }}
          >
            {aside}
          </motion.div>
        )}
      </div>
      <motion.div
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease: EASE, delay: 0.15 } } }}
        className="mt-3 h-px origin-left bg-gradient-to-r from-brass/70 via-line-hot to-transparent"
      />
    </motion.div>
  );
}
