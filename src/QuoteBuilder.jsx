import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { DownloadPDFButton } from "./pdf/DownloadButton";

const QuoteDocument = lazy(() => import("./pdf/QuoteDocument"));

// ─── TOKENS ────────────────────────────────────────────────────────────────────
const C = {
  bg:    '#0D0702', surf:  '#1B0E07', card:  '#241408', cardH: '#2D1B0E',
  b0:    'rgba(212,169,122,0.13)', b1: 'rgba(212,169,122,0.28)',
  b2:    'rgba(212,169,122,0.55)',
  beige: '#D4A97A', beigeD: '#B88C5A', cream: '#E0C89A',
  muted: '#7A5830', dim:   '#3D2818', white: '#F5EDD8',
  teal:  '#5A9E96', tealL: '#80C0B8',
  red:   '#B8503E', redL:  '#D47060',
  blush: '#D89090', green: '#68AF88',
};

// ─── PRICING ───────────────────────────────────────────────────────────────────
const P = {
  audit: { remote: 250, onsite: 450 },
  foundation: 1500,
  A:150, B:175, C1:150, C2:200, C3:150, C4:150,
  D1:300, D2:300, E:300, F:750, G:450, H:600, J:400,
  flagship: { complete:{price:4200,dev:3}, fleet:{price:5000,dev:10} },
  ops: { m2m:40, annual:35, '2yr':30 },
  pa:  { m2m:350, annual:300, '2yr':250 },
  comm:{ dev:25, pa:150 },
  ivr:75, extra:150,
};

// ─── QUOTE ENGINE ──────────────────────────────────────────────────────────────
function calcQuote(a) {
  const lines = []; let savings = 0;

  if (a.audit==='remote') lines.push({id:'aud-r',label:'Tier 0 — Audit (Remote)',price:P.audit.remote,tag:'audit'});
  if (a.audit==='onsite') lines.push({id:'aud-o',label:'Tier 0 — Audit (On-site)',price:P.audit.onsite,tag:'audit'});

  const fg = a.flagship;
  if (fg==='complete'||fg==='fleet') {
    const f=P.flagship[fg];
    lines.push({id:'fg',label:`Flagship — OFB ${fg==='complete'?'Complete (3 devices)':'Fleet (10 devices)'}`,price:f.price,tag:'flagship'});
    const ex=+(a.extraDev||0);
    if(ex>0) lines.push({id:'ex',label:`Extra Devices ×${ex} @ $150`,price:ex*P.extra,tag:'device'});
  } else {
    lines.push({id:'fnd',label:'Tier 1 — Foundation Core',price:P.foundation,tag:'foundation'});
    const cm={d1:{D1:1},connectivity:{D1:1,E:1},d1d2:{D1:1,D2:1},comms:{D1:1,D2:1}}[a.connectivity]||{};
    const D1=!!cm.D1, D2=!!cm.D2, E=!!cm.E;
    const H=a.connectivity==='comms'||a.H===true;
    const c1=+(a.c1||0),c2=+(a.c2||0),c3=+(a.c3||0),c4=+(a.c4||0);
    const used=new Set();

    if(D1&&D2&&H){ lines.push({id:'b-cm',label:'Bundle — Communications (D1 + D2 + H)',price:950,saving:250,tag:'bundle'}); savings+=250; used.add('D1');used.add('D2');used.add('H'); }
    else if(D1&&E){ lines.push({id:'b-cn',label:'Bundle — Connectivity (D1 + E)',price:475,saving:125,tag:'bundle'}); savings+=125; used.add('D1');used.add('E'); }
    if(a.A&&a.B){ lines.push({id:'b-lp',label:'Bundle — Launch Prep (A + B)',price:275,saving:50,tag:'bundle'}); savings+=50; used.add('A');used.add('B'); }
    else if(a.B&&c1>=1){ lines.push({id:'b-oe',label:'Bundle — OFB Essentials (B + C1×1)',price:300,saving:25,tag:'bundle'}); savings+=25; used.add('B');used.add('C1_1'); }
    if(c1>=3&&a.G){ lines.push({id:'b-ap',label:'Bundle — Apple Presence (C1×3 + G)',price:750,saving:150,tag:'bundle'}); savings+=150; used.add('G');used.add('C1_3'); }

    let rC1=c1; if(used.has('C1_3'))rC1-=3; else if(used.has('C1_1'))rC1-=1;
    if(rC1>0) lines.push({id:'c1r',label:`C1 — New Device Deploy ×${rC1}`,price:rC1*P.C1,tag:'device'});

    if(!used.has('A')&&a.A) lines.push({id:'ma',label:'A — Business Formation Guidance',price:P.A,tag:'module'});
    if(!used.has('B')&&a.B) lines.push({id:'mb',label:'B — Banking & Payments',price:P.B,tag:'module'});
    if(!used.has('D1')&&D1) lines.push({id:'mD1',label:'D1 — Carrier Audit',price:P.D1,tag:'module'});
    if(!used.has('D2')&&D2) lines.push({id:'mD2',label:'D2 — Carrier Implementation',price:P.D2,tag:'module'});
    if(!used.has('E')&&E)   lines.push({id:'mE', label:'E — ISP Setup',price:P.E,tag:'module'});
    if(!used.has('H')&&H)   lines.push({id:'mH', label:'H — IVR Setup',price:P.H,tag:'module'});
    if(!used.has('G')&&a.G) lines.push({id:'mG', label:'G — Apple Brands, Full Layer',price:P.G,tag:'module'});
    if(a.F) lines.push({id:'mF',label:'F — Website (Basic)',price:P.F,tag:'module'});
    if(a.J) lines.push({id:'mJ',label:'J — Apple Business Messages',price:P.J,tag:'module'});
    if(c2>0) lines.push({id:'c2',label:`C2 — Existing Device Deploy ×${c2}`,price:c2*P.C2,tag:'device'});
    if(c3>0) lines.push({id:'c3',label:`C3 — On-Site Deployment ×${c3} visit${c3>1?'s':''}`,price:c3*P.C3,tag:'device'});
    if(c4>0) lines.push({id:'c4',label:`C4 — Procurement Coord ×${c4} order${c4>1?'s':''}`,price:c4*P.C4,tag:'device'});
  }

  let disc=0;
  if(a.modifier==='founding') disc=lines.filter(l=>l.tag!=='audit').reduce((s,l)=>s+l.price,0)*0.5;
  const sub=lines.reduce((s,l)=>s+l.price,0);
  const net=sub-disc;
  const recLines=[]; let mo=0;
  if(a.recurring===true){
    const comm=a.commitment||'annual'; const dev=+(a.recDev||3);
    const isCom=a.modifier==='community';
    const oR=isCom?P.comm.dev:P.ops[comm]; const pR=isCom?P.comm.pa:P.pa[comm];
    recLines.push({label:`Apple Operations (${dev} devices × $${oR}/mo)`,price:dev*oR});
    recLines.push({label:`Partner Access — ${comm==='m2m'?'Month-to-month':comm==='annual'?'Annual':'2-Year'}`,price:pR});
    mo=dev*oR+pR;
    if(a.ivrMgmt===true){ recLines.push({label:'IVR Management (base + usage)',price:P.ivr}); mo+=P.ivr; }
  }
  return {lines,savings,disc,sub,net,recLines,mo,yr:mo*12,ltv:net+mo*36};
}

function getSteps(a) {
  const ivrInConn=a.connectivity==='comms';
  const hasIVR=a.H===true||ivrInConn;
  let noFg=0;
  try{ noFg=calcQuote({...a,flagship:undefined,modifier:undefined}).lines.filter(l=>l.tag!=='audit').reduce((s,l)=>s+l.price,0); }catch(e){}
  const all=[
    {id:'client',      title:'Client'},
    {id:'stage',       title:'Stage'},
    {id:'audit',       title:'Audit'},
    {id:'formation',   title:'Foundation',   show:a.stage==='pre'||a.stage==='operational'},
    {id:'apple',       title:'Apple'},
    {id:'connectivity',title:'Connectivity'},
    {id:'ivr',         title:'IVR',          show:!ivrInConn},
    {id:'digital',     title:'Digital'},
    {id:'flagship',    title:'Flagship',     show:noFg>=2500},
    {id:'recurring',   title:'Partner'},
    {id:'recConfig',   title:'Retainer',     show:a.recurring===true},
    {id:'ivrMgmt',     title:'IVR Mgmt',     show:a.recurring===true&&hasIVR},
    {id:'modifier',    title:'Pricing'},
    {id:'summary',     title:'Quote'},
  ];
  const vis=all.filter(s=>s.show!==false);
  return vis.map((s,i)=>({...s,progress:Math.round((i+1)/vis.length*100)}));
}

const fmt=n=>'$'+Math.round(+(n)||0).toLocaleString();

function buildText(a,q){
  let t=`CAFÉ CON PAN LLC\nTOTAL INVESTMENT SUMMARY\n${'─'.repeat(44)}\n`;
  t+=`Client: ${a.clientName||'—'}  ·  ${a.vertical||'—'}\n`;
  t+=`Stage: ${a.stage==='pre'?'Pre-launch':a.stage==='operational'?'Operational':'Targeted'}\n`;
  t+=`Rate: ${a.modifier==='founding'?'Founding Client (50% off one-time)':a.modifier==='community'?'Community Rate':'Founding Partner Standard'}\n`;
  t+=`${'─'.repeat(44)}\nONE-TIME FEES\n`;
  q.lines.forEach(l=>{t+=`  ${l.label}: ${fmt(l.price)}\n`;});
  if(q.savings>0) t+=`  Bundle savings: −${fmt(q.savings)}\n`;
  if(q.disc>0) t+=`  Founding Client discount (50%): −${fmt(q.disc)}\n`;
  t+=`  ${'─'.repeat(30)}\n  TOTAL: ${fmt(q.net)}\n`;
  t+=`\nPAYMENT SCHEDULE\n`;
  if(q.net<2000){t+=`  50% at start: ${fmt(q.net*0.5)}\n  50% at completion: ${fmt(q.net*0.5)}\n`;}
  else{t+=`  50% at start: ${fmt(q.net*0.5)}\n  25% at midpoint: ${fmt(q.net*0.25)}\n  25% at completion: ${fmt(q.net*0.25)}\n`;}
  if(a.recurring===true&&q.recLines.length){
    t+=`\nMONTHLY RECURRING\n`;
    q.recLines.forEach(l=>{t+=`  ${l.label}: ${fmt(l.price)}/mo\n`;});
    t+=`  ${'─'.repeat(30)}\n  TOTAL: ${fmt(q.mo)}/mo  (${fmt(q.yr)}/yr)\n`;
    t+=`\n36-MONTH CLIENT LTV: ${fmt(q.ltv)}\n`;
  }
  t+=`\n${'─'.repeat(44)}\nThird-party pass-through costs paid directly by client.\nFounding Partner rates — rate-locked for life of contract.\nCONFIDENTIAL — not for client distribution.\nGenerated by Café Con Pan Quote Builder`;
  return t;
}

// ─── PDF DATA BUILDER ─────────────────────────────────────────────────────────
const TAG_CATEGORY = {
  audit:      'Audit',
  flagship:   'Flagship',
  foundation: 'Foundation',
  bundle:     'Bundle',
  module:     'Service',
  device:     'Apple Devices',
};

const CLIENT_DESC = {
  'aud-r': 'Technology assessment and written scorecard delivered within 24 hours. Includes a screen-share review session. Fee credits in full toward any engagement of $500+ if signed within 30 days.',
  'aud-o': 'In-person technology walk-through and full written assessment report. Includes on-site visit and travel.',
  'fnd':   'Apple Business Manager setup, first device enrollment, and MDM configuration. The operational foundation for all Apple-managed services.',
  'fg':    'All-inclusive Apple Business setup — Foundation, device deployment, brand layer, connectivity, and communications at a single fixed price.',
  'ex':    'Additional device zero-touch enrollment and configuration beyond the included package allotment.',
  'b-cm':  'Carrier plan audit, carrier switch or new account implementation, and AI-powered business phone system — delivered as a bundled service at a reduced rate.',
  'b-cn':  'Carrier plan audit and business internet setup — delivered as a bundled service at a reduced rate.',
  'b-lp':  'Business formation guidance and banking & payments setup — delivered as a bundled service at a reduced rate.',
  'b-oe':  'Banking & payments setup and initial device deployment — delivered as a bundled service at a reduced rate.',
  'b-ap':  'Multi-device zero-touch deployment and full Apple brand configuration — delivered as a bundled service at a reduced rate.',
  'c1r':   'Zero-touch enrollment and configuration for new Apple devices via Apple Business Manager.',
  'ma':    'LLC/EIN filing guidance, business name availability check, and virtual mailbox advisory. Client completes the actual state filing.',
  'mb':    'Business banking referral and account setup, payment processor configuration (Helcim or Stripe), and Tap to Pay activation.',
  'mD1':   'Carrier plan analysis — rate comparison across providers, savings projection, and written findings report. Billable regardless of whether a switch is executed.',
  'mD2':   'Carrier switch execution — new business account setup, number porting, or plan restructuring on the client\'s behalf.',
  'mE':    'Business internet provider evaluation, referral coordination, install scheduling, and service verification.',
  'mH':   'AI-powered business phone system setup — custom call routing, caller ID (CNAM) configuration, and post-deployment testing.',
  'mG':    'Full Apple brand layer — Branded Mail, Verify with Apple Wallet, Tap to Pay branding, and complete Apple Maps Business Profile.',
  'mF':    'Business website design and development — contact forms, payment integration, and brand-consistent design. Complex builds are quoted separately.',
  'mJ':    'Apple Messages for Business registration and Heymarket MSP setup for direct customer messaging on Apple platforms.',
  'c2':    'Manual MDM enrollment and configuration for existing Apple devices already in use.',
  'c3':    'On-site technician visit for hands-on device deployment, configuration, and staff orientation.',
  'c4':    'Hardware procurement coordination — sourcing, ordering, and delivery logistics management.',
};

const DEVICE_UNIT_PRICES = { c1r:150, c2:200, c3:150, c4:150, ex:150 };

function parseLineQty(id, label, price) {
  const unitPrice = DEVICE_UNIT_PRICES[id];
  if (unitPrice) {
    const match = label.match(/×(\d+)/);
    if (match) return { qty: parseInt(match[1]), unitPrice };
  }
  return { qty: 1, unitPrice: price };
}

const COMMITMENT_LABEL = {
  m2m:    'Month-to-Month',
  annual: 'Annual (12-Month)',
  '2yr':  '2-Year (24-Month)',
};

function buildPDFData(a, q) {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 30);
  const fmtDate = d => d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const slug = (a.clientName||'client').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const qNum = `CCP-Q-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${slug}`;

  const lineItems = q.lines.map(l => {
    const { qty, unitPrice } = parseLineQty(l.id, l.label, l.price);
    return {
      category:    TAG_CATEGORY[l.tag] || l.tag,
      description: CLIENT_DESC[l.id] || l.label,
      qty,
      unitPrice,
      total: l.price,
    };
  });


  const noteLines = [
    q.savings > 0 ? `Bundle savings applied: −${fmt(q.savings)}` : null,
  ].filter(Boolean);

  return {
    quoteNumber:  qNum,
    date:         fmtDate(now),
    expiresDate:  fmtDate(expires),
    preparedBy:   'Jason F. Reyes, Founder & CEO',
    client: {
      businessName: a.clientName || 'Client',
      contactName:  a.contactName || '',
      email:        a.clientEmail || '',
      phone:        a.clientPhone || '',
    },
    lineItems,
    subtotal:  q.sub,
    discount:  q.disc,
    total:     q.net,
    notes:     noteLines.length ? noteLines.join('\n') : undefined,
    recurring: a.recurring === true && q.mo > 0 ? {
      lines:           q.recLines,
      monthly:         q.mo,
      annual:          q.yr,
      commitmentLabel: COMMITMENT_LABEL[a.commitment || 'annual'],
    } : null,
  };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function QuoteBuilder() {
  const [a, setA] = useState(() => {
    try {
      const raw = localStorage.getItem('ccp_quote_prefill');
      if (raw) { localStorage.removeItem('ccp_quote_prefill'); return JSON.parse(raw); }
    } catch {}
    return {};
  });
  const [sid, setSid] = useState('client');
  const [copied, setCopied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 700);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 700);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const steps = useMemo(()=>getSteps(a),[a]);
  const idx   = useMemo(()=>{ const i=steps.findIndex(s=>s.id===sid); return i<0?0:i; },[steps,sid]);
  const step  = steps[idx]||steps[0];
  const q     = useMemo(()=>calcQuote(a),[a]);
  const isSummary = step?.id==='summary';

  function set(k,v){ setA(p=>({...p,[k]:v})); }
  function setMany(u){ setA(p=>({...p,...u})); }
  function next(){ const ni=idx+1; if(ni<steps.length) setSid(steps[ni].id); }
  function back(){ const pi=idx-1; if(pi>=0) setSid(steps[pi].id); }

  // ── STYLE FACTORIES ─────────────────────────────────────────────────────────
  const card = sel=>({
    background: sel?'rgba(212,169,122,0.09)':C.card,
    border:`1px solid ${sel?C.b2:C.b0}`, borderRadius:10,
    padding:'13px 16px', marginBottom:9, cursor:'pointer',
  });
  const inp=(mb=14)=>({
    display:'block',width:'100%',boxSizing:'border-box',
    background:C.card,border:`1px solid ${C.b0}`,borderRadius:8,
    padding:'11px 14px',color:C.cream,fontSize:16,outline:'none',
    fontFamily:'Georgia,serif',marginBottom:mb,
  });
  const lbl={fontSize:11,color:C.muted,textTransform:'uppercase',
    letterSpacing:'0.1em',display:'block',marginBottom:6};
  const oTit=sel=>({fontSize:15,color:sel?C.beige:C.cream,fontWeight:sel?'bold':'normal',marginBottom:3});
  const oSub={fontSize:12,color:C.muted,lineHeight:1.45};
  const oPrc=sel=>({float:'right',fontSize:13,color:sel?C.beige:C.muted});
  const savBadge={marginLeft:7,fontSize:10,
    background:'rgba(90,158,150,0.13)',color:C.tealL,
    border:'1px solid rgba(90,158,150,0.28)',borderRadius:3,padding:'1px 5px'};
  const tealBox={background:'rgba(90,158,150,0.09)',
    border:'1px solid rgba(90,158,150,0.28)',borderRadius:8,
    padding:'10px 14px',marginTop:4};
  const sep={display:'flex',justifyContent:'space-between',padding:'8px 0',
    borderBottom:`1px solid ${C.b0}`};

  // ── STEP CONTENT ────────────────────────────────────────────────────────────
  const steps_map = {
    client:()=>(
      <>
        <label style={lbl}>Business name</label>
        <input style={inp(16)} type="text" placeholder="e.g. Apple Inc."
          value={a.clientName||''} onChange={e=>set('clientName',e.target.value)}/>
        <label style={lbl}>Contact name</label>
        <input style={inp(16)} type="text" placeholder="e.g. Tim Cook"
          value={a.contactName||''} onChange={e=>set('contactName',e.target.value)}/>
        <label style={lbl}>Contact email</label>
        <input style={inp(16)} type="email" placeholder="e.g. tcook@apple.com"
          value={a.clientEmail||''} onChange={e=>set('clientEmail',e.target.value)}/>
        <label style={lbl}>Contact phone</label>
        <input style={inp(16)} type="tel" placeholder="e.g. (703) 555-0100"
          value={a.clientPhone||''} onChange={e=>set('clientPhone',e.target.value)}/>
        <label style={lbl}>Industry / vertical</label>
        <select style={inp(0)} value={a.vertical||''} onChange={e=>set('vertical',e.target.value)}>
          <option value="">Select…</option>
          {['Medical / Healthcare','Dental','Legal','Retail','Restaurant / Food Service',
            'Professional Services','Real Estate','Fitness / Wellness',
            'Creative / Agency','Construction / Trades','Non-Profit','Other'].map(v=>(
            <option key={v}>{v}</option>
          ))}
        </select>
      </>
    ),
    stage:()=>(
      <>
        {[
          {v:'pre',         icon:'🌱', t:'Pre-launch',        d:'LLC forming or just formed — building the business from scratch'},
          {v:'operational', icon:'⚙️', t:'Operational',       d:'Running business — needs a solid tech foundation or full overhaul'},
          {v:'targeted',    icon:'🎯', t:'Targeted services',  d:'Already set up — looking for defined, specific improvements'},
        ].map(o=>(
          <div key={o.v} style={card(a.stage===o.v)} onClick={()=>set('stage',o.v)}>
            <div style={oTit(a.stage===o.v)}>{o.icon}  {o.t}</div>
            <div style={oSub}>{o.d}</div>
          </div>
        ))}
      </>
    ),
    audit:()=>(
      <>
        <p style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6,marginTop:0}}>
          Audit fee credits in full toward any engagement ≥$500 if signed within 30 days of report delivery.
        </p>
        {[
          {v:'none',   t:'No audit — skip to quote',  d:'Proceed directly to building the engagement',                                                     p:null},
          {v:'remote', t:'Remote audit',               d:'Written report + category scorecard delivered within 24 hrs. Screen-share session included.',    p:'$250'},
          {v:'onsite', t:'On-site audit',              d:'In-person walk-through + full report. Includes $150 travel/site fee.',                           p:'$450'},
        ].map(o=>(
          <div key={o.v} style={card(a.audit===o.v)} onClick={()=>set('audit',o.v)}>
            {o.p&&<span style={oPrc(a.audit===o.v)}>{o.p}</span>}
            <div style={oTit(a.audit===o.v)}>{o.t}</div>
            <div style={oSub}>{o.d}</div>
          </div>
        ))}
      </>
    ),
    formation:()=>(
      <>
        <p style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6,marginTop:0}}>
          Select all that apply. Choosing both unlocks the Launch Prep bundle — $275 flat, saves $50.
        </p>
        {[
          {k:'A',t:'A — Business Formation Guidance',d:'LLC/EIN filing guidance, name check, virtual mailbox advisory. Client completes the actual filing.',p:'$150'},
          {k:'B',t:'B — Banking & Payments',          d:'Chase/Mercury referral + Helcim/Stripe setup + Tap to Pay activation. Vendor fees paid by client.',p:'$175'},
        ].map(m=>(
          <div key={m.k} style={card(a[m.k]===true)} onClick={()=>set(m.k,!a[m.k])}>
            <span style={oPrc(a[m.k]===true)}>{m.p}</span>
            <div style={oTit(a[m.k]===true)}>{m.t}</div>
            <div style={oSub}>{m.d}</div>
          </div>
        ))}
        {a.A&&a.B&&<div style={tealBox}><span style={{color:C.tealL,fontSize:13}}>✓ Launch Prep bundle — $275 total (saves $50 off à la carte)</span></div>}
        <div style={{...card(false),marginTop:8}} onClick={()=>setMany({A:false,B:false})}>
          <div style={oTit(false)}>Neither — skip</div>
          <div style={oSub}>Client has business formation and banking handled</div>
        </div>
      </>
    ),
    apple:()=>(
      <>
        <p style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6,marginTop:0}}>
          Foundation Core enrolls device #1 at no extra cost — count <em>additional</em> devices here.
        </p>
        {[
          {k:'c1',t:'New devices — zero-touch deploy (C1)',u:'× $150/device'},
          {k:'c2',t:'Existing devices — manual MDM enrollment (C2)',u:'× $200/device'},
          {k:'c3',t:'On-site deployment visits (C3)',u:'× $150/visit'},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <label style={lbl}>{f.t} <span style={{textTransform:'none',letterSpacing:0,fontSize:11}}>{f.u}</span></label>
            <input style={inp(0)} type="number" min="0" max="100"
              value={a[f.k]??0} onChange={e=>set(f.k,e.target.value)}/>
          </div>
        ))}
        <div style={{marginTop:10}}>
          <div style={card(a.G===true)} onClick={()=>set('G',!a.G)}>
            <span style={oPrc(a.G===true)}>$450</span>
            <div style={oTit(a.G===true)}>G — Apple Brands, Full Layer</div>
            <div style={oSub}>Branded Mail, Verify with Wallet, Tap to Pay branding, full Brand Profile beyond Maps core</div>
          </div>
          {+(a.c1||0)>=3&&a.G&&<div style={tealBox}><span style={{color:C.tealL,fontSize:13}}>✓ Apple Presence bundle — $750 for C1×3 + G (saves $150)</span></div>}
        </div>
        <div style={{marginTop:16}}>
          <label style={lbl}>Retail/B2C procurement orders (C4) <span style={{textTransform:'none',letterSpacing:0,fontSize:11}}>× $150/order — if sourcing through non-kickback channels</span></label>
          <input style={inp(0)} type="number" min="0" max="20"
            value={a.c4??0} onChange={e=>set('c4',e.target.value)}/>
        </div>
      </>
    ),
    connectivity:()=>(
      <>
        {[
          {v:'none',         t:'No connectivity work',               d:'Client has carrier and ISP handled',                                                     p:null,    s:null},
          {v:'d1',           t:'D1 — Carrier audit only',            d:'Quote gathering, plan analysis, savings projection. Billable regardless of outcome.',   p:'$300',  s:null},
          {v:'connectivity', t:'Connectivity bundle  (D1 + E)',       d:'Carrier audit + business internet referral and install management',                     p:'$475',  s:'$125'},
          {v:'d1d2',         t:'D1 + D2 — Audit + implementation',   d:'Carrier audit + executing the switch, new account setup, or number porting',            p:'$600',  s:null},
          {v:'comms',        t:'Communications bundle  (D1+D2+H)',    d:'Full carrier work + IVR/AI phone system. Highest-priority bundle. Saves $250.',         p:'$950',  s:'$250'},
        ].map(o=>(
          <div key={o.v} style={card(a.connectivity===o.v)} onClick={()=>set('connectivity',o.v)}>
            <span style={oPrc(a.connectivity===o.v)}>
              {o.p}
              {o.s&&<span style={savBadge}>save {o.s}</span>}
            </span>
            <div style={oTit(a.connectivity===o.v)}>{o.t}</div>
            <div style={oSub}>{o.d}</div>
          </div>
        ))}
      </>
    ),
    ivr:()=>(
      <>
        <p style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6,marginTop:0}}>
          Deployed post-carrier-setup. Pairs with IVR Management ($75/mo) in the retainer if added later.
        </p>
        {[
          {v:false, t:'No IVR — skip',      d:'Client handles their own call routing'},
          {v:true,  t:'H — IVR Setup',       d:'Twilio + AI call routing, custom call flow, CNAM setup, post-deployment testing', p:'$600'},
        ].map(o=>(
          <div key={String(o.v)} style={card(a.H===o.v)} onClick={()=>set('H',o.v)}>
            {o.p&&<span style={oPrc(a.H===o.v)}>{o.p}</span>}
            <div style={oTit(a.H===o.v)}>{o.t}</div>
            <div style={oSub}>{o.d}</div>
          </div>
        ))}
      </>
    ),
    digital:()=>(
      <>
        <p style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6,marginTop:0}}>
          Select all that apply. Module I (CRM) coming soon — Digital Presence bundle auto-applies when ready.
        </p>
        {[
          {k:'F',t:'F — Website (Basic)',            d:'Functional business site — forms, payments, brand-consistent design. Complex builds quoted separately.',p:'$750'},
          {k:'J',t:'J — Apple Business Messages',   d:'Heymarket MSP setup + Apple Messages for Business registration and Apple review coordination.',        p:'$400 + MSP'},
        ].map(m=>(
          <div key={m.k} style={card(a[m.k]===true)} onClick={()=>set(m.k,!a[m.k])}>
            <span style={oPrc(a[m.k]===true)}>{m.p}</span>
            <div style={oTit(a[m.k]===true)}>{m.t}</div>
            <div style={oSub}>{m.d}</div>
          </div>
        ))}
        <div style={{...card(false),marginTop:4}} onClick={()=>setMany({F:false,J:false})}>
          <div style={oTit(false)}>Neither — skip</div>
          <div style={oSub}>Client has web presence and messaging handled</div>
        </div>
      </>
    ),
    flagship:()=>{
      const noFg=calcQuote({...a,flagship:undefined}).lines.filter(l=>l.tag!=='audit').reduce((s,l)=>s+l.price,0);
      const sel=a.flagship||'none';
      return(
        <>
          <div style={{background:C.card,border:`1px solid ${C.b0}`,borderRadius:8,padding:'12px 14px',marginBottom:16}}>
            <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Current à la carte total</div>
            <div style={{fontSize:20,color:C.cream}}>{fmt(noFg)}</div>
          </div>
          {[
            {v:'none',     t:'Keep current selections',    d:`À la carte — ${fmt(noFg)}. Individual modules retained as configured.`,                                           p:fmt(noFg), hl:false},
            {v:'complete', t:'Flagship — OFB Complete',    d:'Foundation + all bundles, 3-device deployment, single fixed price. Devices 4–15 add $150 each.',                  p:'$4,200',  hl:true},
            {v:'fleet',    t:'Flagship — OFB Fleet',       d:'Same as Complete but 10-device deployment. Best for fleet-first clients. Devices 11–15 add $150 each.',            p:'$5,000',  hl:false},
          ].map(o=>(
            <div key={o.v}
              style={{...card(sel===o.v), ...(o.hl&&sel!==o.v?{border:'1px solid rgba(90,158,150,0.32)'}:{})}}
              onClick={()=>set('flagship',o.v)}>
              <span style={oPrc(sel===o.v)}>{o.p}</span>
              <div style={oTit(sel===o.v)}>{o.t}</div>
              <div style={oSub}>{o.d}</div>
            </div>
          ))}
          {(a.flagship==='complete'||a.flagship==='fleet')&&(
            <>
              <label style={{...lbl,marginTop:8}}>Additional devices beyond package (× $150 each)</label>
              <input style={inp(0)} type="number" min="0" max="15"
                value={a.extraDev??0} onChange={e=>set('extraDev',e.target.value)}/>
            </>
          )}
        </>
      );
    },
    recurring:()=>(
      <>
        {[
          {v:true,  t:'Yes — ongoing Partner relationship', d:'Apple Operations + Partner Access. Device management, SLA, renewals, asset tracking, on/offboarding, quarterly reviews, and more.'},
          {v:false, t:'No — one-time engagement only',     d:'À la carte engagement. Future work at Off-Menu rate ($125/hr Phase 1). Client self-manages post-handoff.'},
        ].map(o=>(
          <div key={String(o.v)} style={card(a.recurring===o.v)} onClick={()=>set('recurring',o.v)}>
            <div style={oTit(a.recurring===o.v)}>{o.t}</div>
            <div style={oSub}>{o.d}</div>
          </div>
        ))}
      </>
    ),
    recConfig:()=>{
      const dev=+(a.recDev||3);
      const comm=a.commitment||'annual';
      return(
        <>
          <label style={lbl}>Devices under management</label>
          <input style={inp(20)} type="number" min="1" max="200"
            value={a.recDev??3} onChange={e=>set('recDev',e.target.value)}/>
          <div style={{...lbl,marginBottom:10}}>Commitment level</div>
          {[
            {v:'m2m',    t:'Month-to-month', note:'30-day written notice to cancel'},
            {v:'annual', t:'Annual',          note:'12-month lock-in — recommended'},
            {v:'2yr',    t:'2-Year',           note:'24-month lock-in — lowest rate available'},
          ].map(o=>{
            const total=dev*P.ops[o.v]+P.pa[o.v];
            const s=comm===o.v;
            return(
              <div key={o.v} style={card(s)} onClick={()=>set('commitment',o.v)}>
                <span style={oPrc(s)}>{fmt(total)}/mo</span>
                <div style={oTit(s)}>{o.t}</div>
                <div style={oSub}>${P.ops[o.v]}/device + ${P.pa[o.v]} PA · {o.note}</div>
              </div>
            );
          })}
        </>
      );
    },
    ivrMgmt:()=>(
      <>
        {[
          {v:true,  t:'Include IVR Management in retainer', d:'Ongoing run, maintenance, AI/telephony usage. Single managed fee — actual usage billed at cost above base.',p:'+$75/mo'},
          {v:false, t:'Exclude for now',                   d:'Can be added later at any billing anchor date. Client manages telephony costs independently.'},
        ].map(o=>(
          <div key={String(o.v)} style={card(a.ivrMgmt===o.v)} onClick={()=>set('ivrMgmt',o.v)}>
            {o.p&&<span style={oPrc(a.ivrMgmt===o.v)}>{o.p}</span>}
            <div style={oTit(a.ivrMgmt===o.v)}>{o.t}</div>
            <div style={oSub}>{o.d}</div>
          </div>
        ))}
      </>
    ),
    modifier:()=>(
      <>
        {[
          {v:'standard', t:'Standard — Founding Partner rates',         d:"Rate-locked for the life of this client's contract. As credentials stack, new clients pay higher rates — existing clients don't."},
          {v:'founding', t:'Founding Client Program',                   d:'50% off one-time fee only. Recurring stays standard. Requires written testimonial, case-study rights, and reference call. Max 1–3 slots.'},
          {v:'community',t:'Community Rate — El Que Se las Arregla',    d:'Solo founder, <3 yrs, <$250K revenue, minority/immigrant-owned. Reduced device + PA rates. Document qualifier internally.'},
        ].map(o=>{
          const s=(a.modifier||'standard')===o.v;
          return(
            <div key={o.v} style={card(s)} onClick={()=>set('modifier',o.v)}>
              <div style={oTit(s)}>{o.t}</div>
              <div style={oSub}>{o.d}</div>
            </div>
          );
        })}
      </>
    ),
    summary:()=>{
      const hasRec=a.recurring===true&&q.recLines.length>0;
      const pdfData=buildPDFData(a,q);
      const pdfFilename=`CCP-Quote-${(a.clientName||'client').replace(/\s+/g,'-')}.pdf`;
      return(
        <>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:20,color:C.white,fontFamily:'Georgia,serif'}}>{a.clientName||'Client'}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>
              {a.vertical||'—'} · {a.stage==='pre'?'Pre-launch':a.stage==='operational'?'Operational':'Targeted'} · Founding Partner Phase
            </div>
          </div>
          <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10}}>One-time fees</div>
          {q.lines.map(l=>(
            <div key={l.id} style={sep}>
              <div style={{flex:1,paddingRight:8}}>
                <span style={{fontSize:13,color:l.tag==='bundle'?C.tealL:C.cream}}>{l.label}</span>
                {l.saving>0&&<span style={savBadge}>−{fmt(l.saving)}</span>}
              </div>
              <span style={{fontSize:13,color:C.beige,whiteSpace:'nowrap'}}>{fmt(l.price)}</span>
            </div>
          ))}
          {q.savings>0&&(
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.b0}`}}>
              <span style={{fontSize:12,color:C.teal}}>Bundle savings</span>
              <span style={{fontSize:12,color:C.teal}}>−{fmt(q.savings)}</span>
            </div>
          )}
          {q.disc>0&&(
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.b0}`}}>
              <span style={{fontSize:12,color:C.blush}}>Founding Client discount (50% off one-time)</span>
              <span style={{fontSize:12,color:C.blush}}>−{fmt(q.disc)}</span>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'space-between',padding:'14px 0 0'}}>
            <span style={{fontSize:15,color:C.cream,fontWeight:'bold'}}>One-time total</span>
            <span style={{fontSize:26,color:C.beige,fontFamily:'Georgia,serif',fontWeight:'bold'}}>{fmt(q.net)}</span>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.b0}`,borderRadius:8,padding:'13px 15px',margin:'16px 0'}}>
            <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:9}}>Payment schedule</div>
            {q.net<2000?(
              <>
                <div style={{fontSize:13,color:C.cream}}>50% at start — {fmt(q.net*0.5)}</div>
                <div style={{fontSize:13,color:C.cream,marginTop:5}}>50% at completion — {fmt(q.net*0.5)}</div>
              </>
            ):(
              <>
                <div style={{fontSize:13,color:C.cream}}>50% at start — {fmt(q.net*0.5)}</div>
                <div style={{fontSize:13,color:C.cream,marginTop:5}}>25% at midpoint — {fmt(q.net*0.25)}</div>
                <div style={{fontSize:13,color:C.cream,marginTop:5}}>25% at completion — {fmt(q.net*0.25)}</div>
              </>
            )}
          </div>
          {hasRec&&(
            <>
              <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10,marginTop:24}}>Monthly recurring</div>
              {q.recLines.map((l,i)=>(
                <div key={i} style={sep}>
                  <span style={{fontSize:13,color:C.cream}}>{l.label}</span>
                  <span style={{fontSize:13,color:C.beige}}>{fmt(l.price)}/mo</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'14px 0 3px'}}>
                <span style={{fontSize:15,color:C.cream,fontWeight:'bold'}}>Monthly total</span>
                <span style={{fontSize:26,color:C.beige,fontFamily:'Georgia,serif',fontWeight:'bold'}}>{fmt(q.mo)}/mo</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',paddingBottom:2}}>
                <span style={{fontSize:12,color:C.muted}}>Annual recurring</span>
                <span style={{fontSize:12,color:C.muted}}>{fmt(q.yr)}/yr</span>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.b0}`,borderRadius:8,padding:'11px 14px',margin:'14px 0'}}>
                <span style={{fontSize:11,color:C.muted,lineHeight:1.6}}>
                  ⚡ Billing anchored to 1st or 14th — no proration. Days between activation and first anchor date are a complimentary onboarding window.
                </span>
              </div>
              <div style={{background:'rgba(212,169,122,0.07)',border:`1px solid ${C.b1}`,borderRadius:12,padding:'18px',margin:'20px 0'}}>
                <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:5}}>36-month client LTV</div>
                <div style={{fontSize:32,color:C.beige,fontFamily:'Georgia,serif',fontWeight:'bold'}}>{fmt(q.ltv)}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:5}}>{fmt(q.net)} + {fmt(q.mo)}/mo × 36</div>
              </div>
            </>
          )}
          <div style={{fontSize:11,color:C.dim,lineHeight:1.7,marginBottom:22}}>
            Third-party pass-through costs (domain, Workspace, MDM licenses, AppleCare, MSP fees, etc.) are paid directly by the client and not reflected above. Provide Pass-Through Cost Reference at engagement start.
          </div>
          <button
            style={{width:'100%',background:copied?C.teal:C.beige,border:'none',borderRadius:9,
              color:C.bg,padding:14,fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif',
              cursor:'pointer',marginBottom:10,transition:'background 0.2s'}}
            onClick={()=>{
              try{navigator.clipboard.writeText(buildText(a,q));}catch(e){}
              setCopied(true); setTimeout(()=>setCopied(false),2500);
            }}>
            {copied?'✓ Copied to clipboard':'Copy quote to clipboard'}
          </button>
          <div style={{width:'100%',marginBottom:10}}>
            <Suspense fallback={
              <button style={{width:'100%',background:'transparent',border:`1px solid ${C.b0}`,
                borderRadius:9,color:C.muted,padding:13,fontSize:14,fontFamily:'Georgia,serif',cursor:'default'}}>
                Preparing PDF…
              </button>
            }>
              <DownloadPDFButton
                doc={<QuoteDocument data={pdfData}/>}
                filename={pdfFilename}
                label="Download Quote PDF"
                variant="outline"
                size="md"
              />
            </Suspense>
          </div>
          <button
            style={{width:'100%',background:'transparent',border:`1px solid ${C.b0}`,borderRadius:9,
              color:C.muted,padding:12,fontSize:14,fontFamily:'Georgia,serif',cursor:'pointer',marginBottom:8}}
            onClick={()=>{setA({});setSid('client');setCopied(false);}}>
            ↩ Start new quote
          </button>
        </>
      );
    },
  };

  const meta={
    client:       {title:'New quote',              q:"Who are we building this for?"},
    stage:        {title:'Business stage',         q:"Where is this client right now?"},
    audit:        {title:'Tier 0',                 q:"Start with a diagnostic audit?"},
    formation:    {title:'Tier 2 — Modules A & B', q:"Any business foundation gaps to fill?"},
    apple:        {title:'Tier 2 — Apple',         q:"What's their Apple footprint?"},
    connectivity: {title:'Tier 2 — Connectivity',  q:"What connectivity services do they need?"},
    ivr:          {title:'Tier 2 — Module H',      q:"Do they need an IVR or AI phone system?"},
    digital:      {title:'Tier 2 — Digital',       q:"Any digital presence needs?"},
    flagship:     {title:'Flagship option',        q:"Upgrade to an OFB package?"},
    recurring:    {title:'Tier 3 — Partner',       q:"Will this be an ongoing managed relationship?"},
    recConfig:    {title:'Retainer setup',         q:"Configure the Partner retainer."},
    ivrMgmt:      {title:'IVR Management',         q:"Include IVR Management in the monthly retainer?"},
    modifier:     {title:'Pricing tier',           q:"Any special pricing applies?"},
    summary:      {title:'Total Investment Summary',q:null},
  }[step?.id]||{title:'',q:''};

  const progress=step?.progress??100;

  return(
    <div style={{fontFamily:'Georgia,serif',background:C.bg,minHeight:'100vh',color:C.cream,paddingTop:64,
      ...(isDesktop?{}:{display:'flex',flexDirection:'column',maxWidth:480,margin:'0 auto',position:'relative'})}}>

      {/* ── HEADER ── */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.b0}`,padding:'13px 20px 0',flexShrink:0,
        position:'sticky',top:64,zIndex:50}}>
        <div style={{maxWidth:isDesktop?1040:480,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
            <span style={{fontSize:11,color:C.beige,textTransform:'uppercase',letterSpacing:'0.14em'}}>
              ☕ Café Con Pan · Quote Builder
            </span>
            <span style={{fontSize:9,background:'rgba(184,80,62,0.13)',color:C.redL,
              border:'1px solid rgba(184,80,62,0.22)',borderRadius:3,padding:'2px 7px',
              letterSpacing:'0.1em',textTransform:'uppercase'}}>Internal</span>
          </div>
          <div style={{height:2,background:C.dim,borderRadius:1,overflow:'hidden',marginBottom:7}}>
            <div style={{height:'100%',background:C.beige,borderRadius:1,
              width:`${progress}%`,transition:'width 0.38s ease'}}/>
          </div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:'0.1em',textTransform:'uppercase',paddingBottom:10}}>
            {meta.title} · {idx+1} of {steps.length}
          </div>
        </div>
      </div>

      {isDesktop ? (
        isSummary ? (
          /* ── DESKTOP SUMMARY ── */
          <div style={{maxWidth:720,margin:'0 auto',padding:'40px 40px 80px'}}>
            {steps_map['summary']?.()}
          </div>
        ) : (
          /* ── DESKTOP TWO-COLUMN ── */
          <div style={{display:'flex',maxWidth:1040,margin:'0 auto',minHeight:'calc(100vh - 136px)'}}>

            {/* Left: step wizard */}
            <div style={{flex:1,padding:'32px 40px 40px',overflowY:'auto'}}>
              {meta.q&&(
                <h2 style={{fontSize:24,lineHeight:1.3,color:C.white,fontFamily:'Georgia,serif',margin:'0 0 24px 0'}}>
                  {meta.q}
                </h2>
              )}
              {steps_map[step?.id]?.()}
              <div style={{display:'flex',gap:10,marginTop:32,paddingTop:20,borderTop:`1px solid ${C.b0}`}}>
                {idx>0&&(
                  <button style={{flex:1,background:'transparent',border:`1px solid ${C.b0}`,borderRadius:9,
                    color:C.muted,padding:12,cursor:'pointer',fontSize:14,fontFamily:'Georgia,serif'}}
                    onClick={back}>← Back</button>
                )}
                <button style={{flex:idx>0?2:1,background:C.beige,border:'none',borderRadius:9,
                  color:C.bg,padding:12,cursor:'pointer',fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif'}}
                  onClick={next}>
                  {idx>=steps.length-2?'View Quote →':'Continue →'}
                </button>
              </div>
            </div>

            {/* Right: live quote summary */}
            <div style={{width:300,flexShrink:0,padding:'28px 28px',borderLeft:`1px solid ${C.b0}`,
              position:'sticky',top:136,alignSelf:'start',maxHeight:'calc(100vh - 136px)',overflowY:'auto'}}>
              <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:16}}>
                Live Quote
              </div>
              {q.lines.length===0?(
                <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
                  Your quote will appear here as you build it.
                </div>
              ):(
                <>
                  {q.lines.map(l=>(
                    <div key={l.id} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.b0}`}}>
                      <span style={{fontSize:12,color:l.tag==='bundle'?C.tealL:C.cream,flex:1,paddingRight:8,lineHeight:1.4}}>{l.label}</span>
                      <span style={{fontSize:12,color:C.beige,whiteSpace:'nowrap'}}>{fmt(l.price)}</span>
                    </div>
                  ))}
                  {q.savings>0&&(
                    <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.b0}`}}>
                      <span style={{fontSize:11,color:C.teal}}>Bundle savings</span>
                      <span style={{fontSize:11,color:C.teal}}>−{fmt(q.savings)}</span>
                    </div>
                  )}
                  {q.disc>0&&(
                    <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.b0}`}}>
                      <span style={{fontSize:11,color:C.blush}}>Founding Client (50%)</span>
                      <span style={{fontSize:11,color:C.blush}}>−{fmt(q.disc)}</span>
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'14px 0 0'}}>
                    <span style={{fontSize:12,color:C.cream,fontWeight:'bold'}}>One-time total</span>
                    <span style={{fontSize:24,color:C.beige,fontFamily:'Georgia,serif',fontWeight:'bold'}}>{fmt(q.net)}</span>
                  </div>
                  {a.recurring===true&&q.mo>0&&(
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',
                      marginTop:8,paddingTop:8,borderTop:`1px solid ${C.b0}`}}>
                      <span style={{fontSize:11,color:C.muted}}>Monthly retainer</span>
                      <span style={{fontSize:16,color:C.beige,fontFamily:'Georgia,serif'}}>{fmt(q.mo)}/mo</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      ) : (
        /* ── MOBILE LAYOUT ── */
        <>
          {/* Running tally */}
          {!isSummary&&(
            <div style={{background:C.card,borderBottom:`1px solid ${C.b0}`,padding:'10px 20px',
              display:'flex',flexShrink:0,position:'sticky',top:136,zIndex:49}}>
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>One-time</div>
                <div style={{fontSize:18,color:C.beige,fontFamily:'Georgia,serif'}}>{fmt(q.net)}</div>
              </div>
              {a.recurring===true&&(
                <div style={{flex:1,textAlign:'center',borderLeft:`1px solid ${C.b0}`}}>
                  <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>Monthly</div>
                  <div style={{fontSize:18,color:C.beige,fontFamily:'Georgia,serif'}}>{fmt(q.mo)}/mo</div>
                </div>
              )}
              {q.savings>0&&(
                <div style={{flex:1,textAlign:'center',borderLeft:`1px solid ${C.b0}`}}>
                  <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>Saved</div>
                  <div style={{fontSize:18,color:C.teal,fontFamily:'Georgia,serif'}}>−{fmt(q.savings)}</div>
                </div>
              )}
            </div>
          )}
          {/* Body */}
          <div style={{flex:1,padding:'24px 20px 100px'}}>
            {meta.q&&(
              <h2 style={{fontSize:21,lineHeight:1.3,color:C.white,fontFamily:'Georgia,serif',margin:'0 0 20px 0'}}>
                {meta.q}
              </h2>
            )}
            {steps_map[step?.id]?.()}
          </div>
          {/* Footer nav */}
          {!isSummary&&(
            <div style={{position:'sticky',bottom:0,background:C.surf,borderTop:`1px solid ${C.b0}`,
              padding:'14px 20px',display:'flex',gap:10,flexShrink:0,zIndex:50}}>
              {idx>0&&(
                <button style={{flex:1,background:'transparent',border:`1px solid ${C.b0}`,borderRadius:9,
                  color:C.muted,padding:12,cursor:'pointer',fontSize:14,fontFamily:'Georgia,serif'}}
                  onClick={back}>← Back</button>
              )}
              <button style={{flex:idx>0?2:3,background:C.beige,border:'none',borderRadius:9,
                color:C.bg,padding:12,cursor:'pointer',fontSize:15,fontWeight:'bold',fontFamily:'Georgia,serif'}}
                onClick={next}>
                {idx>=steps.length-2?'View Quote →':'Continue →'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
