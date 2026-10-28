import { useEffect, useMemo, useState } from "react";
import {
  m,
} from "framer-motion";
import { Copy, Download, Share2 } from "lucide-react";
import { encode } from "uqr";
import { site } from "../data/links";
import { EASE, copyText, haptic } from "../lib/utils";
import Sheet from "./Sheet";
import { useToast } from "./Toast";

const W = 1080;
const H = 1260;

/** Retângulo arredondado (com reserva para navegador sem roundRect). */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Desenha o cartão do QR: nome, QR em tinta escura sobre fundo claro (lê
 * em qualquer câmera), olhos em latão, monograma no meio e o endereço.
 */
function drawPoster(canvas: HTMLCanvasElement, url: string) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = "#04080c";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(160, 80, 0, 160, 80, 760);
  glow.addColorStop(0, "rgba(224,172,92,0.22)");
  glow.addColorStop(1, "rgba(224,172,92,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const text = (t: string, x: number, y: number, font: string, color: string, spacing = "0px") => {
    ctx.font = font;
    ctx.fillStyle = color;
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = spacing;
    ctx.fillText(t, x, y);
  };
  ctx.textBaseline = "alphabetic";
  text("BREVES · MARAJÓ · PA", 96, 128, '500 26px "JetBrains Mono", monospace', "#e0ac5c", "7px");
  text("Neto", 96, 228, '400 96px "Fraunces", Georgia, serif', "#e9f0ef");
  const netoW = (ctx.measureText("Neto").width as number) + 26;
  text("Frazão", 96 + netoW, 228, 'italic 400 96px "Fraunces", Georgia, serif', "#e0ac5c");

  // cartão claro
  const card = { x: 140, y: 300, s: 800 };
  ctx.shadowColor = "rgba(224,172,92,0.35)";
  ctx.shadowBlur = 60;
  ctx.fillStyle = "#eef3f2";
  rr(ctx, card.x, card.y, card.s, card.s, 56);
  ctx.fill();
  ctx.shadowBlur = 0;

  const qr = encode(url, { ecc: "H", border: 0 });
  const pad = 70;
  const cell = (card.s - pad * 2) / qr.size;
  const ox = card.x + pad;
  const oy = card.y + pad;
  const center = qr.size / 2;
  const logoR = qr.size * 0.13; // área livre para o monograma

  ctx.fillStyle = "#04080c";
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (!qr.data[y][x]) continue;
      if (qr.types[y][x] === 2) continue; // olhos desenhados à parte
      if (Math.abs(x + 0.5 - center) < logoR && Math.abs(y + 0.5 - center) < logoR) continue;
      ctx.beginPath();
      ctx.arc(ox + (x + 0.5) * cell, oy + (y + 0.5) * cell, cell * 0.46, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // três olhos: anel escuro + miolo latão escuro (contraste suficiente para leitura)
  for (const [ex, ey] of [
    [0, 0],
    [qr.size - 7, 0],
    [0, qr.size - 7],
  ]) {
    const x = ox + ex * cell;
    const y = oy + ey * cell;
    ctx.fillStyle = "#04080c";
    rr(ctx, x, y, cell * 7, cell * 7, cell * 2);
    ctx.fill();
    ctx.fillStyle = "#eef3f2";
    rr(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 1.4);
    ctx.fill();
    ctx.fillStyle = "#7a5518";
    rr(ctx, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell);
    ctx.fill();
  }

  // monograma no centro
  const ls = logoR * 2 * cell;
  const lx = ox + center * cell - ls / 2;
  const ly = oy + center * cell - ls / 2;
  ctx.fillStyle = "#04080c";
  rr(ctx, lx, ly, ls, ls, ls * 0.24);
  ctx.fill();
  const k = ls / 64;
  ctx.save();
  ctx.translate(lx, ly);
  ctx.scale(k, k);
  ctx.strokeStyle = "#e0ac5c";
  ctx.lineWidth = 5;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(18, 46);
  ctx.lineTo(18, 18);
  ctx.lineTo(46, 46);
  ctx.lineTo(46, 18);
  ctx.stroke();
  ctx.fillStyle = "#3fb79f";
  ctx.beginPath();
  ctx.arc(46, 18, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "center";
  text("APONTE A CÂMERA DO CELULAR", W / 2, 1176, '500 24px "JetBrains Mono", monospace', "#7a8b8e", "6px");
  text(url.replace(/^https?:\/\//, ""), W / 2, 1226, '500 30px "JetBrains Mono", monospace', "#e0ac5c", "2px");
  ctx.textAlign = "left";
}

/** Gaveta do QR Code: mostrar no balcão, baixar ou mandar a imagem. */
export default function QrSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [png, setPng] = useState<string | null>(null);
  const url = site.url;

  useEffect(() => {
    if (!open || png) return;
    let alive = true;
    // espera as fontes da página para o cartão sair com a tipografia certa
    document.fonts.ready.then(() => {
      if (!alive) return;
      const c = document.createElement("canvas");
      drawPoster(c, url);
      setPng(c.toDataURL("image/png"));
    });
    return () => {
      alive = false;
    };
  }, [open, png, url]);

  const file = useMemo(() => {
    if (!png) return null;
    const bin = atob(png.split(",")[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], "neto-frazao-qr.png", { type: "image/png" });
  }, [png]);

  const share = async () => {
    haptic();
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: site.name, text: url });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: site.name, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    const ok = await copyText(url);
    toast({ message: ok ? "Link copiado" : "Não deu para copiar" });
  };

  const copy = async () => {
    haptic();
    const ok = await copyText(url);
    toast({ message: ok ? "Link copiado" : "Não deu para copiar" });
  };

  const btn =
    "flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-hot px-3 py-3 text-sm text-bone transition-colors hover:border-brass hover:text-brass";

  return (
    <Sheet open={open} onClose={onClose} labelledBy="qr-title" maxWidth="26rem">
      {() => (
        <m.div
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={{ show: { transition: { delayChildren: 0.12, staggerChildren: 0.06 } } }}
          className="relative z-10 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-12 sm:px-7 sm:pb-7"
        >
          {[
            <p key="e" className="eyebrow">
              QR Code
            </p>,
            <h3 key="t" id="qr-title" className="mt-2 text-[1.9rem] leading-none">
              Aponte a câmera e pronto
            </h3>,
            <p key="d" className="mt-2 text-[0.9rem] leading-relaxed text-mist">
              Mostre no balcão, imprima no cardápio ou mande a imagem para quem precisar.
            </p>,
          ].map((el) => (
            <m.div key={el.key} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
              {el}
            </m.div>
          ))}

          <m.div
            variants={{
              hidden: { opacity: 0, scale: 0.9, rotate: -3 },
              show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
            }}
            className="relative mx-auto mt-5 aspect-[1080/1260] w-full max-w-[19rem] overflow-hidden rounded-2xl border border-line-hot bg-abyss"
          >
            {png ? (
              <img src={png} alt={`QR Code que abre ${url}`} className="h-full w-full" />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
            )}
          </m.div>
          <p className="mt-2 text-center text-[0.75rem] text-dim">No celular, toque e segure na imagem para salvar.</p>

          <m.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
            className="mt-5 flex gap-2.5"
          >
            <a
              href={png ?? undefined}
              download="neto-frazao-qr.png"
              aria-disabled={!png}
              onClick={() => haptic()}
              data-cursor="baixar"
              className={`${btn} ${png ? "" : "pointer-events-none opacity-50"}`}
            >
              <Download size={15} /> Baixar
            </a>
            <button type="button" onClick={copy} data-cursor="copiar" className={btn}>
              <Copy size={15} /> Copiar link
            </button>
            <button
              type="button"
              onClick={share}
              data-cursor="enviar"
              aria-label="Compartilhar QR Code"
              className="flex w-12 shrink-0 items-center justify-center rounded-xl bg-brass text-abyss transition-transform active:scale-95"
            >
              <Share2 size={15} />
            </button>
          </m.div>
        </m.div>
      )}
    </Sheet>
  );
}
