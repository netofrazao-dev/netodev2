import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { FORCE_MOTION, whenIdle } from "./lib/utils";

if (FORCE_MOTION) document.documentElement.classList.add("motion-full");

// depois de um deploy novo, um pedaço antigo pode não existir mais:
// recarrega uma vez para buscar a versão atual (sem entrar em loop)
window.addEventListener("vite:preloadError", (e) => {
  try {
    if (sessionStorage.getItem("nf:reloaded")) return;
    sessionStorage.setItem("nf:reloaded", "1");
  } catch {
    return;
  }
  e.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// app instalável + funciona sem internet nas próximas visitas
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    whenIdle(() => navigator.serviceWorker.register("/sw.js").catch(() => {}), 4000),
  );
}
