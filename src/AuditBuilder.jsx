import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { DownloadPDFButton } from "./pdf/DownloadButton";

const AuditReportDocument = lazy(() => import("./pdf/AuditReportDocument"));

// ─── TOKENS ────────────────────────────────────────────────────────────────────
const C = {
  bg:    '#0D0702', surf:  '#1B0E07', card:  '#241408',
  b0:    'rgba(212,169,122,0.13)', b1: 'rgba(212,169,122,0.28)',
  beige: '#D4A97A', cream: '#E0C89A',
  muted: '#7A5830', dim:   '#3D2818', white: '#F5EDD8',
  teal:  '#5A9E96', tealL: '#80C0B8',
  red:   '#B8503E', redL:  '#D47060',
  amber: '#CC7A2A', green: '#68AF88',
};

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  'Devices & MDM',
  'Email & Communication',
  'Connectivity',
  'Apple Presence',
  'Security & Compliance',
  'Operations & Support',
];

const DEFAULT_ROADMAP = [
  { phase: 'Immediate (0–30 days)',   items: [] },
  { phase: 'Short-Term (30–90 days)', items: [] },
  { phase: 'Long-Term (90+ days)',    items: [] },
];

const STEPS = [
  { id: 'client',   title: 'Client Info' },
  { id: 'scores',   title: 'Assessment Scores' },
  { id: 'summary',  title: 'Executive Summary' },
  { id: 'findings', title: 'Findings' },
  { id: 'roadmap',  title: 'Roadmap' },
  { id: 'report',   title: 'Report' },
];

const SEV_COLOR = { critical: C.red, high: C.amber, medium: C.beige, low: C.teal };

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function scoreColor(n) {
  if (n >= 80) return C.teal;
  if (n >= 60) return C.green;
  if (n >= 40) return C.amber;
  return C.red;
}

function scoreLabel(n) {
  if (n >= 80) return 'Excellent';
  if (n >= 60) return 'Good';
  if (n >= 40) return 'Needs Work';
  return 'Critical';
}

function scoreStatus(n) {
  if (n >= 80) return 'excellent';
  if (n >= 60) return 'good';
  if (n >= 40) return 'warning';
  return 'critical';
}

function buildPDFData(a) {
  const now = new Date();
  const fmt = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const slug = (a.clientName || 'client').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const reportId = `CCP-AUD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${slug}`;
  const cats = a.categories || [];
  const avg = cats.length ? Math.round(cats.reduce((s, c) => s + (c.score || 0), 0) / cats.length) : 0;

  return {
    reportId,
    date:       fmt(now),
    preparedBy: 'Jason F. Reyes, Founder & CEO',
    client: {
      businessName: a.clientName  || 'Client',
      contactName:  a.contactName || '',
      email:        a.clientEmail || '',
      phone:        a.clientPhone || '',
    },
    executiveSummary: a.executiveSummary || '',
    overallScore:     a.overallScore != null ? a.overallScore : avg,
    categories: cats.map(c => ({
      name:    c.name,
      score:   c.score || 0,
      status:  scoreStatus(c.score || 0),
      summary: c.summary || '',
    })),
    findings: (a.findings || []).map((f, i) => ({
      id:             `F-${String(i + 1).padStart(3, '0')}`,
      category:       f.category || '',
      severity:       f.severity || 'medium',
      finding:        f.finding  || '',
      impact:         f.impact   || '',
      recommendation: f.recommendation || '',
      effort:         f.effort   || 'Medium',
    })),
    roadmap: (a.roadmap || [])
      .map(p => ({ ...p, items: p.items.filter(Boolean) }))
      .filter(p => p.items.length > 0),
  };
}

function blankState() {
  return {
    clientName:       '',
    contactName:      '',
    clientEmail:      '',
    clientPhone:      '',
    categories:       DEFAULT_CATEGORIES.map(name => ({ name, score: 70, summary: '' })),
    executiveSummary: '',
    overallScore:     null,
    findings:         [],
    roadmap:          DEFAULT_ROADMAP.map(r => ({ ...r, items: [] })),
  };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function AuditBuilder() {
  const [a, setA]         = useState(blankState);
  const [step, setStep]   = useState(0);
  const [roadmapInput, setRoadmapInput] = useState(['', '', '']);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 700);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 700);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cur     = STEPS[step];
  const isFinal = cur.id === 'report';

  function set(k, v) { setA(p => ({ ...p, [k]: v })); }

  function setCat(i, key, val) {
    setA(p => {
      const cats = [...p.categories];
      cats[i] = { ...cats[i], [key]: val };
      return { ...p, categories: cats };
    });
  }

  function setFinding(i, key, val) {
    setA(p => {
      const findings = [...p.findings];
      findings[i] = { ...findings[i], [key]: val };
      return { ...p, findings };
    });
  }

  function addFinding() {
    setA(p => ({
      ...p,
      findings: [...p.findings, {
        category: p.categories[0]?.name || '',
        severity: 'medium', effort: 'Medium',
        finding: '', impact: '', recommendation: '',
      }],
    }));
  }

  function removeFinding(i) {
    setA(p => ({ ...p, findings: p.findings.filter((_, j) => j !== i) }));
  }

  function addRoadmapItem(pi) {
    const val = roadmapInput[pi]?.trim();
    if (!val) return;
    setA(p => ({
      ...p,
      roadmap: p.roadmap.map((r, i) =>
        i === pi ? { ...r, items: [...r.items, val] } : r
      ),
    }));
    setRoadmapInput(prev => prev.map((v, i) => i === pi ? '' : v));
  }

  function removeRoadmapItem(pi, ii) {
    setA(p => ({
      ...p,
      roadmap: p.roadmap.map((r, i) =>
        i === pi ? { ...r, items: r.items.filter((_, j) => j !== ii) } : r
      ),
    }));
  }

  const avgScore = useMemo(() => {
    const cats = a.categories;
    return cats.length ? Math.round(cats.reduce((s, c) => s + (c.score || 0), 0) / cats.length) : 0;
  }, [a.categories]);

  const overallScore = a.overallScore != null ? a.overallScore : avgScore;
  const pdfData      = useMemo(() => buildPDFData(a), [a]);
  const pdfFilename  = `CCP-Audit-${(a.clientName || 'client').replace(/\s+/g, '-')}.pdf`;
  const progress     = Math.round((step + 1) / STEPS.length * 100);

  // ── STYLE FACTORIES ─────────────────────────────────────────────────────────
  const inp = (mb = 14) => ({
    display: 'block', width: '100%', boxSizing: 'border-box',
    background: C.card, border: `1px solid ${C.b0}`, borderRadius: 8,
    padding: '11px 14px', color: C.cream, fontSize: 16, outline: 'none',
    fontFamily: 'Georgia,serif', marginBottom: mb,
  });
  const lbl = {
    fontSize: 11, color: C.muted, textTransform: 'uppercase',
    letterSpacing: '0.1em', display: 'block', marginBottom: 6,
  };
  const ta = (rows = 4, mb = 14) => ({
    ...inp(mb), resize: 'vertical', minHeight: rows * 22 + 22, lineHeight: 1.6,
  });

  // ── STEP CONTENT ────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (cur.id) {

      case 'client': return (
        <>
          <label style={lbl}>Business name *</label>
          <input style={inp(16)} type="text" placeholder="e.g. Main Street Dental"
            value={a.clientName} onChange={e => set('clientName', e.target.value)} />
          <label style={lbl}>Contact name *</label>
          <input style={inp(16)} type="text" placeholder="e.g. Dr. Sarah Kim"
            value={a.contactName} onChange={e => set('contactName', e.target.value)} />
          <label style={lbl}>Email</label>
          <input style={inp(16)} type="email" placeholder="e.g. sarah@mainstreetdental.com"
            value={a.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
          <label style={lbl}>Phone</label>
          <input style={inp(0)} type="tel" placeholder="e.g. (703) 555-0100"
            value={a.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
        </>
      );

      case 'scores': return (
        <>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6, marginTop: 0 }}>
            Score each area 0–100. Status derives automatically. Add a 1–2 sentence summary per area.
          </p>
          {a.categories.map((cat, i) => {
            const color = scoreColor(cat.score || 0);
            return (
              <div key={cat.name} style={{
                background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10,
                padding: 16, marginBottom: 12, borderLeft: `3px solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: C.beige, fontWeight: 'bold' }}>{cat.name}</span>
                  <span style={{ fontSize: 13, color, fontWeight: 'bold' }}>
                    {cat.score || 0}<span style={{ fontSize: 11, color: C.muted }}>/100</span>
                  </span>
                </div>
                <input type="range" min="0" max="100" value={cat.score || 0}
                  onChange={e => setCat(i, 'score', +e.target.value)}
                  style={{ width: '100%', marginBottom: 6, accentColor: color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: C.muted }}>Critical</span>
                  <span style={{ fontSize: 11, color, letterSpacing: '0.06em' }}>{scoreLabel(cat.score || 0)}</span>
                  <span style={{ fontSize: 10, color: C.muted }}>Excellent</span>
                </div>
                <textarea style={ta(2, 0)} placeholder="1–2 sentence summary of this area…"
                  value={cat.summary} onChange={e => setCat(i, 'summary', e.target.value)} />
              </div>
            );
          })}
          <div style={{ background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10, padding: '14px 16px', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Overall score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 28, color: scoreColor(overallScore), fontWeight: 'bold' }}>
                {overallScore}<span style={{ fontSize: 12, color: C.muted, fontWeight: 'normal' }}>/100</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>avg of categories</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="score-override" checked={a.overallScore != null}
                onChange={e => set('overallScore', e.target.checked ? avgScore : null)} />
              <label htmlFor="score-override" style={{ ...lbl, display: 'inline', marginBottom: 0 }}>Override manually</label>
              {a.overallScore != null && (
                <input type="number" min="0" max="100"
                  style={{ ...inp(0), width: 80, display: 'inline', marginBottom: 0 }}
                  value={a.overallScore}
                  onChange={e => set('overallScore', Math.min(100, Math.max(0, +e.target.value)))} />
              )}
            </div>
          </div>
        </>
      );

      case 'summary': return (
        <>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6, marginTop: 0 }}>
            2–4 paragraphs on the overall state of their tech. This is the first thing the client reads.
          </p>
          <textarea style={ta(10, 6)}
            placeholder="e.g. Main Street Dental has a solid foundational setup with a few critical gaps that pose security and operational risk if left unaddressed…"
            value={a.executiveSummary}
            onChange={e => set('executiveSummary', e.target.value)} />
          <div style={{ fontSize: 11, color: C.muted }}>
            {a.executiveSummary.length > 0 ? `${a.executiveSummary.length} characters` : 'Aim for 300–600 characters'}
          </div>
        </>
      );

      case 'findings': return (
        <>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6, marginTop: 0 }}>
            One card per issue. The PDF sorts them by severity automatically.
          </p>
          {a.findings.map((f, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10,
              padding: 16, marginBottom: 14,
              borderLeft: `3px solid ${SEV_COLOR[f.severity] || C.muted}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  F-{String(i + 1).padStart(3, '0')}
                </span>
                <button onClick={() => removeFinding(i)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.red,
                }}>Remove</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select style={inp(0)} value={f.category} onChange={e => setFinding(i, 'category', e.target.value)}>
                    {a.categories.map(c => <option key={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Severity</label>
                  <select style={inp(0)} value={f.severity} onChange={e => setFinding(i, 'severity', e.target.value)}>
                    {['critical', 'high', 'medium', 'low'].map(s => (
                      <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Effort</label>
                  <select style={inp(0)} value={f.effort} onChange={e => setFinding(i, 'effort', e.target.value)}>
                    {['Low', 'Medium', 'High'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <label style={lbl}>Finding</label>
              <input style={inp(10)} type="text" placeholder="What is the issue?"
                value={f.finding} onChange={e => setFinding(i, 'finding', e.target.value)} />
              <label style={lbl}>Impact</label>
              <input style={inp(10)} type="text" placeholder="What's the risk if left unaddressed?"
                value={f.impact} onChange={e => setFinding(i, 'impact', e.target.value)} />
              <label style={lbl}>Recommendation</label>
              <input style={inp(0)} type="text" placeholder="What should be done?"
                value={f.recommendation} onChange={e => setFinding(i, 'recommendation', e.target.value)} />
            </div>
          ))}
          <button onClick={addFinding} style={{
            width: '100%', background: 'transparent', border: `1px dashed ${C.b1}`,
            borderRadius: 10, color: C.beige, padding: 14, cursor: 'pointer',
            fontSize: 14, fontFamily: 'Georgia,serif',
          }}>+ Add Finding</button>
        </>
      );

      case 'roadmap': return (
        <>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6, marginTop: 0 }}>
            Add action items per phase. Press Enter or click Add. Empty phases are omitted from the PDF.
          </p>
          {a.roadmap.map((phase, pi) => (
            <div key={pi} style={{
              background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10,
              padding: 16, marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: C.teal, fontWeight: 'bold', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 12 }}>
                {phase.phase}
              </div>
              {phase.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.teal, flexShrink: 0, marginTop: 2 }}>→</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.cream, lineHeight: 1.5 }}>{item}</span>
                  <button onClick={() => removeRoadmapItem(pi, ii)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: C.muted, flexShrink: 0, lineHeight: 1,
                  }}>✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input style={{ ...inp(0), flex: 1, marginBottom: 0, fontSize: 13 }}
                  type="text" placeholder="Add action item…"
                  value={roadmapInput[pi] || ''}
                  onChange={e => setRoadmapInput(prev => prev.map((v, i) => i === pi ? e.target.value : v))}
                  onKeyDown={e => e.key === 'Enter' && addRoadmapItem(pi)} />
                <button onClick={() => addRoadmapItem(pi)} style={{
                  background: C.beige, border: 'none', borderRadius: 8,
                  color: C.bg, padding: '0 14px', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'Georgia,serif', fontWeight: 'bold', flexShrink: 0,
                }}>Add</button>
              </div>
            </div>
          ))}
        </>
      );

      case 'report': {
        const data = pdfData;
        return (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Report Summary</div>
              <div style={{ fontSize: 20, color: C.white, fontFamily: 'Georgia,serif', marginBottom: 4 }}>{data.client.businessName}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Prepared for {data.client.contactName}</div>
              {[
                ['Report ID',           data.reportId],
                ['Date',                data.date],
                ['Categories Assessed', data.categories.length],
                ['Findings',            data.findings.length],
                ['Roadmap Phases',      data.roadmap.length],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.b0}` }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                  <span style={{ fontSize: 12, color: C.cream }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Overall Score</span>
                <span style={{ fontSize: 20, color: scoreColor(data.overallScore), fontWeight: 'bold', fontFamily: 'Georgia,serif' }}>
                  {data.overallScore}/100
                </span>
              </div>
            </div>

            <div style={{ width: '100%', marginBottom: 10 }}>
              <Suspense fallback={
                <button style={{ width: '100%', background: 'transparent', border: `1px solid ${C.b0}`,
                  borderRadius: 9, color: C.muted, padding: 13, fontSize: 14, fontFamily: 'Georgia,serif', cursor: 'default' }}>
                  Preparing PDF…
                </button>
              }>
                <DownloadPDFButton
                  doc={<AuditReportDocument data={data} />}
                  filename={pdfFilename}
                  label="Download Audit Report PDF"
                  variant="solid"
                  size="md"
                />
              </Suspense>
            </div>

            <button style={{
              width: '100%', background: 'transparent', border: `1px solid ${C.b0}`,
              borderRadius: 9, color: C.muted, padding: 12, fontSize: 14,
              fontFamily: 'Georgia,serif', cursor: 'pointer',
            }} onClick={() => { setA(blankState()); setStep(0); setRoadmapInput(['', '', '']); }}>
              ↩ Start new report
            </button>
          </>
        );
      }

      default: return null;
    }
  };

  const stepQ = {
    client:   "Who is this report for?",
    scores:   "How does each area score?",
    summary:  "Write the executive summary.",
    findings: "What did you find?",
    roadmap:  "What's the recommended roadmap?",
    report:   null,
  }[cur.id];

  // ── NAV BUTTONS ─────────────────────────────────────────────────────────────
  const backBtn = (
    <button style={{
      flex: 1, background: 'transparent', border: `1px solid ${C.b0}`, borderRadius: 9,
      color: C.muted, padding: 12, cursor: 'pointer', fontSize: 14, fontFamily: 'Georgia,serif',
    }} onClick={() => setStep(s => s - 1)}>← Back</button>
  );
  const nextBtn = (
    <button style={{
      flex: step > 0 ? 2 : 1, background: C.beige, border: 'none', borderRadius: 9,
      color: C.bg, padding: 12, cursor: 'pointer', fontSize: 15, fontWeight: 'bold', fontFamily: 'Georgia,serif',
    }} onClick={() => setStep(s => Math.min(s + 1, STEPS.length - 1))}>
      {step >= STEPS.length - 2 ? 'Generate Report →' : 'Continue →'}
    </button>
  );

  // ── LIVE PREVIEW ─────────────────────────────────────────────────────────────
  const livePreview = (
    <div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Live Preview</div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Overall Score</div>
        <div style={{ fontSize: 28, color: scoreColor(overallScore), fontWeight: 'bold' }}>
          {overallScore}<span style={{ fontSize: 12, color: C.muted }}>/100</span>
        </div>
      </div>
      {a.categories.map(cat => (
        <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 0', borderBottom: `1px solid ${C.b0}` }}>
          <span style={{ fontSize: 12, color: C.cream }}>{cat.name}</span>
          <span style={{ fontSize: 13, color: scoreColor(cat.score || 0), fontWeight: 'bold' }}>{cat.score || 0}</span>
        </div>
      ))}
      {a.findings.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Findings</div>
          {['critical', 'high', 'medium', 'low'].map(sev => {
            const count = a.findings.filter(f => f.severity === sev).length;
            if (!count) return null;
            return (
              <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 12, color: SEV_COLOR[sev] }}>{sev[0].toUpperCase() + sev.slice(1)}</span>
                <span style={{ fontSize: 12, color: C.cream }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: 'Georgia,serif', background: C.bg, minHeight: '100vh', color: C.cream, paddingTop: 64,
      ...(isDesktop ? {} : { display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative' }),
    }}>

      {/* Header */}
      <div style={{
        background: C.surf, borderBottom: `1px solid ${C.b0}`, padding: '13px 20px 0',
        flexShrink: 0, position: 'sticky', top: 64, zIndex: 50,
      }}>
        <div style={{ maxWidth: isDesktop ? 1040 : 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <span style={{ fontSize: 11, color: C.beige, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              ☕ Café Con Pan · Audit Builder
            </span>
            <span style={{
              fontSize: 9, background: 'rgba(184,80,62,0.13)', color: C.redL,
              border: '1px solid rgba(184,80,62,0.22)', borderRadius: 3, padding: '2px 7px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Internal</span>
          </div>
          <div style={{ height: 2, background: C.dim, borderRadius: 1, overflow: 'hidden', marginBottom: 7 }}>
            <div style={{ height: '100%', background: C.beige, borderRadius: 1, width: `${progress}%`, transition: 'width 0.38s ease' }} />
          </div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', paddingBottom: 10 }}>
            {cur.title} · {step + 1} of {STEPS.length}
          </div>
        </div>
      </div>

      {isDesktop ? (
        isFinal ? (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 40px 80px' }}>
            {renderStep()}
          </div>
        ) : (
          <div style={{ display: 'flex', maxWidth: 1040, margin: '0 auto', minHeight: 'calc(100vh - 136px)' }}>

            {/* Left: step */}
            <div style={{ flex: 1, padding: '32px 40px 40px', overflowY: 'auto' }}>
              {stepQ && (
                <h2 style={{ fontSize: 24, lineHeight: 1.3, color: C.white, fontFamily: 'Georgia,serif', margin: '0 0 24px 0' }}>
                  {stepQ}
                </h2>
              )}
              {renderStep()}
              <div style={{ display: 'flex', gap: 10, marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.b0}` }}>
                {step > 0 && backBtn}
                {nextBtn}
              </div>
            </div>

            {/* Right: live preview */}
            <div style={{
              width: 260, flexShrink: 0, padding: '28px 24px', borderLeft: `1px solid ${C.b0}`,
              position: 'sticky', top: 136, alignSelf: 'start',
              maxHeight: 'calc(100vh - 136px)', overflowY: 'auto',
            }}>
              {livePreview}
            </div>
          </div>
        )
      ) : (
        <>
          <div style={{ flex: 1, padding: '24px 20px 100px' }}>
            {stepQ && (
              <h2 style={{ fontSize: 21, lineHeight: 1.3, color: C.white, fontFamily: 'Georgia,serif', margin: '0 0 20px 0' }}>
                {stepQ}
              </h2>
            )}
            {renderStep()}
          </div>
          {!isFinal && (
            <div style={{
              position: 'sticky', bottom: 0, background: C.surf, borderTop: `1px solid ${C.b0}`,
              padding: '14px 20px', display: 'flex', gap: 10, flexShrink: 0, zIndex: 50,
            }}>
              {step > 0 && backBtn}
              {nextBtn}
            </div>
          )}
        </>
      )}
    </div>
  );
}
