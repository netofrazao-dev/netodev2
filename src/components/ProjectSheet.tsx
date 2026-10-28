import { useRef, useState } from "react";
import {
  AnimatePresence,
  m,
} from "framer-motion";
import { ArrowRight, ArrowUpRight, ExternalLink, Lock, Share2 } from "lucide-react";
import { site, whatsappLink, type Project } from "../data/links";
import { EASE, haptic, pageUrl, shareUrl } from "../lib/utils";
import { Cover } from "./Cover";
import { WhatsappIcon } from "./icons";
import Sheet, { SheetAction } from "./Sheet";
import { useToast } from "./Toast";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** O site do projeto num celular — dá para rolar com o dedo dentro da tela. */
function PhonePreview({ src, name }: { src: string; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  return (
    <m.figure variants={item} className="mt-7">
      <div className="relative mx-auto w-[15rem] rounded-[2.4rem] border border-line-hot bg-abyss p-2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        <div className="relative h-[27rem] overflow-hidden rounded-[1.95rem] bg-surface">
          <div aria-hidden className="absolute left-1/2 top-2 z-10 h-[1.15rem] w-[4.6rem] -translate-x-1/2 rounded-full bg-abyss" />
          <div
            onScroll={() => !scrolled && setScrolled(true)}
            className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            aria-label={`Prévia de ${name} no celular — role para ver mais`}
          >
            <img
              src={src}
              alt={`Site ${name} aberto no celular`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`block w-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
          </div>
          {!loaded && (
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
          )}
          <AnimatePresence>
            {loaded && !scrolled && (
              <m.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center bg-gradient-to-t from-abyss/90 to-transparent pb-4"
              >
                <span className="flex items-center gap-1.5 rounded-full bg-abyss/90 px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-bone">
                  <span className="animate-nudge-y inline-block">↓</span> role aqui dentro
                </span>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <figcaption className="mt-3 text-center font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-dim">
        Como abre no celular
      </figcaption>
    </m.figure>
  );
}

/**
 * Gaveta do projeto. A capa "voa" do cartão até o topo da gaveta quando o
 * projeto vem do carrossel; dá para compartilhar o link direto do projeto
 * e passar para o próximo sem fechar.
 */
export default function ProjectSheet({
  project,
  list,
  flight,
  onClose,
  onNavigate,
}: {
  project: Project | null;
  list: Project[];
  flight: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}) {
  const toast = useToast();
  const scroller = useRef<HTMLDivElement>(null);
  const lastRef = useRef<Project | null>(project);
  if (project) lastRef.current = project;
  const p = project ?? lastRef.current;
  if (!p) return null;

  const idx = list.findIndex((x) => x.slug === p.slug);
  const next = list.length > 1 ? list[(idx + 1) % list.length] : null;

  const share = async () => {
    haptic();
    const r = await shareUrl(`${pageUrl()}#projeto=${p.slug}`, `${p.name} · ${site.name}`, p.kicker);
    if (r === "copied") toast({ message: "Link do projeto copiado" });
  };

  const goNext = () => {
    if (!next) return;
    haptic(8);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
    onNavigate(next.slug);
  };

  return (
    <Sheet
      open={!!project}
      onClose={onClose}
      labelledBy="sheet-title"
      actions={
        !p.private && (
          <SheetAction label="Compartilhar" onClick={share}>
            <Share2 size={15} />
          </SheetAction>
        )
      }
    >
      {({ startDrag }) => (
        <>
          {/* a capa que voa do cartão */}
          <m.div
            layoutId={flight === p.slug ? `cover-${p.slug}` : undefined}
            onPointerDown={startDrag}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            style={{ borderRadius: "28px 28px 0 0" }}
            className="relative z-10 aspect-[16/9] w-full shrink-0 touch-none overflow-hidden"
          >
            <AnimatePresence initial={false}>
              <m.div
                key={p.slug}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0"
              >
                <Cover project={p} eager />
              </m.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
          </m.div>

          <m.div
            ref={scroller}
            exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
            className="relative z-10 -mt-7 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 [mask-image:linear-gradient(to_bottom,transparent,black_1.75rem)] sm:px-7 sm:pb-7"
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={p.slug}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                variants={{ show: { transition: { delayChildren: 0.12, staggerChildren: 0.05 } } }}
              >
                <m.p
                  variants={item}
                  className="flex flex-wrap items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-dim"
                >
                  <span className="text-brass">{p.type}</span>
                  <span aria-hidden>·</span>
                  <span>{p.client}</span>
                </m.p>
                <m.h3 id="sheet-title" variants={item} className="mt-3 text-[2.4rem] leading-none">
                  {p.name}
                </m.h3>
                <m.p variants={item} className="mt-2 font-display text-[1.1rem] italic text-brass">
                  {p.kicker}
                </m.p>
                <m.p variants={item} className="mt-4 text-[0.95rem] leading-relaxed text-mist">
                  {p.summary}
                </m.p>

                {p.mobile && !p.private && <PhonePreview src={p.mobile} name={p.name} />}

                <m.div variants={item} className="mt-7 grid grid-cols-3 gap-2">
                  {p.results.map((r) => (
                    <div key={r.label} className="rounded-xl border border-line bg-abyss/50 p-3">
                      <p className="font-display text-[1.2rem] leading-none text-bone">{r.value}</p>
                      <p className="mt-1.5 text-[0.6875rem] leading-snug text-dim">{r.label}</p>
                    </div>
                  ))}
                </m.div>

                <m.p variants={item} className="eyebrow-mist mt-7">
                  O que eu resolvi
                </m.p>
                <ol className="mt-3 space-y-3">
                  {p.solution.map((s, i) => (
                    <m.li key={s.title} variants={item} className="flex gap-3">
                      <span className="mt-0.5 font-mono text-[0.6875rem] text-brass">0{i + 1}</span>
                      <div>
                        <p className="text-[0.95rem] font-medium text-bone">{s.title}</p>
                        <p className="mt-0.5 text-[0.875rem] leading-relaxed text-mist">{s.body}</p>
                      </div>
                    </m.li>
                  ))}
                </ol>

                <m.ul variants={item} className="mt-6 flex flex-wrap gap-1.5" aria-label="Tecnologias usadas">
                  {p.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.06em] text-mist"
                    >
                      {t}
                    </li>
                  ))}
                </m.ul>

                <m.div variants={item} className="mt-7 flex flex-col gap-2.5">
                  <m.a
                    href={whatsappLink(
                      `Oi, Neto! Vi o projeto ${p.name} no seu link e quero algo parecido para o meu negócio.`,
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
                  </m.a>
                  {p.private && (
                    <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line-hot px-4 py-3 text-center text-[0.8125rem] text-mist">
                      <Lock size={14} className="shrink-0 text-brass" />
                      Sistema interno do cliente — sem acesso público.
                    </p>
                  )}
                  {!p.private && (p.live || site.portfolio) && (
                    <div className="flex gap-2.5">
                      {p.live && (
                        <a
                          href={p.live}
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
                          href={`${site.portfolio}/projetos/${p.slug}`}
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
                </m.div>

                {next && (
                  <m.button
                    variants={item}
                    type="button"
                    onClick={goNext}
                    data-cursor="próximo"
                    className="group mt-6 flex w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5 text-left transition-colors hover:border-brass/60"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-dim">
                        Próximo projeto
                      </span>
                      <span className="mt-0.5 block truncate font-display text-[1.2rem] text-bone">{next.name}</span>
                    </span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-brass transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </m.button>
                )}
              </m.div>
            </AnimatePresence>
          </m.div>
        </>
      )}
    </Sheet>
  );
}
