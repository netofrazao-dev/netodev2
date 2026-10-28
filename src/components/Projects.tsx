import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Plus } from "lucide-react";
import { projects, type Project } from "../data/links";
import { EASE_IN_OUT, haptic } from "../lib/utils";
import { Cover } from "./Cover";
import ProjectSheet from "./ProjectSheet";
import { SectionHead } from "./Section";

const GAP = 14;

/* ------------------------------------------------------------------ */

function Card({
  project,
  i,
  x,
  step,
  width,
  onOpen,
  onFocus,
}: {
  project: Project;
  i: number;
  x: MotionValue<number>;
  step: number;
  width: number;
  onOpen: () => void;
  onFocus: () => void;
}) {
  // distância deste cartão até o centro do carrossel (0 = ativo)
  const dist = useTransform(x, (v) => Math.min(Math.abs(v + i * step) / step, 1.5));
  const scale = useTransform(dist, [0, 1], [1, 0.9]);
  const opacity = useTransform(dist, [0, 1, 1.5], [1, 0.55, 0.35]);
  const rotateY = useTransform(x, (v) => {
    const d = (v + i * step) / step;
    return Math.max(-1, Math.min(1, d)) * 9;
  });
  const parallax = useTransform(x, (v) => (v + i * step) * -0.12);

  return (
    <motion.div
      style={{ width, scale, opacity, rotateY, transformPerspective: 1000 }}
      className="shrink-0"
    >
      <button
        type="button"
        onClick={onOpen}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && onFocus()}
        data-cursor="ver"
        aria-label={`Ver detalhes do projeto ${project.name}`}
        className="group block w-full select-none rounded-2xl text-left"
      >
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
          <motion.div
            layoutId={`cover-${project.slug}`}
            className="relative aspect-[16/10] overflow-hidden"
            style={{ borderRadius: "16px 16px 0 0" }}
          >
            <Cover project={project} parallax={parallax} />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
            <div
              className="absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: `linear-gradient(135deg, ${project.hues[0]}, transparent 60%)` }}
            />
          </motion.div>

          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-abyss/70 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-mist backdrop-blur-md">
            {project.type}
          </span>
          {/* no ar (pulsando) ou sistema privado do cliente */}
          {(project.private || project.live) && (
            <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-abyss/70 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-mist backdrop-blur-md">
              {project.private ? (
                <>
                  <Lock size={10} className="text-brass" /> Privado
                </>
              ) : (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-pulse-dot absolute inset-0 rounded-full bg-jade" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-jade" />
                  </span>
                  No ar
                </>
              )}
            </span>
          )}

          <div className="relative -mt-10 p-4 pt-0">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[1.45rem] text-bone">{project.name}</h3>
                <p className="mt-1 line-clamp-1 text-[0.8125rem] italic text-mist">{project.kicker}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-hot text-brass transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 group-hover:border-brass group-hover:bg-brass group-hover:text-abyss">
                <Plus size={16} />
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-dim">
              <span style={{ color: project.hues[0] }}>●</span>
              <span>{project.year}</span>
              <span>·</span>
              <span className="truncate">{project.client}</span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

function Counter({ value, total }: { value: number; total: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="flex items-center gap-1 font-mono text-[0.6875rem] tracking-[0.1em] text-dim tabular">
      <span className="relative inline-block h-[1.2em] w-[1.3em] overflow-hidden text-brass">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: EASE_IN_OUT }}
            className="absolute inset-0"
          >
            {pad(value + 1)}
          </motion.span>
        </AnimatePresence>
      </span>
      / {pad(total)}
    </span>
  );
}

export default function Projects() {
  const viewport = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(340);
  const x = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<Project | null>(null);
  const dragged = useRef(false);

  const width = Math.min(Math.round(vw * 0.84), 340);
  const step = width + GAP;
  const last = projects.length - 1;

  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVw(el.clientWidth));
    ro.observe(el);
    setVw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // ao redimensionar, mantém o cartão ativo no lugar
  useEffect(() => {
    x.set(-active * step);
  }, [step]);

  useMotionValueEvent(x, "change", (v) => {
    const i = Math.max(0, Math.min(last, Math.round(-v / step)));
    if (i !== active) {
      setActive(i);
      haptic(4);
    }
  });

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(last, i));
    animate(x, -target * step, { type: "spring", stiffness: 260, damping: 32, mass: 0.9 });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = x.get() + info.velocity.x * 0.18;
    goTo(Math.round(-projected / step));
    window.setTimeout(() => (dragged.current = false), 0);
  };

  const progress = useTransform(x, [0, -last * step], ["0%", "100%"]);

  return (
    <section aria-labelledby="projetos-title">
      <SectionHead
        id="projetos-title"
        n="02"
        title="Trabalhos recentes"
        aside={<Counter value={active} total={projects.length} />}
      />

      <div
        ref={viewport}
        className="relative -mx-4 overflow-hidden px-4 py-2 lg:mx-0 lg:px-0 lg:[mask-image:linear-gradient(to_right,black_82%,transparent)]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(active + 1);
          if (e.key === "ArrowLeft") goTo(active - 1);
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -last * step, right: 0 }}
          dragElastic={0.14}
          dragTransition={{ power: 0 }}
          onDragStart={() => (dragged.current = true)}
          onDragEnd={onDragEnd}
          style={{ x, gap: GAP }}
          data-cursor="arrastar"
          className="flex w-max cursor-grab touch-pan-y active:cursor-grabbing"
        >
          {projects.map((p, i) => (
            <Card
              key={p.slug}
              project={p}
              i={i}
              x={x}
              step={step}
              width={width}
              onFocus={() => goTo(i)}
              onOpen={() => {
                if (dragged.current) return;
                if (i !== active) return goTo(i);
                haptic(10);
                setOpen(p);
              }}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-px flex-1 overflow-hidden bg-line">
          <motion.div style={{ width: progress }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-brass to-jade" />
        </div>
        <div className="flex gap-2">
          {[
            { dir: -1, icon: <ArrowLeft size={15} />, label: "Projeto anterior" },
            { dir: 1, icon: <ArrowRight size={15} />, label: "Próximo projeto" },
          ].map((b) => {
            const disabled = b.dir < 0 ? active === 0 : active === last;
            return (
              <motion.button
                key={b.dir}
                type="button"
                aria-label={b.label}
                disabled={disabled}
                onClick={() => goTo(active + b.dir)}
                whileTap={{ scale: 0.86 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-mist transition-colors hover:border-brass/60 hover:text-brass disabled:opacity-30"
              >
                {b.icon}
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-dim lg:hidden">
        <span className="animate-nudge inline-block">→</span> arraste para o lado · toque para abrir
      </p>

      <ProjectSheet project={open} onClose={() => setOpen(null)} />
    </section>
  );
}
