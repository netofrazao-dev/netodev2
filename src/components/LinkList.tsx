import {
  m,
} from "framer-motion";
import { ArrowUpRight, Copy, Globe, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { links, type LinkItem, type LinkKind } from "../data/links";
import { EASE, copyText, haptic, lanternHandlers } from "../lib/utils";
import { GithubIcon, InstagramIcon } from "./icons";
import { SectionHead } from "./Section";
import { useToast } from "./Toast";

const icons: Record<LinkKind, ReactNode> = {
  instagram: <InstagramIcon size={20} />,
  portfolio: <Globe size={20} strokeWidth={1.6} />,
  github: <GithubIcon size={19} />,
  email: <Mail size={20} strokeWidth={1.6} />,
};

/** Cor de cada ícone — o Instagram ganha o gradiente da marca no hover. */
const tint: Record<LinkKind, string> = {
  instagram: "group-hover:text-[#f58529]",
  portfolio: "group-hover:text-brass",
  github: "group-hover:text-bone",
  email: "group-hover:text-jade",
};

function LinkCard({ item, i }: { item: LinkItem; i: number }) {
  const toast = useToast();
  const isMail = item.kind === "email";

  const onClick = async (e: React.MouseEvent) => {
    haptic();
    if (!isMail) return;
    // e-mail: copia na hora e oferece abrir o app — no celular é o que se quer
    e.preventDefault();
    const ok = await copyText(item.detail);
    toast({
      message: ok ? "E-mail copiado" : item.detail,
      action: { label: "Abrir e-mail", href: item.href },
    });
  };

  return (
    <m.li
      variants={{
        hidden: { opacity: 0, y: 26, rotateX: -24 },
        show: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.85, ease: EASE },
        },
      }}
      style={{ transformOrigin: "50% 0%", transformPerspective: 900 }}
    >
      <m.a
        href={item.href}
        target={isMail ? undefined : "_blank"}
        rel="noopener noreferrer"
        onClick={onClick}
        data-cursor={item.cursor}
        whileTap={{ scale: 0.975 }}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="lantern group flex items-center gap-4 rounded-2xl p-3 pr-4"
        {...lanternHandlers}
      >
        <span
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-abyss/70 text-mist transition-colors duration-500 ${tint[item.kind]}`}
        >
          {item.kind === "instagram" && (
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
              style={{ background: "radial-gradient(circle at 30% 110%, #feda75, #fa7e1e 30%, #d62976 55%, #962fbf 75%, #4f5bd5)" }}
            />
          )}
          <span className="relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-8 group-hover:scale-110">
            {icons[item.kind]}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[1rem] font-medium text-bone">{item.title}</span>
          <span className="mt-0.5 block truncate font-mono text-[0.6875rem] tracking-[0.02em] text-dim transition-colors group-hover:text-mist">
            {item.detail}
          </span>
        </span>

        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-dim transition-colors group-hover:text-brass">
          {isMail ? (
            <Copy size={15} className="transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <>
              <ArrowUpRight
                size={18}
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-6 group-hover:translate-x-6"
              />
              <ArrowUpRight
                size={18}
                className="absolute -translate-x-6 translate-y-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0"
              />
            </>
          )}
        </span>

        <span className="pointer-events-none absolute right-4 top-2 font-mono text-[0.5625rem] tracking-[0.12em] text-dim/50">
          0{i + 1}
        </span>
      </m.a>
    </m.li>
  );
}

export default function LinkList() {
  return (
    <section id="links" aria-labelledby="links-title" className="anchor">
      <SectionHead id="links-title" n="01" title="Onde me achar" />
      <m.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        className="flex flex-col gap-2.5"
      >
        {links.map((item, i) => (
          <LinkCard key={item.kind} item={item} i={i} />
        ))}
      </m.ul>
    </section>
  );
}
