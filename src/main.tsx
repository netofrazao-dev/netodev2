import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { FORCE_MOTION } from "./lib/utils";

if (FORCE_MOTION) document.documentElement.classList.add("motion-full");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
