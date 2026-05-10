"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const METRICS = [
  { count: 48,  suffix: "M+",   desc: "Audience Reach\nManaged Monthly"     },
  { count: 2.8, prefix: "AED ", suffix: "B", decimal: true, desc: "Revenue Generated\nFor Clients" },
  { count: 340, suffix: "+",    desc: "Elite Influencers\nIn Our Network"    },
  { count: 98,  suffix: "%",    desc: "Client Retention\nRate, Year One"     },
];

function Counter({ count, prefix = "", suffix, decimal = false }: { count: number; prefix?: string; suffix: string; decimal?: boolean }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [val, setVal] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const duration  = 1800;
    const startTime = performance.now();
    function tick(now: number) {
      const t     = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v     = count * eased;
      setVal(prefix + (decimal ? v.toFixed(1) : Math.round(v)) + suffix);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, count, prefix, suffix, decimal]);

  return (
    <div ref={ref} className="metric-num" dangerouslySetInnerHTML={{ __html: val }} />
  );
}

export default function Metrics() {
  return (
    <section id="metrics" className="apex-section metrics-section">
      <div className="metrics-grid">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.desc}
            className="metric-cell"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
          >
            <Counter count={m.count} prefix={m.prefix} suffix={m.suffix} decimal={m.decimal} />
            <div className="metric-desc" style={{ whiteSpace: "pre-line" }}>{m.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
