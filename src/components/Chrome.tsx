import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { site } from "../data/links";
import { PrimaryCta } from "./Cta";

/** Régua de progresso de leitura no topo. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-brass via-brass-hot to-jade"
    />
  );
}

/**
 * Cabeçalho compacto (celular): aparece quando o perfil sai da tela, com a
 * foto, o nome e o botão de orçamento sempre à mão.
 */
export function MiniHeader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "-110%" }}
          animate={{ y: 0 }}
          exit={{ y: "-110%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="fixed inset-x-0 top-0 z-[60] border-b border-line/80 bg-ink/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-[30rem] items-center gap-3 px-4 py-2.5">
            <motion.img
              src={site.photo}
              alt=""
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24, delay: 0.08 }}
              className="h-9 w-9 rounded-full object-cover object-[50%_40%] ring-1 ring-brass/60"
            />
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="min-w-0 flex-1"
            >
              <p className="truncate font-display text-[1.05rem] leading-tight">{site.name}</p>
              <p className="truncate font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-dim">
                dev web · {site.city}, {site.state}
              </p>
            </motion.div>
            <PrimaryCta compact />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
