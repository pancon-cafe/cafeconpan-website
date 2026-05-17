import { useState, useEffect, useRef } from "react";
import CafeGame from "./CafeGame";

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

const STRINGS = {
  en: {
    nav: { items:["Home","Tech Services","Coffee & Food","Events","About","Contact"], cta:"Get a Quote", langBtn:"ES" },
    hero: { stamp:"☕ Honduras-Rooted · Est. 2025", subtitle:"Tech · Coffee · Culture · Community", pillars:["Tech Services","Coffee & Food","Events"], cta:"Get Tech Services →" },
    story: { eyebrow:"Our Story", title:"More Than a", titleSpan:"Cup of Coffee", body:"At Café Con Pan, we believe coffee is more than a drink — it's a connection. Rooted in our Honduran heritage, we started with a simple idea: to share authentic coffee and bread with our community. That same spirit drives everything we do — from helping small businesses launch and grow through technology, to building a space where culture and community come together. One cup and one connection at a time." },
    pillars: {
      eyebrow:"Three Pillars, One Brand", title:"What We're", titleSpan:"Building",
      cards:[
        { n:"01", icon:"⌨️", title:"Tech Services", desc:"MDM setup, managed device retainers, IT consulting, and carrier services. Apple-focused. Carrier-agnostic. Client-first.", cta:"Available Now", page:"Tech Services" },
        { n:"02", icon:"☕", title:"Coffee & Food", desc:"A Central American cafe experience rooted in Honduran heritage. Pan dulce, café de olla, and the warmth of home.", cta:"Coming Soon", page:"Coffee & Food" },
        { n:"03", icon:"🎉", title:"Community", desc:"Cultural programming and events that honor and celebrate Central American roots. A gathering point for community.", cta:"Coming Soon", page:"Events" },
      ],
    },
    biggerPicture: {
      eyebrow:"The Bigger Picture", title:"What's Next for", titleSpan:"Café Con Pan",
      sub:"The tech arm leads because it's ready. But this brand was always meant to be more — and these are the chapters still being written.",
      cards:[
        { icon:"☕", title:"Coffee From Home", badge:"In Planning", desc:"Single-origin Honduran coffee sourced from family's land in Central America. Grown with care, brought to your cup." },
        { icon:"🫓", title:"The Café Experience", badge:"In Development", desc:"An authentic Central American cafe — pan dulce, café de olla, and a space that feels like walking into an abuela's kitchen." },
        { icon:"🎉", title:"Cultural Events", badge:"Building Soon", desc:"Community programming that celebrates Central American roots. Music, food, storytelling, and people worth knowing." },
      ],
      emailPlaceholder:"Stay in the loop — drop your email", emailBtn:"I'm In",
    },
    tech: {
      eyebrow:"Pillar One — Available Now", title:"Tech Services for", titleSpan:"Small Business",
      sub:"Apple-focused MDM and device management, IT consulting, and carrier services — through one trusted, independent partner.",
      packages:[
        { icon:"🚀", name:"Open for Business", tag:"Launch Package", desc:"Complete business launch: LLC/EIN guidance, banking, domain + email, website, payment setup, Apple device procurement, MDM enrollment, and full Brands setup.", price:"$2,500 – $5,000+" },
        { icon:"🍎", name:"Apple Presence", tag:"Visibility Package", desc:"For existing businesses ready to show up in Apple's ecosystem: Apple Maps, Branded Mail, Tap to Pay branding, Brand Profile, and Maps Ads readiness.", price:"$500 – $1,500" },
        { icon:"🔁", name:"Apple Operations", tag:"Managed Services", desc:"Ongoing device management, helpdesk, user onboarding/offboarding, software updates, app licensing, and security policy maintenance.", price:"$35 – $50 / device / month" },
        { icon:"📡", name:"Connectivity Consulting", tag:"Carrier & ISP", desc:"Carrier plan audit, negotiation, number porting, new service activation, and ISP setup. 100% carrier-agnostic — we work for you, not the carrier.", price:"$150 – $300 / hr or flat fee" },
        { icon:"🤝", name:"Tech Concierge", tag:"On-Call Support", desc:"Relationship-based on-call tech support for owners who want one trusted number to call. Monthly add-on to any package.", price:"$200 – $500 / month" },
      ],
      creds:{
        eyebrow:"Credentials & Structure", title:"Built to", titleSpan:"Back It Up",
        sub:"Certifications, legal structure, and partner programs in place before going to market — because credibility is built before the first client, not after.",
        badges:[
          {label:"MDM Certifications",val:"Jamf · Mosyle"},
          {label:"Apple Partnership",val:"ACN — Pending"},
          {label:"Carrier Approach",val:"100% Agnostic"},
          {label:"Legal Structure",val:"LLC · EIN"},
          {label:"Tax Status",val:"Reseller Exempt"},
        ],
        cta:"Request a Consultation →",
      },
    },
    coffeeTeaser:{ eyebrow:"Pillar Two", title:"Coffee &", accent:"Food", body:"A cafe experience rooted in Central American tradition. Pan dulce fresh from the oven, café de olla brewed the right way, and a space that feels like walking into an abuela's kitchen.", quote:"Coffee is how Central Americans say good morning, welcome home, and I'm glad you're here.", placeholder:"Your email — we'll let you know when we open" },
    eventsTeaser:{ eyebrow:"Pillar Three", title:"Community &", accent:"Events", body:"Cultural programming, community gatherings, and events that celebrate Central American roots. Music, food, storytelling, and people worth knowing. Something worth showing up for.", quote:"Community isn't a feature. It's the whole point.", placeholder:"Get notified when events are announced" },
    about:{
      eyebrow:"The Story", title:"Roots,", titleSpan:"Community,", titleEnd:"Purpose",
      quote:"Three things my culture always did well: make great coffee, take care of each other, and build things that last.",
      quoteAttr:"— Café Con Pan",
      body1:"Café Con Pan is a multi-arm brand rooted in Central American heritage — specifically Honduran culture — and built around three interconnected pillars: technology services, coffee and food, and community programming.",
      body2:"The tech arm leads because it's ready. Years of hands-on experience at Apple and in carrier services, now channeled through an independent practice built with the right credentials: LLC, EIN, reseller exemption, Jamf and Mosyle certifications in progress, and ACN on the horizon.",
      body3:"The cafe and events arms are developing in parallel — not as afterthoughts, but as the beating heart of what this brand is ultimately becoming. A place. A gathering point. Something that tastes and feels like home.",
      stats:[{num:"3",label:"Brand Pillars"},{num:"2",label:"Certs In Progress"},{num:"🇭🇳",label:"Honduras Roots"}],
    },
    contact:{
      eyebrow:"Get in Touch", title:"Let's", titleSpan:"Talk",
      sub:"Ready to talk tech services, or just want to follow the Café Con Pan journey?",
      info:[{label:"Email",val:"hello@pancon.cafe"},{label:"Website",val:"pancon.cafe"},{label:"Business",val:"Cafe Con Pan LLC"},{label:"Services",val:"Tech · Coffee · Culture"}],
      nameLabel:"Your Name", namePlaceholder:"Full name",
      emailLabel:"Email Address", emailPlaceholder:"you@company.com",
      inquiryLabel:"Inquiry Type", messageLabel:"Message", messagePlaceholder:"Tell us about your business and what you need...",
      options:["Tech Services — MDM & Device Management","Tech Services — Carrier Audit & Negotiation","Tech Services — IT Consulting","Partnership Inquiry","Coffee & Events — Stay in the Loop"],
      submit:"Send It →", submitting:"Sending...",
      success:"Message sent! We'll be in touch soon. ☕",
      error:"Something went wrong. Please try again or email us directly at hello@pancon.cafe.",
    },
    footer:{ tagline:"Tech · Coffee · Culture", copy:"© 2026 Cafe Con Pan LLC · pancon.cafe" },
  },
  es: {
    nav: { items:["Inicio","Servicios Tech","Café & Pan","Eventos","Nosotros","Contacto"], cta:"Cotización", langBtn:"EN" },
    hero: { stamp:"☕ Raíces Hondureñas · Est. 2025", subtitle:"Tech · Café · Cultura · Comunidad", pillars:["Servicios Tech","Café & Pan","Eventos"], cta:"Ver Servicios Tech →" },
    story: { eyebrow:"Nuestra Historia", title:"Más Que una", titleSpan:"Taza de Café", body:"En Café Con Pan, creemos que el café es más que una bebida — es una conexión. Con raíces en nuestra herencia hondureña, comenzamos con una idea simple: compartir café y pan auténtico con nuestra comunidad. Ese mismo espíritu impulsa todo lo que hacemos — desde ayudar a pequeños negocios a crecer mediante la tecnología, hasta construir un espacio donde la cultura y la comunidad se unen. Una taza y una conexión a la vez." },
    pillars: {
      eyebrow:"Tres Pilares, Una Marca", title:"Lo Que Estamos", titleSpan:"Construyendo",
      cards:[
        { n:"01", icon:"⌨️", title:"Servicios Tech", desc:"Configuración de MDM, gestión de dispositivos, consultoría IT y servicios de carrier. Enfocados en Apple. Independientes del carrier. El cliente primero.", cta:"Disponible Ahora", page:"Tech Services" },
        { n:"02", icon:"☕", title:"Café & Pan", desc:"Una experiencia de café centroamericano con raíces hondureñas. Pan dulce, café de olla y el calor del hogar.", cta:"Próximamente", page:"Coffee & Food" },
        { n:"03", icon:"🎉", title:"Comunidad", desc:"Programas culturales y eventos que honran y celebran las raíces centroamericanas. Un punto de encuentro para la comunidad.", cta:"Próximamente", page:"Events" },
      ],
    },
    biggerPicture: {
      eyebrow:"El Panorama General", title:"Lo Que Sigue para", titleSpan:"Café Con Pan",
      sub:"El brazo tecnológico lidera porque está listo. Pero esta marca siempre fue pensada para ser más — y estos son los capítulos que aún se están escribiendo.",
      cards:[
        { icon:"☕", title:"Café de Casa", badge:"En Planificación", desc:"Café hondureño de origen único cultivado en tierras familiares en Centroamérica. Cultivado con cuidado, llevado a tu taza." },
        { icon:"🫓", title:"La Experiencia del Café", badge:"En Desarrollo", desc:"Un café centroamericano auténtico — pan dulce, café de olla y un espacio que se siente como entrar a la cocina de una abuela." },
        { icon:"🎉", title:"Eventos Culturales", badge:"Próximamente", desc:"Programas comunitarios que celebran las raíces centroamericanas. Música, comida, historias y personas que vale la pena conocer." },
      ],
      emailPlaceholder:"Mantente al día — deja tu correo", emailBtn:"¡Apúntame!",
    },
    tech: {
      eyebrow:"Pilar Uno — Disponible Ahora", title:"Servicios Tech para", titleSpan:"Pequeños Negocios",
      sub:"Gestión de dispositivos Apple y MDM, consultoría IT y servicios de carrier — a través de un socio independiente de confianza.",
      packages:[
        { icon:"🚀", name:"Abrir el Negocio", tag:"Paquete de Lanzamiento", desc:"Lanzamiento completo del negocio: orientación para LLC/EIN, banca, dominio + correo, sitio web, configuración de pagos, adquisición de dispositivos Apple, inscripción MDM y configuración completa de Brands.", price:"$2,500 – $5,000+" },
        { icon:"🍎", name:"Presencia Apple", tag:"Paquete de Visibilidad", desc:"Para negocios existentes listos para aparecer en el ecosistema de Apple: Apple Maps, correo con marca, branding Tap to Pay, Perfil de Marca y preparación para Maps Ads.", price:"$500 – $1,500" },
        { icon:"🔁", name:"Operaciones Apple", tag:"Servicios Gestionados", desc:"Gestión continua de dispositivos, helpdesk, incorporación y desvinculación de usuarios, actualizaciones de software, licencias de apps y mantenimiento de políticas de seguridad.", price:"$35 – $50 / dispositivo / mes" },
        { icon:"📡", name:"Consultoría de Conectividad", tag:"Carrier e ISP", desc:"Auditoría de plan de carrier, negociación, portabilidad de número, activación de nuevo servicio y configuración de ISP. 100% independiente del carrier — trabajamos para ti, no para el carrier.", price:"$150 – $300 / hr o tarifa fija" },
        { icon:"🤝", name:"Tech Concierge", tag:"Soporte On-Call", desc:"Soporte técnico on-call basado en relaciones para propietarios que quieren un número de confianza al que llamar. Complemento mensual a cualquier paquete.", price:"$200 – $500 / mes" },
      ],
      creds:{
        eyebrow:"Credenciales y Estructura", title:"Construido para", titleSpan:"Respaldarlo",
        sub:"Certificaciones, estructura legal y programas de socios en marcha antes de salir al mercado — porque la credibilidad se construye antes del primer cliente, no después.",
        badges:[
          {label:"Certificaciones MDM",val:"Jamf · Mosyle"},
          {label:"Asociación Apple",val:"ACN — Pendiente"},
          {label:"Enfoque Carrier",val:"100% Independiente"},
          {label:"Estructura Legal",val:"LLC · EIN"},
          {label:"Estado Fiscal",val:"Exención Revendedor"},
        ],
        cta:"Solicitar una Consulta →",
      },
    },
    coffeeTeaser:{ eyebrow:"Pilar Dos", title:"Café &", accent:"Pan", body:"Una experiencia de café con raíces en la tradición centroamericana. Pan dulce recién salido del horno, café de olla preparado de la manera correcta y un espacio que se siente como entrar a la cocina de una abuela.", quote:"El café es como los centroamericanos dicen buenos días, bienvenido a casa y me alegra que estés aquí.", placeholder:"Tu correo — te avisaremos cuando abramos" },
    eventsTeaser:{ eyebrow:"Pilar Tres", title:"Comunidad &", accent:"Eventos", body:"Programas culturales, encuentros comunitarios y eventos que celebran las raíces centroamericanas. Música, comida, historias y personas que vale la pena conocer. Algo por lo que vale la pena aparecer.", quote:"La comunidad no es una característica. Es el punto central.", placeholder:"Recibe notificación cuando se anuncien eventos" },
    about:{
      eyebrow:"La Historia", title:"Raíces,", titleSpan:"Comunidad,", titleEnd:"Propósito",
      quote:"Tres cosas que mi cultura siempre hizo bien: hacer un gran café, cuidarse mutuamente y construir cosas que duran.",
      quoteAttr:"— Café Con Pan",
      body1:"Café Con Pan es una marca multidimensional arraigada en la herencia centroamericana — específicamente en la cultura hondureña — y construida alrededor de tres pilares interconectados: servicios tecnológicos, café y comida, y programas comunitarios.",
      body2:"El brazo tecnológico lidera porque está listo. Años de experiencia práctica en Apple y en servicios de carrier, ahora canalizados a través de una práctica independiente con las credenciales correctas: LLC, EIN, exención de revendedor, certificaciones Jamf y Mosyle en progreso, y ACN en el horizonte.",
      body3:"El café y los eventos se están desarrollando en paralelo — no como ideas secundarias, sino como el corazón palpitante de lo que esta marca está destinada a convertirse. Un lugar. Un punto de encuentro. Algo que sabe y se siente como el hogar.",
      stats:[{num:"3",label:"Pilares de Marca"},{num:"2",label:"Certs en Progreso"},{num:"🇭🇳",label:"Raíces Hondureñas"}],
    },
    contact:{
      eyebrow:"Ponte en Contacto", title:"", titleSpan:"Hablemos",
      sub:"¿Listo para hablar de servicios tech o simplemente quieres seguir el viaje de Café Con Pan?",
      info:[{label:"Correo",val:"hello@pancon.cafe"},{label:"Sitio Web",val:"pancon.cafe"},{label:"Negocio",val:"Cafe Con Pan LLC"},{label:"Servicios",val:"Tech · Café · Cultura"}],
      nameLabel:"Tu Nombre", namePlaceholder:"Nombre completo",
      emailLabel:"Correo Electrónico", emailPlaceholder:"tu@empresa.com",
      inquiryLabel:"Tipo de Consulta", messageLabel:"Mensaje", messagePlaceholder:"Cuéntanos sobre tu negocio y lo que necesitas...",
      options:["Servicios Tech — Gestión MDM y Dispositivos","Servicios Tech — Auditoría y Negociación de Carrier","Servicios Tech — Consultoría IT","Consulta de Asociación","Café & Eventos — Mantente al Día"],
      submit:"Enviar →", submitting:"Enviando...",
      success:"¡Mensaje enviado! Estaremos en contacto pronto. ☕",
      error:"Algo salió mal. Inténtalo de nuevo o escríbenos directamente a hello@pancon.cafe.",
    },
    footer:{ tagline:"Tech · Café · Cultura", copy:"© 2026 Cafe Con Pan LLC · pancon.cafe" },
  },
};

const getBrowserLang = () => {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("es") ? "es" : "en";
};

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Nunito',sans-serif;background:${C.cream};overflow-x:hidden}

  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
  .fade-up{animation:fadeUp 0.6s ease forwards}
  .pop{animation:pop 0.5s ease forwards}

  .grain{position:fixed;inset:0;pointer-events:none;z-index:200;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity:0.5}

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
  .lang-btn{background:transparent;color:${C.cream};cursor:pointer;
    font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;
    letter-spacing:0.12em;text-transform:uppercase;
    padding:6px 10px;border:2px solid rgba(245,237,214,0.3);
    transition:border-color 0.2s,color 0.2s;margin-left:4px}
  .lang-btn:hover{border-color:${C.blush};color:${C.blush}}

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

  .creds-row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:48px}
  .cred-badge{border:3px solid ${C.beige};padding:16px 28px;text-align:center;
    background:rgba(245,237,214,0.08)}
  .cred-badge-label{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;
    color:${C.beige};opacity:0.7;margin-bottom:6px;font-weight:700}
  .cred-badge-val{font-family:'Lilita One',cursive;font-size:17px;color:${C.cream}}

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
    background:${C.cream};font-family:'Nunito',sans-serif;font-size:16px;
    font-weight:600;color:${C.espresso}}
  .email-input::placeholder{color:#bbb}
  .email-btn{background:${C.espresso};color:${C.cream};border:none;
    padding:14px 20px;cursor:pointer;
    font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;
    transition:background 0.2s}
  .email-btn:hover{background:${C.red}}

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
    font-size:16px;font-weight:600;outline:none;
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

  footer{background:${C.espresso};padding:48px 40px;
    display:flex;justify-content:space-between;align-items:center;
    flex-wrap:wrap;gap:24px}
  .footer-logo{font-family:'Pacifico',cursive;font-size:22px;color:${C.cream}}
  .footer-logo span{color:${C.blush}}
  .footer-tagline{font-size:12px;letter-spacing:0.15em;text-transform:uppercase;
    color:${C.teal};font-weight:700}
  .footer-copy{font-size:12px;color:rgba(245,237,214,0.4);font-weight:600}

  .divider-row{display:flex;align-items:center;gap:16px;margin:32px 0}
  .divider-line{flex:1;height:2px;background:${C.espresso};opacity:0.15}
  .divider-icon{font-size:20px;opacity:0.4}

  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:960px;margin:0 auto}
  .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:900px;margin:0 auto}
  .grid-2>*:last-child:nth-child(odd){grid-column:1/-1;max-width:calc(50% - 10px);margin:0 auto;width:100%}

  .nav-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:6px}
  .nav-hamburger span{display:block;width:22px;height:2px;background:${C.cream};border-radius:2px}

  @media(max-width:768px){
    nav{padding:0 20px}
    .nav-links{display:none}
    .nav-links.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:${C.espresso};padding:16px 20px 24px;gap:2px;z-index:99;border-bottom:3px solid ${C.beige}}
    .nav-btn{width:100%;text-align:left;padding:12px 10px;font-size:14px}
    .nav-cta-btn{width:100%;text-align:center;margin-top:12px;padding:14px 20px}
    .lang-btn{margin-top:8px;width:100%;text-align:center}
    .nav-hamburger{display:flex}
    .hero{padding:100px 24px 48px;min-height:auto}
    .hero-pillars{flex-direction:column;align-items:stretch}
    .hero-pillar{justify-content:center}
    .section{padding:56px 24px}
    .services-grid{grid-template-columns:1fr}
    .about-grid{grid-template-columns:1fr;gap:36px}
    .contact-grid{grid-template-columns:1fr;gap:36px}
    .grid-3,.grid-2{grid-template-columns:1fr}
    .grid-2>*:last-child:nth-child(odd){max-width:100%;grid-column:auto}
    .creds-row{gap:12px}
    .about-stats{gap:24px}
    footer{flex-direction:column;text-align:center;padding:40px 24px;gap:16px}
    .email-row{flex-direction:column}
    .email-input,.email-btn{width:100%;box-sizing:border-box}
    .email-btn{padding:14px 20px;text-align:center}
  }
`;

const navKeys = ["Home","Tech Services","Coffee & Food","Events","About","Contact"];

const PAGE_HASH = {
  "Home":"home","Tech Services":"tech-services","Coffee & Food":"coffee-food",
  "Events":"events","About":"about","Contact":"contact",
};
const HASH_PAGE = Object.fromEntries(Object.entries(PAGE_HASH).map(([k,v])=>[v,k]));
const getPageFromHash = () => HASH_PAGE[window.location.hash.replace("#","")] || "Home";

function HomePage({ go, t }) {
  return (
    <>
      <section className="hero">
        <div className="hero-sunburst">
          <Sunburst size={700} color={C.gold} opacity={0.18} />
        </div>
        <div className="hero-content fade-up">
          <div className="hero-stamp">{t.hero.stamp}</div>
          <h1 className="hero-title">
            <span className="line-red">Café</span>
            Con
            <span className="line-teal"> Pan</span>
          </h1>
          <p className="hero-subtitle">{t.hero.subtitle}</p>
          <div className="hero-pillars">
            <button className="hero-pillar" onClick={() => go("Tech Services")}>
              <span className="hero-pillar-icon">⌨️</span> {t.hero.pillars[0]}
            </button>
            <button className="hero-pillar" onClick={() => go("Coffee & Food")}>
              <span className="hero-pillar-icon">☕</span> {t.hero.pillars[1]}
            </button>
            <button className="hero-pillar" onClick={() => go("Events")}>
              <span className="hero-pillar-icon">🎉</span> {t.hero.pillars[2]}
            </button>
          </div>
          <button className="hero-cta" onClick={() => go("Tech Services")}>{t.hero.cta}</button>
          <div className="hero-domain">pancon.cafe</div>
        </div>
      </section>

      <TextileBorder />

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">{t.story.eyebrow}</div>
          <h2 className="section-title">{t.story.title} <span>{t.story.titleSpan}</span></h2>
        </div>
        <p className="section-sub" style={{maxWidth:640,margin:"0 auto",textAlign:"center"}}>{t.story.body}</p>
      </section>

      <TextileBorder />

      <section className="section section-alt">
        <div className="section-header">
          <div className="section-eyebrow">{t.pillars.eyebrow}</div>
          <h2 className="section-title">{t.pillars.title} <span>{t.pillars.titleSpan}</span></h2>
        </div>
        <div className="grid-3">
          {t.pillars.cards.map(p => (
            <div key={p.n} onClick={() => go(p.page)} style={{
              background:C.cream, border:`3px solid ${C.espresso}`,
              padding:"36px 28px",
              boxShadow:`5px 5px 0 ${p.n==="01"?C.teal:p.n==="02"?C.red:C.gold}`,
              cursor:"pointer", transition:"transform 0.15s,box-shadow 0.15s"
            }}
            onMouseEnter={e => { const col=p.n==="01"?C.teal:p.n==="02"?C.red:C.gold; e.currentTarget.style.transform="translate(-2px,-2px)"; e.currentTarget.style.boxShadow=`7px 7px 0 ${col}`; }}
            onMouseLeave={e => { const col=p.n==="01"?C.teal:p.n==="02"?C.red:C.gold; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`5px 5px 0 ${col}`; }}>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:64,opacity:0.08,color:C.espresso,lineHeight:1}}>{p.n}</div>
              <div style={{fontSize:36,marginBottom:12}}>{p.icon}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:22,color:C.espresso,marginBottom:10}}>{p.title}</div>
              <p style={{fontSize:14,lineHeight:1.8,color:"#555",fontWeight:600,marginBottom:16}}>{p.desc}</p>
              <span style={{
                display:"inline-block",
                background: p.cta === "Available Now" || p.cta === "Disponible Ahora" ? C.espresso : "transparent",
                color: p.cta === "Available Now" || p.cta === "Disponible Ahora" ? C.cream : C.espresso,
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
          <div className="section-eyebrow" style={{color:C.teal}}>{t.biggerPicture.eyebrow}</div>
          <h2 className="section-title section-title-light">{t.biggerPicture.title} <span>{t.biggerPicture.titleSpan}</span></h2>
          <p className="section-sub section-sub-light">{t.biggerPicture.sub}</p>
        </div>
        <div className="grid-3">
          {t.biggerPicture.cards.map(c => (
            <div key={c.title} style={{background:"rgba(255,255,255,0.05)",border:`2px solid ${C.beige}33`,padding:32}}>
              <div style={{fontSize:36,marginBottom:12}}>{c.icon}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:20,color:C.cream,marginBottom:8}}>{c.title}</div>
              <span style={{display:"inline-block",background:C.teal,color:C.cream,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",padding:"4px 10px",marginBottom:12}}>{c.badge}</span>
              <p style={{fontSize:14,lineHeight:1.8,color:"rgba(245,237,214,0.65)",fontWeight:600}}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="email-row" style={{marginTop:48,maxWidth:420,margin:"48px auto 0"}}>
          <input className="email-input" placeholder={t.biggerPicture.emailPlaceholder} />
          <button className="email-btn">{t.biggerPicture.emailBtn}</button>
        </div>
      </section>
    </>
  );
}

function TechPage({ go, t }) {
  return (
    <>
      <section className="section" style={{paddingTop:100}}>
        <div className="section-header">
          <div className="section-eyebrow">{t.tech.eyebrow}</div>
          <h2 className="section-title">{t.tech.title} <span>{t.tech.titleSpan}</span></h2>
          <p className="section-sub">{t.tech.sub}</p>
        </div>
        <div className="grid-2">
          {t.tech.packages.map((p) => (
            <div key={p.name} className="service-card">
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
          <div className="section-eyebrow" style={{color:C.teal}}>{t.tech.creds.eyebrow}</div>
          <h2 className="section-title section-title-light">{t.tech.creds.title} <span>{t.tech.creds.titleSpan}</span></h2>
          <p className="section-sub section-sub-light">{t.tech.creds.sub}</p>
        </div>
        <div className="creds-row">
          {t.tech.creds.badges.map(c => (
            <div key={c.label} className="cred-badge">
              <div className="cred-badge-label">{c.label}</div>
              <div className="cred-badge-val">{c.val}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:48}}>
          <button className="hero-cta" onClick={() => go("Contact")}>{t.tech.creds.cta}</button>
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
          <span className="coming-tag">{eyebrow}</span>
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

function AboutPage({ t }) {
  return (
    <>
      <section className="section" style={{paddingTop:100}}>
        <div className="section-header">
          <div className="section-eyebrow">{t.about.eyebrow}</div>
          <h2 className="section-title">{t.about.title} <span>{t.about.titleSpan}</span> {t.about.titleEnd}</h2>
        </div>
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-frame">
              <div style={{fontSize:48,marginBottom:16}}>☕🫓</div>
              <div className="about-quote">"{t.about.quote}"</div>
              <div className="about-quote-attr">{t.about.quoteAttr}</div>
            </div>
          </div>
          <div>
            <div className="about-body">
              <p>{t.about.body1}</p>
              <p>{t.about.body2}</p>
              <p>{t.about.body3}</p>
            </div>
            <div className="about-stats">
              {t.about.stats.map(s => (
                <div key={s.label}>
                  <div className="about-stat-num">{s.num}</div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <TextileBorder />
    </>
  );
}

function ContactPage({ t }) {
  const [form, setForm] = useState({name:"",email:"",inquiry:t.contact.options[0],message:""});
  const [status, setStatus] = useState("idle");

  const handle = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async e => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          access_key:"bb35de9c-0515-4e74-9f2f-202d6fd033b8",
          name:form.name,
          email:form.email,
          subject:form.inquiry,
          message:form.message,
          replyto:form.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm({name:"",email:"",inquiry:t.contact.options[0],message:""});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="section" style={{paddingTop:100}}>
      <div className="section-header">
        <div className="section-eyebrow">{t.contact.eyebrow}</div>
        <h2 className="section-title">{t.contact.title}{t.contact.title ? " " : ""}<span>{t.contact.titleSpan}</span></h2>
        <p className="section-sub">{t.contact.sub}</p>
      </div>
      <div className="contact-grid">
        <div>
          {t.contact.info.map(i => (
            <div key={i.label} className="contact-info-item">
              <div className="contact-info-label">{i.label}</div>
              <div className="contact-info-val">{i.val}</div>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <SteamSVG />
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="form-field">
            <label className="form-label">{t.contact.nameLabel}</label>
            <input className="form-input" name="name" placeholder={t.contact.namePlaceholder} value={form.name} onChange={handle} required />
          </div>
          <div className="form-field">
            <label className="form-label">{t.contact.emailLabel}</label>
            <input className="form-input" name="email" type="email" placeholder={t.contact.emailPlaceholder} value={form.email} onChange={handle} required />
          </div>
          <div className="form-field">
            <label className="form-label">{t.contact.inquiryLabel}</label>
            <select className="form-select" name="inquiry" value={form.inquiry} onChange={handle}>
              {t.contact.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">{t.contact.messageLabel}</label>
            <textarea className="form-textarea" name="message" placeholder={t.contact.messagePlaceholder} value={form.message} onChange={handle} required />
          </div>
          {status === "success" && (
            <div style={{background:"#5A9E9622",border:`2px solid ${C.teal}`,padding:"14px 18px",marginBottom:16,color:C.espresso,fontWeight:700,fontSize:14}}>
              {t.contact.success}
            </div>
          )}
          {status === "error" && (
            <div style={{background:"#B8503E22",border:`2px solid ${C.red}`,padding:"14px 18px",marginBottom:16,color:C.espresso,fontWeight:700,fontSize:14}}>
              {t.contact.error}
            </div>
          )}
          <button className="submit-btn" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? t.contact.submitting : t.contact.submit}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function CafeConPan() {
  const [page, setPage] = useState(getPageFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState(getBrowserLang);
  const [gameActive, setGameActive] = useState(false);
  const typedRef = useRef("");

  const t = STRINGS[lang];
  const go = (p) => {
    setPage(p); setMenuOpen(false); window.scrollTo(0,0);
    window.location.hash = PAGE_HASH[p];
  };

  useEffect(() => { window.scrollTo(0,0); }, [page]);

  useEffect(() => {
    const onHash = () => { const p = getPageFromHash(); setPage(p); window.scrollTo(0,0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key.length !== 1) return;
      typedRef.current = (typedRef.current + e.key).slice(-4).toUpperCase();
      if (typedRef.current === "CAFE") setGameActive(true);
    };
    const onInput = e => {
      if (e.target.value && e.target.value.toLowerCase().includes("cafe")) setGameActive(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("input", onInput);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("input", onInput);
    };
  }, []);

  const renderPage = () => {
    switch(page) {
      case "Home": return <HomePage go={go} t={t} />;
      case "Tech Services": return <TechPage go={go} t={t} />;
      case "Coffee & Food": return <TeaserPage {...t.coffeeTeaser} />;
      case "Events": return <TeaserPage {...t.eventsTeaser} />;
      case "About": return <AboutPage t={t} />;
      case "Contact": return <ContactPage t={t} />;
      default: return <HomePage go={go} t={t} />;
    }
  };

  return (
    <>
      {gameActive && <CafeGame onClose={() => setGameActive(false)} />}
      <style>{fonts + css}</style>
      <div className="grain" />
      <nav>
        <div className="nav-logo" onClick={() => go("Home")}>
          Café Con <span>Pan</span>
        </div>
        <div className={`nav-links${menuOpen ? " open" : ""}`}>
          {navKeys.map((key, i) => (
            <button key={key} className={`nav-btn ${page===key?"active":""}`} onClick={() => go(key)}>
              {t.nav.items[i]}
            </button>
          ))}
          <button className="nav-cta-btn" onClick={() => go("Contact")}>{t.nav.cta}</button>
          <button className="lang-btn" onClick={() => setLang(lang === "en" ? "es" : "en")}>{t.nav.langBtn}</button>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>
      <main style={{paddingTop:0}}>{renderPage()}</main>
      <TextileBorder />
      <footer>
        <div className="footer-logo">Café Con <span>Pan</span></div>
        <div className="footer-tagline">{t.footer.tagline}</div>
        <div className="footer-copy">{t.footer.copy}</div>
      </footer>
    </>
  );
}
