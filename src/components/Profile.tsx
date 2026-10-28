import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  m,
  stagger,
  useAnimate,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Share2 } from "lucide-react";
import { heroNouns, proof, site } from "../data/links";
import { useStage } from "../lib/stage";
import { EASE, EASE_IN_OUT, haptic, shareSelf, useBrevesClock, useReducedMotion } from "../lib/utils";
import Rolling from "./Rolling";
import Scramble from "./Scramble";
import { useToast } from "./Toast";

/* ------------------------------------------------------------------ */
/* barra de status: online/fora do horário + hora de Breves             */
/* ------------------------------------------------------------------ */

function StatusBar() {
  const ready = useStage();
  const { time, online } = useBrevesClock();
  const toast = useToast();

  const share = async () => {
    haptic();
    const r = await shareSelf();
    if (r === "copied") toast({ message: "Link copiado" });
  };

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-abyss/70 text-mist transition-colors hover:border-brass/50 hover:text-brass";

  return (
    <m.div
      initial={{ opacity: 0, y: -12 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
      className="flex items-center justify-between gap-3"
    >
      <div className="inline-flex min-w-0 items-center gap-2.5 rounded-full border border-line bg-abyss/70 py-1.5 pl-2.5 pr-3.5">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-pulse-dot absolute inset-0 rounded-full ${online ? "bg-jade" : "bg-brass"}`} />
          <span className={`relative h-2 w-2 rounded-full ${online ? "bg-jade" : "bg-brass"}`} />
        </span>
        <span className="truncate font-mono text-[0.625rem] uppercase tracking-[0.14em] text-mist">
          {online ? "Online" : "Fora do horário"}
          <span className="mx-1.5 text-dim">·</span>
          <span className="text-bone">
            <Rolling text={time} />
          </span>
          <span className="ml-1.5 text-dim">em Breves</span>
        </span>
      </div>

      <m.button
        type="button"
        onClick={share}
        whileTap={{ scale: 0.88, rotate: -8 }}
        data-cursor="enviar"
        aria-label="Compartilhar esta página"
        className={iconBtn}
      >
        <Share2 size={15} />
      </m.button>
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/* retrato com anel de latão e jade                                    */
/* ------------------------------------------------------------------ */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Avatar() {
  const ready = useStage();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [14, -14]), { stiffness: 200, damping: 18 });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 200, damping: 18 });
  const [scan, setScan] = useState(false);

  useEffect(() => {
    if (!ready || reduced) return;
    const id = window.setTimeout(() => setScan(true), 900);
    return () => window.clearTimeout(id);
  }, [ready, reduced]);

  // Android: o retrato acompanha a inclinação do celular. No iPhone isso
  // exigiria pedir permissão — preferimos não interromper ninguém.
  useEffect(() => {
    if (reduced) return;
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined;
    if (!D || typeof D.requestPermission === "function") return;
    let base: { b: number; g: number } | null = null;
    const on = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!base) base = { b: e.beta, g: e.gamma };
      px.set(clamp((e.gamma - base.g) / 36, -0.5, 0.5));
      py.set(clamp((e.beta - base.b) / 36, -0.5, 0.5));
    };
    window.addEventListener("deviceorientation", on);
    return () => window.removeEventListener("deviceorientation", on);
  }, [reduced, px, py]);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div style={{ perspective: 700 }} className="relative w-fit">
      <m.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        whileTap={{ scale: 0.95 }}
        onTap={() => haptic(6)}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="relative h-[7.25rem] w-[7.25rem]"
      >
        <m.div
          initial={{ scale: 0.4, opacity: 0, rotate: -120 }}
          animate={ready ? { scale: 1, opacity: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.2, ease: EASE, delay: 0.05 }}
          className="absolute -inset-[5px]"
        >
          <div
            className="animate-spin-slow absolute inset-0 rounded-full shadow-[0_0_28px_rgba(224,172,92,0.25)]"
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-brass) 0deg, transparent 70deg, var(--color-jade) 160deg, transparent 230deg, var(--color-brass-hot) 300deg, var(--color-brass) 360deg)",
            }}
          />
        </m.div>
        <m.svg
          viewBox="0 0 100 100"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="animate-spin-slower absolute -inset-[15px] h-[calc(100%+30px)] w-[calc(100%+30px)] text-line-hot"
          aria-hidden
        >
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 3.2" />
        </m.svg>

        <div className="absolute inset-0 rounded-full bg-ink" />
        <m.div
          initial={{ clipPath: "circle(0% at 50% 50%)", scale: 1.25 }}
          animate={ready ? { clipPath: "circle(50% at 50% 50%)", scale: 1 } : undefined}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          className="absolute inset-[3px] overflow-hidden rounded-full"
          style={{ transform: "translateZ(20px)" }}
        >
          <img
            src="/neto-240.webp"
            srcSet={site.photoSet}
            sizes="116px"
            alt={`Foto de ${site.name}`}
            width={240}
            height={240}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[50%_40%]"
          />
          {scan && (
            <div className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-jade/35 to-transparent mix-blend-screen" />
          )}
        </m.div>

        <m.span
          initial={{ scale: 0 }}
          animate={ready ? { scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 500, damping: 14, delay: 1.0 }}
          className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink"
          style={{ transform: "translateZ(40px)" }}
        >
          <span className="h-3 w-3 rounded-full bg-jade shadow-[0_0_12px_rgba(63,183,159,0.9)]" />
        </m.span>
      </m.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* nome letra a letra — e uma onda quando tocado                       */
/* ------------------------------------------------------------------ */

function Name() {
  const ready = useStage();
  const [scope, animateScope] = useAnimate();
  const words = site.name.split(" ");
  let idx = 0;

  const wave = () => {
    haptic(6);
    animateScope(
      "[data-letter]",
      { y: [0, -14, 0], rotate: [0, -6, 0], color: ["#e9f0ef", "#f5c880", "#e9f0ef"] },
      { duration: 0.6, delay: stagger(0.035), ease: "easeInOut" },
    );
  };

  return (
    <h1
      ref={scope}
      onClick={wave}
      onPointerEnter={(e) => e.pointerType === "mouse" && wave()}
      className="flex cursor-default flex-wrap gap-x-[0.28em] text-[clamp(3rem,15vw,4.4rem)] leading-[0.92]"
    >
      <span className="sr-only">{site.name}</span>
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-flex">
          {word.split("").map((ch) => {
            const i = idx++;
            return (
              <m.span
                key={i}
                className="inline-block"
                initial={{ y: "0.6em", opacity: 0, rotateX: -80 }}
                animate={ready ? { y: 0, opacity: 1, rotateX: 0 } : undefined}
                transition={{ duration: 0.85, ease: EASE, delay: 0.2 + i * 0.04 }}
                style={{ transformOrigin: "50% 100%", transformPerspective: 600 }}
              >
                <span data-letter className={`inline-block ${w === 1 ? "italic" : ""}`}>
                  {ch}
                </span>
              </m.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/* "Sites e sistemas para ___"                                         */
/* ------------------------------------------------------------------ */

function Rotator() {
  const ready = useStage();
  const [i, setI] = useState(0);

  // com "reduzir movimento" o framer tira o deslize e fica só a troca suave
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % heroNouns.length), 2400);
    return () => window.clearInterval(id);
  }, [ready]);

  return (
    <m.p
      initial={{ opacity: 0, y: 16 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
      className="font-display text-[1.6rem] leading-[1.15] tracking-[-0.02em] text-mist"
    >
      Sites e sistemas para
      <span className="relative block h-[1.25em] overflow-hidden" aria-live="off">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.em
            key={heroNouns[i]}
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-105%", opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_IN_OUT }}
            className="absolute left-0 top-0 inline-block whitespace-nowrap italic text-brass"
          >
            {heroNouns[i]}
            <m.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
              className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gradient-to-r from-brass via-brass-hot to-transparent"
            />
          </m.em>
        </AnimatePresence>
      </span>
    </m.p>
  );
}

/* ------------------------------------------------------------------ */
/* números                                                             */
/* ------------------------------------------------------------------ */

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ready = useStage();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!ready || !inView || !ref.current) return;
    const el = ref.current;
    const ctrl = animate(0, to, {
      duration: 1.6,
      delay: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => ctrl.stop();
  }, [ready, inView, to, suffix]);

  return (
    <span ref={ref} className="tabular">
      0{suffix}
    </span>
  );
}

function Proof() {
  const ready = useStage();
  return (
    <m.dl
      initial="hidden"
      animate={ready ? "show" : "hidden"}
      variants={{ show: { transition: { delayChildren: 1.1, staggerChildren: 0.1 } } }}
      className="grid grid-cols-3 border-y border-line/80"
    >
      {proof.map((p) => (
        <m.div
          key={p.label}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
          }}
          className="relative flex flex-col-reverse py-4 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-line/80 [&:not(:first-child)]:pl-4"
        >
          <dt className="mt-2 text-[0.75rem] leading-snug text-dim">{p.label}</dt>
          <dd className="font-display text-[1.9rem] leading-none text-bone">
            <CountUp to={p.num} suffix={p.suffix} />
          </dd>
        </m.div>
      ))}
    </m.dl>
  );
}

/** "AGORA: …" — o que estou construindo neste momento. */
function NowCard() {
  const ready = useStage();
  if (!site.now) return null;
  return (
    <m.div
      initial={{ opacity: 0, y: 14 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: EASE, delay: 1.15 }}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface/80 px-3.5 py-3"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-pulse-dot absolute inset-0 rounded-full bg-jade" />
        <span className="relative h-2 w-2 rounded-full bg-jade" />
      </span>
      <Scramble text="AGORA" delay={1.3} className="shrink-0 font-mono text-[0.625rem] font-medium tracking-[0.18em] text-jade" />
      <span aria-hidden className="h-3 w-px shrink-0 bg-line-hot" />
      <p className="min-w-0 flex-1 text-[0.85rem] leading-snug text-bone">{site.now}</p>
    </m.div>
  );
}

/* ------------------------------------------------------------------ */

/** Topo: status, retrato, nome e a frase que gira. */
export function ProfileTop() {
  const ready = useStage();
  return (
    <div className="flex flex-col gap-6">
      <StatusBar />

      <div className="flex items-end justify-between gap-4 pt-1">
        <Avatar />
        <m.div
          initial={{ opacity: 0, x: 12 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          className="pb-2 text-right"
        >
          <p className="eyebrow">Dev web</p>
          <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-dim">
            {site.city} · {site.region} · {site.state}
          </p>
          <p className="mt-1 font-mono text-[0.5625rem] tracking-[0.08em] text-dim">{site.coords}</p>
        </m.div>
      </div>

      <div className="space-y-3">
        <Name />
        <Rotator />
      </div>
    </div>
  );
}

/** Depois do botão: o que estou fazendo agora, quem sou eu e os números. */
export function ProfileMore() {
  const ready = useStage();
  return (
    <div className="flex flex-col gap-6">
      <NowCard />
      {/* só desliza (sem começar invisível): é o maior texto da primeira tela */}
      <m.p
        initial={{ y: 14 }}
        animate={ready ? { y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE, delay: 1.2 }}
        className="text-[0.975rem] leading-relaxed text-mist"
      >
        Sou o Neto. Construo do zero o site, a loja virtual ou o sistema que o seu negócio precisa
        para vender mais e trabalhar menos — <span className="text-bone">feito aqui em Breves</span>,
        sem template e sem enrolação.
      </m.p>

      <Proof />
    </div>
  );
}
