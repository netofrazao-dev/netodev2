import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import Backdrop from "./components/Backdrop";
import { MiniHeader, ScrollProgress } from "./components/Chrome";
import Cta from "./components/Cta";
import Cursor from "./components/Cursor";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import LinkList from "./components/LinkList";
import Marquee from "./components/Marquee";
import { ProfileMore, ProfileTop } from "./components/Profile";
import Projects from "./components/Projects";
import Services from "./components/Services";
import { ToastProvider } from "./components/Toast";
import { StageContext } from "./lib/stage";
import { FORCE_MOTION, prefersReducedMotion } from "./lib/utils";

const INTRO_KEY = "nf:intro";

/** A abertura roda uma vez por sessão — e nunca com "reduzir movimento". */
function introAlreadySeen() {
  if (prefersReducedMotion()) return true;
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [seen] = useState(introAlreadySeen);
  const [stage, setStage] = useState(seen);
  const [mini, setMini] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // cabeçalho compacto quando o botão principal sai por cima da tela
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setMini(!e.isIntersecting && e.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onOpen = () => {
    setStage(true);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* navegação privada — tudo bem */
    }
  };

  return (
    <MotionConfig reducedMotion={FORCE_MOTION ? "never" : "user"}>
      <StageContext.Provider value={stage}>
        <ToastProvider>
          <Backdrop />
          <div aria-hidden className="grain-layer" />
          <ScrollProgress />
          <MiniHeader show={mini} />
          <Cursor />
          {!seen && <Intro onOpen={onOpen} />}

          <div className="relative mx-auto w-full max-w-[30rem] px-4 pt-[max(1.25rem,env(safe-area-inset-top))] lg:grid lg:max-w-6xl lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-20 lg:px-10 lg:pt-0">
            <header className="side">
              <ProfileTop />
              <div ref={ctaRef} className="mt-7">
                <Cta />
              </div>
              <div className="mt-9">
                <ProfileMore />
              </div>
            </header>

            <main className="mt-16 flex flex-col gap-16 lg:mt-0 lg:py-24">
              <LinkList />
              <Projects />
              <Services />
              <Marquee />
              <Footer />
            </main>
          </div>
        </ToastProvider>
      </StageContext.Provider>
    </MotionConfig>
  );
}
