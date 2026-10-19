import { Fragment, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import { site, whatsappLink, type Project } from "../data/links";
import { EASE, haptic, useMedia } from "../lib/utils";
import { Cover } from "./Cover";
import { WhatsappIcon } from "./icons";

const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)", transition: { duration: 0.2 } },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

/**
 * Gaveta do projeto. A capa "voa" do cartão do carrossel até o topo da
 * gaveta (layoutId compartilhado) enquanto o painel cresce por baixo.
 * No celular fecha arrastando para baixo; no desktop vira modal central.
 */
export default function ProjectSheet({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const desktop = useMedia("(min-width: 640px)");
  const controls = useDragControls();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 80);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      lastFocus.current?.focus?.({ preventScroll: true });
    };
  }, [project, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) {
      haptic(8);
      onClose();
    }
  };

  const startDrag = (e: React.PointerEvent) => {
    if (!desktop) controls.start(e);
  };

  return createPortal(
    <AnimatePresence>
      {project && (
        <Fragment key={project.slug}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.05 } }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-abyss/75 backdrop-blur-[6px]"
          />

          <div className="pointer-events-none fixed inset-0 z-[81] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-title"
              drag={desktop ? false : "y"}
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.75 }}
              onDragEnd={onDragEnd}
              className="pointer-events-auto relative flex max-h-[92dvh] w-full max-w-[34rem] flex-col"
            >
              {/* o painel — cresce por baixo da capa */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 70 }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                className="absolute inset-0 rounded-t-[1.75rem] border border-line-hot bg-surface shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)] sm:rounded-[1.75rem]"
              />

              {/* a capa que voa do cartão */}
              <motion.div
                layoutId={`cover-${project.slug}`}
                onPointerDown={startDrag}
                transition={{ type: "spring", stiffness: 240, damping: 30 }}
                style={{ borderRadius: "28px 28px 0 0" }}
                className="relative z-10 aspect-[16/9] w-full shrink-0 touch-none overflow-hidden"
              >
                <Cover project={project} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
              </motion.div>

              {/* puxador */}
              <div
                onPointerDown={startDrag}
                className="absolute inset-x-0 top-0 z-20 flex h-8 touch-none justify-center pt-2.5 sm:hidden"
              >
                <motion.span
                  initial={{ opacity: 0, scaleX: 0.3 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                  className="h-1 w-10 rounded-full bg-white/40"
                />
              </div>

              <motion.button
                ref={closeBtn}
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                data-cursor="fechar"
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.25 }}
                className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-abyss/70 text-bone backdrop-blur-md"
              >
                <X size={16} />
              </motion.button>

              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
                  show: { transition: { delayChildren: 0.18, staggerChildren: 0.055 } },
                }}
                className="relative z-10 -mt-7 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-7"
              >
                <motion.p
                  variants={item}
                  className="flex flex-wrap items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-dim"
                >
                  <span className="text-brass">{project.type}</span>
                  <span>·</span>
                  <span>{project.year}</span>
                  <span>·</span>
                  <span>{project.client}</span>
                </motion.p>
                <motion.h3 id="sheet-title" variants={item} className="mt-3 text-[2.4rem] leading-none">
                  {project.name}
                </motion.h3>
                <motion.p variants={item} className="mt-2 font-display text-[1.1rem] italic text-brass">
                  {project.kicker}
                </motion.p>
                <motion.p variants={item} className="mt-4 text-[0.95rem] leading-relaxed text-mist">
                  {project.summary}
                </motion.p>

                <motion.div variants={item} className="mt-6 grid grid-cols-3 gap-2">
                  {project.results.map((r) => (
                    <div key={r.label} className="rounded-xl border border-line bg-abyss/50 p-3">
                      <p className="font-display text-[1.2rem] leading-none text-bone">{r.value}</p>
                      <p className="mt-1.5 text-[0.6875rem] leading-snug text-dim">{r.label}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.p variants={item} className="eyebrow-mist mt-7">
                  O que eu resolvi
                </motion.p>
                <ol className="mt-3 space-y-3">
                  {project.solution.map((s, i) => (
                    <motion.li key={s.title} variants={item} className="flex gap-3">
                      <span className="mt-0.5 font-mono text-[0.6875rem] text-brass">0{i + 1}</span>
                      <div>
                        <p className="text-[0.95rem] font-medium text-bone">{s.title}</p>
                        <p className="mt-0.5 text-[0.875rem] leading-relaxed text-mist">{s.body}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>

                <motion.ul variants={item} className="mt-6 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.06em] text-mist"
                    >
                      {t}
                    </li>
                  ))}
                </motion.ul>

                <motion.div variants={item} className="mt-7 flex flex-col gap-2.5">
                  <motion.a
                    href={whatsappLink(
                      `Oi, Neto! Vi o projeto ${project.name} no seu link e quero algo parecido para o meu negócio.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => haptic(10)}
                    data-cursor="conversar"
                    className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-brass px-5 py-3.5 font-medium text-abyss"
                  >
                    <span
                      aria-hidden
                      className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                    />
                    <WhatsappIcon size={18} />
                    Quero algo assim
                  </motion.a>
                  {(project.live || site.portfolio) && (
                    <div className="flex gap-2.5">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="abrir"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-hot px-4 py-3 text-sm text-bone transition-colors hover:border-jade hover:text-jade"
                        >
                          <ExternalLink size={15} /> Ver no ar
                        </a>
                      )}
                      {site.portfolio && (
                        <a
                          href={`${site.portfolio}/projetos/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="ler"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-hot px-4 py-3 text-sm text-bone transition-colors hover:border-brass hover:text-brass"
                        >
                          Estudo de caso <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body,
  );
}
