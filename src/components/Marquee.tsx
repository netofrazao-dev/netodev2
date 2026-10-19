import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { stack } from "../data/links";
import { useReducedMotion } from "../lib/utils";

/**
 * Fita de tecnologias que reage à rolagem: rolar rápido acelera a fita,
 * inverte o sentido e entorta as letras um pouco.
 */
function Row({ items, base, accent }: { items: string[]; base: number; accent: "brass" | "jade" }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(velocity, [-2000, 2000], [8, -8]);
  const dir = useRef(1);
  const pct = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    x.set(x.get() + move);
  });

  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={{ x: pct, skewX: skew }} className="flex shrink-0 gap-6 pr-6">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-6 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-mist">
            {t}
            <span className={accent === "brass" ? "text-brass" : "text-jade"}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  const half = Math.ceil(stack.length / 2);
  return (
    <div
      aria-label={`Tecnologias: ${stack.join(", ")}`}
      className="-mx-4 flex flex-col gap-3 border-y border-line/70 py-4 lg:mx-0"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div aria-hidden className="flex flex-col gap-3">
        <Row items={stack.slice(0, half)} base={-2.2} accent="brass" />
        <Row items={stack.slice(half)} base={2.2} accent="jade" />
      </div>
    </div>
  );
}
