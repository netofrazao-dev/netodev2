import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  m,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";
import { overlayStore } from "../lib/overlay";
import { EASE, haptic, useMedia } from "../lib/utils";

type Api = { startDrag: (e: React.PointerEvent) => void };

/**
 * Gaveta base. No celular sobe de baixo e fecha arrastando para baixo; no
 * desktop vira um modal no centro. Cuida de tudo que uma janela precisa:
 * trava a rolagem, prende o foco (Tab não escapa), Esc fecha, a página de
 * trás fica inerte para leitores de tela e o foco volta para onde estava.
 */
export default function Sheet({
  open,
  onClose,
  labelledBy,
  maxWidth = "34rem",
  actions,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  maxWidth?: string;
  actions?: ReactNode;
  children: (api: Api) => ReactNode;
}) {
  const desktop = useMedia("(min-width: 640px)");
  const controls = useDragControls();
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const lastFocus = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const root = document.getElementById("root");
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    root?.setAttribute("inert", "");
    overlayStore.add();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onCloseRef.current();
      if (e.key !== "Tab" || !dialog.current) return;
      // prende o Tab dentro da gaveta
      const f = [
        ...dialog.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 90);

    return () => {
      html.style.overflow = prevOverflow;
      root?.removeAttribute("inert");
      overlayStore.remove();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      lastFocus?.focus?.({ preventScroll: true });
    };
  }, [open]);

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
      {open && (
        <Fragment key="sheet">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.05 } }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-abyss/85"
          />

          <div className="pointer-events-none fixed inset-0 z-[81] flex items-end justify-center sm:items-center sm:p-6">
            <m.div
              ref={dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              drag={desktop ? false : "y"}
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.75 }}
              onDragEnd={onDragEnd}
              style={{ maxWidth }}
              className="pointer-events-auto relative flex max-h-[92dvh] w-full flex-col"
            >
              {/* o painel cresce por baixo do conteúdo (a capa pode voar por cima) */}
              <m.div
                aria-hidden
                initial={desktop ? { opacity: 0, scale: 0.96 } : { opacity: 0, y: 80 }}
                animate={desktop ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
                exit={desktop ? { opacity: 0, scale: 0.97 } : { opacity: 0, y: 80 }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                className="absolute inset-0 rounded-t-[1.75rem] border border-line-hot bg-surface shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)] sm:rounded-[1.75rem]"
              />

              {/* puxador */}
              <div
                onPointerDown={startDrag}
                className="absolute inset-x-0 top-0 z-20 flex h-9 touch-none justify-center pt-2.5 sm:hidden"
              >
                <m.span
                  initial={{ opacity: 0, scaleX: 0.3 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
                  className="h-1 w-10 rounded-full bg-white/40"
                />
              </div>

              <m.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 24, delay: 0.2 }}
                className="absolute right-3 top-3 z-20 flex gap-2"
              >
                {actions}
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  data-cursor="fechar"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-abyss/80 text-bone transition-transform duration-300 hover:rotate-90"
                >
                  <X size={16} />
                </button>
              </m.div>

              {children({ startDrag })}
            </m.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Botão redondo pequeno no topo da gaveta (ex.: compartilhar). */
export function SheetAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-cursor={label.toLowerCase()}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-abyss/80 text-bone transition-colors hover:text-brass"
    >
      {children}
    </button>
  );
}
