import { useEffect, useRef } from "react";
import { stack } from "../data/links";
import { prefersReducedMotion } from "../lib/utils";

/**
 * Fita de tecnologias. A animação é CSS (roda fora da thread principal);
 * o JavaScript só ajusta a velocidade quando a pessoa rola — rolar rápido
 * acelera a fita, rolar para cima inverte — e só enquanto ela está visível.
 */
export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const wrap = el.querySelector<HTMLElement>("[data-wrap]");
    let anims: Animation[] = [];
    let visible = false;
    let raf = 0;
    let lastY = window.scrollY;
    let rate = 1;
    let dir = 1;

    const tick = () => {
      if (!visible) return;
      const y = window.scrollY;
      const v = y - lastY;
      lastY = y;
      if (v > 0.5) dir = 1;
      else if (v < -0.5) dir = -1;
      const target = dir * (1 + Math.min(Math.abs(v) * 0.15, 6));
      rate += (target - rate) * 0.1;
      if (!anims.length) anims = [...el.querySelectorAll<HTMLElement>("[data-track]")].flatMap((t) => t.getAnimations());
      for (const a of anims) a.playbackRate = rate;
      if (wrap) wrap.style.transform = `skewX(${Math.max(-8, Math.min(8, -v * 0.25))}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      el.classList.toggle("is-paused", !visible);
      cancelAnimationFrame(raf);
      if (visible) {
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const half = Math.ceil(stack.length / 2);
  const rows = [
    { items: stack.slice(0, half), accent: "text-brass", reverse: false },
    { items: stack.slice(half), accent: "text-jade", reverse: true },
  ];

  return (
    <div
      ref={ref}
      className="marquee -mx-4 border-y border-line/70 py-4 lg:mx-0"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <p className="sr-only">Tecnologias: {stack.join(", ")}.</p>
      <div aria-hidden data-wrap className="flex flex-col gap-3 will-change-transform">
        {rows.map((row, r) => (
          <div key={r} className="flex overflow-hidden whitespace-nowrap">
            <div
              data-track
              className="flex shrink-0 gap-6 pr-6"
              style={{ animation: `marquee ${r ? 26 : 22}s linear infinite${row.reverse ? " reverse" : ""}` }}
            >
              {[...row.items, ...row.items].map((t, i) => (
                <span key={i} className="flex items-center gap-6 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-mist">
                  {t}
                  <span className={row.accent}>◆</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
