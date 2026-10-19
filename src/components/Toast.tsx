import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

type ToastData = {
  id: number;
  message: string;
  action?: { label: string; href: string };
};

const ToastContext = createContext<(t: Omit<ToastData, "id">) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<number>(0);

  const show = useCallback((t: Omit<ToastData, "id">) => {
    window.clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), t.action ? 4200 : 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <AnimatePresence mode="popLayout">
          {toast && (
            <motion.div
              key={toast.id}
              layout
              initial={{ y: 40, opacity: 0, scale: 0.9, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ y: 20, opacity: 0, scale: 0.94, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 rounded-full border border-line-hot bg-raised/90 py-2 pl-2 pr-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.08 }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-jade text-abyss"
              >
                <Check size={15} strokeWidth={3} />
              </motion.span>
              <span className={`text-sm text-bone ${toast.action ? "" : "pr-3"}`}>{toast.message}</span>
              {toast.action && (
                <a
                  href={toast.action.href}
                  className="rounded-full bg-brass px-3.5 py-1.5 text-xs font-medium text-abyss"
                >
                  {toast.action.label}
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
