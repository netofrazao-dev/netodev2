import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  m,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Plus } from "lucide-react";
import { categories, projects, type Category, type Project } from "../data/links";
import { useHashOverlay } from "../lib/overlay";
import { EASE, EASE_IN_OUT, haptic } from "../lib/utils";
import { Cover } from "./Cover";
import { SectionHead } from "./Section";

const ProjectSheet = lazy(() => import("./ProjectSheet"));
export const preloadProjectSheet = () => import("./ProjectSheet");

const GAP = 14;

function Badge({ project }: { project: Project }) {
  if (!project.private && !project.live) return null;
  return (
    <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-abyss/80 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-mist">
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
  );
}

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
  // só a imagem escurece nos cartões de fora — o texto continua legível
  const dim = useTransform(dist, [0, 1], [0, 0.6]);
  const rotateY = useTransform(x, (v) => Math.max(-1, Math.min(1, (v + i * step) / step)) * 9);
  const parallax = useTransform(x, (v) => (v + i * step) * -0.12);

  return (
    <m.div
      variants={{
        hidden: { opacity: 0, x: 60 },
        show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
      }}
      className="shrink-0"
    >
      <m.div style={{ width, scale, rotateY, transformPerspective: 1000 }}>
        <button
          type="button"
          onClick={onOpen}
          onFocus={(e) => e.currentTarget.matches(":focus-visible") && onFocus()}
          data-cursor="ver"
          className="group block w-full select-none rounded-2xl text-left"
        >
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
            <m.div
              layoutId={`cover-${project.slug}`}
              className="relative aspect-[16/10] overflow-hidden"
              style={{ borderRadius: "16px 16px 0 0" }}
            >
              <Cover project={project} parallax={parallax} sizes="(max-width: 1023px) 80vw, 340px" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
              <div
                className="absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100"
                style={{ background: `linear-gradient(135deg, ${project.hues[0]}, transparent 60%)` }}
              />
              <m.div aria-hidden style={{ opacity: dim }} className="absolute inset-0 bg-ink" />
            </m.div>

            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-abyss/80 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-mist">
              {project.type}
            </span>
            <Badge project={project} />

            <div className="relative -mt-10 p-4 pt-0">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[1.45rem] text-bone">{project.name}</h3>
                  <p className="mt-1 line-clamp-1 text-[0.8125rem] italic text-mist">{project.kicker}</p>
                </div>
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-hot text-brass transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 group-hover:border-brass group-hover:bg-brass group-hover:text-abyss"
                >
                  <Plus size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-dim">
                <span aria-hidden style={{ color: project.hues[0] }}>
                  ●
                </span>
                <span className="truncate">{project.client}</span>
              </div>
            </div>
          </div>
          <span className="sr-only">— ver detalhes</span>
        </button>
      </m.div>
    </m.div>
  );
}

function Counter({ value, total }: { value: number; total: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="flex items-center gap-1 font-mono text-[0.6875rem] tracking-[0.1em] text-dim tabular">
      <span className="sr-only">
        Projeto {value + 1} de {total}
      </span>
      <span aria-hidden className="relative inline-block h-[1.2em] w-[1.3em] overflow-hidden text-brass">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={value}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: EASE_IN_OUT }}
            className="absolute inset-0"
          >
            {pad(value + 1)}
          </m.span>
        </AnimatePresence>
      </span>
      <span aria-hidden>/ {pad(total)}</span>
    </span>
  );
}

export default function Projects() {
  const viewport = useRef<HTMLDivElement>(null);
  // palpite inicial sem ler o layout; o ResizeObserver corrige depois da 1ª pintura
  const [vw, setVw] = useState(() =>
    typeof window === "undefined" ? 340 : window.innerWidth >= 1024 ? 592 : Math.min(window.innerWidth, 480) - 32,
  );
  const [filter, setFilter] = useState<Category | "todos">("todos");
  const x = useMotionValue(0);
  const [active, setActive] = useState(0);
  const dragged = useRef(false);
  const sheet = useHashOverlay("projeto");
  // a capa só "voa" do cartão para o projeto aberto pelo carrossel
  const [flight, setFlight] = useState<string | null>(null);

  const list = useMemo(
    () => (filter === "todos" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );
  const openProject = sheet.value ? projects.find((p) => p.slug === sheet.value) ?? null : null;

  const width = Math.min(Math.round(vw * 0.84), 340);
  const step = width + GAP;
  const last = list.length - 1;

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setVw(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ao redimensionar, mantém o cartão ativo no lugar
  useEffect(() => {
    x.set(-Math.min(active, last) * step);
    // só quando a medida muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useMotionValueEvent(x, "change", (v) => {
    const i = Math.max(0, Math.min(last, Math.round(-v / step)));
    if (i !== active) {
      setActive(i);
      haptic(4);
    }
  });

  const goTo = (i: number, instant = false) => {
    const target = Math.max(0, Math.min(last, i));
    if (instant) x.set(-target * step);
    else animate(x, -target * step, { type: "spring", stiffness: 260, damping: 32, mass: 0.9 });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = x.get() + info.velocity.x * 0.18;
    goTo(Math.round(-projected / step));
    window.setTimeout(() => (dragged.current = false), 0);
  };

  const changeFilter = (f: Category | "todos") => {
    if (f === filter) return;
    haptic(6);
    setFilter(f);
    setActive(0);
    x.set(0);
  };

  const progress = useTransform(x, [0, -Math.max(1, last) * step], ["0%", "100%"]);

  return (
    <section id="projetos" aria-labelledby="projetos-title" className="anchor">
      <SectionHead
        id="projetos-title"
        n="02"
        title="Trabalhos recentes"
        aside={<Counter value={active} total={list.length} />}
      />

      {/* filtros */}
      <div className="rail -mx-4 mb-4 px-4 pb-1 lg:mx-0 lg:px-0" aria-label="Filtrar projetos">
        {categories.map((c) => {
          const count = c.id === "todos" ? projects.length : projects.filter((p) => p.category === c.id).length;
          if (!count) return null;
          const on = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => changeFilter(c.id)}
              className={`relative shrink-0 rounded-full border px-3.5 py-2 text-[0.8125rem] transition-colors duration-300 ${on ? "border-brass text-abyss" : "border-line text-mist hover:text-bone"}`}
            >
              {on && (
                <m.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-brass"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative">
                {c.label} <span className="tabular opacity-60">{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={viewport}
        className="relative -mx-4 overflow-hidden px-4 py-2 lg:mx-0 lg:px-0 lg:[mask-image:linear-gradient(to_right,black_82%,transparent)]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(active + 1);
          if (e.key === "ArrowLeft") goTo(active - 1);
        }}
      >
        <m.div
          key={filter}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          drag={list.length > 1 ? "x" : false}
          dragConstraints={{ left: -last * step, right: 0 }}
          dragElastic={0.14}
          dragTransition={{ power: 0 }}
          onDragStart={() => (dragged.current = true)}
          onDragEnd={onDragEnd}
          style={{ x, gap: GAP }}
          data-cursor="arrastar"
          className="flex w-max cursor-grab touch-pan-y active:cursor-grabbing"
        >
          {list.map((p, i) => (
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
                setFlight(p.slug);
                sheet.open(p.slug);
              }}
            />
          ))}
        </m.div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-px flex-1 overflow-hidden bg-line">
          <m.div style={{ width: progress }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-brass to-jade" />
        </div>
        <div className="flex gap-2">
          {[
            { dir: -1, icon: <ArrowLeft size={15} />, label: "Projeto anterior" },
            { dir: 1, icon: <ArrowRight size={15} />, label: "Próximo projeto" },
          ].map((b) => {
            const disabled = b.dir < 0 ? active === 0 : active >= last;
            return (
              <m.button
                key={b.dir}
                type="button"
                aria-label={b.label}
                disabled={disabled}
                onClick={() => goTo(active + b.dir)}
                whileTap={{ scale: 0.86 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mist transition-colors hover:border-brass/60 hover:text-brass disabled:opacity-30"
              >
                {b.icon}
              </m.button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-dim lg:hidden">
        <span aria-hidden className="animate-nudge inline-block">
          →
        </span>
        arraste para o lado · toque para abrir
      </p>

      <Suspense fallback={null}>
        {(openProject || flight) && (
          <ProjectSheet
            project={openProject}
            list={list.some((p) => p.slug === openProject?.slug) ? list : projects}
            flight={flight}
            onClose={() => {
              haptic(6);
              sheet.close();
            }}
            onNavigate={(slug) => {
              setFlight(null);
              sheet.replace(slug);
              const i = list.findIndex((p) => p.slug === slug);
              if (i >= 0) goTo(i, true);
            }}
          />
        )}
      </Suspense>
    </section>
  );
}
