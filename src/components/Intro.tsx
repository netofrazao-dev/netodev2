import { useEffect } from "react";

/**
 * Controla a abertura que já vem desenhada no index.html — ela aparece
 * antes de qualquer JavaScript, então a primeira pintura é imediata. Aqui
 * só decidimos quando a cortina abre: assim que o monograma termina de se
 * desenhar (ou no primeiro toque).
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
      window.setTimeout(() => el.remove(), 1000);
    };
    const wait = Math.max(120, 980 - performance.now());
    const t = window.setTimeout(open, wait);
    el.addEventListener("pointerdown", open);
    return () => {
      window.clearTimeout(t);
      el.removeEventListener("pointerdown", open);
    };
    // onOpen é estável no App; a abertura acontece uma vez só
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
