import { useEffect, useState, type PointerEvent } from "react";
import { site } from "../data/links";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.83, 0, 0.17, 1] as const;

/** Toque curto no celular (Android). No iPhone simplesmente não faz nada. */
export function haptic(ms: number | number[] = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sem vibração, sem problema */
  }
}

/** Roda quando o navegador estiver folgado (ou em até `timeout` ms). */
export function whenIdle(fn: () => void, timeout = 1500) {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout });
  else window.setTimeout(fn, 300);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // navegador interno do Instagram às vezes bloqueia a API nova
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Compartilha um endereço. Retorna "shared", "copied" ou "failed". */
export async function shareUrl(url: string, title: string, text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared" as const;
    } catch (e) {
      if ((e as Error).name === "AbortError") return "shared" as const;
    }
  }
  return (await copyText(url)) ? ("copied" as const) : ("failed" as const);
}

export const pageUrl = () =>
  typeof window === "undefined" ? site.url : window.location.origin + window.location.pathname;

export const shareSelf = () =>
  shareUrl(pageUrl(), `${site.name} · Sites e sistemas`, "Sites, lojas virtuais e sistemas sob medida no Marajó.");

export function useMedia(query: string) {
  const [match, setMatch] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/**
 * "?movimento" na URL liga todas as animações mesmo com "reduzir movimento"
 * ativo no sistema (Windows com "Efeitos de animação" desligado, por exemplo).
 * Serve para você ver a página completa no PC; visitantes não usam.
 */
export const FORCE_MOTION =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("movimento");

export function prefersReducedMotion() {
  return !FORCE_MOTION && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useReducedMotion = () => {
  const media = useMedia("(prefers-reduced-motion: reduce)");
  return !FORCE_MOTION && media;
};
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");

/* ------------------------------------------------------------------ */
/* relógio de Breves — um único timer para a página inteira            */
/* ------------------------------------------------------------------ */

function readClock() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: site.timeZone,
  }).formatToParts(new Date());
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  const hour = Number(h) % 24;
  return {
    time: `${h.padStart(2, "0")}:${m}`,
    online: hour >= site.hours.from && hour < site.hours.to,
  };
}

let clock = readClock();
const listeners = new Set<(c: typeof clock) => void>();
let timer = 0;

function schedule() {
  window.clearTimeout(timer);
  // acorda só na virada do minuto — nada de re-render a cada segundo
  const ms = 60_000 - (Date.now() % 60_000) + 50;
  timer = window.setTimeout(() => {
    clock = readClock();
    listeners.forEach((l) => l(clock));
    schedule();
  }, ms);
}

/** Hora de Breves e se estou no horário de resposta. */
export function useBrevesClock() {
  const [state, setState] = useState(clock);
  useEffect(() => {
    listeners.add(setState);
    if (listeners.size === 1) schedule();
    // a aba volta do segundo plano: confere a hora na hora
    const onVis = () => {
      if (document.hidden) return;
      clock = readClock();
      listeners.forEach((l) => l(clock));
    };
    document.addEventListener("visibilitychange", onVis);
    setState(readClock());
    return () => {
      listeners.delete(setState);
      if (!listeners.size) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return state;
}

/* ------------------------------------------------------------------ */

/** Liga a "lanterna" (.lantern) no ponto do ponteiro. Funciona com dedo também. */
export const lanternHandlers = {
  onPointerMove(e: PointerEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--lit", "1");
  },
  onPointerDown(e: PointerEvent<HTMLElement>) {
    lanternHandlers.onPointerMove(e);
  },
  onPointerLeave(e: PointerEvent<HTMLElement>) {
    e.currentTarget.style.setProperty("--lit", "0");
  },
  onPointerUp(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") {
      const el = e.currentTarget;
      window.setTimeout(() => el.style.setProperty("--lit", "0"), 380);
    }
  },
};

/** Rola até uma seção respeitando "reduzir movimento". */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}
