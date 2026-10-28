import { useEffect, useRef } from "react";
import {
  m,
  useScroll,
  useTransform,
} from "framer-motion";
import { overlayStore } from "../lib/overlay";
import { prefersReducedMotion, whenIdle } from "../lib/utils";

type Pt = { x: number; y: number };
type Branch = { pts: Pt[]; depth: number };
type Pulse = { branch: number; t: number; speed: number; hue: 0 | 1 };
type Ring = { x: number; y: number; born: number };

/** RNG determinístico — o mesmo delta em todo carregamento. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Cresce um delta em espaço normalizado: "x" é o sentido do rio, "y" é a
 * largura. Cada canal anda com ruído e às vezes se parte em dois.
 */
function growDelta(maxDepth: number, trunks: number, budget0: number, split: number, cap: number) {
  const rng = makeRng(20261019);
  const branches: Branch[] = [];
  const nodes: Pt[] = [];

  const walk = (start: Pt, angle: number, depth: number, budget: number) => {
    if (branches.length >= cap) return;
    const pts: Pt[] = [start];
    let p = start;
    let a = angle;
    for (let i = 0; i < budget; i++) {
      a += (rng() - 0.5) * 0.32;
      a = Math.max(-1, Math.min(1, a));
      const step = 0.022 + rng() * 0.014;
      p = { x: p.x + Math.cos(a) * step, y: p.y + Math.sin(a) * step * 0.8 };
      if (p.x > 1.16 || p.y < -0.14 || p.y > 1.14) break;
      pts.push(p);
      if (depth < maxDepth && i > 3 && i < budget - 4 && rng() < split && branches.length < cap) {
        nodes.push(p);
        walk(p, a + (rng() < 0.5 ? -1 : 1) * (0.34 + rng() * 0.42), depth + 1, Math.max(8, Math.round(budget * 0.6)));
      }
    }
    if (pts.length > 2) branches.push({ pts, depth });
  };

  for (let t = 0; t < trunks; t++) {
    const y = 0.12 + (t + 0.5) * (0.76 / trunks) + (rng() - 0.5) * 0.08;
    walk({ x: -0.1, y }, (rng() - 0.5) * 0.3, 0, budget0);
  }
  return { branches, nodes };
}

/** Brilho redondo desenhado uma vez e carimbado depois (bem mais barato). */
function makeGlow(color: string, r: number) {
  const c = document.createElement("canvas");
  c.width = c.height = r * 2;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${color},0.32)`);
  grad.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, r * 2, r * 2);
  return c;
}

/**
 * Fundo vivo: o delta do Marajó como placa de circuito. No celular (retrato)
 * o rio desce de cima para baixo; rolar a página acelera os pulsos e tocar
 * na tela solta uma onda de sonar.
 *
 * Leveza: resolução 1x no celular, ~40 quadros por segundo, brilhos
 * pré-desenhados, pausa com a aba escondida ou gaveta aberta, e só começa
 * depois que a página terminou de carregar.
 */
function DeltaField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // "reduzir movimento": o rio continua, só que lento, sem sonar e sem correnteza da rolagem
    const calm = prefersReducedMotion();
    const small = window.matchMedia("(max-width: 767px)").matches;
    const frameGap = small ? 24 : 15; // ms entre quadros (~40 fps no celular)

    const { branches, nodes } = growDelta(small ? 3 : 4, small ? 3 : 4, small ? 42 : 46, small ? 0.12 : 0.13, small ? 40 : 90);

    const COLORS = ["224,172,92", "63,183,159"] as const;
    const glows = COLORS.map((c) => makeGlow(c, 22));

    let w = 0;
    let h = 0;
    let dpr = 1;
    let vertical = false;
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");

    const X = (p: Pt) => (vertical ? p.y * w : p.x * w);
    const Y = (p: Pt) => (vertical ? p.x * h : p.y * h);

    // esmaecimento das bordas (antes era uma máscara CSS aplicada a cada quadro;
    // agora é calculado aqui: elipse 140% × 90% centrada em 50% / 30%)
    const fade = (px: number, py: number) => {
      const d = Math.hypot((px - w * 0.5) / (w * 1.4), (py - h * 0.3) / (h * 0.9));
      if (d <= 0.2) return 1;
      if (d <= 0.6) return 1 - ((d - 0.2) / 0.4) * 0.5;
      if (d <= 1) return 0.5 * (1 - (d - 0.6) / 0.4);
      return 0;
    };

    const pointer = { x: 0, y: 0, active: false };
    const rings: Ring[] = [];
    const pulses: Pulse[] = [];
    let boost = 1;
    let lastScroll = window.scrollY;
    let raf = 0;
    let last = 0;
    let running = false;
    let started = false;

    const paintStatic = () => {
      if (!lctx) return;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, w, h);
      lctx.lineCap = "round";
      lctx.lineJoin = "round";
      for (const b of branches) {
        lctx.beginPath();
        lctx.moveTo(X(b.pts[0]), Y(b.pts[0]));
        for (let i = 1; i < b.pts.length; i++) {
          const a = b.pts[i - 1];
          const c = b.pts[i];
          const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
          lctx.quadraticCurveTo(X(a), Y(a), X(mid), Y(mid));
        }
        lctx.lineWidth = Math.max(0.6, 2.2 - b.depth * 0.5);
        lctx.strokeStyle =
          b.depth === 0 ? "rgba(224,172,92,0.2)" : b.depth === 1 ? "rgba(63,183,159,0.16)" : "rgba(144,163,165,0.09)";
        lctx.stroke();
      }
      lctx.fillStyle = "rgba(224,172,92,0.32)";
      for (const n of nodes) lctx.fillRect(X(n) - 1.5, Y(n) - 1.5, 3, 3);

      // aplica o esmaecimento uma vez só, na camada estática
      lctx.save();
      lctx.globalCompositeOperation = "destination-in";
      lctx.setTransform(dpr * w * 1.4, 0, 0, dpr * h * 0.9, dpr * w * 0.5, dpr * h * 0.3);
      const g = lctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0.2, "rgba(0,0,0,1)");
      g.addColorStop(0.6, "rgba(0,0,0,0.5)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      lctx.fillStyle = g;
      lctx.fillRect(-2, -2, 4, 4);
      lctx.restore();
    };

    const drawStill = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(layer, 0, 0, w, h);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = small ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      vertical = h > w * 1.05;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      layer.width = canvas.width;
      layer.height = canvas.height;
      paintStatic();
      if (!running) drawStill();
    };

    const along = (b: Branch, t: number): Pt => {
      const f = Math.max(0, Math.min(0.999, t)) * (b.pts.length - 1);
      const i = Math.floor(f);
      const k = f - i;
      const a = b.pts[i];
      const c = b.pts[Math.min(i + 1, b.pts.length - 1)];
      return { x: a.x + (c.x - a.x) * k, y: a.y + (c.y - a.y) * k };
    };

    const max = small ? 8 : 14;
    for (let i = 0; i < max; i++) {
      pulses.push({
        branch: Math.floor(Math.random() * branches.length),
        t: -Math.random() * 0.8,
        speed: 0.0019 + Math.random() * 0.0034,
        hue: Math.random() < 0.6 ? 0 : 1,
      });
    }

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (now - last < frameGap) return;
      const step = Math.min(2.5, (now - last) / 16.7);
      last = now;

      const sy = window.scrollY;
      const v = Math.abs(sy - lastScroll);
      lastScroll = sy;
      const target = calm ? 0.4 : 1 + Math.min(v * 0.09, 5);
      boost += (target - boost) * 0.12;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(layer, 0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of pulses) {
        p.t += p.speed * boost * step;
        const b = branches[p.branch];
        if (!b) continue;
        if (p.t > 1.2) {
          p.t = -Math.random() * 0.4;
          p.branch = Math.floor(Math.random() * branches.length);
          p.hue = Math.random() < 0.6 ? 0 : 1;
          continue;
        }
        if (p.t < 0) continue;
        const color = COLORS[p.hue];
        const headPt = along(b, p.t);
        const f = fade(X(headPt), Y(headPt));
        if (f <= 0.01) continue;
        ctx.fillStyle = `rgb(${color})`;
        for (let s = 6; s >= 1; s--) {
          const tt = p.t - s * 0.016 * Math.min(boost, 2.4);
          if (tt < 0) continue;
          const pos = along(b, tt);
          ctx.globalAlpha = (1 - s / 7) * 0.5 * f;
          ctx.fillRect(X(pos) - 1, Y(pos) - 1, 2, 2);
        }
        const hx = X(headPt);
        const hy = Y(headPt);
        ctx.globalAlpha = 0.9 * f;
        ctx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
        ctx.globalAlpha = f;
        ctx.drawImage(glows[p.hue], hx - 22, hy - 22);
        ctx.globalAlpha = 1;
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        const k = (now - r.born) / 1100;
        if (k >= 1) {
          rings.splice(i, 1);
          continue;
        }
        const e = 1 - Math.pow(1 - k, 3);
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = (1 - k) * 0.5;
        ctx.strokeStyle = `rgb(${COLORS[0]})`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8 + e * 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgb(${COLORS[1]})`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8 + e * 93, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (pointer.active) {
        const r = 240;
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
        g.addColorStop(0, "rgba(224,172,92,0.09)");
        g.addColorStop(0.5, "rgba(63,183,159,0.035)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(pointer.x - r, pointer.y - r, r * 2, r * 2);
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const shouldRun = () => started && !document.hidden && overlayStore.get() === 0;
    const sync = () => {
      if (shouldRun() && !running) {
        running = true;
        last = 0;
        lastScroll = window.scrollY;
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun() && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onDown = (e: PointerEvent) => {
      if (calm || !running) return;
      rings.push({ x: e.clientX, y: e.clientY, born: performance.now() });
      if (rings.length > 5) rings.shift();
    };
    const onLeave = () => {
      pointer.active = false;
    };

    // o ResizeObserver já dispara uma vez sozinho — sem leitura forçada na montagem
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // o rio só acende quando a página já está pronta
    const begin = () => {
      started = true;
      canvas.style.opacity = "1";
      sync();
    };
    if (document.readyState === "complete") whenIdle(begin, 1200);
    else window.addEventListener("load", () => whenIdle(begin, 1200), { once: true });

    const unsub = overlayStore.subscribe(sync);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", sync);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsub();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="h-full w-full opacity-0 transition-opacity duration-[1600ms] ease-out"
    />
  );
}

export default function Backdrop() {
  const { scrollYProgress } = useScroll();
  const auroraY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const jadeY = useTransform(scrollYProgress, [0, 1], ["10%", "-50%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />

      {/* auroras: gradientes já são macios — sem filtro de desfoque (caro no celular) */}
      <m.div style={{ y: auroraY }} className="absolute inset-0 will-change-transform">
        <div
          className="animate-drift absolute -left-1/4 -top-1/4 h-[80vh] w-[100vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(224,172,92,0.13), transparent)" }}
        />
      </m.div>
      <m.div style={{ y: jadeY }} className="absolute inset-0 will-change-transform">
        <div
          className="animate-drift-slow absolute -right-1/3 top-1/3 h-[70vh] w-[100vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(63,183,159,0.1), transparent)" }}
        />
      </m.div>

      <div className="blueprint" />

      <div className="absolute inset-x-0 top-0 h-[100lvh]">
        <DeltaField />
      </div>

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 70% at 50% 40%, transparent 40%, rgba(2,5,10,0.75) 100%)" }}
      />
    </div>
  );
}
