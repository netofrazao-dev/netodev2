import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Dices, Moon, Pipette, Play, Pointer, Share2, Sun, X } from "lucide-react";
import { whatsappLink } from "../data/links";
import { looks, segments, swatches, type StyleId } from "../data/extras";
import { EASE, haptic, pageUrl, prefersReducedMotion, shareUrl } from "../lib/utils";
import { WhatsappIcon } from "./icons";
import { SectionHead } from "./Section";
import { useToast } from "./Toast";
import MiniSite, { DESIGN_W, type Phase, type Screen } from "./sim/MiniSite";
import Reach from "./sim/Reach";
import { ICONS, domainOf, initialsOf, lookVars, money, parsePrice, type Cart, type Theme } from "./sim/shared";

type State = { name: string; seg: string; color: string; look: StyleId; theme: Theme };
const KEY = "nf:simulador:2";
const DEFAULT: State = { name: "", seg: "padaria", color: swatches[0].color, look: "moderno", theme: "claro" };
const HEX = /^[0-9a-f]{6}$/i;

const segColor = (id: string) => swatches.find((s) => s.id === segments.find((g) => g.id === id)?.swatch)?.color ?? DEFAULT.color;

/** Começa do link compartilhado (?nome=&tipo=&cor=&estilo=&tema=), da sessão ou do padrão. */
function initialState(): State {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.has("nome") || q.has("tipo")) {
      const seg = segments.find((s) => s.id === q.get("tipo"))?.id ?? DEFAULT.seg;
      const cor = q.get("cor") ?? "";
      const color = swatches.find((s) => s.id === cor)?.color ?? (HEX.test(cor) ? `#${cor.toLowerCase()}` : segColor(seg));
      const look = looks.find((l) => l.id === q.get("estilo"))?.id ?? DEFAULT.look;
      const theme: Theme = q.get("tema") === "escuro" ? "escuro" : "claro";
      return { name: (q.get("nome") ?? "").slice(0, 30), seg, color, look, theme };
    }
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as State | null;
    if (saved && segments.some((s) => s.id === saved.seg) && /^#[0-9a-f]{6}$/i.test(saved.color)) return { ...DEFAULT, ...saved };
  } catch {
    /* sem armazenamento — tudo bem */
  }
  return DEFAULT;
}

const SCREEN_W = 224; // largura útil da tela do celular (15rem − bordas)
const S = SCREEN_W / DESIGN_W; // o mini-site é desenhado em 360px e reduzido
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Faíscas: quando o nome aparece e quando o pedido é lido. */
function Sparkles({ burst, colors }: { burst: number; colors: string[] }) {
  if (!burst) return null;
  return (
    <div key={burst} aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const d = 0.75 + (i % 3) * 0.2;
        return (
          <m.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * 160 * d, y: Math.sin(a) * 220 * d, opacity: 0, scale: 0.3, rotate: 180 }}
            transition={{ duration: 1, ease: EASE }}
            className={`absolute left-1/2 top-1/2 h-2 w-2 ${i % 3 ? "rounded-full" : "rounded-[1px]"}`}
            style={{ backgroundColor: colors[i % colors.length] }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Simulator() {
  const toast = useToast();
  const [state, setState] = useState<State>(initialState);
  const [pulse, setPulse] = useState(0);
  const [burst, setBurst] = useState({ n: 0, colors: ["#e0ac5c", "#3fb79f"] });
  const named = useRef(state.name.trim().length >= 2);
  const seg = segments.find((s) => s.id === state.seg) ?? segments[0];
  const swatch = swatches.find((s) => s.color === state.color);
  const look = looks.find((l) => l.id === state.look) ?? looks[0];

  // o "app" dentro do celular
  const [screen, setScreen] = useState<Screen>("inicio");
  const [cart, setCart] = useState<Cart>({});
  const [slot, setSlot] = useState(0);
  const [phase, setPhase] = useState<Phase>(0);
  const [chat, setChat] = useState<{ order: string; reply: string } | null>(null);
  const [flash, setFlash] = useState<{ key: number; text: string } | null>(null);
  const [touched, setTouched] = useState(false);
  const [tested, setTested] = useState(false);
  const timers = useRef<number[]>([]);

  // dedo da demonstração
  const screenRef = useRef<HTMLDivElement>(null);
  const [finger, setFinger] = useState<{ x: number; y: number; tap: number } | null>(null);
  const demo = useRef(0);
  const [demoOn, setDemoOn] = useState(false);
  const typing = useRef(0);

  // inclina o celular com o mouse (desktop)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 160, damping: 18 });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 160, damping: 18 });

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ok */
    }
  }, [state]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const display = state.name.trim() || "Seu negócio";
  const initials = initialsOf(display);
  const domain = domainOf(state.name.trim());
  const colorLabel = swatch?.label.toLowerCase() ?? `personalizada (${state.color})`;

  /* ---------------- controles ---------------- */

  const stopDemo = () => {
    if (!demo.current) return;
    demo.current = 0;
    setDemoOn(false);
    setFinger(null);
  };

  const resetApp = () => {
    clearTimers();
    setScreen("inicio");
    setCart({});
    setSlot(0);
    setPhase(0);
    setChat(null);
    setFlash(null);
  };

  const update = (patch: Partial<State>, flashScreen = true) => {
    setState((s) => ({ ...s, ...patch }));
    if (flashScreen) setPulse((n) => n + 1);
  };

  const onName = (v: string) => {
    typing.current++;
    update({ name: v.slice(0, 30) }, false);
    if (!named.current && v.trim().length >= 2) {
      named.current = true;
      setBurst((b) => ({ n: b.n + 1, colors: ["#e0ac5c", "#3fb79f"] }));
      setPulse((n) => n + 1);
      haptic([8, 40, 8]);
    }
  };

  const pickSeg = (id: string) => {
    stopDemo();
    resetApp();
    update({ seg: id, color: segColor(id) });
  };

  /** Sorteia ramo, cor, estilo e tema e "digita" um nome de exemplo. */
  const surprise = () => {
    stopDemo();
    resetApp();
    haptic([6, 30, 6]);
    const others = segments.filter((s) => s.id !== seg.id);
    const next = others[Math.floor(Math.random() * others.length)];
    const color = Math.random() < 0.5 ? segColor(next.id) : swatches[Math.floor(Math.random() * swatches.length)].color;
    const nextLook = looks[Math.floor(Math.random() * looks.length)].id;
    const theme: Theme = Math.random() < 0.3 ? "escuro" : "claro";
    update({ seg: next.id, color, look: nextLook, theme, name: "" });
    named.current = true;
    const id = ++typing.current;
    if (prefersReducedMotion()) {
      update({ name: next.example }, false);
      return;
    }
    const type = async () => {
      await wait(250);
      for (let i = 1; i <= next.example.length; i++) {
        if (typing.current !== id) return;
        setState((s) => ({ ...s, name: next.example.slice(0, i) }));
        await wait(38);
      }
      setBurst((b) => ({ n: b.n + 1, colors: [color, "#ffffff"] }));
    };
    void type();
  };

  /* ---------------- o "app" ---------------- */

  const onAdd = (label: string) => {
    haptic(6);
    setCart((c) => ({ ...c, [label]: (c[label] ?? 0) + 1 }));
    setFlash({ key: Date.now(), text: `${label} adicionado` });
    clearTimers();
    later(() => setFlash(null), 1400);
  };

  const onRemove = (label: string) => {
    haptic(4);
    setCart((c) => {
      const n = (c[label] ?? 0) - 1;
      const next = { ...c };
      if (n > 0) next[label] = n;
      else delete next[label];
      return next;
    });
  };

  /** Mostra a conversa: a mensagem chega, o negócio responde e a resposta é lida. */
  const playChat = (order: string, reply: string) => {
    clearTimers();
    setFlash(null);
    setChat({ order, reply });
    setPhase(0);
    setScreen("zap");
    later(() => setPhase(1), 350);
    later(() => setPhase(2), 1700);
    later(() => {
      setPhase(3);
      setTested(true);
      haptic([10, 50, 10]);
      setBurst((b) => ({ n: b.n + 1, colors: [state.color, "#25D366", "#ffffff"] }));
    }, 2600);
  };

  const onSend = () => {
    const lines = seg.items.filter(([label]) => cart[label]);
    if (!lines.length) return;
    const total = lines.reduce((sum, [label, price]) => sum + parsePrice(price) * cart[label], 0);
    const chosen = seg.slot.options[slot] ?? seg.slot.options[0];
    const order = [
      seg.intro,
      ...lines.map(([label, price]) => `${cart[label]}x ${label} — ${money(parsePrice(price) * cart[label])}`),
      `Total: ${money(total)}`,
      `${seg.slot.label}: ${chosen}`,
    ].join("\n");
    haptic(10);
    playChat(order, seg.reply.replace("{slot}", chosen.toLowerCase()));
  };

  const onHello = () => playChat("Oi! Vi o site de vocês e queria tirar uma dúvida.", `Oi! Seja bem-vindo(a) à ${display} 😊 Como posso ajudar?`);

  /* ---------------- demonstração com o dedo ---------------- */

  const tap = async (selector: string, id: number) => {
    const root = screenRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-demo="${selector}"]`);
    if (!root || !el || demo.current !== id) return false;
    const a = root.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    setFinger((f) => ({ x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2, tap: f?.tap ?? 0 }));
    await wait(560);
    if (demo.current !== id) return false;
    setFinger((f) => (f ? { ...f, tap: f.tap + 1 } : f));
    await wait(140);
    el.click();
    await wait(420);
    return demo.current === id;
  };

  const runDemo = async () => {
    const id = Date.now();
    demo.current = id;
    setDemoOn(true);
    setTouched(true);
    typing.current++;
    resetApp();
    const phone = screenRef.current?.getBoundingClientRect();
    if (phone && (phone.top < 0 || phone.bottom > window.innerHeight)) {
      screenRef.current?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      await wait(600);
    }
    setFinger({ x: SCREEN_W / 2, y: 470, tap: 0 });
    await wait(450);
    const steps = ["add-0", "add-1", "add-0", "tab-bag", `slot-${Math.min(1, seg.slot.options.length - 1)}`, "send"];
    for (const s of steps) if (!(await tap(s, id))) return;
    setFinger(null);
    await wait(3200);
    if (demo.current === id) {
      demo.current = 0;
      setDemoOn(false);
    }
  };

  /* ---------------- mensagens ---------------- */

  const message = [
    `Oi, Neto! Montei no seu link uma prévia de site para ${state.name.trim() || "o meu negócio"}:`,
    "",
    `• Ramo: ${seg.label}`,
    `• Estilo: ${look.label.toLowerCase()}, tema ${state.theme}`,
    `• Cor: ${colorLabel}`,
    ...(state.name.trim() ? [`• Endereço que eu queria: ${domain}`] : []),
    ...(tested ? ["• Testei o pedido chegando no WhatsApp"] : []),
    "",
    "Quero um assim!",
  ].join("\n");

  const sharePreview = async () => {
    haptic();
    const q = new URLSearchParams({
      nome: state.name.trim(),
      tipo: seg.id,
      cor: swatch?.id ?? state.color.slice(1),
      estilo: state.look,
      tema: state.theme,
    });
    const r = await shareUrl(`${pageUrl()}?${q}#simular`, `Prévia do site — ${display}`, "Olha como ficaria o site:");
    if (r === "copied") toast({ message: "Link da prévia copiado" });
  };

  const SegIcon = ICONS[seg.icon];

  return (
    <section id="simular" aria-labelledby="simular-title" className="anchor">
      <SectionHead
        id="simular-title"
        n="03"
        title="Seu negócio, online"
        sub="Escreva o nome do seu negócio e brinque à vontade: o site dentro do celular funciona de verdade. Monte um pedido e veja ele chegando no WhatsApp."
      />

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-x-8">
        {/* o celular */}
        <div className="lg:sticky lg:top-8">
          <div
            className="relative mx-auto w-fit py-2"
            style={{ perspective: 1000 }}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const r = e.currentTarget.getBoundingClientRect();
              px.set((e.clientX - r.left) / r.width - 0.5);
              py.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onPointerLeave={() => {
              px.set(0);
              py.set(0);
            }}
          >
            <div className={demoOn || screen !== "inicio" ? "" : "animate-float"}>
              <m.div
                initial={{ opacity: 0, y: 40, rotateX: 18 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1, ease: EASE }}
                style={{ rotateX: rotX, rotateY: rotY, ["--glow" as string]: `${state.color}66` }}
                className="relative w-[15rem] rounded-[2.5rem] border border-line-hot bg-abyss p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_0_60px_-20px_var(--glow)]"
              >
                <div
                  ref={screenRef}
                  role="group"
                  aria-label={`Prévia interativa do site de ${display}`}
                  onPointerDown={(e) => {
                    if (!e.isTrusted) return;
                    stopDemo();
                    setTouched(true);
                  }}
                  className="relative h-[29rem] overflow-hidden rounded-[2rem]"
                  style={lookVars(state.look, state.theme, state.color)}
                >
                  <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${S})` }}>
                    <MiniSite
                      display={display}
                      initials={initials}
                      domain={domain}
                      seg={seg}
                      look={state.look}
                      screen={screen}
                      cart={cart}
                      slot={slot}
                      phase={phase}
                      chat={chat}
                      flash={flash}
                      onScreen={(s) => {
                        haptic(4);
                        setScreen(s);
                      }}
                      onAdd={onAdd}
                      onRemove={onRemove}
                      onSlot={(i) => {
                        haptic(4);
                        setSlot(i);
                      }}
                      onSend={onSend}
                      onHello={onHello}
                      onBack={resetApp}
                    />
                  </div>
                  <div aria-hidden className="absolute left-1/2 top-[7px] z-10 h-[1.05rem] w-[4.3rem] -translate-x-1/2 rounded-full bg-abyss" />
                  {pulse > 0 && (
                    <div
                      key={pulse}
                      aria-hidden
                      className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-white/45 to-transparent"
                    />
                  )}

                  {/* dedo da demonstração */}
                  <AnimatePresence>
                    {finger && (
                      <m.span
                        aria-hidden
                        initial={{ opacity: 0, scale: 1.6, x: finger.x - 16, y: finger.y - 16 }}
                        animate={{ opacity: 1, scale: 1, x: finger.x - 16, y: finger.y - 16 }}
                        exit={{ opacity: 0, scale: 1.4 }}
                        transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
                        className="pointer-events-none absolute left-0 top-0 z-30 h-8 w-8"
                      >
                        <m.span
                          key={finger.tap}
                          initial={{ scale: finger.tap ? 0.7 : 1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute inset-0 rounded-full border-2 border-white bg-white/45 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
                        />
                        {finger.tap > 0 && (
                          <m.span
                            key={`r${finger.tap}`}
                            initial={{ scale: 0.6, opacity: 0.9 }}
                            animate={{ scale: 2.4, opacity: 0 }}
                            transition={{ duration: 0.6, ease: EASE }}
                            className="absolute inset-0 rounded-full border-2 border-white"
                          />
                        )}
                      </m.span>
                    )}
                  </AnimatePresence>
                </div>
              </m.div>
            </div>
            <Sparkles burst={burst.n} colors={burst.colors} />

            {/* dica: o site funciona */}
            <AnimatePresence>
              {!touched && (
                <m.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 1.2, duration: 0.4, ease: EASE }}
                  className="pointer-events-none absolute -bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-brass/50 bg-raised px-3 py-1.5 text-[0.72rem] font-medium text-brass shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)]"
                >
                  <Pointer size={13} className="animate-nudge-y" /> Toque no site: ele funciona
                </m.span>
              )}
            </AnimatePresence>
          </div>

          <div className="mx-auto mt-5 flex max-w-[22rem] gap-2 lg:flex-col">
            <m.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => (demoOn ? (stopDemo(), resetApp()) : void runDemo())}
              className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-jade/50 bg-jade-wash px-3 py-3 text-[0.82rem] font-medium text-jade"
            >
              {demoOn ? <X size={15} /> : <Play size={15} fill="currentColor" />}
              {demoOn ? "Parar" : "Ver um pedido chegando"}
            </m.button>
            <m.button
              type="button"
              whileTap={{ scale: 0.92, rotate: -20 }}
              onClick={surprise}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line-hot px-3.5 py-3 text-[0.82rem] font-medium text-bone transition-colors hover:border-brass hover:text-brass"
            >
              <Dices size={16} /> Surpreenda-me
            </m.button>
          </div>
        </div>

        {/* controles */}
        <div className="mt-8 lg:mt-1">
          <label htmlFor="sim-nome" className="eyebrow-mist">
            Nome do seu negócio
          </label>
          <div className="relative mt-2">
            <input
              id="sim-nome"
              value={state.name}
              onChange={(e) => onName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              maxLength={30}
              placeholder={`Ex.: ${seg.example}`}
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="done"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 pr-11 text-[1rem] text-bone outline-none transition-colors focus:border-brass"
            />
            <AnimatePresence>
              {state.name && (
                <m.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  onClick={() => {
                    typing.current++;
                    update({ name: "" }, false);
                  }}
                  aria-label="Apagar nome"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dim hover:text-bone"
                >
                  <X size={16} />
                </m.button>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[0.75rem] text-dim">
            Seu endereço pode ser
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={domain}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                className="truncate font-mono text-[0.72rem] text-jade"
              >
                {domain}
              </m.span>
            </AnimatePresence>
          </p>

          <p className="eyebrow-mist mt-6" id="sim-ramo">
            Ramo
          </p>
          <div className="rail -mx-4 mt-2 px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-labelledby="sim-ramo">
            {segments.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === seg.id}
                  onClick={() => {
                    if (s.id === seg.id) return;
                    haptic(6);
                    pickSeg(s.id);
                  }}
                  className="chip shrink-0"
                >
                  <Icon size={14} /> {s.label}
                </button>
              );
            })}
          </div>

          <p className="eyebrow-mist mt-6" id="sim-cor">
            Cor da marca
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-3" role="group" aria-labelledby="sim-cor">
            {swatches.map((sw) => {
              const on = sw.color === state.color;
              return (
                <button
                  key={sw.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={sw.label}
                  onClick={() => {
                    if (on) return;
                    haptic(6);
                    update({ color: sw.color });
                  }}
                  className="relative h-9 w-9 rounded-full transition-transform active:scale-90"
                  style={{ backgroundColor: sw.color }}
                >
                  {on && (
                    <m.span
                      layoutId="swatch-ring"
                      className="absolute -inset-[5px] rounded-full border-2 border-bone"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
            {/* cor livre */}
            <label
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-transform active:scale-90"
              style={{
                background: swatch
                  ? "conic-gradient(from 0deg, #f43f5e, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #f43f5e)"
                  : state.color,
              }}
            >
              <span className="sr-only">Escolher outra cor</span>
              <Pipette size={15} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              <input
                type="color"
                value={state.color}
                onChange={(e) => update({ color: e.target.value }, false)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              {!swatch && (
                <m.span
                  layoutId="swatch-ring"
                  className="absolute -inset-[5px] rounded-full border-2 border-bone"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
            </label>
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div>
              <p className="eyebrow-mist" id="sim-estilo">
                Estilo
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="sim-estilo">
                {looks.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={l.id === state.look}
                    onClick={() => {
                      if (l.id === state.look) return;
                      haptic(6);
                      update({ look: l.id });
                    }}
                    className={`chip ${l.id === "classico" ? "font-display italic" : l.id === "ousado" ? "font-black uppercase tracking-[0.04em]" : ""}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow-mist" id="sim-tema">
                Tema
              </p>
              <div className="relative mt-2 flex rounded-full border border-line bg-surface p-1" role="group" aria-labelledby="sim-tema">
                {(
                  [
                    { id: "claro", icon: Sun, label: "Claro" },
                    { id: "escuro", icon: Moon, label: "Escuro" },
                  ] as const
                ).map((t) => {
                  const on = state.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      aria-label={`Tema ${t.label.toLowerCase()}`}
                      onClick={() => {
                        if (on) return;
                        haptic(6);
                        update({ theme: t.id });
                      }}
                      className={`relative flex h-8 w-10 items-center justify-center rounded-full transition-colors ${on ? "text-abyss" : "text-mist"}`}
                    >
                      {on && (
                        <m.span
                          layoutId="theme-pill"
                          className="absolute inset-0 rounded-full bg-brass"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <t.icon size={15} className="relative" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* resumo do que foi montado */}
          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
            <span
              className="sim-h flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[0.85rem]"
              style={{ ...lookVars(state.look, state.theme, state.color), backgroundColor: state.color, color: "var(--on-a)" }}
            >
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.95rem] font-medium text-bone">{display}</span>
              <span className="mt-0.5 flex items-center gap-1.5 truncate text-[0.72rem] text-dim">
                <SegIcon size={12} className="shrink-0" /> {seg.label} · {look.label} · tema {state.theme}
              </span>
            </span>
            <AnimatePresence>
              {tested && (
                <m.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="shrink-0 rounded-full bg-jade-wash px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-jade"
                >
                  pedido testado
                </m.span>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3 flex gap-2.5">
            <m.a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.97 }}
              onClick={() => haptic(10)}
              data-cursor="quero"
              className="relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-brass px-5 py-3.5 font-medium text-abyss"
            >
              <span
                aria-hidden
                className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
              <WhatsappIcon size={18} /> Quero esse site
            </m.a>
            <m.button
              type="button"
              onClick={sharePreview}
              whileTap={{ scale: 0.92 }}
              aria-label="Compartilhar esta prévia"
              data-cursor="enviar"
              className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-line-hot text-bone transition-colors hover:border-brass hover:text-brass"
            >
              <Share2 size={17} />
            </m.button>
          </div>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-dim">
            É só uma prévia: o seu site de verdade é desenhado do zero para o seu negócio, com as suas fotos e os seus produtos.
          </p>
        </div>

        <Reach display={display} initials={initials} domain={domain} seg={seg} look={state.look} theme={state.theme} color={state.color} />
      </div>
    </section>
  );
}
