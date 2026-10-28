import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* quantas gavetas estão abertas — o dock e o fundo animado escutam    */
/* ------------------------------------------------------------------ */

let openCount = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((s) => s());

export const overlayStore = {
  add() {
    openCount++;
    emit();
  },
  remove() {
    openCount = Math.max(0, openCount - 1);
    emit();
  },
  get: () => openCount,
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
};

export const useAnyOverlayOpen = () =>
  useSyncExternalStore(overlayStore.subscribe, () => overlayStore.get() > 0, () => false);

/* ------------------------------------------------------------------ */
/* gaveta presa ao endereço: #projeto=apham, #qr …                     */
/* ------------------------------------------------------------------ */

const STATE_KEY = "nfOverlay";

function readHash(prefix: string) {
  const h = window.location.hash;
  if (h === `#${prefix}`) return "";
  if (h.startsWith(`#${prefix}=`)) return decodeURIComponent(h.slice(prefix.length + 2));
  return null;
}

function hashFor(prefix: string, value: string) {
  return value ? `#${prefix}=${encodeURIComponent(value)}` : `#${prefix}`;
}

/**
 * Estado de uma gaveta guardado no endereço. Assim:
 * - o botão "voltar" do celular fecha a gaveta em vez de sair da página;
 * - dá para mandar o link direto de um projeto (…/#projeto=apham);
 * - recarregar a página reabre o que estava aberto.
 */
export function useHashOverlay(prefix: string) {
  const [value, setValue] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readHash(prefix),
  );

  useEffect(() => {
    const sync = () => setValue(readHash(prefix));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [prefix]);

  const open = useCallback(
    (v = "") => {
      const state = { [STATE_KEY]: prefix };
      if (readHash(prefix) === null) window.history.pushState(state, "", hashFor(prefix, v));
      else window.history.replaceState(state, "", hashFor(prefix, v));
      setValue(v);
    },
    [prefix],
  );

  /** Troca o conteúdo sem criar outra entrada no histórico. */
  const replace = useCallback(
    (v: string) => {
      window.history.replaceState(window.history.state, "", hashFor(prefix, v));
      setValue(v);
    },
    [prefix],
  );

  const close = useCallback(() => {
    if (readHash(prefix) === null) return setValue(null);
    // aberta por nós: volta uma entrada; aberta por link direto: só limpa o endereço
    if (window.history.state?.[STATE_KEY] === prefix) window.history.back();
    else {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      setValue(null);
    }
  }, [prefix]);

  return { value, open, close, replace };
}
