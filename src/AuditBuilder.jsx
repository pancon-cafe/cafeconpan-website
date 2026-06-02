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

// ─── DISCOVERY QUESTIONS ───────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Devices & MDM', questions: [
    'How many devices and what types? (iPhones, Macs, iPads, etc.)',
    'Are devices enrolled in MDM? If yes, which platform?',
    'Business-owned or personal devices?',
    'Are all devices on the latest OS?',
    'Any devices that are old, broken, or unaccounted for?',
  ]},
  { name: 'Email & Communication', questions: [
    'What email platform? (Gmail, Outlook, personal @gmail, Yahoo, etc.)',
    'On a custom business domain? (e.g. name@theirbusiness.com)',
    'How many email users?',
    'Any spam filtering or security beyond the default?',
    'Shared inboxes or aliases in use? (info@, hello@, etc.)',
  ]},
  { name: 'Connectivity', questions: [
    'Business-grade internet or residential?',
    'Current provider and approximate speed?',
    'Wi-Fi secured? Guest network separate from business traffic?',
    'Mobile carrier — business account or personal?',
    'Any reliability issues, outages, or dead zones?',
  ]},
  { name: 'Apple Presence', questions: [
    'Enrolled in Apple Business Manager / Business Register?',
    'Apple Maps listing — claimed and verified?',
    'Apple Business Messages or Tap to Pay active?',
    'Apple Customer Number (ACN) established?',
    'Brand profile consistent across Apple surfaces?',
  ]},
  { name: 'Security & Compliance', questions: [
    'MFA/2FA enabled on all accounts?',
    'Password manager in use?',
    'When did they last review who has access to what?',
    'Any compliance requirements? (HIPAA, PCI, etc.)',
    'Any past security incidents — even minor ones?',
  ]},
  { name: 'Operations & Support', questions: [
    'Who handles IT support today?',
    'Is the tech environment documented anywhere?',
    'Critical files and data backed up? Where?',
    'How are licenses and renewals tracked? (domain, email, software)',
    'When something breaks — what\'s the current process?',
  ]},
];

const DEFAULT_ROADMAP = [
  { phase: 'Immediate (0–30 days)',   items: [] },
  { phase: 'Short-Term (30–90 days)', items: [] },
  { phase: 'Long-Term (90+ days)',    items: [] },
];

const STEPS = [
  { id: 'client',    title: 'Client Info' },
  { id: 'discovery', title: 'Discovery' },
  { id: 'review',    title: 'Review & Edit' },
  { id: 'report',    title: 'Report' },
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
    reportId, date: fmt(now),
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
      name: c.name, score: c.score || 0,
      status: scoreStatus(c.score || 0), summary: c.summary || '',
    })),
    findings: (a.findings || []).map((f, i) => ({
      id: `F-${String(i + 1).padStart(3, '0')}`,
      category: f.category || '', severity: f.severity || 'medium',
      finding: f.finding || '', impact: f.impact || '',
      recommendation: f.recommendation || '', effort: f.effort || 'Medium',
    })),
    roadmap: (a.roadmap || [])
      .map(p => ({ ...p, items: p.items.filter(Boolean) }))
      .filter(p => p.items.length > 0),
    opportunities: (a.opportunities || []).filter(o => o.headline || o.description),
  };
}

function blankState() {
  return {
    clientName: '', contactName: '', clientEmail: '', clientPhone: '',
    auditType: 'remote',
    discovery: Object.fromEntries(CATEGORIES.map(c => [c.name, ''])),
    categories: CATEGORIES.map(c => ({ name: c.name, score: 50, summary: '' })),
    goals: '',
    executiveSummary: '', overallScore: null, findings: [],
    roadmap: DEFAULT_ROADMAP.map(r => ({ ...r, items: [] })),
    opportunities: [],
    recommendedModules: null,
  };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function AuditBuilder() {
  const [a, setA]         = useState(() => {
    try {
      const raw = localStorage.getItem('ccp_grind_handoff');
      if (raw) { localStorage.removeItem('ccp_grind_handoff'); return { ...blankState(), ...JSON.parse(raw) }; }
    } catch {}
    return blankState();
  });
  const [step, setStep]   = useState(0);
  const [roadmapInput, setRoadmapInput] = useState(['', '', '']);
  const [generating, setGenerating]     = useState(false);
  const [genError, setGenError]         = useState(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 700);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 700);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cur     = STEPS[step];
  const isFinal = cur.id === 'report';

  function set(k, v) { setA(p => ({ ...p, [k]: v })); }
  function setDiscovery(name, val) {
    setA(p => ({ ...p, discovery: { ...p.discovery, [name]: val } }));
  }
  function setCat(i, key, val) {
    setA(p => { const cats = [...p.categories]; cats[i] = { ...cats[i], [key]: val }; return { ...p, categories: cats }; });
  }
  function setFinding(i, key, val) {
    setA(p => { const findings = [...p.findings]; findings[i] = { ...findings[i], [key]: val }; return { ...p, findings }; });
  }
  function addFinding() {
    setA(p => ({ ...p, findings: [...p.findings, {
      category: p.categories[0]?.name || '', severity: 'medium', effort: 'Medium',
      finding: '', impact: '', recommendation: '',
    }]}));
  }
  function removeFinding(i) { setA(p => ({ ...p, findings: p.findings.filter((_, j) => j !== i) })); }
  function addRoadmapItem(pi) {
    const val = roadmapInput[pi]?.trim();
    if (!val) return;
    setA(p => ({ ...p, roadmap: p.roadmap.map((r, i) => i === pi ? { ...r, items: [...r.items, val] } : r) }));
    setRoadmapInput(prev => prev.map((v, i) => i === pi ? '' : v));
  }
  function removeRoadmapItem(pi, ii) {
    setA(p => ({ ...p, roadmap: p.roadmap.map((r, i) => i === pi ? { ...r, items: r.items.filter((_, j) => j !== ii) } : r) }));
  }

  async function generateWithAI() {
    setGenerating(true);
    setGenError(null);

    const discoveryText = CATEGORIES.map(cat =>
      `### ${cat.name}\n${a.discovery[cat.name]?.trim() || '(no notes provided)'}`
    ).join('\n\n');

    const prompt = `You are an Apple technology consultant at Cafe Con Pan LLC preparing a technology audit report for a small business client. Based on the discovery notes below, generate a complete structured report.

CLIENT: ${a.clientName || 'Unknown'}
CONTACT: ${a.contactName || 'Unknown'}
AUDIT TYPE: ${a.auditType === 'onsite' ? 'On-Site' : 'Remote'}
GOALS & VISION: ${a.goals?.trim() || '(not provided)'}

DISCOVERY NOTES:
${discoveryText}

CCP SERVICE CATALOG (reference these in roadmap items with exact pricing):
- Foundation Core: $1,500 — business email+domain setup, Apple Business Manager, MDM first device, Apple Maps listing
- Module C1: $150/device — new device deployment, zero-touch MDM enrollment
- Module C2: $200/device — existing device enrollment (factory reset, manual MDM)
- Module D1: $300 — carrier audit & recommendation (billable regardless of outcome)
- Module D2: $300 add-on — carrier implementation (only if client proceeds after D1)
- Module E: $300 — ISP/business internet setup
- Connectivity Bundle (D1 + E): $475
- Module G: $450 — Apple Brands full layer (Branded Mail, Verify with Wallet, Tap to Pay branding, full Brand Profile)
- Module H: $600 — IVR setup (Twilio + AI call routing)
- Communications Bundle (D1 + D2 + H): $950
- Module F: $750 — business website (via Claude Code, webforms, payment integration)
- Module J: $400 + MSP — Apple Business Messages setup
- Security & Compliance (coming soon): endpoint protection, MFA/password manager setup
- Recurring Apple Operations: $35–40/device/mo (MDM, device management)
- Recurring Partner Access: $300–350/mo (check-ins, QBRs, SLA, procurement, renewals)
- IVR Management: $75/mo + usage

SCORING GUIDE (0–100):
- 0–25: Nothing in place, critical risk
- 26–45: Informal/ad-hoc, significant gaps
- 46–65: Partially deployed, inconsistent
- 66–80: Mostly in place, minor gaps
- 81–100: Fully deployed, monitored, documented

SEVERITY:
- critical: immediate threat to operations, data, or compliance
- high: significant risk, address within 30 days
- medium: notable gap, address within 90 days
- low: best practice improvement, flexible timeline

EFFORT:
- Low: under 2 hours
- Medium: 2–8 hours or 1–3 sessions
- High: multiple sessions or ongoing

Respond with ONLY valid JSON — no markdown, no code fences, no explanation — in this exact shape:
{
  "categories": [
    { "name": "Devices & MDM", "score": 0-100, "summary": "1-2 sentences on current state" },
    { "name": "Email & Communication", "score": 0-100, "summary": "1-2 sentences" },
    { "name": "Connectivity", "score": 0-100, "summary": "1-2 sentences" },
    { "name": "Apple Presence", "score": 0-100, "summary": "1-2 sentences" },
    { "name": "Security & Compliance", "score": 0-100, "summary": "1-2 sentences" },
    { "name": "Operations & Support", "score": 0-100, "summary": "1-2 sentences" }
  ],
  "executiveSummary": "2-4 paragraphs, professional tone, addresses the business situation directly",
  "findings": [
    {
      "category": "exact category name from the list above",
      "severity": "critical|high|medium|low",
      "finding": "clear statement of the specific issue",
      "impact": "what happens if left unaddressed",
      "recommendation": "specific action, reference CCP service + price where applicable",
      "effort": "Low|Medium|High"
    }
  ],
  "roadmap": [
    { "phase": "Immediate (0–30 days)", "items": ["action item, include CCP service + price where applicable"] },
    { "phase": "Short-Term (30–90 days)", "items": ["..."] },
    { "phase": "Long-Term (90+ days)", "items": ["..."] }
  ],
  "opportunities": [
    {
      "headline": "short, specific title (5-8 words)",
      "description": "2-3 sentences. Forward-looking and specific to this business and industry. Connect naturally to a CCP service without making it a sales pitch — lead with the benefit to the client."
    }
  ],
  "recommendedModules": {
    "A": false,
    "B": false,
    "D1": false,
    "D2": false,
    "E": false,
    "G": false,
    "H": false,
    "F": false,
    "J": false,
    "c1": 0,
    "c2": 0,
    "recurring": false
  }
}

Generate 3-5 opportunities — these are NOT problems, they are possibilities. Specific ways this business could use technology to grow, differentiate, or operate better based on their industry, goals, and current state. Each should connect naturally to a CCP service and reflect the client's stated goals where relevant.

Set each recommendedModules flag to true/count if that service appears in the roadmap. D2 only true if D1 is also true. c1 = number of new devices to deploy, c2 = number of existing devices to enroll. recurring = true if you recommend the Partner relationship.

Generate 3–8 findings. If notes are sparse for a category, score conservatively and note further assessment is needed. Include CCP service pricing in roadmap items where applicable.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const result = await res.json();
      const raw = result.content[0].text.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
      const parsed = JSON.parse(raw);

      setA(p => ({
        ...p,
        categories: CATEGORIES.map(cat => {
          const gen = parsed.categories?.find(c => c.name === cat.name);
          return gen
            ? { name: cat.name, score: Math.min(100, Math.max(0, gen.score || 50)), summary: gen.summary || '' }
            : { name: cat.name, score: 50, summary: '' };
        }),
        executiveSummary: parsed.executiveSummary || '',
        findings: (parsed.findings || []).map(f => ({
          category:       f.category       || CATEGORIES[0].name,
          severity:       f.severity       || 'medium',
          finding:        f.finding        || '',
          impact:         f.impact         || '',
          recommendation: f.recommendation || '',
          effort:         f.effort         || 'Medium',
        })),
        roadmap: DEFAULT_ROADMAP.map(r => {
          const gen = parsed.roadmap?.find(rp => rp.phase === r.phase);
          return gen ? { ...r, items: gen.items || [] } : { ...r, items: [] };
        }),
        opportunities: (parsed.opportunities || []).map(o => ({
          headline: o.headline || '',
          description: o.description || '',
        })),
        recommendedModules: parsed.recommendedModules || null,
      }));

    } catch (err) {
      console.error('AI generation error:', err);
      setGenError(err.message || 'Generation failed. Check your API key or try again.');
    } finally {
      setGenerating(false);
    }
  }

  function buildQuoteFromAudit() {
    const recs = a.recommendedModules || {};
    const D1 = !!recs.D1, D2 = !!recs.D2, E = !!recs.E, H = !!recs.H;

    let connectivity = 'none';
    if (D1 && D2 && H) connectivity = 'comms';
    else if (D1 && E)  connectivity = 'connectivity';
    else if (D1 && D2) connectivity = 'd1d2';
    else if (D1)       connectivity = 'd1';

    const prefill = {
      clientName:  a.clientName,
      contactName: a.contactName,
      clientEmail: a.clientEmail,
      clientPhone: a.clientPhone,
      stage:       'operational',
      audit:       a.auditType === 'onsite' ? 'onsite' : 'remote',
      A: !!recs.A, B: !!recs.B,
      connectivity,
      H: H && connectivity !== 'comms',
      G: !!recs.G, F: !!recs.F, J: !!recs.J,
      c1: recs.c1 || 0, c2: recs.c2 || 0,
      recurring: !!recs.recurring,
    };

    localStorage.setItem('ccp_quote_prefill', JSON.stringify(prefill));
    window.location.hash = '#quote-builder';
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
    fontFamily: "'Nunito',sans-serif", marginBottom: mb,
  });
  const lbl = {
    fontSize: 11, color: C.muted, textTransform: 'uppercase',
    letterSpacing: '0.1em', display: 'block', marginBottom: 6,
  };
  const ta = (rows = 4, mb = 14) => ({
    ...inp(mb), resize: 'vertical', minHeight: rows * 22 + 22, lineHeight: 1.6,
  });

  function sectionHead(title) {
    return (
      <div style={{
        fontSize: 10, color: C.teal, textTransform: 'uppercase',
        letterSpacing: '0.18em', fontWeight: 700,
        marginTop: 28, marginBottom: 14,
        paddingTop: 18, borderTop: `1px solid ${C.b0}`,
      }}>
        {title}
      </div>
    );
  }

  // ── STEP CONTENT ────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (cur.id) {

      case 'client': return (
        <>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
            Remote audits are $250 · On-site audits are $450 (+ $150 travel fee).
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {['remote', 'onsite'].map(t => (
              <button key={t} onClick={() => set('auditType', t)} style={{
                flex: 1, background: a.auditType === t ? C.beige : 'transparent',
                border: `1px solid ${a.auditType === t ? C.beige : C.b1}`,
                color: a.auditType === t ? C.bg : C.muted,
                borderRadius: 8, padding: '10px 0', cursor: 'pointer',
                fontSize: 13, fontFamily: "'Nunito',sans-serif",
                fontWeight: a.auditType === t ? 'bold' : 'normal',
                textTransform: 'capitalize',
              }}>{t === 'onsite' ? 'On-Site' : 'Remote'}</button>
            ))}
          </div>
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
          <input style={inp(20)} type="tel" placeholder="e.g. (703) 555-0100"
            value={a.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
          <label style={lbl}>Goals & Vision</label>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 8, lineHeight: 1.6 }}>
            What are they hoping to accomplish or build in the next 12 months?
          </p>
          <textarea style={ta(3, 0)}
            placeholder="e.g. They want to open a second location, streamline how staff communicates with customers, and stop relying on personal phones for business…"
            value={a.goals} onChange={e => set('goals', e.target.value)} />
        </>
      );

      case 'discovery': return (
        <>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 0, marginBottom: 20, lineHeight: 1.6 }}>
            Write whatever you observed — rough notes, shorthand, fragments are fine.
            The questions are prompts, not required fields.
            AI will synthesize everything into scores, findings, and a roadmap.
          </p>
          {CATEGORIES.map(cat => (
            <div key={cat.name} style={{
              background: C.card, border: `1px solid ${C.b0}`,
              borderRadius: 10, padding: 16, marginBottom: 14,
            }}>
              <div style={{ fontSize: 13, color: C.beige, fontWeight: 'bold', marginBottom: 10 }}>
                {cat.name}
              </div>
              <ul style={{ margin: '0 0 12px 0', padding: '0 0 0 16px' }}>
                {cat.questions.map(q => (
                  <li key={q} style={{ fontSize: 11, color: C.muted, marginBottom: 4, lineHeight: 1.5 }}>
                    {q}
                  </li>
                ))}
              </ul>
              <textarea
                style={{ ...ta(4, 0), fontSize: 14 }}
                placeholder="Write your observations here…"
                value={a.discovery[cat.name] || ''}
                onChange={e => setDiscovery(cat.name, e.target.value)}
              />
            </div>
          ))}
        </>
      );

      case 'review': return (
        <>
          {/* AI Generate CTA */}
          <div style={{
            background: 'rgba(90,158,150,0.06)', border: `1px solid rgba(90,158,150,0.25)`,
            borderRadius: 10, padding: 20, marginBottom: 16, textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: C.cream, marginBottom: 8, fontFamily: "'Nunito',sans-serif" }}>
              Generate with AI
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 16px' }}>
              Reads your discovery notes and fills in scores, findings, executive summary,
              and a prioritized roadmap with real CCP pricing. Everything stays editable.
            </div>
            {genError && (
              <div style={{ fontSize: 12, color: C.red, marginBottom: 12, padding: '8px 12px', background: 'rgba(184,80,62,0.1)', borderRadius: 6 }}>
                {genError}
              </div>
            )}
            <button
              onClick={generateWithAI}
              disabled={generating}
              style={{
                background: generating ? 'rgba(90,158,150,0.2)' : C.teal,
                border: 'none', borderRadius: 8, padding: '11px 32px',
                color: generating ? 'rgba(90,158,150,0.6)' : C.bg,
                cursor: generating ? 'not-allowed' : 'pointer',
                fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 'bold',
                transition: 'background 0.2s',
              }}
            >
              {generating ? 'Generating…' : 'Generate Report Draft'}
            </button>
          </div>

          {/* Category Scores */}
          {sectionHead('Category Scores')}
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

          {/* Overall Score */}
          <div style={{
            background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10,
            padding: '14px 16px', marginTop: 8,
          }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Overall Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 28, color: scoreColor(overallScore), fontWeight: 'bold' }}>
                {overallScore}<span style={{ fontSize: 12, color: C.muted, fontWeight: 'normal' }}>/100</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>avg of categories</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="score-override" checked={a.overallScore != null}
                onChange={e => set('overallScore', e.target.checked ? avgScore : null)} />
              <label htmlFor="score-override" style={{ ...lbl, display: 'inline', marginBottom: 0 }}>
                Override manually
              </label>
              {a.overallScore != null && (
                <input type="number" min="0" max="100"
                  style={{ ...inp(0), width: 80, display: 'inline', marginBottom: 0 }}
                  value={a.overallScore}
                  onChange={e => set('overallScore', Math.min(100, Math.max(0, +e.target.value)))} />
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {sectionHead('Executive Summary')}
          <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 12, lineHeight: 1.6 }}>
            2–4 paragraphs on the overall state of their tech. First thing the client reads.
          </p>
          <textarea style={ta(10, 6)}
            placeholder="e.g. Main Street Dental has a solid foundational setup with a few critical gaps that pose security and operational risk if left unaddressed…"
            value={a.executiveSummary}
            onChange={e => set('executiveSummary', e.target.value)} />
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
            {a.executiveSummary.length > 0
              ? `${a.executiveSummary.length} characters`
              : 'Aim for 300–600 characters'}
          </div>

          {/* Findings */}
          {sectionHead('Findings')}
          <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
            One card per issue. PDF sorts by severity automatically.
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
                    {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
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
            fontSize: 14, fontFamily: "'Nunito',sans-serif", marginBottom: 8,
          }}>+ Add Finding</button>

          {/* Opportunities */}
          {sectionHead('Opportunities')}
          <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
            Possibilities — not problems. What could this business build or become with the right tech?
          </p>
          {a.opportunities.map((opp, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.b0}`, borderRadius: 10,
              padding: 16, marginBottom: 12, borderLeft: `3px solid ${C.teal}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Opportunity {i + 1}
                </span>
                <button onClick={() => setA(p => ({ ...p, opportunities: p.opportunities.filter((_, j) => j !== i) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.muted }}>
                  Remove
                </button>
              </div>
              <input style={inp(10)} type="text" placeholder="Headline (e.g. Appointment Confirmations via Apple Messages)"
                value={opp.headline}
                onChange={e => setA(p => { const ops = [...p.opportunities]; ops[i] = { ...ops[i], headline: e.target.value }; return { ...p, opportunities: ops }; })} />
              <textarea style={ta(3, 0)} placeholder="2-3 sentences on what's possible and why it matters for this business…"
                value={opp.description}
                onChange={e => setA(p => { const ops = [...p.opportunities]; ops[i] = { ...ops[i], description: e.target.value }; return { ...p, opportunities: ops }; })} />
            </div>
          ))}
          <button onClick={() => setA(p => ({ ...p, opportunities: [...p.opportunities, { headline: '', description: '' }] }))}
            style={{
              width: '100%', background: 'transparent', border: `1px dashed ${C.b1}`,
              borderRadius: 10, color: C.teal, padding: 14, cursor: 'pointer',
              fontSize: 14, fontFamily: "'Nunito',sans-serif", marginBottom: 8,
            }}>+ Add Opportunity</button>

          {/* Roadmap */}
          {sectionHead('Roadmap')}
          <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 20, lineHeight: 1.6 }}>
            Add action items per phase. Empty phases are omitted from the PDF.
          </p>
          {a.roadmap.map((phase, pi) => (
            <div key={pi} style={{
              background: C.card, border: `1px solid ${C.b0}`,
              borderRadius: 10, padding: 16, marginBottom: 14,
            }}>
              <div style={{
                fontSize: 11, color: C.teal, fontWeight: 'bold',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
              }}>
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
                  fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 'bold', flexShrink: 0,
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
            <div style={{
              background: C.card, border: `1px solid ${C.b0}`,
              borderRadius: 10, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Report Summary
              </div>
              <div style={{ fontSize: 20, color: C.white, fontFamily: "'Nunito',sans-serif", marginBottom: 4 }}>
                {data.client.businessName}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                Prepared for {data.client.contactName}
              </div>
              {[
                ['Report ID',           data.reportId],
                ['Date',                data.date],
                ['Audit Type',          a.auditType === 'onsite' ? 'On-Site' : 'Remote'],
                ['Categories Assessed', data.categories.length],
                ['Findings',            data.findings.length],
                ['Roadmap Phases',      data.roadmap.length],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '7px 0', borderBottom: `1px solid ${C.b0}`,
                }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                  <span style={{ fontSize: 12, color: C.cream }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Overall Score</span>
                <span style={{
                  fontSize: 20, color: scoreColor(data.overallScore),
                  fontWeight: 'bold', fontFamily: "'Nunito',sans-serif",
                }}>
                  {data.overallScore}/100
                </span>
              </div>
            </div>

            <div style={{ width: '100%', marginBottom: 10 }}>
              <Suspense fallback={
                <button style={{ width: '100%', background: 'transparent', border: `1px solid ${C.b0}`, borderRadius: 9, color: C.muted, padding: 13, fontSize: 14, fontFamily: "'Nunito',sans-serif", cursor: 'default' }}>
                  Preparing PDF…
                </button>
              }>
                <DownloadPDFButton
                  doc={<AuditReportDocument data={data} />}
                  filename={pdfFilename}
                  label="Download Full Report PDF"
                  variant="solid"
                  size="md"
                />
              </Suspense>
            </div>

            <div style={{ width: '100%', marginBottom: 10 }}>
              <Suspense fallback={
                <button style={{ width: '100%', background: 'transparent', border: `1px solid ${C.b0}`, borderRadius: 9, color: C.muted, padding: 13, fontSize: 14, fontFamily: "'Nunito',sans-serif", cursor: 'default' }}>
                  Preparing Teaser…
                </button>
              }>
                <DownloadPDFButton
                  doc={<AuditReportDocument data={data} teaser={true} />}
                  filename={pdfFilename.replace('.pdf', '-Teaser.pdf')}
                  label="Download Teaser PDF"
                  variant="outline"
                  size="md"
                />
              </Suspense>
            </div>

            <button onClick={buildQuoteFromAudit} style={{
              width: '100%', background: C.teal, border: 'none',
              borderRadius: 9, color: C.bg, padding: 13, fontSize: 14,
              fontFamily: "'Nunito',sans-serif", fontWeight: 'bold', cursor: 'pointer',
              marginBottom: 10,
            }}>
              Build Quote from This Audit →
            </button>

            <button style={{
              width: '100%', background: 'transparent', border: `1px solid ${C.b0}`,
              borderRadius: 9, color: C.muted, padding: 12, fontSize: 14,
              fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
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
    client:    'Who is this audit for?',
    discovery: 'What did you observe?',
    review:    'Review and edit the report.',
    report:    null,
  }[cur.id];

  // ── NAV BUTTONS ─────────────────────────────────────────────────────────────
  const backBtn = (
    <button style={{
      flex: 1, background: 'transparent', border: `1px solid ${C.b0}`, borderRadius: 9,
      color: C.muted, padding: 12, cursor: 'pointer', fontSize: 14, fontFamily: "'Nunito',sans-serif",
    }} onClick={() => setStep(s => s - 1)}>← Back</button>
  );
  const nextBtn = (
    <button style={{
      flex: step > 0 ? 2 : 1, background: C.beige, border: 'none', borderRadius: 9,
      color: C.bg, padding: 12, cursor: 'pointer', fontSize: 15, fontWeight: 'bold',
      fontFamily: "'Nunito',sans-serif",
    }} onClick={() => setStep(s => Math.min(s + 1, STEPS.length - 1))}>
      {step >= STEPS.length - 2 ? 'Finalize Report →' : 'Continue →'}
    </button>
  );

  // ── LIVE PREVIEW ─────────────────────────────────────────────────────────────
  const livePreview = (
    <div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
        Live Preview
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Overall Score</div>
        <div style={{ fontSize: 28, color: scoreColor(overallScore), fontWeight: 'bold' }}>
          {overallScore}<span style={{ fontSize: 12, color: C.muted }}>/100</span>
        </div>
      </div>

      {cur.id === 'discovery'
        ? CATEGORIES.map(cat => {
            const filled = !!(a.discovery[cat.name]?.trim());
            return (
              <div key={cat.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: `1px solid ${C.b0}`,
              }}>
                <span style={{ fontSize: 12, color: C.cream }}>{cat.name}</span>
                <span style={{ fontSize: 11, color: filled ? C.teal : C.muted }}>
                  {filled ? '✓' : '—'}
                </span>
              </div>
            );
          })
        : a.categories.map(cat => (
            <div key={cat.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: `1px solid ${C.b0}`,
            }}>
              <span style={{ fontSize: 12, color: C.cream }}>{cat.name}</span>
              <span style={{ fontSize: 13, color: scoreColor(cat.score || 0), fontWeight: 'bold' }}>
                {cat.score || 0}
              </span>
            </div>
          ))
      }

      {a.findings.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Findings
          </div>
          {['critical', 'high', 'medium', 'low'].map(sev => {
            const count = a.findings.filter(f => f.severity === sev).length;
            if (!count) return null;
            return (
              <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 12, color: SEV_COLOR[sev] }}>
                  {sev[0].toUpperCase() + sev.slice(1)}
                </span>
                <span style={{ fontSize: 12, color: C.cream }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
      {a.opportunities.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: `1px solid ${C.b0}` }}>
          <span style={{ fontSize: 12, color: C.teal }}>Opportunities</span>
          <span style={{ fontSize: 12, color: C.cream }}>{a.opportunities.length}</span>
        </div>
      )}
    </div>
  );

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'Nunito',sans-serif", background: C.bg, minHeight: '100vh',
      color: C.cream, paddingTop: 64,
      ...(isDesktop ? {} : { display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative' }),
    }}>

      {/* Header */}
      <div style={{
        background: C.surf, borderBottom: `1px solid ${C.b0}`, padding: '13px 20px 0',
        flexShrink: 0, position: 'sticky', top: 64, zIndex: 50,
      }}>
        <div style={{ maxWidth: isDesktop ? 1040 : 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
            {[['The Grind','the-grind'],['The Cupping','audit-builder'],['The Pour','quote-builder']].map(([name, hash], i) => (
              <span key={hash} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ fontSize: 9, color: C.muted }}>→</span>}
                <button onClick={() => { window.location.hash = `#${hash}`; }}
                  disabled={name === 'The Cupping'}
                  style={{ background: 'none', border: 'none', padding: '0 0 2px', cursor: name === 'The Cupping' ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: name === 'The Cupping' ? C.teal : `${C.muted}`, borderBottom: name === 'The Cupping' ? `1px solid ${C.teal}` : '1px solid transparent', transition: 'color 0.15s' }}
                  onMouseEnter={e => { if (name !== 'The Cupping') e.currentTarget.style.color = C.cream; }}
                  onMouseLeave={e => { if (name !== 'The Cupping') e.currentTarget.style.color = C.muted; }}
                >{name}</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <span style={{ fontSize: 11, color: C.beige, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              ☕ Café Con Pan · The Cupping
            </span>
            <span style={{
              fontSize: 9, background: 'rgba(184,80,62,0.13)', color: C.redL,
              border: '1px solid rgba(184,80,62,0.22)', borderRadius: 3,
              padding: '2px 7px', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Internal</span>
          </div>
          <div style={{ height: 2, background: C.dim, borderRadius: 1, overflow: 'hidden', marginBottom: 7 }}>
            <div style={{
              height: '100%', background: C.beige, borderRadius: 1,
              width: `${progress}%`, transition: 'width 0.38s ease',
            }} />
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

            {/* Left: step form */}
            <div style={{ flex: 1, padding: '32px 40px 40px', overflowY: 'auto' }}>
              {stepQ && (
                <h2 style={{ fontSize: 24, lineHeight: 1.3, color: C.white, fontFamily: "'Lilita One',cursive", margin: '0 0 24px 0' }}>
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
              <h2 style={{ fontSize: 21, lineHeight: 1.3, color: C.white, fontFamily: "'Lilita One',cursive", margin: '0 0 20px 0' }}>
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
