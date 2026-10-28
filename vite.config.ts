import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Coloca o CSS (pequeno, ~11 KB comprimido) direto no HTML: a primeira
 * pintura não espera uma segunda ida ao servidor — conta muito no 4G.
 */
function inlineCss(): Plugin {
  return {
    name: "inline-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        for (const [name, asset] of Object.entries(ctx.bundle)) {
          if (!name.endsWith(".css") || asset.type !== "asset") continue;
          const at = html.indexOf(`href="/${name}"`);
          if (at < 0) continue;
          const start = html.lastIndexOf("<link", at);
          const end = html.indexOf(">", at);
          if (start < 0 || end < 0) continue;
          html = html.slice(0, start) + `<style>${String(asset.source)}</style>` + html.slice(end + 1);
          delete ctx.bundle[name];
        }
        return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineCss()],
});
