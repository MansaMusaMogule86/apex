"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const HEIGHTS = [30, 45, 38, 62, 55, 74, 68, 82, 77, 94];

const FEATURES = [
  {
    icon: <svg className="ai-feat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    name: "Real-Time Brand Monitoring",
    desc: "Every mention, sentiment shift, and competitor move — tracked continuously. Alerts before problems become crises.",
  },
  {
    icon: <svg className="ai-feat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    name: "Predictive Growth Modeling",
    desc: "90-day forecasts trained on APEX client portfolio. Know the outcome before you spend the budget.",
  },
  {
    icon: <svg className="ai-feat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    name: "AI Monthly Intelligence Report",
    desc: "Executive-grade analysis delivered monthly. Numbers with narrative. Strategy with precision. Never generic.",
  },
  {
    icon: <svg className="ai-feat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    name: "APEX Score™ Algorithm",
    desc: "Proprietary 1000-point influencer scoring. Authenticity, engagement quality, brand safety, exclusivity — all factored.",
  },
];

function ChartBars() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className="chart-bars" id="chart-bars">
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={`chart-bar${i === HEIGHTS.length - 1 ? " active" : ""}`}
          style={{
            height: inView ? `${h}%` : "4px",
            transition: `height 0.8s var(--ease-silk) ${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AIDemo() {
  return (
    <section id="ai-demo" className="apex-section ai-demo-section">
      <div className="container">
        <div className="ai-demo-grid">

          <motion.div
            className="ai-mockup"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: EASE }}
          >
            <div className="mockup-bar">
              <div className="mockup-dots"><span/><span/><span/></div>
              <span className="mockup-title">apex.ai — client dashboard</span>
            </div>
            <div className="mockup-body">
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--mist)", textTransform: "uppercase", marginBottom: 14 }}>
                Performance Overview · Last 30 Days
              </div>
              <div className="mock-metric-row">
                <div className="mock-metric"><div className="mock-metric-val">48.2M</div><div className="mock-metric-label">Total Reach</div></div>
                <div className="mock-metric"><div className="mock-metric-val">6.8%</div><div className="mock-metric-label">Engagement</div></div>
                <div className="mock-metric"><div className="mock-metric-val" style={{ color: "var(--gold-light)" }}>912</div><div className="mock-metric-label">APEX Score</div></div>
              </div>
              <div className="mock-chart">
                <div className="mock-chart-label">Brand Momentum Index</div>
                <ChartBars />
              </div>
              <div className="mock-insight">
                <div className="mock-insight-label">AI Insight · High Confidence</div>
                <div className="mock-insight-text">Competitor EMAAR launched 3 new accounts this week. Recommend increasing influencer frequency by 40% in next 14 days to maintain SOV advantage.</div>
              </div>
              <div className="mock-insight gold-insight">
                <div className="mock-insight-label">APEX Score · Updated</div>
                <div className="mock-insight-text">Score increased +47pts this week. Primary driver: Sophia V partnership generating 3.2x projected engagement.</div>
              </div>
              <div className="mock-actions">
                <div className="mock-btn primary">Generate Report</div>
                <div className="mock-btn secondary">Ask AI ⌘K</div>
              </div>
            </div>
          </motion.div>

          <div>
            <motion.div className="section-label" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.7, ease: EASE }}>
              AI Intelligence
            </motion.div>
            <motion.h2 className="section-headline" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
              The Machine<br />That Never<br /><em>Sleeps</em>
            </motion.h2>
            <motion.p className="section-body" style={{ marginBottom: 32 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}>
              Our AI suite operates 24/7, processing thousands of data points across your brand, your competitors, and your audience — surfacing only what demands your attention.
            </motion.p>

            <div className="ai-features-list">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.name}
                  className="ai-feat"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.08 }}
                >
                  {f.icon}
                  <div>
                    <div className="ai-feat-name">{f.name}</div>
                    <div className="ai-feat-desc">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
