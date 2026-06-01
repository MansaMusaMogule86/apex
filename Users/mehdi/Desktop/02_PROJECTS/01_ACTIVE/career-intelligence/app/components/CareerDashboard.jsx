"use client";

import { useMemo, useState } from "react";

const initialState = {
  slaHours: 48,
  students: [
    { id: "S-1042", name: "Aisha Al-Naqbi", major: "CIT", cgpa: 3.18, stage: "Searching", risk: "Medium", noc: "Not started", docs: { cv: true, jd: false, offer: false, passport: true }, alerts: ["No applications in 10 days"] },
    { id: "S-1187", name: "Omar Al-Hammadi", major: "CSEC", cgpa: 2.31, stage: "Interviewing", risk: "High", noc: "Pending", docs: { cv: true, jd: true, offer: true, passport: true }, alerts: ["Prereq missing: NSSA-241"] },
    { id: "S-0991", name: "Sara Khan", major: "EE", cgpa: 3.72, stage: "Offer Received", risk: "Low", noc: "Ready", docs: { cv: true, jd: true, offer: true, passport: true }, alerts: [] },
    { id: "S-1320", name: "Yousef Abdel", major: "ME", cgpa: 2.05, stage: "Searching", risk: "High", noc: "Not started", docs: { cv: false, jd: false, offer: false, passport: true }, alerts: ["Missing CV", "No workshop attendance"] },
    { id: "S-1106", name: "Mariam Noor", major: "Finance", cgpa: 2.61, stage: "Active Co-op", risk: "Low", noc: "Approved", docs: { cv: true, jd: true, offer: true, passport: true }, alerts: [] },
    { id: "S-1213", name: "Hassan Saleh", major: "Marketing", cgpa: 2.11, stage: "JD Submitted", risk: "Medium", noc: "Pending", docs: { cv: true, jd: true, offer: true, passport: false }, alerts: ["Passport copy missing"] },
    { id: "S-0874", name: "Layla Faris", major: "Psychology", cgpa: 3.01, stage: "Eligible", risk: "Low", noc: "Not started", docs: { cv: true, jd: false, offer: false, passport: true }, alerts: [] },
    { id: "S-1402", name: "Khalid Nasser", major: "IE", cgpa: 2.44, stage: "Registered", risk: "Medium", noc: "Approved", docs: { cv: true, jd: true, offer: true, passport: true }, alerts: ["Evaluation due soon"] },
  ],
  employers: [
    { id: "E-201", name: "Siemens", industry: "Engineering", hires: 9, relationship: "Strong", next: "Workshop in 14d", notes: ["Hosted session Q2", "2 offers pending"] },
    { id: "E-155", name: "KPMG", industry: "Consulting", hires: 6, relationship: "Strong", next: "Career fair booth", notes: ["Returning partner", "Wants more MIS"] },
    { id: "E-088", name: "Aramex", industry: "Logistics", hires: 4, relationship: "Stable", next: "Check-in in 30d", notes: ["Pipeline for IE", "Needs faster NOC"] },
    { id: "E-274", name: "Startup Lab", industry: "Tech", hires: 1, relationship: "At risk", next: "Re-engage this week", notes: ["Slow response", "Unfilled reqs"] },
  ],
  fairs: [
    { id: "F-2026-Spring", name: "Spring Career Fair", date: "2026-03-12", employers: 42, students: 510, offers: 64 },
    { id: "F-2026-Fall", name: "Fall Career Fair", date: "2026-10-08", employers: 48, students: 560, offers: 72 },
  ],
  nocRequests: [
    { id: "NOC-7782", studentId: "S-1187", employer: "Startup Lab", cgpa: 2.31, prereqs: "1 issue", status: "Pending Review", submitted: "2026-05-29", reasons: ["Prereq mismatch", "Needs advisor review"] },
    { id: "NOC-8120", studentId: "S-1213", employer: "KPMG", cgpa: 2.11, prereqs: "OK", status: "Docs Missing", submitted: "2026-05-28", reasons: ["Passport copy missing"] },
    { id: "NOC-8455", studentId: "S-0991", employer: "Siemens", cgpa: 3.72, prereqs: "OK", status: "Ready to Approve", submitted: "2026-05-27", reasons: [] },
  ],
  placements: [
    { id: "P-3001", studentId: "S-1106", employer: "KPMG", stage: "Active", start: "2026-05-05", weeks: 12, reportSubmitted: false },
    { id: "P-3002", studentId: "S-1402", employer: "Aramex", stage: "Registered", start: "2026-06-10", weeks: 10, reportSubmitted: false },
    { id: "P-3003", studentId: "S-0991", employer: "Siemens", stage: "Offer → JD", start: "2026-06-20", weeks: 10, reportSubmitted: true },
  ],
};

const views = [
  { id: "dashboard", title: "Dashboard", sub: "Institution-wide co-op visibility and action queue" },
  { id: "students", title: "Students", sub: "Track every student throughout the co-op lifecycle" },
  { id: "employers", title: "Employers", sub: "Employer CRM and relationship management" },
  { id: "career-fairs", title: "Career Fairs", sub: "Attendance, offers, conversion tracking" },
  { id: "noc", title: "NOC Requests", sub: "One-click approvals with eligibility checks" },
  { id: "placements", title: "Placements", sub: "End-to-end placement pipeline and compliance" },
  { id: "analytics", title: "Analytics", sub: "Realtime KPIs, trends, cohort breakdowns" },
  { id: "reports", title: "Reports", sub: "Executive exports and compliance reporting" },
  { id: "ai", title: "AI Assistant", sub: "Search, insights, and next best actions" },
  { id: "settings", title: "Settings", sub: "RBAC, notifications, and system configuration" },
];

function fmtPct(value) {
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
}

function stageChipClass(stage) {
  if (["Eligible", "Active Co-op", "Completed"].includes(stage)) return "c-eligible";
  if (["Searching", "JD Submitted"].includes(stage)) return "c-pending";
  if (["Interviewing", "Offer Received", "Registered", "Active"].includes(stage)) return "c-active";
  return "";
}

export default function CareerDashboard() {
  const [data, setData] = useState(initialState);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState([{ role: "assistant", text: "Ask about at-risk students, pending NOC, or KPI progress." }]);
  const [reportType, setReportType] = useState("Placement Report");
  const [reportMajor, setReportMajor] = useState("");
  const [reportTerm, setReportTerm] = useState("2026 Spring");
  const [reportFormat, setReportFormat] = useState("JSON");
  const [reportPreview, setReportPreview] = useState("Select a report type and press Generate.");

  const studentById = useMemo(() => new Map(data.students.map((s) => [s.id, s])), [data.students]);

  const metrics = useMemo(() => {
    const eligible = data.students.filter((s) => ["Eligible", "Searching", "Interviewing", "Offer Received", "JD Submitted", "Registered", "Active Co-op"].includes(s.stage)).length;
    const searching = data.students.filter((s) => s.stage === "Searching").length;
    const inCoop = data.students.filter((s) => s.stage === "Active Co-op").length;
    const pending = data.nocRequests.filter((n) => n.status !== "Approved").length + data.students.filter((s) => Object.values(s.docs).some((v) => !v)).length;
    const placed = data.students.filter((s) => ["Active Co-op", "Registered"].includes(s.stage)).length;
    const progress = eligible ? (placed / eligible) * 100 : 0;
    return { eligible, searching, inCoop, pending, placed, progress };
  }, [data]);

  const majors = useMemo(() => [...new Set(data.students.map((s) => s.major))].sort(), [data.students]);
  const stages = useMemo(() => [...new Set(data.students.map((s) => s.stage))].sort(), [data.students]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.students.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.major.toLowerCase().includes(q);
      const matchM = !filterMajor || s.major === filterMajor;
      const matchS = !filterStage || s.stage === filterStage;
      const matchR = !filterRisk || s.risk === filterRisk;
      return matchQ && matchM && matchS && matchR;
    });
  }, [data.students, filterMajor, filterRisk, filterStage, search]);

  const missingReports = useMemo(() => data.placements.filter((p) => !p.reportSubmitted), [data.placements]);
  const cohortSummary = useMemo(() => {
    const cohorts = [
      ["Engineering", data.students.filter((s) => ["EE", "ME", "IE"].includes(s.major)).length],
      ["Computing", data.students.filter((s) => ["CIT", "CSEC"].includes(s.major)).length],
      ["Business", data.students.filter((s) => ["Finance", "Marketing"].includes(s.major)).length],
      ["Other", data.students.filter((s) => ["Psychology"].includes(s.major)).length],
    ];
    return cohorts.filter((c) => c[1] > 0).map((c) => `${c[0]}: ${c[1]}`).join(" • ");
  }, [data.students]);

  const viewMeta = views.find((v) => v.id === view) ?? views[0];

  function updateNocStatus(id, status) {
    setData((prev) => ({
      ...prev,
      nocRequests: prev.nocRequests.map((n) => (n.id === id ? { ...n, status: status === "Approved" ? "Approved" : "Pending Review" } : n)),
    }));
  }

  function sendChat() {
    const q = chatInput.trim();
    if (!q) return;
    setChatInput("");
    const next = [{ role: "user", text: q }];
    const t = q.toLowerCase();
    let reply = "Try: Which students are at risk? What is pending for NOC? How is placement KPI trending?";

    if (t.includes("risk")) {
      const highs = data.students.filter((s) => s.risk === "High").map((s) => s.name);
      reply = highs.length ? `High-risk students: ${highs.join(" • ")}. Recommended: 1:1 + mock interview + prereq check.` : "No high-risk students flagged right now.";
    } else if (t.includes("noc") || t.includes("approval")) {
      const pending = data.nocRequests.filter((n) => n.status !== "Approved").length;
      const ready = data.nocRequests.filter((n) => n.status === "Ready to Approve").length;
      reply = `NOC queue: ${pending} pending, ${ready} ready to approve.`;
    } else if (t.includes("kpi") || t.includes("placement")) {
      reply = `Placement KPI: ${metrics.placed}/${metrics.eligible} placed (${fmtPct(metrics.progress)}). Focus on ${metrics.searching} searching students.`;
    }

    setChat((prev) => [...prev, ...next, { role: "assistant", text: reply }]);
  }

  function generateReport() {
    const payload = {
      generated_at: new Date().toISOString(),
      type: reportType,
      scope: { major: reportMajor || "All majors", term: reportTerm },
      kpis: {
        eligible_students: metrics.eligible,
        searching: metrics.searching,
        in_coop: metrics.inCoop,
        pending_approvals: metrics.pending,
        placed: metrics.placed,
        placement_rate_pct: Math.round(metrics.progress * 10) / 10,
      },
    };

    if (reportFormat === "CSV") {
      const csv = [
        ["metric", "value"],
        ["eligible_students", payload.kpis.eligible_students],
        ["searching", payload.kpis.searching],
        ["in_coop", payload.kpis.in_coop],
        ["pending_approvals", payload.kpis.pending_approvals],
        ["placed", payload.kpis.placed],
        ["placement_rate_pct", payload.kpis.placement_rate_pct],
      ]
        .map((row) => row.join(","))
        .join("\n");
      setReportPreview(csv);
      return;
    }

    setReportPreview(JSON.stringify(payload, null, 2));
  }

  function downloadReport() {
    const ext = reportFormat === "CSV" ? "csv" : "json";
    const mime = reportFormat === "CSV" ? "text/csv" : "application/json";
    const blob = new Blob([reportPreview], { type: mime });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report.${ext}`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1>Career Intelligence</h1>
            <p>Co-op Ops and Student Success</p>
          </div>
        </div>
        <nav className="nav">
          {views.map((v) => (
            <button key={v.id} className="navBtn" aria-current={view === v.id ? "page" : undefined} onClick={() => setView(v.id)}>
              <span className="dot" />
              <span>{v.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>{viewMeta.title}</h2>
            <div className="subtitle">{viewMeta.sub}</div>
          </div>
          <div className="searchRow">
            <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students, employers, NOC" />
          </div>
        </header>

        {view === "dashboard" && (
          <section>
            <div className="hero">
              <h3>RIT Dubai Co-op Command Center</h3>
              <p>AI powered co-op operations and student success platform. Mission: no student is lost in the co-op journey.</p>
            </div>
            <div className="grid kpis">
              <Card label="Eligible Students" value={metrics.eligible} />
              <Card label="Students Searching" value={metrics.searching} />
              <Card label="Students In Co-op" value={metrics.inCoop} />
              <Card label="Pending Approvals" value={metrics.pending} />
            </div>
          </section>
        )}

        {view === "students" && (
          <section className="card">
            <div className="cardHeader">
              <h3>Students</h3>
              <div className="filters">
                <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)}>
                  <option value="">All majors</option>
                  {majors.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                  <option value="">All stages</option>
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
                  <option value="">All risk</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Major</th>
                    <th>CGPA</th>
                    <th>Lifecycle</th>
                    <th>Risk</th>
                    <th>NOC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                        <div className="small">{s.id}</div>
                      </td>
                      <td>{s.major}</td>
                      <td>{s.cgpa.toFixed(2)}</td>
                      <td>
                        <span className={`chip ${stageChipClass(s.stage)}`}>{s.stage}</span>
                      </td>
                      <td>{s.risk}</td>
                      <td>{s.noc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === "employers" && (
          <section className="card">
            <div className="cardHeader">
              <h3>Employer CRM</h3>
            </div>
            <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employer</th>
                  <th>Industry</th>
                  <th>Hires</th>
                  <th>Relationship</th>
                  <th>Next touch</th>
                </tr>
              </thead>
              <tbody>
                {data.employers.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.name}</strong>
                      <div className="small">{e.id}</div>
                    </td>
                    <td>{e.industry}</td>
                    <td>{e.hires}</td>
                    <td>{e.relationship}</td>
                    <td>{e.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        )}

        {view === "career-fairs" && (
          <section className="card">
            <div className="cardHeader">
              <h3>Career Fairs</h3>
            </div>
            <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Employers</th>
                  <th>Students</th>
                  <th>Offers</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {data.fairs.map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>{f.date}</td>
                    <td>{f.employers}</td>
                    <td>{f.students}</td>
                    <td>{f.offers}</td>
                    <td>{fmtPct((f.offers / f.students) * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        )}

        {view === "noc" && (
          <section className="card">
            <div className="cardHeader">
              <h3>NOC Requests</h3>
            </div>
            <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Employer</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.nocRequests.map((n) => (
                  <tr key={n.id}>
                    <td>{studentById.get(n.studentId)?.name ?? n.studentId}</td>
                    <td>{n.employer}</td>
                    <td>{n.cgpa.toFixed(2)}</td>
                    <td>{n.status}</td>
                    <td>{n.submitted}</td>
                    <td className="actions">
                      <button className="btn" onClick={() => updateNocStatus(n.id, "Approved")}>Approve</button>
                      <button className="btn ghost" onClick={() => updateNocStatus(n.id, "Rejected")}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        )}

        {view === "placements" && (
          <section className="twoCol">
            <div className="card">
              <div className="cardHeader">
                <h3>Placements</h3>
              </div>
              <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Employer</th>
                    <th>Stage</th>
                    <th>Start</th>
                    <th>Weeks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.placements.map((p) => (
                    <tr key={p.id}>
                      <td>{studentById.get(p.studentId)?.name ?? p.studentId}</td>
                      <td>{p.employer}</td>
                      <td>{p.stage}</td>
                      <td>{p.start}</td>
                      <td>{p.weeks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            <div className="card">
              <div className="cardHeader">
                <h3>Missing Reports</h3>
                <span className="badge">{missingReports.length}</span>
              </div>
              <div className="cardBody">
                {missingReports.map((p) => (
                  <div key={p.id} className="field">
                    {studentById.get(p.studentId)?.name ?? p.studentId}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === "analytics" && (
          <section className="twoCol">
            <div className="card">
              <div className="cardHeader">
                <h3>Realtime Analytics</h3>
              </div>
              <div className="cardBody statsGrid">
                <div className="field"><div className="k">Placement rate</div><div className="v">{fmtPct(metrics.progress)}</div></div>
                <div className="field"><div className="k">Median approval time</div><div className="v">{Math.round(data.slaHours * 0.52)}h</div></div>
                <div className="field"><div className="k">Employer engagement</div><div className="v">{Math.min(100, 35 + data.employers.filter((e) => e.relationship === "Strong").length * 18)}/100</div></div>
                <div className="field"><div className="k">Cohorts</div><div className="v">{cohortSummary || "-"}</div></div>
              </div>
            </div>
            <div className="card">
              <div className="cardHeader"><h3>AI Risk Monitor</h3></div>
              <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Signal</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students
                    .filter((s) => s.risk === "High")
                    .map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.alerts[0] || "Low activity"}</td>
                        <td>Schedule 1:1 and mock interview.</td>
                      </tr>
                    ))}
                </tbody>
              </table>
                </div>
            </div>
          </section>
        )}

        {view === "reports" && (
          <section className="twoCol">
            <div className="card">
              <div className="cardHeader"><h3>Report Builder</h3></div>
              <div className="cardBody builder">
                <label>Report type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option>Placement Report</option>
                  <option>KPI Report</option>
                  <option>Employer Report</option>
                  <option>Career Fair Report</option>
                  <option>Compliance Report</option>
                </select>
                <label>Major</label>
                <select value={reportMajor} onChange={(e) => setReportMajor(e.target.value)}>
                  <option value="">All majors</option>
                  {majors.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <label>Term</label>
                <select value={reportTerm} onChange={(e) => setReportTerm(e.target.value)}>
                  <option>2026 Spring</option>
                  <option>2026 Summer</option>
                  <option>2026 Fall</option>
                </select>
                <label>Format</label>
                <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)}>
                  <option>JSON</option>
                  <option>CSV</option>
                </select>
                <div className="actions">
                  <button className="btn" onClick={generateReport}>Generate</button>
                  <button className="btn primary" type="button" onClick={downloadReport}>Download</button>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="cardHeader"><h3>Output</h3></div>
              <div className="cardBody">
                <pre className="preview">{reportPreview}</pre>
              </div>
            </div>
          </section>
        )}

        {view === "ai" && (
          <section className="twoCol">
            <div className="card">
              <div className="cardHeader"><h3>AI Assistant</h3></div>
              <div className="cardBody">
                <div className="chatLog">
                  {chat.map((m, i) => (
                    <div className="field" key={`${m.role}-${i}`}>
                      <div className="k">{m.role}</div>
                      <div className="v">{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="chatInputRow">
                  <input className="search" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Which students are at risk this week?" />
                  <button className="btn primary" type="button" onClick={sendChat}>Send</button>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="cardHeader"><h3>AI Features</h3></div>
              <div className="cardBody">
                <div className="field"><div className="k">AI NOC approval</div><div className="v">Auto-check prerequisites, CGPA, docs, then draft decision.</div></div>
                <div className="field"><div className="k">AI risk detection</div><div className="v">Rank students by likelihood of not placing and recommend interventions.</div></div>
                <div className="field"><div className="k">AI KPI monitoring</div><div className="v">Alert when placement rate or SLA drifts.</div></div>
              </div>
            </div>
          </section>
        )}

        {view === "settings" && (
          <section className="card">
            <div className="cardHeader"><h3>System Settings</h3></div>
            <div className="cardBody builder">
              <label>Approval SLA target (hours)</label>
              <input type="number" min="1" value={data.slaHours} onChange={(e) => setData((prev) => ({ ...prev, slaHours: Math.max(1, Number(e.target.value || 1)) }))} />
            </div>
          </section>
        )}
      </main>

      <nav className="mobileNav">
        {views.slice(0, 5).map((v) => (
          <button key={v.id} type="button" className="navBtn" aria-current={view === v.id ? "page" : undefined} onClick={() => setView(v.id)}>
            <span className="dot" aria-hidden="true" />
            <span>{v.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="card">
      <div className="kpi">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
    </div>
  );
}
