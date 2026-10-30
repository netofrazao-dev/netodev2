import type { CSSProperties } from "react";
import {
  BedDouble,
  Croissant,
  Grape,
  Pill,
  Scissors,
  Shirt,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";
import type { StyleId } from "../../data/extras";

export const ICONS = {
  padaria: Croissant,
  acai: Grape,
  roupas: Shirt,
  barbearia: Scissors,
  restaurante: UtensilsCrossed,
  mercadinho: ShoppingBasket,
  farmacia: Pill,
  pousada: BedDouble,
} as const;

export type Theme = "claro" | "escuro";
export type Cart = Record<string, number>;

/** "R$ 16,90" → 16.9 */
export const parsePrice = (p: string) => Number(p.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

export const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Texto escuro em cor clara, branco em cor escura. */
export function onAccent(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum > 0.66 ? "#14181b" : "#ffffff";
}

export function initialsOf(display: string) {
  return (
    display
      .split(/\s+/)
      .filter((w) => w.length > 2 || /^[A-ZÀ-Ú]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "SN"
  );
}

/** "Padaria Pão Dourado" → "padariapaodourado.com.br" */
export function domainOf(name: string) {
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 26);
  return `${slug || "seunegocio"}.com.br`;
}

/** Todas as cores e formas do mini-site saem daqui — o estilo e o tema só trocam variáveis. */
export function lookVars(look: StyleId, theme: Theme, color: string): CSSProperties {
  const dark = theme === "escuro";
  const paper = look === "classico";
  return {
    "--a": color,
    "--on-a": onAccent(color),
    "--bg": dark ? (paper ? "#16130e" : "#0f1214") : paper ? "#f3ede1" : "#f6f4ef",
    "--card": dark ? (paper ? "#221e17" : "#1a1f23") : "#ffffff",
    "--fg": dark ? "#eef1f2" : "#14181b",
    "--muted": dark ? "rgba(238,241,242,.62)" : "rgba(20,24,27,.58)",
    "--soft": dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)",
    "--line": dark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.07)",
    "--shadow": dark ? "0 1px 0 rgba(255,255,255,.04)" : "0 1px 0 rgba(0,0,0,.04), 0 8px 20px -14px rgba(0,0,0,.35)",
    "--r": look === "moderno" ? "22px" : paper ? "10px" : "3px",
    "--rs": look === "moderno" ? "14px" : paper ? "7px" : "2px",
    "--pill": look === "moderno" ? "999px" : paper ? "8px" : "3px",
    "--hf": paper ? "var(--font-display)" : "var(--font-sans)",
    "--hw": look === "ousado" ? "900" : paper ? "600" : "700",
    "--ht": look === "ousado" ? "uppercase" : "none",
    "--hs": look === "ousado" ? "-0.035em" : "-0.02em",
  } as CSSProperties;
}
