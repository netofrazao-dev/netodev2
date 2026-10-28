import { Component, type ReactNode } from "react";
import { defaultMessage, whatsappLink } from "../data/links";

/**
 * Se uma parte da página quebrar (navegador antigo, conexão que caiu no
 * meio do carregamento), mostra um aviso com o WhatsApp no lugar de deixar
 * um buraco — o caminho até o contato nunca some.
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode; compact?: boolean },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[neto-links]", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="rounded-2xl border border-line-hot bg-surface p-5 text-center">
        <p className="text-[0.95rem] text-bone">Essa parte não carregou direito.</p>
        <p className="mt-1 text-[0.8125rem] text-mist">Pode ser a conexão. Tente de novo ou fale direto comigo.</p>
        <div className="mt-4 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-line-hot px-4 py-2.5 text-sm text-bone"
          >
            Recarregar
          </button>
          <a
            href={whatsappLink(defaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-brass px-4 py-2.5 text-sm font-medium text-abyss"
          >
            WhatsApp
          </a>
        </div>
      </div>
    );
  }
}
