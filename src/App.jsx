import { useState, useEffect } from "react";

const C = {
  cream: "#F5EDD6",
  espresso: "#3D2B1F",
  red: "#B8503E",
  blush: "#F2B0AC",
  beige: "#D4A97A",
  teal: "#5A9E96",
  gold: "#C8922A",
  parchment: "#EDE0C4",
};

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;600;700&family=Pacifico&display=swap');`;

// SVG textile border pattern (huipil-inspired weave)
const TextileBorder = ({ flip = false }) => (
  <svg width="100%" height="24" style={{ display: "block", transform: flip ? "scaleY(-1)" : "none" }}>
    <defs>
      <pattern id="weave" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill={C.beige} />
        <polygon points="12,2 22,12 12,22 2,12" fill={C.red} opacity="0.7" />
        <polygon points="12,6 18,12 12,18 6,12" fill={C.cream} />
        <polygon points="12,9 15,12 12,15 9,12" fill={C.espresso} opacity="0.5" />
        <rect x="0" y="0" width="2" height="2" fill={C.espresso} opacity="0.4" />
        <rect x="22" y="0" width="2" height="2" fill={C.espresso} opacity="0.4" />
        <rect x="0" y="22" width="2" height="2" fill={C.espresso} opacity="0.4" />
        <rect x="22" y="22" width="2" height="2" fill={C.espresso} opacity="0.4" />
      </pattern>
    </defs>
    <rect width="100%" height="24" fill="url(#weave)" />
  </svg>
);

// Sunburst SVG
const Sunburst = ({ size = 500, color = C.beige, opacity = 0.25 }) => {
  const rays = 24;
  const cx = size / 2, cy = size / 2, r = size / 2;
  const paths = Array.from({ length: rays }, (_, i) => {
    const a1 = (i * 360) / rays;
    const a2 = a1 + 360 / rays / 2;
    const toRad = (d) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(a1 - 90));
    const y1 = cy + r * Math.sin(toRad(a1 - 90));
    const x2 = cx + r * Math.cos(toRad(a2 - 90));
    const y2 = cy + r * Math.sin(toRad(a2 - 90));
    return `M${cx},${cy} L${x1},${y1} L${x2},${y2} Z`;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", pointerEvents: "none" }}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill={color} opacity={i % 2 === 0 ? opacity : opacity * 0.5} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.18} fill={color} opacity={opacity * 1.2} />
    </svg>
  );
};

// Coffee steam animation
const SteamSVG = () => (
  <svg width="72" height="88" viewBox="0 0 72 88">
    <style>{`
      @keyframes steam1 { 0%,100%{transform:translateY(0) scaleX(1);opacity:0.6} 50%{transform:translateY(-8px) scaleX(1.3);opacity:0.15} }
      @keyframes steam2 { 0%,100%{transform:translateY(0) scaleX(1);opacity:0.45} 50%{transform:translateY(-10px) scaleX(0.8);opacity:0.1} }
      .s1{animation:steam1 2s ease-in-out infinite}
      .s2{animation:steam2 2.4s ease-in-out infinite 0.4s}
      .s3{animation:steam1 1.8s ease-in-out infinite 0.8s}
    `}</style>
    <path className="s1" d="M25 36 Q23 29 25 22 Q27 15 25 8" stroke={C.espresso} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path className="s2" d="M36 34 Q34 26 36 19 Q38 12 36 5" stroke={C.espresso} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path className="s3" d="M47 36 Q45 29 47 22 Q49 15 47 8" stroke={C.espresso} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M13 40 L59 40 L55 74 L17 74 Z" fill={C.espresso}/>
    <ellipse cx="36" cy="40" rx="23" ry="5" fill={C.beige}/>
    <path d="M17 52 L16 65" stroke={C.cream} strokeWidth="2.5" opacity="0.12" strokeLinecap="round"/>
    <path d="M55 50 Q66 50 66 59 Q66 68 55 68" stroke={C.espresso} strokeWidth="5" fill="none" strokeLinecap="round"/>
    <ellipse cx="36" cy="75" rx="26" ry="5.5" fill={C.espresso} opacity="0.2"/>
  </svg>
);

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Nunito',sans-serif;background:${C.cream};overflow-x:hidden}

  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
  .fade-up{animation:fadeUp 0.6s ease forwards}
  .pop{animation:pop 0.5s ease forwards}

  /* Paper grain overlay */
  .grain{position:fixed;inset:0;pointer-events:none;z-index:200;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity:0.5}

  /* NAV */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;
    background:${C.espresso};
    display:flex;align-items:center;justify-content:space-between;
    padding:0 40px;height:64px;
    border-bottom:3px solid ${C.beige}}
  .nav-logo{font-family:'Pacifico',cursive;font-size:20px;color:${C.cream};
    cursor:pointer;letter-spacing:0.02em;line-height:1}
  .nav-logo span{color:${C.blush}}
  .nav-links{display:flex;gap:8px;align-items:center}
  .nav-btn{background:none;border:none;cursor:pointer;
    font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;color:${C.cream};
    opacity:0.7;padding:6px 10px;transition:opacity 0.2s,color 0.2s}
  .nav-btn:hover,.nav-btn.active{opacity:1;color:${C.blush}}
  .nav-cta-btn{background:${C.red};color:${C.cream};border:none;cursor:pointer;
    font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;
    padding:10px 20px;
    border:2px solid ${C.blush};
    transition:background 0.2s}
  .nav-cta-btn:hover{background:${C.blush};color:${C.espresso}}

  /* HERO */
  .hero{min-height:100vh;background:${C.cream};display:flex;
    align-items:center;justify-content:center;
    padding:80px 40px 0;position:relative;overflow:hidden;text-align:center}
  .hero-sunburst{position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%);z-index:0}
  .hero-content{position:relative;z-index:2;max-width:800px}
  .hero-stamp{display:inline-block;
    border:3px solid ${C.espresso};
    padding:6px 20px;margin-bottom:24px;
    font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
    font-weight:700;color:${C.espresso};background:${C.blush};
    transform:rotate(-1.5deg)}
  .hero-title{font-family:'Lilita One',cursive;
    font-size:clamp(56px,9vw,110px);line-height:0.95;
    color:${C.espresso};margin-bottom:8px;
    -webkit-text-stroke:2px ${C.espresso}}
  .hero-title .line-red{color:${C.red};display:block}
  .hero-title .line-teal{color:${C.teal};display:block}
  .hero-subtitle{font-size:16px;color:${C.espresso};opacity:0.75;
    font-weight:600;letter-spacing:0.08em;text-transform:uppercase;
    margin-bottom:40px}
  .hero-pillars{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
  .hero-pillar{background:${C.espresso};color:${C.cream};
    padding:12px 24px;
    border:3px solid ${C.espresso};
    font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
    cursor:pointer;transition:background 0.2s,color 0.2s;
    display:flex;align-items:center;gap:8px}
  .hero-pillar:hover{background:${C.cream};color:${C.espresso}}
  .hero-pillar-icon{font-size:18px}
  .hero-cta{background:${C.red};color:${C.cream};
    border:3px solid ${C.espresso};
    font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;
    letter-spacing:0.1em;text-transform:uppercase;
    padding:16px 40px;cursor:pointer;
    box-shadow:4px 4px 0 ${C.espresso};
    transition:transform 0.1s,box-shadow 0.1s}
  .hero-cta:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 ${C.espresso}}
  .hero-domain{margin-top:20px;font-size:13px;color:${C.espresso};opacity:0.5;
    letter-spacing:0.15em;text-transform:uppercase;font-weight:700}

  /* SECTIONS */
  .section{padding:72px 40px;background:${C.cream}}
  .section-alt{background:${C.parchment}}
  .section-dark{background:${C.espresso}}

  .section-header{text-align:center;margin-bottom:56px}
  .section-eyebrow{font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
    font-weight:700;color:${C.teal};margin-bottom:12px}
  .section-title{font-family:'Lilita One',cursive;
    font-size:clamp(32px,4vw,52px);color:${C.espresso};line-height:1.1}
  .section-title-light{color:${C.cream}}
  .section-title span{color:${C.red}}
  .section-sub{margin-top:12px;font-size:15px;color:#666;max-width:520px;
    margin-left:auto;margin-right:auto;line-height:1.8;font-weight:600}
  .section-sub-light{color:rgba(245,237,214,0.65)}

  /* SERVICE CARDS */
  .services-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:900px;margin:0 auto}
  .service-card{background:${C.cream};
    border:3px solid ${C.espresso};
    padding:36px;
    box-shadow:5px 5px 0 ${C.espresso};
    transition:transform 0.15s,box-shadow 0.15s;cursor:default}
  .service-card:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 ${C.espresso}}
  .service-card-icon{font-size:36px;margin-bottom:16px;display:block}
  .service-card-name{font-family:'Lilita One',cursive;font-size:22px;
    color:${C.espresso};margin-bottom:10px}
  .service-card-desc{font-size:14px;line-height:1.8;color:#555;font-weight:600}
  .service-card-price{margin-top:16px;display:inline-block;
    background:${C.espresso};color:${C.beige};
    font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
    padding:5px 12px}

  /* CREDS */
  .creds-row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:48px}
  .cred-badge{border:3px solid ${C.beige};padding:16px 28px;text-align:center;
    background:rgba(245,237,214,0.08)}
  .cred-badge-label{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;
    color:${C.beige};opacity:0.7;margin-bottom:6px;font-weight:700}
  .cred-badge-val{font-family:'Lilita One',cursive;font-size:17px;color:${C.cream}}

  /* ABOUT */
  .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;
    align-items:center;max-width:1000px;margin:0 auto}
  .about-visual{position:relative}
  .about-frame{background:${C.espresso};
    border:4px solid ${C.espresso};
    padding:48px 40px;
    box-shadow:8px 8px 0 ${C.beige}}
  .about-quote{font-family:'Pacifico',cursive;font-size:22px;
    color:${C.cream};line-height:1.5;margin-bottom:20px}
  .about-quote-attr{font-size:12px;letter-spacing:0.15em;text-transform:uppercase;
    color:${C.teal};font-weight:700}
  .about-body p{font-size:15px;line-height:1.9;color:#4a3728;
    margin-bottom:20px;font-weight:600}
  .about-stats{display:flex;gap:32px;margin-top:32px;flex-wrap:wrap}
  .about-stat-num{font-family:'Lilita One',cursive;font-size:52px;
    color:${C.red};line-height:1}
  .about-stat-label{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;
    color:#999;margin-top:4px;font-weight:700}

  /* TEASER */
  .teaser-inner{max-width:640px;margin:0 auto;text-align:center}
  .coming-tag{display:inline-block;background:${C.teal};color:${C.cream};
    font-size:11px;letter-spacing:0.18em;text-transform:uppercase;
    padding:7px 20px;font-weight:700;margin-bottom:28px;
    border:2px solid ${C.espresso};
    box-shadow:3px 3px 0 ${C.espresso}}
  .teaser-title{font-family:'Lilita One',cursive;
    font-size:clamp(36px,5vw,60px);color:${C.espresso};
    line-height:1.1;margin-bottom:20px}
  .teaser-title span{color:${C.red}}
  .teaser-body{font-size:15px;line-height:1.9;color:#555;
    font-weight:600;margin-bottom:36px}
  .email-row{display:flex;max-width:420px;margin:0 auto;
    border:3px solid ${C.espresso};
    box-shadow:4px 4px 0 ${C.espresso}}
  .email-input{flex:1;padding:14px 18px;border:none;outline:none;
    background:${C.cream};font-family:'Nunito',sans-serif;font-size:14px;
    font-weight:600;color:${C.espresso}}
  .email-input::placeholder{color:#bbb}
  .email-btn{background:${C.espresso};color:${C.cream};border:none;
    padding:14px 20px;cursor:pointer;
    font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;
    transition:background 0.2s}
  .email-btn:hover{background:${C.red}}

  /* CONTACT */
  .contact-grid{display:grid;grid-template-columns:1fr 1.6fr;gap:64px;max-width:900px;margin:0 auto}
  .contact-info-item{margin-bottom:32px}
  .contact-info-label{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;
    color:${C.teal};font-weight:700;margin-bottom:6px}
  .contact-info-val{font-size:16px;color:${C.espresso};font-weight:700}
  .form-field{margin-bottom:20px}
  .form-label{display:block;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;
    font-weight:700;color:${C.espresso};margin-bottom:8px}
  .form-input,.form-select,.form-textarea{width:100%;padding:13px 16px;
    border:3px solid ${C.espresso};
    background:${C.cream};font-family:'Nunito',sans-serif;
    font-size:14px;font-weight:600;outline:none;
    transition:border-color 0.2s,box-shadow 0.2s}
  .form-input:focus,.form-select:focus,.form-textarea:focus{
    box-shadow:3px 3px 0 ${C.espresso}}
  .form-textarea{resize:vertical;min-height:110px}
  .form-select{appearance:none}
  .submit-btn{background:${C.espresso};color:${C.cream};border:none;
    width:100%;padding:16px;cursor:pointer;
    font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;
    letter-spacing:0.1em;text-transform:uppercase;
    border:3px solid ${C.espresso};
    box-shadow:4px 4px 0 ${C.beige};
    transition:transform 0.1s,box-shadow 0.1s}
  .submit-btn:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 ${C.beige}}

  /* FOOTER */
  footer{background:${C.espresso};padding:48px 40px;
    display:flex;justify-content:space-between;align-items:center;
    flex-wrap:wrap;gap:24px}
  .footer-logo{font-family:'Pacifico',cursive;font-size:22px;color:${C.cream}}
  .footer-logo span{color:${C.blush}}
  .footer-tagline{font-size:12px;letter-spacing:0.15em;text-transform:uppercase;
    color:${C.teal};font-weight:700}
  .footer-copy{font-size:12px;color:rgba(245,237,214,0.4);font-weight:600}

  /* DIVIDER */
  .divider-row{display:flex;align-items:center;gap:16px;margin:32px 0}
  .divider-line{flex:1;height:2px;background:${C.espresso};opacity:0.15}
  .divider-icon{font-size:20px;opacity:0.4}
`;

const navItems = ["Home","Tech Services","Coffee & Food","Events","About","Contact"];

function HomePage({ go }) {
  return (
    <>
      <section className="hero">
        <div className="hero-sunburst">
          <Sunburst size={700} color={C.gold} opacity={0.18} />
        </div>
        <div className="hero-content fade-up">
          <div className="hero-stamp">☕ Honduras-Rooted · Est. 2025</div>
          <h1 className="hero-title">
            <span className="line-red">Café</span>
            Con
            <span className="line-teal"> Pan</span>
          </h1>
          <p className="hero-subtitle">Tech · Coffee · Culture · Community</p>
          <div className="hero-pillars">
            <button className="hero-pillar" onClick={() => go("Tech Services")}>
              <span className="hero-pillar-icon">⌨️</span> Tech Services
            </button>
            <button className="hero-pillar" onClick={() => go("Coffee & Food")}>
              <span className="hero-pillar-icon">☕</span> Coffee & Food
            </button>
            <button className="hero-pillar" onClick={() => go("Events")}>
              <span className="hero-pillar-icon">🎉</span> Events
            </button>
          </div>
          <button className="hero-cta" onClick={() => go("Tech Services")}>
            Get Tech Services →
          </button>
          <div className="hero-domain">pancon.cafe</div>
        </div>
      </section>

      <TextileBorder />

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">Our Story</div>
          <h2 className="section-title">More Than a <span>Cup of Coffee</span></h2>
        </div>
        <p className="section-sub" style={{maxWidth:640,margin:"0 auto",textAlign:"center"}}>At Café Con Pan, we believe coffee is more than a drink — it's a connection. Rooted in our Honduran heritage, we started with a simple idea: to share authentic coffee and bread with our community. That same spirit drives everything we do — from helping small businesses launch and grow through technology, to building a space where culture and community come together. One cup and one connection at a time.</p>
      </section>

      <TextileBorder />

      <section className="section section-alt">
        <div className="section-header">
          <div className="section-eyebrow">Three Pillars, One Brand</div>
          <h2 className="section-title">What We're <span>Building</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,maxWidth:960,margin:"0 auto"}}>
          {[
            { n:"01", icon:"⌨️", title:"Tech Services", col:C.teal, desc:"MDM setup, managed device retainers, IT consulting, and carrier services. Apple-focused. Carrier-agnostic. Client-first.", cta:"Available Now", page:"Tech Services" },
            { n:"02", icon:"☕", title:"Coffee & Food", col:C.red, desc:"A Central American cafe experience rooted in Honduran heritage. Pan dulce, café de olla, and the warmth of home.", cta:"Coming Soon", page:"Coffee & Food" },
            { n:"03", icon:"🎉", title:"Community", col:C.gold, desc:"Cultural programming and events that honor and celebrate Central American roots. A gathering point for community.", cta:"Coming Soon", page:"Events" },
          ].map(p => (
            <div key={p.n} onClick={() => go(p.page)} style={{
              background:C.cream, border:`3px solid ${C.espresso}`,
              padding:"36px 28px",
              boxShadow:`5px 5px 0 ${p.col}`,
              cursor:"pointer", transition:"transform 0.15s,box-shadow 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translate(-2px,-2px)"; e.currentTarget.style.boxShadow=`7px 7px 0 ${p.col}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`5px 5px 0 ${p.col}`; }}>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:64,opacity:0.08,color:C.espresso,lineHeight:1}}>{p.n}</div>
              <div style={{fontSize:36,marginBottom:12}}>{p.icon}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:22,color:C.espresso,marginBottom:10}}>{p.title}</div>
              <p style={{fontSize:14,lineHeight:1.8,color:"#555",fontWeight:600,marginBottom:16}}>{p.desc}</p>
              <span style={{
                display:"inline-block",
                background: p.cta === "Available Now" ? C.espresso : "transparent",
                color: p.cta === "Available Now" ? C.cream : C.espresso,
                border:`2px solid ${C.espresso}`,
                fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                padding:"5px 12px"
              }}>{p.cta}</span>
            </div>
          ))}
        </div>
      </section>

      <TextileBorder flip />

      <section className="section section-dark">
        <div className="section-header">
          <div className="section-eyebrow" style={{color:C.teal}}>The Bigger Picture</div>
          <h2 className="section-title section-title-light">What's Next for <span>Café Con Pan</span></h2>
          <p className="section-sub section-sub-light">The tech arm leads because it's ready. But this brand was always meant to be more — and these are the chapters still being written.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,maxWidth:900,margin:"0 auto"}}>
          {[
            {icon:"☕", title:"Coffee From Home", badge:"In Planning", desc:"Single-origin Honduran coffee sourced from family's land in Central America. Grown with care, brought to your cup."},
            {icon:"🫓", title:"The Café Experience", badge:"In Development", desc:"An authentic Central American cafe — pan dulce, café de olla, and a space that feels like walking into an abuela's kitchen."},
            {icon:"🎉", title:"Cultural Events", badge:"Building Soon", desc:"Community programming that celebrates Central American roots. Music, food, storytelling, and people worth knowing."},
          ].map(c => (
            <div key={c.title} style={{background:"rgba(255,255,255,0.05)",border:`2px solid ${C.beige}33`,padding:32}}>
              <div style={{fontSize:36,marginBottom:12}}>{c.icon}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:20,color:C.cream,marginBottom:8}}>{c.title}</div>
              <span style={{display:"inline-block",background:C.teal,color:C.cream,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",padding:"4px 10px",marginBottom:12}}>{c.badge}</span>
              <p style={{fontSize:14,lineHeight:1.8,color:"rgba(245,237,214,0.65)",fontWeight:600}}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="email-row" style={{marginTop:48,maxWidth:420,margin:"48px auto 0"}}>
          <input className="email-input" placeholder="Stay in the loop — drop your email" />
          <button className="email-btn">I'm In</button>
        </div>
      </section>
    </>
  );
}

function TechPage({ go }) {
  const packages = [
    { icon:"🚀", name:"Open for Business", tag:"Launch Package", desc:"Complete business launch: LLC/EIN guidance, banking, domain + email, website, payment setup, Apple device procurement, MDM enrollment, and full Brands setup.", price:"$2,500 – $5,000+" },
    { icon:"🍎", name:"Apple Presence", tag:"Visibility Package", desc:"For existing businesses ready to show up in Apple's ecosystem: Apple Maps, Branded Mail, Tap to Pay branding, Brand Profile, and Maps Ads readiness.", price:"$500 – $1,500" },
    { icon:"🔁", name:"Apple Operations", tag:"Managed Services", desc:"Ongoing device management, helpdesk, user onboarding/offboarding, software updates, app licensing, and security policy maintenance.", price:"$35 – $50 / device / month" },
    { icon:"📡", name:"Connectivity Consulting", tag:"Carrier & ISP", desc:"Carrier plan audit, negotiation, number porting, new service activation, and ISP setup. 100% carrier-agnostic — we work for you, not the carrier.", price:"$150 – $300 / hr or flat fee" },
    { icon:"🤝", name:"Tech Concierge", tag:"On-Call Support", desc:"Relationship-based on-call tech support for owners who want one trusted number to call. Monthly add-on to any package.", price:"$200 – $500 / month" },
  ];
  return (
    <>
      <section className="section" style={{paddingTop:100}}>
        <div className="section-header">
          <div className="section-eyebrow">Pillar One — Available Now</div>
          <h2 className="section-title">Tech Services for <span>Small Business</span></h2>
          <p className="section-sub">Apple-focused MDM and device management, IT consulting, and carrier services — through one trusted, independent partner.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20,maxWidth:900,margin:"0 auto"}}>
          {packages.map((p, i) => (
            <div key={p.name} className="service-card" style={packages.length % 2 !== 0 && i === packages.length - 1 ? {gridColumn:"1 / -1",maxWidth:"calc(50% - 10px)",margin:"0 auto",width:"100%"} : {}}>
              <span className="service-card-icon">{p.icon}</span>
              <div className="service-card-name">{p.name}</div>
              <p className="service-card-desc">{p.desc}</p>
              <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,color:C.teal,marginBottom:6,marginTop:16}}>{p.tag}</div>
              <span className="service-card-price">{p.price}</span>
            </div>
          ))}
        </div>
      </section>

      <TextileBorder />

      <section className="section section-dark">
        <div className="section-header">
          <div className="section-eyebrow" style={{color:C.teal}}>Credentials & Structure</div>
          <h2 className="section-title section-title-light">Built to <span>Back It Up</span></h2>
          <p className="section-sub section-sub-light">Certifications, legal structure, and partner programs in place before going to market — because credibility is built before the first client, not after.</p>
        </div>
        <div className="creds-row">
          {[
            {label:"MDM Certifications",val:"Jamf · Mosyle"},
            {label:"Apple Partnership",val:"ACN — Pending"},
            {label:"Carrier Approach",val:"100% Agnostic"},
            {label:"Legal Structure",val:"LLC · EIN"},
            {label:"Tax Status",val:"Reseller Exempt"},
          ].map(c => (
            <div key={c.label} className="cred-badge">
              <div className="cred-badge-label">{c.label}</div>
              <div className="cred-badge-val">{c.val}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:48}}>
          <button className="hero-cta" onClick={() => go("Contact")}>Request a Consultation →</button>
        </div>
      </section>

      <TextileBorder flip />
    </>
  );
}

function TeaserPage({ eyebrow, title, accent, body, quote, placeholder }) {
  return (
    <>
      <section className="section" style={{paddingTop:100,background:C.cream,position:"relative",overflow:"hidden",minHeight:"60vh",display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",right:-100,top:"50%",transform:"translateY(-50%)",opacity:0.12}}>
          <Sunburst size={500} color={C.gold} opacity={0.8} />
        </div>
        <div className="teaser-inner" style={{position:"relative",zIndex:2}}>
          <span className="coming-tag">Coming Soon</span>
          <h2 className="teaser-title">{title} <span>{accent}</span></h2>
          <p className="teaser-body">{body}</p>
          <div className="email-row">
            <input className="email-input" placeholder={placeholder} />
            <button className="email-btn">Notify Me</button>
          </div>
        </div>
      </section>
      <TextileBorder />
      <section className="section section-dark" style={{textAlign:"center"}}>
        <blockquote style={{
          fontFamily:"'Pacifico',cursive",fontSize:28,color:C.blush,
          lineHeight:1.5,maxWidth:600,margin:"0 auto",
          paddingBottom:24,borderBottom:`2px solid ${C.beige}33`
        }}>"{quote}"</blockquote>
        <div className="section-eyebrow" style={{marginTop:20}}>— Café Con Pan</div>
      </section>
      <TextileBorder flip />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <section className="section" style={{paddingTop:100}}>
        <div className="section-header">
          <div className="section-eyebrow">The Story</div>
          <h2 className="section-title">Roots, <span>Community,</span> Purpose</h2>
        </div>
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-frame">
              <div style={{fontSize:48,marginBottom:16}}>☕🫓</div>
              <div className="about-quote">"Three things my culture always did well: make great coffee, take care of each other, and build things that last."</div>
              <div className="about-quote-attr">— Café Con Pan</div>
            </div>
          </div>
          <div>
            <div className="about-body">
              <p>Café Con Pan is a multi-arm brand rooted in Central American heritage — specifically Honduran culture — and built around three interconnected pillars: technology services, coffee and food, and community programming.</p>
              <p>The tech arm leads because it's ready. Years of hands-on experience at Apple and in carrier services, now channeled through an independent practice built with the right credentials: LLC, EIN, reseller exemption, Jamf and Mosyle certifications in progress, and ACN on the horizon.</p>
              <p>The cafe and events arms are developing in parallel — not as afterthoughts, but as the beating heart of what this brand is ultimately becoming. A place. A gathering point. Something that tastes and feels like home.</p>
            </div>
            <div className="about-stats">
              <div><div className="about-stat-num">3</div><div className="about-stat-label">Brand Pillars</div></div>
              <div><div className="about-stat-num">2</div><div className="about-stat-label">Certs In Progress</div></div>
              <div><div className="about-stat-num">🇭🇳</div><div className="about-stat-label">Honduras Roots</div></div>
            </div>
          </div>
        </div>
      </section>
      <TextileBorder />
    </>
  );
}

function ContactPage() {
  return (
    <section className="section" style={{paddingTop:100}}>
      <div className="section-header">
        <div className="section-eyebrow">Get in Touch</div>
        <h2 className="section-title">Let's <span>Talk</span></h2>
        <p className="section-sub">Ready to talk tech services, or just want to follow the Café Con Pan journey?</p>
      </div>
      <div className="contact-grid">
        <div>
          {[
            {label:"Email",val:"hello@pancon.cafe"},
            {label:"Website",val:"pancon.cafe"},
            {label:"Business",val:"Cafe Con Pan LLC"},
            {label:"Services",val:"Tech · Coffee · Culture"},
          ].map(i => (
            <div key={i.label} className="contact-info-item">
              <div className="contact-info-label">{i.label}</div>
              <div className="contact-info-val">{i.val}</div>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <SteamSVG />
          </div>
        </div>
        <div>
          <div className="form-field">
            <label className="form-label">Your Name</label>
            <input className="form-input" placeholder="Full name" />
          </div>
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input className="form-input" placeholder="you@company.com" />
          </div>
          <div className="form-field">
            <label className="form-label">Inquiry Type</label>
            <select className="form-select">
              <option>Tech Services — MDM & Device Management</option>
              <option>Tech Services — Carrier Audit & Negotiation</option>
              <option>Tech Services — IT Consulting</option>
              <option>Partnership Inquiry</option>
              <option>Coffee & Events — Stay in the Loop</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" placeholder="Tell us about your business and what you need..." />
          </div>
          <button className="submit-btn">Send It →</button>
        </div>
      </div>
    </section>
  );
}

export default function CafeConPan() {
  const [page, setPage] = useState("Home");

  const go = (p) => { setPage(p); window.scrollTo(0,0); };

  useEffect(() => { window.scrollTo(0,0); }, [page]);

  const renderPage = () => {
    switch(page) {
      case "Home": return <HomePage go={go} />;
      case "Tech Services": return <TechPage go={go} />;
      case "Coffee & Food": return <TeaserPage
        eyebrow="Pillar Two" title="Coffee &" accent="Food"
        body="A cafe experience rooted in Central American tradition. Pan dulce fresh from the oven, café de olla brewed the right way, and a space that feels like walking into an abuela's kitchen."
        quote="Coffee is how Central Americans say good morning, welcome home, and I'm glad you're here."
        placeholder="Your email — we'll let you know when we open" />;
      case "Events": return <TeaserPage
        eyebrow="Pillar Three" title="Community &" accent="Events"
        body="Cultural programming, community gatherings, and events that celebrate Central American roots. Music, food, storytelling, and people worth knowing. Something worth showing up for."
        quote="Community isn't a feature. It's the whole point."
        placeholder="Get notified when events are announced" />;
      case "About": return <AboutPage />;
      case "Contact": return <ContactPage />;
      default: return <HomePage go={go} />;
    }
  };

  return (
    <>
      <style>{fonts + css}</style>
      <div className="grain" />
      <nav>
        <div className="nav-logo" onClick={() => go("Home")}>
          Café Con <span>Pan</span>
        </div>
        <div className="nav-links">
          {navItems.map(n => (
            <button key={n} className={`nav-btn ${page===n?"active":""}`} onClick={() => go(n)}>{n}</button>
          ))}
          <button className="nav-cta-btn" onClick={() => go("Contact")}>Get a Quote</button>
        </div>
      </nav>
      <main style={{paddingTop:0}}>{renderPage()}</main>
      <TextileBorder />
      <footer>
        <div className="footer-logo">Café Con <span>Pan</span></div>
        <div className="footer-tagline">Tech · Coffee · Culture</div>
        <div className="footer-copy">© 2026 Cafe Con Pan LLC · pancon.cafe</div>
      </footer>
    </>
  );
}
