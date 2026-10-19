import { motion, type MotionValue } from "framer-motion";
import type { Project } from "../data/links";
import { EASE } from "../lib/utils";

/* ------------------------------------------------------------------ */
/* capa desenhada em CSS — para projeto sem print (sistema interno)    */
/* ------------------------------------------------------------------ */

export function MockDashboard({ hues }: { hues: [string, string] }) {
  const bars = [38, 62, 48, 80, 56, 92, 70];
  return (
    <div className="absolute inset-0 flex bg-[#0b1116] p-3 pt-12 text-[0px]">
      <div className="mr-2.5 flex w-[16%] flex-col gap-1.5 rounded-md bg-white/[0.03] p-2">
        <div className="mb-1 h-2.5 w-2.5 rounded-sm" style={{ background: hues[0] }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1.5 rounded-full bg-white/10" style={{ width: `${60 + ((i * 17) % 35)}%` }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="grid grid-cols-3 gap-2">
          {["R$ 4.820", "R$ 312", "0"].map((v, i) => (
            <div key={v} className="rounded-md bg-white/[0.04] p-2">
              <div className="h-1 w-1/2 rounded-full bg-white/15" />
              <div
                className="mt-1.5 font-mono text-[9px] font-medium"
                style={{ color: i === 0 ? hues[0] : i === 1 ? "#e9f0ef" : "#3fb79f" }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1.5 rounded-md bg-white/[0.03] p-2.5">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 origin-bottom rounded-t-sm"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, ${hues[1]}, ${hues[0]})`,
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.06 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Cover({ project, parallax }: { project: Project; parallax?: MotionValue<number> }) {
  if (!project.cover) return <MockDashboard hues={project.hues} />;
  return (
    <motion.img
      src={project.cover}
      alt={`Tela do projeto ${project.name}`}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ x: parallax }}
      className="absolute inset-0 h-full w-[118%] max-w-none -translate-x-[8%] object-cover object-left-top"
    />
  );
}

