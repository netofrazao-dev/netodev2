import { lazy, startTransition, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  MotionConfig,
} from "framer-motion";
import Backdrop from "./components/Backdrop";
import { Dock, ScrollProgress } from "./components/Chrome";
import Cta from "./components/Cta";
import Cursor from "./components/Cursor";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import LinkList from "./components/LinkList";
import Marquee from "./components/Marquee";
import { ProfileMore, ProfileTop } from "./components/Profile";
import Projects, { preloadProjectSheet } from "./components/Projects";
import { ToastProvider, useToast } from "./components/Toast";
import { useHashOverlay } from "./lib/overlay";
import { StageContext } from "./lib/stage";
import { FORCE_MOTION, scrollToId, whenIdle } from "./lib/utils";

const loadBelow = () => import("./components/Below");
const Below = lazy(loadBelow);
const loadQr = () => import("./components/QrSheet");
const QrSheet = lazy(loadQr);

const loadFeatures = () => import("./lib/motion-features").then((r) => r.default);

const INTRO_KEY = "nf:intro";
const SECTIONS = ["links", "projetos", "simular", "orcamento", "processo", "duvidas", "contato"];

/** Reserva o espaço das seções que chegam depois — nada pula na tela. */
function BelowFallback() {
  return (
    <div aria-hidden className="flex flex-col gap-16">
      {[880, 980, 560, 640].map((h, i) => (
        <div key={i} style={{ height: h }} className="relative overflow-hidden rounded-2xl border border-line/60">
          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      ))}
    </div>
  );
}

/** Avisos do sistema: sem internet / voltou. */
function NetworkWatch() {
  const toast = useToast();
  useEffect(() => {
    const off = () => toast({ message: "Sem internet — o WhatsApp abre quando a conexão voltar" });
    const on = () => toast({ message: "Conexão de volta" });
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
    };
  }, [toast]);
  return null;
}

export default function App() {
  const [seen] = useState(() => document.documentElement.classList.contains("no-splash"));
  const [stage, setStage] = useState(seen);
  const [dock, setDock] = useState(false);
  // o que fica abaixo da dobra entra logo depois da 1ª pintura, em modo
  // concorrente: o React pausa para o navegador respirar (sem tarefa longa)
  const [rest, setRest] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const qr = useHashOverlay("qr");
  const [qrLoaded, setQrLoaded] = useState(qr.value !== null);

  useEffect(() => {
    startTransition(() => setRest(true));
  }, []);

  // abertura já vista: tira a cortina do HTML de vez
  useEffect(() => {
    if (seen) document.getElementById("splash")?.remove();
  }, [seen]);

  // dock aparece quando o botão principal sai por cima da tela
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // o resto da página chega assim que o navegador fica livre
  useEffect(() => {
    whenIdle(() => {
      loadBelow();
      preloadProjectSheet();
    }, 2000);
  }, []);

  // link direto para uma seção (…/#simular): rola até ela depois da abertura
  useEffect(() => {
    if (!stage) return;
    const id = window.location.hash.slice(1);
    if (!SECTIONS.includes(id)) return;
    let tries = 0;
    const t = window.setInterval(() => {
      if (document.getElementById(id) || ++tries > 40) {
        window.clearInterval(t);
        scrollToId(id);
      }
    }, 100);
    return () => window.clearInterval(t);
  }, [stage]);

  const onOpen = useCallback(() => {
    setStage(true);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* navegação privada — tudo bem */
    }
  }, []);

  const openQr = useCallback(() => {
    loadQr();
    setQrLoaded(true);
    qr.open();
  }, [qr]);

  return (
    <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion={FORCE_MOTION ? "never" : "user"}>
      <StageContext.Provider value={stage}>
        <ToastProvider>
          <Backdrop />
          <div aria-hidden className="grain-layer" />
          <ScrollProgress />
          <Cursor />
          <NetworkWatch />
          {!seen && <Intro onOpen={onOpen} />}

          <div className="relative mx-auto w-full max-w-[30rem] px-4 pt-[max(1.25rem,env(safe-area-inset-top))] lg:grid lg:max-w-6xl lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-20 lg:px-10 lg:pt-0">
            <header className="side">
              <ProfileTop />
              <div ref={ctaRef} className="mt-7">
                <Cta onQr={openQr} />
              </div>
              <div className="mt-9">
                <ProfileMore />
              </div>
            </header>

            <main className="mt-16 flex min-h-[100svh] flex-col gap-16 pb-28 lg:mt-0 lg:py-24">
              {rest && (
                <>
                  <LinkList />
                  <ErrorBoundary>
                    <Projects />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <Suspense fallback={<BelowFallback />}>
                      <Below />
                    </Suspense>
                  </ErrorBoundary>
                  <Marquee />
                  <Footer />
                </>
              )}
            </main>
          </div>

          <Dock show={dock} />
          {qrLoaded && (
            <Suspense fallback={null}>
              <QrSheet open={qr.value !== null} onClose={qr.close} />
            </Suspense>
          )}
        </ToastProvider>
      </StageContext.Provider>
    </MotionConfig>
    </LazyMotion>
  );
}
