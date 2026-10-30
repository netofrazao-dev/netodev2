import { useEffect } from "react";

/** Duração da animação do index.html (anel cheio, nome no lugar, "pronto"). */
const SHOW_MS = 2050;

declare global {
  interface Window {
    /** Marcado pelo script do <head>, antes da primeira pintura. */
    __spStart?: number;
  }
}

/**
 * Controla a abertura que já vem desenhada no index.html — ela aparece
 * antes de qualquer JavaScript, então a primeira pintura é imediata. Aqui
 * só decidimos quando a cortina abre: assim que a animação termina, no
 * primeiro toque ou numa tecla (Enter, Espaço, Esc).
 */
export default function Intro({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const el = document.getElementById("splash");
    if (!el) {
      onOpen();
      return;
    }
    let done = false;
    const open = () => {
      if (done) return;
      done = true;
      el.classList.add("open");
      onOpen();
      window.setTimeout(() => el.remove(), 1100);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") open();
    };
    const wait = Math.max(120, (window.__spStart ?? 0) + SHOW_MS - performance.now());
    const t = window.setTimeout(open, wait);
    el.addEventListener("pointerdown", open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      el.removeEventListener("pointerdown", open);
      window.removeEventListener("keydown", onKey);
    };
    // onOpen é estável no App; a abertura acontece uma vez só
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
