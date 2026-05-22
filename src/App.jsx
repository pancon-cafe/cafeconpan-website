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
    nav: { items:["Home","Tech Services","Community","Our Story","Contact"], cta:"Get a Quote", langBtn:"ES" },
    hero: { stamp:"☕ Honduras-Rooted · Est. 2025", subtitle:"Tech · Coffee · Culture · Community", pillars:["Tech Services","Community"], cta:"Get Tech Services →" },
    story: { eyebrow:"Our Story", title:"More Than a", titleSpan:"Cup of Coffee", body:"At Café Con Pan, we believe coffee is more than a drink — it's a connection. Rooted in our Honduran heritage, we started with a simple idea: to share authentic coffee and bread with our community. That same spirit drives everything we do — from helping small businesses launch and grow through technology, to building a space where culture and community come together. One cup and one connection at a time." },
    painPoints: {
      eyebrow:"Real Talk",
      title:"Does This Sound",
      titleSpan:"Familiar?",
      sub:"You didn't start your business to become an IT person. But somewhere along the way, the tech stuff started costing you time, money, and headaches you didn't sign up for.",
      cards:[
        { title:"Your business email is a @gmail.com, @yahoo.com, or @outlook.com.", desc:"Nothing wrong with those — except when one of them is the email on your business card. Clients notice. It signals you're not quite official yet, even when you absolutely are." },
        { title:"Your personal phone is your business phone.", desc:"Same number for family, clients, vendors, and late-night emergencies. No separation. No boundary. No way to ever really clock out." },
        { title:"Someone bought iPhones at Best Buy and set them up with personal Apple IDs.", desc:"It worked — until someone quit. Now those devices have company contacts, emails, and apps tied to a personal account you can't access or control." },
        { title:"You don't know if you're overpaying your carrier.", desc:"Most small businesses are — by hundreds of dollars a month — on plans that made sense two years ago and haven't been looked at since." },
        { title:"Your business doesn't show up on Apple Maps.", desc:"Your customers are on iPhones. They search for businesses like yours every day. If you're not showing up — or showing up wrong — that's real revenue walking past your door." },
        { title:"When something breaks, everything stops.", desc:"No IT person to call. No system for fixing it fast. Just you, on hold, trying to figure it out — while your actual work piles up." },
      ],
      bridge:"This is exactly the kind of thing we fix. Not with complicated systems or corporate contracts — just the right setup, done once, done right.",
      cta:"Let's Talk →",
    },
    pillars: {
      eyebrow:"Three Pillars, One Brand", title:"What We're", titleSpan:"Building",
      cards:[
        { n:"01", icon:"⌨️", title:"Tech Services", desc:"Apple-focused device management, IT consulting, and carrier services. Available now.", cta:"Explore →", page:"Tech Services" },
        { n:"02", icon:"☕", title:"Coffee & Community", desc:"A Honduran-rooted café experience and cultural programming. Coming together.", cta:"See What's Coming →", page:"Community" },
        { n:"03", icon:"🌱", title:"The Bigger Vision", desc:"Family land in Honduras. A café with a boardroom. An investment arm. The full picture.", cta:"Read Our Story →", page:"Our Story" },
      ],
    },
    biggerPicture: {
      eyebrow:"The Bigger Picture", title:"What's Next for", titleSpan:"Café Con Pan",
      sub:"The tech arm leads because it's ready. But this brand was always meant to be more — and these are the chapters still being written.",
      cards:[
        { icon:"☕", title:"Central American Single-Origin Coffee", badge:"In Planning", desc:"Coffee sourced from family land across Central America — starting with Honduras, Guatemala, and El Salvador, with more countries to come. From seed to cup, rooted in where we come from." },
        { icon:"🫓", title:"The Café & Boardroom", badge:"In Development", desc:"A physical café with a reserved boardroom — where clients can meet, deals get done, and the community gathers over something warm." },
        { icon:"💼", title:"Investing in People", badge:"On the Horizon", desc:"For the businesses and people we believe in — a future arm dedicated to going beyond services and into shared growth with the clients we align with." },
      ],
      emailPlaceholder:"Stay in the loop — drop your email", emailBtn:"I'm In",
    },
    tech: {
      eyebrow:"Pillar One — Available Now", title:"Tech Services for", titleSpan:"Small Business",
      sub:"Apple-focused MDM and device management, IT consulting, and carrier services — through one trusted, independent partner.",
      packages:[
        { icon:"🚀", name:"Open for Business", tag:"Launch Package", desc:"Complete business launch: LLC/EIN guidance, banking, domain + email, website, payment setup, Apple device procurement, MDM enrollment, and full Brands setup. Guidance only — we help you navigate the process, not act as your attorney or accountant.", price:"$2,500 – $5,000+" },
        { icon:"🍎", name:"Apple Presence", tag:"Visibility Package", desc:"For existing businesses ready to show up in Apple's ecosystem: Apple Maps, Branded Mail, Tap to Pay branding, Brand Profile, and Maps Ads readiness.", price:"$500 – $1,500" },
        { icon:"🔁", name:"Apple Operations", tag:"Managed Services", desc:"Ongoing device management, helpdesk, user onboarding/offboarding, software updates, app licensing, and security policy maintenance.", price:"$35 – $50 / device / month" },
        { icon:"📡", name:"Connectivity Consulting", tag:"Carrier & ISP", desc:"Carrier plan audit, negotiation, number porting, new service activation, and ISP setup. 100% carrier-agnostic — we work for you, not the carrier.", price:"$150 – $300 / hr or flat fee" },
        { icon:"🤝", name:"Tech Concierge", tag:"On-Call Support", desc:"Relationship-based on-call tech support for owners who want one trusted number to call. Monthly add-on to any package.", price:"$300 – $600 / month" },
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
    community:{
      eyebrow:"Pillars Two & Three",
      title:"Coffee, Culture &",
      titleSpan:"Community",
      sub:"Two chapters still being written — and the heart of what this brand is ultimately becoming.",
      coffeeEyebrow:"Coming Soon — The Café",
      coffeeTitle:"Coffee &",
      coffeeTitleSpan:"Food",
      coffeeBody:"A cafe experience rooted in Central American tradition. Pan dulce fresh from the oven, café de olla brewed the right way, and a space that feels like walking into an abuela's kitchen. Not just a coffee shop — a place where business gets done, community gathers, and culture is celebrated.",
      coffeeQuote:"Coffee is how Central Americans say good morning, welcome home, and I'm glad you're here.",
      coffeePlaceholder:"Your email — we'll let you know when we open",
      coffeeEmailBtn:"Notify Me",
      combinedEmailEyebrow:"Stay in the Loop",
      combinedPlaceholder:"Your email — we'll keep you posted on both",
      combinedEmailBtn:"Notify Me",
      techCta:"In the meantime — our tech services are open for business →",
      eventsEyebrow:"Coming Soon — Events & Culture",
      eventsTitle:"Community &",
      eventsTitleSpan:"Events",
      eventsBody:"Cultural programming, community gatherings, and events that celebrate Central American roots. Music, food, storytelling, and people worth knowing. Sponsored art shows, cultural nights, and eventually — a boardroom in our café where businesses can meet, plan, and grow together.",
      eventsQuote:"Community isn't a feature. It's the whole point.",
      eventsPlaceholder:"Get notified when events are announced",
      eventsEmailBtn:"Notify Me",
      wallpapersEyebrow:"Free Download",
      wallpapersTitle:"Carry the",
      wallpapersTitleSpan:"Brand",
      wallpapersBody:"Rep Café Con Pan on your lock screen. Free wallpapers for iPhone, iPad, and Mac — tap to download.",
      wallpapersIphone:"iPhone",
      wallpapersIpad:"iPad",
      wallpapersMac:"Mac",
      wallpapersCta:"Download →",
      wallpapersFooterLink:"Free Wallpapers",
    },
    laMesa:{
      badge:"By Invitation Only",
      title:"La Mesa",
      sub:"The table where community, business, and coffee come together. If you're reading this, you were invited for a reason.",
      whatTitle:"What La Mesa Is",
      whatBody:"La Mesa is Café Con Pan's inner circle — people we trust, who move in the same circles we do, and who believe in what we're building. Not just a referral program. A partnership. When you send someone our way, you're not just making an introduction. You're vouching for them, and we're vouching for you.",
      howTitle:"How It Works",
      howBody:"When someone in your world needs tech help, a proper business setup, or just doesn't know where to start — you send them our way. We take good care of them. You get taken care of. Details are shared personally when you're in.",
      tiersTitle:"Your Place at the Table",
      tiers:[
        { name:"Regular", icon:"☕", desc:"1–2 closed referrals. You earn 5% of their first invoice once payment clears." },
        { name:"Barista", icon:"⌨️", desc:"3–5 closed referrals. You earn 8% of each first invoice. You're trusted at this table." },
        { name:"La Mesa", icon:"🌱", desc:"6+ closed referrals. You earn 10% of each first invoice. Founding partner status — your seat at the table when the café opens." },
      ],
      promiseTitle:"The Long Game",
      promiseBody:"This brand is becoming a physical place — a café with a real boardroom. When that day comes, La Mesa partners don't just get a coffee. They get a seat at the actual table. Founding status. Named. Remembered.",
      formTitle:"You're In — Let's Make It Official",
      formSub:"Fill this out and we'll follow up personally.",
      nameLabel:"Your Name", namePlaceholder:"Full name",
      emailLabel:"Email", emailPlaceholder:"you@email.com",
      roleLabel:"Your Role / How We Know Each Other", rolePlaceholder:"e.g. Fitness coach, friend of Jason",
      messageLabel:"Anything else you want us to know", messagePlaceholder:"Optional — no pressure",
      submit:"I'm In →", submitting:"Sending...",
      success:"Welcome to La Mesa. We'll be in touch soon. ☕",
      error:"Something went wrong. Email us directly at hello@pancon.cafe.",
      scrollToRef:"Send a Referral →",
      refTitle:"Send Someone Our Way",
      refSub:"Already a La Mesa partner? Submit a referral here and we'll take it from there.",
      refYourName:"Your Name", refYourNamePlaceholder:"Your full name",
      refTheirName:"Their Name", refTheirNamePlaceholder:"Who are you referring?",
      refTheirEmail:"Their Email", refTheirEmailPlaceholder:"their@email.com",
      refTheirPhone:"Their Phone", refTheirPhonePlaceholder:"Best number to reach them",
      refTheirBiz:"Business Name", refTheirBizPlaceholder:"Legal registered name preferred",
      refTheirWeb:"Website", refTheirWebPlaceholder:"Optional — if they have one",
      refNeed:"What Do They Need Help With",
      refOptions:["Not sure — general intro","Tech Services — Device Management","Tech Services — Carrier Audit","Tech Services — IT Consulting","Business Setup — LLC / EIN / Email / Domain","Something else"],
      refNotes:"Anything else we should know", refNotesPlaceholder:"Optional — any context helps",
      refSubmit:"Send the Referral →", refSubmitting:"Sending...",
      refSuccess:"Got it — we'll reach out to them and let you know. ☕",
      refError:"Something went wrong. Email us directly at hello@pancon.cafe.",
    },
    about:{
      eyebrow:"The Story", title:"Roots,", titleSpan:"Community,", titleEnd:"Purpose",
      quote:"She served it in a bowl with rosquillas and ojaldras, like soup. I was five years old and I've never stopped thinking about that cup.",
      quoteAttr:"— Café Con Pan",
      body1:"I remember being very little, visiting my family in Honduras. Every morning without fail, my grandmother would make coffee. Not in a mug — in a bowl. She'd add rosquillas and ojaldras and let them soak until they were soft enough to eat with a spoon, like soup. I was instantly hooked. I still am.",
      body2:"That bowl of coffee is where the name came from. And it's where the whole idea started — coffee as a bridge. To family, to community, to work, to the conversations that change things. I realized I could build something around that idea. Tech services to help small businesses thrive. A real café experience rooted in that Honduran morning. Events and culture that bring people together. And eventually, the ability to invest in the businesses we believe in. One cup and one connection at a time.",
      stats:[{num:"3",label:"Brand Pillars"},{num:"2",label:"Certs In Progress"},{num:"🇭🇳",label:"Honduras Roots"}],
    },
    socials:{
      instagram:"https://instagram.com/icafeconpan",
      linkedin:"https://linkedin.com/company/cafeconpan",
      twitter:"https://twitter.com/icafeconpan",
      tiktok:"https://tiktok.com/@icafeconpan",
      youtube:"",
      facebook:"",
      discord:"",
      instagramLabel:"Instagram",
      linkedinLabel:"LinkedIn",
      twitterLabel:"Twitter",
      tiktokLabel:"TikTok",
      youtubeLabel:"YouTube",
      facebookLabel:"Facebook",
      discordLabel:"Discord",
      followLabel:"Follow the Journey",
    },
    contact:{
      eyebrow:"Get in Touch", title:"Let's", titleSpan:"Talk",
      sub:"Ready to talk tech services, or just want to follow the Café Con Pan journey?",
      info:[{label:"Email",val:"hello@pancon.cafe"},{label:"Website",val:"pancon.cafe"},{label:"Business",val:"Cafe Con Pan LLC"},{label:"Services",val:"Tech · Coffee · Culture"},{label:"Instagram",val:"@icafeconpan"},{label:"LinkedIn",val:"Cafe Con Pan LLC"}],
      nameLabel:"Your Name", namePlaceholder:"Full name",
      emailLabel:"Email Address", emailPlaceholder:"you@company.com",
      inquiryLabel:"Inquiry Type", messageLabel:"Message", messagePlaceholder:"Tell us about your business and what you need...",
      options:["Tech Services — MDM & Device Management","Tech Services — Carrier Audit & Negotiation","Tech Services — IT Consulting","Partnership Inquiry","Coffee & Events — Stay in the Loop"],
      submit:"Send It →", submitting:"Sending...",
      success:"Message sent! We'll be in touch soon. ☕",
      error:"Something went wrong. Please try again or email us directly at hello@pancon.cafe.",
    },
    softCta:{ eyebrow:"Not Sure Where to Start?", body:"No pitch, no pressure. Just a conversation about where your business is and what might actually help.", btn:"Let's Just Talk →", emailEyebrow:"Not Ready Yet?", emailBody:"Follow the journey and we'll reach out when the time is right." },
    disclaimer:"We provide guidance and implementation support — not legal, tax, or financial advice. For those needs, we recommend working with a licensed professional.",
    footer:{ tagline:"Tech · Coffee · Culture", copy:"© 2026 Cafe Con Pan LLC · pancon.cafe", disclaimer:"We provide guidance and implementation support — not legal, tax, or financial advice. For those needs, we recommend working with a licensed professional." },
    pay:{ eyebrow:"Pay Your Invoice", title:"Quick &", titleSpan:"Secure", body:"Enter your invoice number and amount on the next page. Payment is processed securely through Helcim.", cta:"Pay Now →", questions:"Questions? Email" },
    privacy:{ footerLink:"Privacy Policy" },
  },
  es: {
    nav: { items:["Inicio","Servicios Tech","Comunidad","Nuestra Historia","Contacto"], cta:"Cotización", langBtn:"EN" },
    hero: { stamp:"☕ Raíces Hondureñas · Est. 2025", subtitle:"Tech · Café · Cultura · Comunidad", pillars:["Servicios Tech","Comunidad"], cta:"Ver Servicios Tech →", culturalSignal:"Hablamos tu idioma — literal y culturalmente." },
    story: { eyebrow:"Nuestra Historia", title:"Más Que una", titleSpan:"Taza de Café", body:"En Café Con Pan, creemos que el café es más que una bebida — es una conexión. Con raíces en nuestra herencia hondureña, comenzamos con una idea simple: compartir café y pan auténtico con nuestra comunidad. Ese mismo espíritu impulsa todo lo que hacemos — desde ayudar a pequeños negocios a crecer mediante la tecnología, hasta construir un espacio donde la cultura y la comunidad se unen. Una taza y una conexión a la vez." },
    paraTi: {
      eyebrow:"Para Ti",
      title:"Construido para",
      titleSpan:"Tu Realidad",
      body1:"Sabemos lo que es ser extraordinario en tu oficio — y al mismo tiempo tener que navegar un sistema de negocios que nadie te explicó, en un idioma que no es el tuyo. Eso no es una debilidad. Es simplemente una barrera que nosotros podemos quitar.",
      body2:"Jason habla español. Conoce la cultura. Y ha trabajado con negocios como el tuyo desde adentro de Apple. Estás en buenas manos.",
      stat1num:"100%", stat1label:"Bilingüe",
      stat2num:"🇭🇳", stat2label:"Raíces Hondureñas",
      stat3num:"Apple", stat3label:"Desde Adentro",
    },
    painPoints: {
      eyebrow:"La Verdad",
      title:"¿Te Suena",
      titleSpan:"Conocido?",
      sub:"No empezaste tu negocio para convertirte en experto de tecnología. Pero en algún momento, todo ese tema tech empezó a costarte tiempo, dinero y dolores de cabeza que no tenías planeados.",
      cards:[
        { title:"El correo de tu negocio es un @gmail.com, @yahoo.com, o @outlook.com.", desc:"No hay nada malo con esos — excepto cuando uno de ellos es el correo en tu tarjeta de presentación. Los clientes lo notan. Da la impresión de que aún no estás del todo establecido, aunque llevas años trabajando duro." },
        { title:"Tu teléfono personal es tu teléfono de negocio.", desc:"El mismo número para la familia, los clientes, los proveedores y las emergencias de la noche. Sin separación. Sin límites. Sin manera de verdad desconectarte." },
        { title:"Alguien compró los iPhones en una tienda y los configuró con un Apple ID personal.", desc:"Funcionó — hasta que alguien se fue. Ahora esos dispositivos tienen contactos, correos y aplicaciones del negocio vinculados a una cuenta personal a la que no tienes acceso." },
        { title:"No sabes si estás pagando de más con tu carrier.", desc:"La mayoría de los negocios pequeños sí están pagando de más — cientos de dólares al mes — en planes que tenían sentido hace dos años y nadie ha revisado desde entonces." },
        { title:"Tu negocio no aparece en Apple Maps.", desc:"Tus clientes tienen iPhones. Buscan negocios como el tuyo todos los días. Si no apareces — o apareces mal — eso es dinero real pasando de largo." },
        { title:"Cuando algo falla, todo se detiene.", desc:"Nadie a quien llamar. Ningún sistema para resolverlo rápido. Solo tú, esperando en el teléfono, tratando de averiguarlo — mientras el trabajo real se acumula." },
        { title:"Nadie te explicó cómo funciona el sistema.", desc:"El EIN, el LLC, la cuenta bancaria de negocio, el historial de crédito comercial — en Honduras, en México, en El Salvador, nadie te enseñó esto. Aquí tampoco. Pero nosotros sí sabemos." },
        { title:"Todo está en inglés y a veces el inglés técnico es otro idioma más.", desc:"Los contratos del carrier, los términos del software, los formularios del gobierno — una cosa es hablar inglés y otra es entender el lenguaje legal y técnico que usan para hacer negocios aquí." },
      ],
      bridge:"Para eso estamos aquí. No con sistemas complicados ni contratos corporativos — solo la configuración correcta, hecha una vez, hecha bien.",
      cta:"Hablemos →",
    },
    pillars: {
      eyebrow:"Tres Pilares, Una Marca", title:"Lo Que Estamos", titleSpan:"Construyendo",
      cards:[
        { n:"01", icon:"⌨️", title:"Servicios Tech", desc:"Gestión de dispositivos Apple, consultoría IT y servicios de carrier. Disponible ahora.", cta:"Explorar →", page:"Tech Services" },
        { n:"02", icon:"☕", title:"Café & Comunidad", desc:"Una experiencia de café con raíces hondureñas y programas culturales. Tomando forma.", cta:"Ver lo que Viene →", page:"Community" },
        { n:"03", icon:"🌱", title:"La Visión Completa", desc:"Tierras familiares en Honduras. Un café con sala de juntas. Un brazo de inversión. El panorama completo.", cta:"Nuestra Historia →", page:"Our Story" },
      ],
    },
    biggerPicture: {
      eyebrow:"El Panorama General", title:"Lo Que Sigue para", titleSpan:"Café Con Pan",
      sub:"El brazo tecnológico lidera porque está listo. Pero esta marca siempre fue pensada para ser más — y estos son los capítulos que aún se están escribiendo.",
      cards:[
        { icon:"☕", title:"Café Centroamericano de Origen Único", badge:"En Planificación", desc:"Café cultivado en tierras familiares en Centroamérica — empezando con Honduras, Guatemala y El Salvador, con más países por venir. De la semilla a la taza, con raíces en de donde venimos." },
        { icon:"🫓", title:"El Café & La Sala de Juntas", badge:"En Desarrollo", desc:"Un café físico con una sala de juntas reservable — donde los clientes se reúnen, se cierran tratos y la comunidad se junta alrededor de algo caliente." },
        { icon:"💼", title:"Invirtiendo en Personas", badge:"En el Horizonte", desc:"Para los negocios y las personas en las que creemos — un brazo futuro dedicado a ir más allá de los servicios hacia un crecimiento compartido con los clientes con quienes nos alineamos." },
      ],
      emailPlaceholder:"Tu correo — mantente al día", emailBtn:"¡Apúntame!",
    },
    tech: {
      eyebrow:"Pilar Uno — Disponible Ahora", title:"Servicios Tech para", titleSpan:"Pequeños Negocios",
      sub:"Gestión de dispositivos Apple y MDM, consultoría IT y servicios de carrier — a través de un socio independiente de confianza.",
      packages:[
        { icon:"🚀", name:"Abrir el Negocio", tag:"Paquete de Lanzamiento", desc:"Lanzamiento completo del negocio: orientación para LLC/EIN, banca, dominio + correo, sitio web, configuración de pagos, adquisición de dispositivos Apple, inscripción MDM y configuración completa de Brands. Solo orientación — te ayudamos a navegar el proceso, sin actuar como tu abogado o contador.", price:"$2,500 – $5,000+" },
        { icon:"🍎", name:"Presencia Apple", tag:"Paquete de Visibilidad", desc:"Para negocios existentes listos para aparecer en el ecosistema de Apple: Apple Maps, correo con marca, branding Tap to Pay, Perfil de Marca y preparación para Maps Ads.", price:"$500 – $1,500" },
        { icon:"🔁", name:"Operaciones Apple", tag:"Servicios Gestionados", desc:"Gestión continua de dispositivos, helpdesk, incorporación y desvinculación de usuarios, actualizaciones de software, licencias de apps y mantenimiento de políticas de seguridad.", price:"$35 – $50 / dispositivo / mes" },
        { icon:"📡", name:"Consultoría de Conectividad", tag:"Carrier e ISP", desc:"Auditoría de plan de carrier, negociación, portabilidad de número, activación de nuevo servicio y configuración de ISP. 100% independiente del carrier — trabajamos para ti, no para el carrier.", price:"$150 – $300 / hr o tarifa fija" },
        { icon:"🤝", name:"Tech Concierge", tag:"Soporte On-Call", desc:"Soporte técnico on-call basado en relaciones para propietarios que quieren un número de confianza al que llamar. Complemento mensual a cualquier paquete.", price:"$300 – $600 / mes" },
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
    community:{
      eyebrow:"Pilares Dos y Tres",
      title:"Café, Cultura y",
      titleSpan:"Comunidad",
      sub:"Dos capítulos que aún se están escribiendo — y el corazón de lo que esta marca está destinada a convertirse.",
      coffeeEyebrow:"Próximamente — El Café",
      coffeeTitle:"Café &",
      coffeeTitleSpan:"Pan",
      coffeeBody:"Una experiencia de café con raíces en la tradición centroamericana. Pan dulce recién salido del horno, café de olla preparado de la manera correcta y un espacio que se siente como entrar a la cocina de una abuela. No solo una cafetería — un lugar donde se hacen negocios, se reúne la comunidad y se celebra la cultura.",
      coffeeQuote:"El café es como los centroamericanos dicen buenos días, bienvenido a casa y me alegra que estés aquí.",
      coffeePlaceholder:"Tu correo — te avisamos pronto",
      coffeeEmailBtn:"Avísame",
      combinedEmailEyebrow:"Mantente al Día",
      combinedPlaceholder:"Tu correo — café y eventos",
      combinedEmailBtn:"Avísame",
      techCta:"Mientras tanto — nuestros servicios tech están disponibles ahora →",
      eventsEyebrow:"Próximamente — Eventos y Cultura",
      eventsTitle:"Comunidad &",
      eventsTitleSpan:"Eventos",
      eventsBody:"Programas culturales, encuentros comunitarios y eventos que celebran las raíces centroamericanas. Música, comida, historias y personas que vale la pena conocer. Shows de arte patrocinados, noches culturales y eventualmente — una sala de juntas en nuestro café donde los negocios pueden reunirse, planificar y crecer juntos.",
      eventsQuote:"La comunidad no es una característica. Es el punto central.",
      eventsPlaceholder:"Tu correo — te notificamos",
      eventsEmailBtn:"Avísame",
      wallpapersEyebrow:"Descarga Gratis",
      wallpapersTitle:"Lleva la",
      wallpapersTitleSpan:"Marca",
      wallpapersBody:"Representa a Café Con Pan en tu pantalla de bloqueo. Fondos de pantalla gratis para iPhone, iPad y Mac — toca para descargar.",
      wallpapersIphone:"iPhone",
      wallpapersIpad:"iPad",
      wallpapersMac:"Mac",
      wallpapersCta:"Descargar →",
      wallpapersFooterLink:"Fondos Gratis",
    },
    laMesa:{
      badge:"Solo por Invitación",
      title:"La Mesa",
      sub:"El lugar donde la comunidad, los negocios y el café se encuentran. Si estás leyendo esto, fuiste invitado por una razón.",
      whatTitle:"Qué Es La Mesa",
      whatBody:"La Mesa es el círculo de confianza de Café Con Pan — personas en las que creemos, que se mueven en los mismos círculos que nosotros, y que creen en lo que estamos construyendo. No es solo un programa de referidos. Es una alianza. Cuando nos mandas a alguien, no solo estás haciendo una presentación. Estás dando tu palabra por ellos, y nosotros damos la nuestra por ti.",
      howTitle:"Cómo Funciona",
      howBody:"Cuando alguien en tu mundo necesita ayuda con tecnología, una configuración adecuada para su negocio, o simplemente no sabe por dónde empezar — nos lo mandas. Nosotros los atendemos bien. Tú también eres atendido. Los detalles se comparten personalmente cuando ya estás adentro.",
      tiersTitle:"Tu Lugar en la Mesa",
      tiers:[
        { name:"Regular", icon:"☕", desc:"1–2 referidos cerrados. Ganas el 5% de su primera factura cuando el pago se confirme." },
        { name:"Barista", icon:"⌨️", desc:"3–5 referidos cerrados. Ganas el 8% de cada primera factura. Eres de confianza en esta mesa." },
        { name:"La Mesa", icon:"🌱", desc:"6+ referidos cerrados. Ganas el 10% de cada primera factura. Socio fundador — tu lugar en la mesa cuando el café abra." },
      ],
      promiseTitle:"El Juego Largo",
      promiseBody:"Esta marca se está convirtiendo en un lugar físico — un café con una sala de juntas de verdad. Cuando llegue ese día, los socios de La Mesa no solo reciben un café. Reciben un lugar en la mesa real. Estatus de fundador. Nombrados. Recordados.",
      formTitle:"Estás Adentro — Hagámoslo Oficial",
      formSub:"Llena esto y te contactamos personalmente.",
      nameLabel:"Tu Nombre", namePlaceholder:"Nombre completo",
      emailLabel:"Correo", emailPlaceholder:"tu@correo.com",
      roleLabel:"Tu Rol / Cómo Nos Conocemos", rolePlaceholder:"Ej. Entrenador, amigo de Jason",
      messageLabel:"Algo más que quieras que sepamos", messagePlaceholder:"Opcional — sin presión",
      submit:"Estoy Adentro →", submitting:"Enviando...",
      success:"Bienvenido a La Mesa. Estaremos en contacto pronto. ☕",
      error:"Algo salió mal. Escríbenos directamente a hello@pancon.cafe.",
      scrollToRef:"Enviar un Referido →",
      refTitle:"Mándanos a Alguien",
      refSub:"¿Ya eres socio de La Mesa? Envía un referido aquí y nosotros nos encargamos del resto.",
      refYourName:"Tu Nombre", refYourNamePlaceholder:"Tu nombre completo",
      refTheirName:"Su Nombre", refTheirNamePlaceholder:"¿A quién nos estás refiriendo?",
      refTheirEmail:"Su Correo", refTheirEmailPlaceholder:"su@correo.com",
      refTheirPhone:"Su Teléfono", refTheirPhonePlaceholder:"Mejor número para contactarlos",
      refTheirBiz:"Nombre del Negocio", refTheirBizPlaceholder:"Nombre legal registrado de preferencia",
      refTheirWeb:"Sitio Web", refTheirWebPlaceholder:"Opcional — si tiene uno",
      refNeed:"¿En Qué Necesitan Ayuda?",
      refOptions:["No estoy seguro — presentación general","Servicios Tech — Gestión de Dispositivos","Servicios Tech — Auditoría de Carrier","Servicios Tech — Consultoría IT","Configuración de Negocio — LLC / EIN / Correo / Dominio","Otra cosa"],
      refNotes:"Algo más que debamos saber", refNotesPlaceholder:"Opcional — cualquier contexto ayuda",
      refSubmit:"Enviar el Referido →", refSubmitting:"Enviando...",
      refSuccess:"Recibido — les contactaremos y te avisamos. ☕",
      refError:"Algo salió mal. Escríbenos directamente a hello@pancon.cafe.",
    },
    about:{
      eyebrow:"La Historia", title:"Raíces,", titleSpan:"Comunidad,", titleEnd:"Propósito",
      quote:"Lo servía en un tazón con rosquillas y ojaldras, como sopa. Tenía cinco años y nunca he dejado de pensar en esa taza.",
      quoteAttr:"— Café Con Pan",
      body1:"Recuerdo siendo muy pequeño, visitando a mi familia en Honduras. Cada mañana sin falta, mi abuela preparaba café. No en una taza — en un tazón. Le añadía rosquillas y ojaldras y las dejaba remojar hasta que estaban suaves para comerlas con cuchara, como sopa. Quedé completamente enamorado de ese ritual. Y lo sigo estando.",
      body2:"Ese tazón de café es de donde viene el nombre. Y es donde nació toda la idea — el café como puente. A la familia, a la comunidad, al trabajo, a las conversaciones que cambian las cosas. Me di cuenta de que podía construir algo alrededor de esa idea. Servicios tech para ayudar a pequeños negocios a crecer. Una experiencia de café auténtica con raíces en esa mañana hondureña. Eventos y cultura que unen a la gente. Y eventualmente, la capacidad de invertir en los negocios en los que creemos. Una taza y una conexión a la vez.",
      stats:[{num:"3",label:"Pilares de Marca"},{num:"2",label:"Certs en Progreso"},{num:"🇭🇳",label:"Raíces Hondureñas"}],
    },
    socials:{
      instagram:"https://instagram.com/icafeconpan",
      linkedin:"https://linkedin.com/company/cafeconpan",
      twitter:"https://twitter.com/icafeconpan",
      tiktok:"https://tiktok.com/@icafeconpan",
      youtube:"",
      facebook:"",
      discord:"",
      instagramLabel:"Instagram",
      linkedinLabel:"LinkedIn",
      twitterLabel:"Twitter",
      tiktokLabel:"TikTok",
      youtubeLabel:"YouTube",
      facebookLabel:"Facebook",
      discordLabel:"Discord",
      followLabel:"Síguenos",
    },
    contact:{
      eyebrow:"Ponte en Contacto", title:"", titleSpan:"Hablemos",
      sub:"¿Listo para hablar de servicios tech o simplemente quieres seguir el viaje de Café Con Pan?",
      info:[{label:"Correo",val:"hello@pancon.cafe"},{label:"Sitio Web",val:"pancon.cafe"},{label:"Negocio",val:"Cafe Con Pan LLC"},{label:"Servicios",val:"Tech · Café · Cultura"},{label:"Instagram",val:"@icafeconpan"},{label:"LinkedIn",val:"Cafe Con Pan LLC"}],
      nameLabel:"Tu Nombre", namePlaceholder:"Nombre completo",
      emailLabel:"Correo Electrónico", emailPlaceholder:"tu@empresa.com",
      inquiryLabel:"Tipo de Consulta", messageLabel:"Mensaje", messagePlaceholder:"Cuéntanos sobre tu negocio y lo que necesitas...",
      options:["Servicios Tech — Gestión MDM y Dispositivos","Servicios Tech — Auditoría y Negociación de Carrier","Servicios Tech — Consultoría IT","Consulta de Asociación","Café & Eventos — Mantente al Día"],
      submit:"Enviar →", submitting:"Enviando...",
      success:"¡Mensaje enviado! Estaremos en contacto pronto. ☕",
      error:"Algo salió mal. Inténtalo de nuevo o escríbenos directamente a hello@pancon.cafe.",
    },
    softCta:{ eyebrow:"¿No Sabes Por Dónde Empezar?", body:"Sin presión, sin discurso. Solo una conversación sobre dónde está tu negocio y qué podría ayudar.", btn:"Hablemos →", emailEyebrow:"¿Todavía No Estás Listo?", emailBody:"Síguenos y te contactaremos cuando sea el momento." },
    disclaimer:"Ofrecemos orientación y apoyo operativo — no asesoría legal, fiscal ni financiera. Para esas necesidades, recomendamos trabajar con un profesional licenciado.",
    footer:{ tagline:"Tech · Café · Cultura", copy:"© 2026 Cafe Con Pan LLC · pancon.cafe", disclaimer:"Ofrecemos orientación y apoyo operativo — no asesoría legal, fiscal ni financiera. Para esas necesidades, recomendamos trabajar con un profesional licenciado." },
    pay:{ eyebrow:"Paga tu Factura", title:"Rápido y", titleSpan:"Seguro", body:"Ingresa el número de factura y el monto en la siguiente página. El pago se procesa de forma segura a través de Helcim.", cta:"Pagar Ahora →", questions:"¿Preguntas? Escríbenos a" },
    privacy:{ footerLink:"Política de Privacidad" },
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
    margin-bottom:16px}
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

  .soft-cta-row{display:flex;gap:48px;align-items:flex-start;justify-content:center;max-width:860px;margin:0 auto}
  .soft-cta-panel{flex:1 1 0;min-width:0;text-align:center}
  .soft-cta-divider{width:2px;background:${C.espresso}22;align-self:stretch;flex-shrink:0}
  @media(max-width:620px){
    .soft-cta-row{flex-direction:column;align-items:center;gap:40px}
    .soft-cta-divider{display:none}
    .soft-cta-panel{width:100%;max-width:360px}
  }

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

const navKeys = ["Home","Tech Services","Community","Our Story","Contact"];

const PAGE_HASH = {
  "Home":"home","Tech Services":"tech-services","Community":"community",
  "Our Story":"our-story","Contact":"contact","La Mesa":"la-mesa","Pay":"pay",
  "La Mesa Referral":"la-mesa-referral",
  "Privacy Policy":"privacy-policy",
};
const HASH_PAGE = Object.fromEntries(Object.entries(PAGE_HASH).map(([k,v])=>[v,k]));
const getPageFromHash = () => HASH_PAGE[window.location.hash.replace("#","")] || "Home";

function EmailCapture({ placeholder, btnLabel }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          access_key:"bb35de9c-0515-4e74-9f2f-202d6fd033b8",
          subject:"New Email Signup — Café Con Pan",
          email,
          replyto:email,
          message:"New subscriber joined the Café Con Pan waitlist.",
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") return (
    <div style={{
      textAlign:"center",padding:"16px 24px",
      border:`2px solid ${C.teal}`,color:C.cream,
      fontFamily:"'Nunito',sans-serif",fontWeight:700,
      fontSize:14,letterSpacing:"0.06em",
      maxWidth:420,margin:"0 auto",
    }}>☕ You're on the list. We'll be in touch.</div>
  );

  return (
    <div className="email-row" style={{maxWidth:420,margin:"0 auto"}}>
      <input
        className="email-input"
        placeholder={placeholder}
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        type="email"
      />
      <button className="email-btn" onClick={submit} disabled={status === "submitting"}>
        {status === "submitting" ? "..." : btnLabel}
      </button>
    </div>
  );
}

function ParaTiSection({ t }) {
  return (
    <>
      <TextileBorder />
      <section className="section" style={{background:C.espresso}}>
        <div className="section-header">
          <div className="section-eyebrow" style={{color:C.teal}}>{t.paraTi.eyebrow}</div>
          <h2 className="section-title section-title-light">
            {t.paraTi.title} <span>{t.paraTi.titleSpan}</span>
          </h2>
        </div>
        <div style={{maxWidth:640,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontSize:16,lineHeight:1.9,color:"rgba(245,237,214,0.85)",fontWeight:600,marginBottom:24}}>
            {t.paraTi.body1}
          </p>
          <p style={{fontFamily:"'Pacifico',cursive",fontSize:20,color:C.blush,lineHeight:1.6,marginBottom:40}}>
            "{t.paraTi.body2}"
          </p>
          <div style={{display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {num:t.paraTi.stat1num, label:t.paraTi.stat1label},
              {num:t.paraTi.stat2num, label:t.paraTi.stat2label},
              {num:t.paraTi.stat3num, label:t.paraTi.stat3label},
            ].map(s => (
              <div key={s.label} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Lilita One',cursive",fontSize:36,color:C.red,lineHeight:1}}>{s.num}</div>
                <div style={{fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.beige,opacity:0.7,marginTop:4,fontWeight:700}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <TextileBorder flip />
    </>
  );
}

function PainPointsSection({ go, t }) {
  return (
    <section className="section section-alt">
      <div className="section-header">
        <div className="section-eyebrow">{t.painPoints.eyebrow}</div>
        <h2 className="section-title">{t.painPoints.title} <span>{t.painPoints.titleSpan}</span></h2>
        <p className="section-sub">{t.painPoints.sub}</p>
      </div>
      <div className="grid-2" style={{maxWidth:900,margin:"0 auto"}}>
        {t.painPoints.cards.map(c => (
          <div key={c.title} style={{
            background:C.cream,
            border:`3px solid ${C.espresso}`,
            padding:"28px 32px",
            boxShadow:`4px 4px 0 ${C.red}`,
          }}>
            <div style={{fontFamily:"'Lilita One',cursive",fontSize:16,color:C.espresso,marginBottom:10,lineHeight:1.3}}>{c.title}</div>
            <p style={{fontSize:14,lineHeight:1.8,color:"#555",fontWeight:600,margin:0}}>{c.desc}</p>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",maxWidth:640,margin:"56px auto 0"}}>
        <p style={{fontFamily:"'Pacifico',cursive",fontSize:20,color:C.espresso,lineHeight:1.6,marginBottom:32}}>"{t.painPoints.bridge}"</p>
        <button className="hero-cta" onClick={() => go("Contact")}>{t.painPoints.cta}</button>
      </div>
    </section>
  );
}

function HomePage({ go, t, lang }) {
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
          {lang === "es" && <p style={{fontSize:14,color:C.espresso,fontWeight:700,letterSpacing:"0.06em",marginBottom:24,opacity:0.85}}>{t.hero.culturalSignal}</p>}
          <div className="hero-pillars" style={{marginTop:24}}>
            <button className="hero-pillar" onClick={() => go("Tech Services")}>
              <span className="hero-pillar-icon">⌨️</span> {t.hero.pillars[0]}
            </button>
            <button className="hero-pillar" onClick={() => go("Community")}>
              <span className="hero-pillar-icon">☕</span> {t.hero.pillars[1]}
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

      <TextileBorder flip />

      {lang === "es" && <ParaTiSection t={t} />}

      <PainPointsSection go={go} t={t} />

      <TextileBorder flip />

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
                background:"transparent",
                color:C.espresso,
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
      </section>

      <TextileBorder />

      <section className="section" style={{background:C.parchment}}>
        <div className="soft-cta-row">
          <div className="soft-cta-panel">
            <div className="section-eyebrow" style={{marginBottom:12}}>{t.softCta.eyebrow}</div>
            <p style={{fontSize:15,lineHeight:1.8,color:"#555",fontWeight:600,marginBottom:28,maxWidth:320,margin:"0 auto 28px"}}>{t.softCta.body}</p>
            <button className="hero-cta" onClick={() => go("Contact")}>{t.softCta.btn}</button>
          </div>
          <div className="soft-cta-divider" />
          <div className="soft-cta-panel">
            <div className="section-eyebrow" style={{marginBottom:12}}>{t.softCta.emailEyebrow}</div>
            <p style={{fontSize:15,lineHeight:1.8,color:"#555",fontWeight:600,marginBottom:28,maxWidth:320,margin:"0 auto 28px"}}>{t.softCta.emailBody}</p>
            <EmailCapture placeholder={t.biggerPicture.emailPlaceholder} btnLabel={t.biggerPicture.emailBtn} />
          </div>
        </div>
      </section>

      <TextileBorder flip />
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
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:24}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:4}}>{t.socials.followLabel}</div>
            <div style={{display:"flex",gap:16}}>
              <a href={t.socials.instagram} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.5}
              >{t.socials.instagramLabel}</a>
              <a href={t.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.5}
              >{t.socials.linkedinLabel}</a>
              <a href={t.socials.twitter} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.5}
              >{t.socials.twitterLabel}</a>
              <a href={t.socials.tiktok} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.5}
              >{t.socials.tiktokLabel}</a>
              {t.socials.youtube&&<a href={t.socials.youtube} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>{t.socials.youtubeLabel}</a>}
              {t.socials.facebook&&<a href={t.socials.facebook} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>{t.socials.facebookLabel}</a>}
              {t.socials.discord&&<a href={t.socials.discord} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.espresso,opacity:0.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>{t.socials.discordLabel}</a>}
            </div>
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

function CommunityPage({ t, go }) {
  return (
    <>
      <section className="section section-alt" style={{paddingTop:100,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",left:-80,top:"50%",transform:"translateY(-50%)",opacity:0.1,pointerEvents:"none"}}>
          <Sunburst size={500} color={C.gold} opacity={0.8} />
        </div>
        <div className="teaser-inner" style={{position:"relative",zIndex:2}}>
          <span className="coming-tag">{t.community.coffeeEyebrow}</span>
          <h2 className="teaser-title">{t.community.coffeeTitle} <span>{t.community.coffeeTitleSpan}</span></h2>
          <p className="teaser-body">{t.community.coffeeBody}</p>
        </div>
      </section>

      <TextileBorder flip />

      <section className="section section-dark" style={{textAlign:"center"}}>
        <blockquote style={{
          fontFamily:"'Pacifico',cursive",fontSize:28,color:C.blush,
          lineHeight:1.5,maxWidth:600,margin:"0 auto",
          paddingBottom:24,borderBottom:`2px solid ${C.beige}33`
        }}>"{t.community.coffeeQuote}"</blockquote>
        <div className="section-eyebrow" style={{marginTop:20}}>— Café Con Pan</div>
      </section>

      <TextileBorder />

      <section className="section" style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-80,top:"50%",transform:"translateY(-50%)",opacity:0.1,pointerEvents:"none"}}>
          <Sunburst size={500} color={C.gold} opacity={0.8} />
        </div>
        <div className="teaser-inner" style={{position:"relative",zIndex:2}}>
          <span className="coming-tag">{t.community.eventsEyebrow}</span>
          <h2 className="teaser-title">{t.community.eventsTitle} <span>{t.community.eventsTitleSpan}</span></h2>
          <p className="teaser-body">{t.community.eventsBody}</p>
        </div>
      </section>

      <TextileBorder flip />

      <section className="section section-dark" style={{textAlign:"center"}}>
        <div className="section-eyebrow" style={{marginBottom:16}}>{t.community.wallpapersEyebrow}</div>
        <h2 className="teaser-title" style={{color:C.cream,marginBottom:12}}>{t.community.wallpapersTitle} <span style={{color:C.blush}}>{t.community.wallpapersTitleSpan}</span></h2>
        <p style={{fontSize:15,color:`rgba(245,237,214,0.7)`,maxWidth:420,margin:"0 auto 36px",lineHeight:1.8}}>{t.community.wallpapersBody}</p>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="https://drive.google.com/uc?export=download&id=1FnhFPmoQSERIx_4RzD0VOQAo96XYcbw3" target="_blank" rel="noopener noreferrer"
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,background:`rgba(245,237,214,0.06)`,border:`2px solid rgba(245,237,214,0.15)`,padding:"28px 40px",textDecoration:"none",transition:"border-color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=`rgba(245,237,214,0.4)`}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`rgba(245,237,214,0.15)`}>
            <span style={{fontSize:32}}>📱</span>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.cream}}>{t.community.wallpapersIphone}</span>
            <span style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:C.teal,fontWeight:700}}>{t.community.wallpapersCta}</span>
          </a>
          <a href="https://drive.google.com/uc?export=download&id=1mgUgO9x8kS-CVos91ENBRcTZO64a-So-" target="_blank" rel="noopener noreferrer"
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,background:`rgba(245,237,214,0.06)`,border:`2px solid rgba(245,237,214,0.15)`,padding:"28px 40px",textDecoration:"none",transition:"border-color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=`rgba(245,237,214,0.4)`}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`rgba(245,237,214,0.15)`}>
            <span style={{fontSize:32}}>⬛</span>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.cream}}>{t.community.wallpapersIpad}</span>
            <span style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:C.teal,fontWeight:700}}>{t.community.wallpapersCta}</span>
          </a>
          <a href="https://drive.google.com/uc?export=download&id=1vbkZQj5MEO0NtwSu7e0LAEGcUyBM37XE" target="_blank" rel="noopener noreferrer"
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,background:`rgba(245,237,214,0.06)`,border:`2px solid rgba(245,237,214,0.15)`,padding:"28px 40px",textDecoration:"none",transition:"border-color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=`rgba(245,237,214,0.4)`}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`rgba(245,237,214,0.15)`}>
            <span style={{fontSize:32}}>💻</span>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.cream}}>{t.community.wallpapersMac}</span>
            <span style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:C.teal,fontWeight:700}}>{t.community.wallpapersCta}</span>
          </a>
        </div>
      </section>

      <TextileBorder />

      <section className="section" style={{background:C.parchment,textAlign:"center"}}>
        <div className="section-eyebrow" style={{marginBottom:16}}>{t.community.combinedEmailEyebrow}</div>
        <div style={{maxWidth:420,margin:"0 auto 36px"}}>
          <EmailCapture placeholder={t.community.combinedPlaceholder} btnLabel={t.community.combinedEmailBtn} />
        </div>
        <button onClick={() => go("Tech Services")} style={{
          background:"none",border:"none",cursor:"pointer",
          fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,
          color:C.espresso,letterSpacing:"0.06em",opacity:0.6,
          textDecoration:"underline",transition:"opacity 0.2s"
        }}
        onMouseEnter={e=>e.currentTarget.style.opacity=1}
        onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
        >{t.community.techCta}</button>
      </section>

      <TextileBorder flip />
    </>
  );
}

const HELCIM_PAY_URL = "https://cafe-con-pan.myhelcim.com/hosted/?token=eaa2f540fe608242bc582b";

function PayPage({ t }) {
  const p = t.pay;
  return (
    <>
      <TextileBorder />
      <section className="section" style={{background:C.parchment,minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{maxWidth:560,margin:"0 auto",textAlign:"center",padding:"0 24px"}}>
          <div className="section-eyebrow" style={{marginBottom:16}}>{p.eyebrow}</div>
          <h1 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(32px,6vw,52px)",color:C.espresso,lineHeight:1.1,margin:"0 0 20px"}}>
            {p.title} <span style={{color:C.red}}>{p.titleSpan}</span>
          </h1>
          <p style={{fontSize:16,lineHeight:1.8,color:"#555",fontWeight:600,maxWidth:420,margin:"0 auto 40px"}}>
            {p.body}
          </p>
          <a
            href={HELCIM_PAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:"inline-block",background:C.red,color:C.cream,
              textDecoration:"none",fontFamily:"'Nunito',sans-serif",
              fontWeight:700,fontSize:13,letterSpacing:"0.16em",textTransform:"uppercase",
              padding:"18px 48px",border:`2px solid ${C.espresso}`,
              boxShadow:`4px 4px 0 ${C.espresso}`,
            }}
          >
            {p.cta}
          </a>
          <p style={{marginTop:32,fontSize:12,color:"#999",letterSpacing:"0.08em",textTransform:"uppercase"}}>
            {p.questions} <a href="mailto:hello@pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>hello@pancon.cafe</a>
          </p>
        </div>
      </section>
      <TextileBorder flip />
    </>
  );
}

function LaMesaPage({ t, go }) {
  const [form, setForm] = useState({name:"",email:"",role:"",message:""});
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
          subject:`La Mesa Partner Interest — ${form.name}`,
          name:form.name, email:form.email, replyto:form.email,
          message:`Role: ${form.role}\n\n${form.message || "No additional message."}`,
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch { setStatus("error"); }
  };

  const m = t.laMesa;
  return (
    <>
      {/* Hero */}
      <section style={{
        background:C.espresso,paddingTop:100,paddingBottom:72,
        paddingLeft:40,paddingRight:40,textAlign:"center",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.06,pointerEvents:"none"}}>
          <Sunburst size={700} color={C.gold} opacity={0.8} />
        </div>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{
            display:"inline-block",border:`2px solid ${C.teal}`,
            padding:"5px 20px",marginBottom:28,
            fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",
            fontWeight:700,color:C.teal,
          }}>{m.badge}</div>
          <h1 style={{
            fontFamily:"'Pacifico',cursive",fontSize:"clamp(52px,9vw,96px)",
            color:C.cream,lineHeight:1,marginBottom:24,
          }}>{m.title}</h1>
          <p style={{
            fontFamily:"'Nunito',sans-serif",fontSize:17,color:`rgba(245,237,214,0.7)`,
            fontWeight:600,maxWidth:560,margin:"0 auto",lineHeight:1.8,
          }}>{m.sub}</p>
          <button onClick={() => go("La Mesa Referral")}
            style={{marginTop:32,background:"none",border:`2px solid ${C.teal}`,color:C.teal,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,letterSpacing:"0.16em",textTransform:"uppercase",padding:"12px 32px",transition:"background 0.2s,color 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.teal;e.currentTarget.style.color=C.espresso;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=C.teal;}}
          >{m.scrollToRef}</button>
        </div>
      </section>

      <TextileBorder flip />

      {/* What + How */}
      <section className="section" style={{background:C.parchment}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",flexDirection:"column",gap:48}}>
          <div>
            <div className="section-eyebrow" style={{marginBottom:12}}>{m.whatTitle}</div>
            <p style={{fontSize:16,lineHeight:1.9,color:"#4a3728",fontWeight:600}}>{m.whatBody}</p>
          </div>
          <div>
            <div className="section-eyebrow" style={{marginBottom:12}}>{m.howTitle}</div>
            <p style={{fontSize:16,lineHeight:1.9,color:"#4a3728",fontWeight:600}}>{m.howBody}</p>
          </div>
        </div>
      </section>

      <TextileBorder />

      {/* Tiers */}
      <section className="section section-dark">
        <div className="section-header">
          <div className="section-eyebrow" style={{color:C.teal}}>{m.tiersTitle}</div>
        </div>
        <div className="grid-3" style={{maxWidth:860,margin:"0 auto"}}>
          {m.tiers.map((tier, i) => (
            <div key={tier.name} style={{
              border:`3px solid ${i===2?C.gold:C.beige}33`,
              padding:"36px 28px",textAlign:"center",
              background: i===2 ? `rgba(200,146,42,0.08)` : "rgba(255,255,255,0.04)",
              position:"relative",
            }}>
              {i===2 && <div style={{
                position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",
                background:C.gold,color:C.espresso,
                fontSize:9,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",
                padding:"3px 14px",
              }}>Founding Status</div>}
              <div style={{fontSize:36,marginBottom:12}}>{tier.icon}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:22,color:i===2?C.gold:C.cream,marginBottom:10}}>{tier.name}</div>
              <p style={{fontSize:14,lineHeight:1.8,color:"rgba(245,237,214,0.65)",fontWeight:600,margin:0}}>{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TextileBorder />

      {/* The Long Game */}
      <section className="section" style={{background:C.parchment,textAlign:"center"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div className="section-eyebrow" style={{marginBottom:16}}>{m.promiseTitle}</div>
          <p style={{fontFamily:"'Pacifico',cursive",fontSize:22,color:C.espresso,lineHeight:1.7}}>{m.promiseBody}</p>
        </div>
      </section>

      <TextileBorder />

      {/* Join form */}
      <section className="section section-dark">
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <h2 style={{fontFamily:"'Lilita One',cursive",fontSize:32,color:C.cream,marginBottom:10}}>{m.formTitle}</h2>
            <p style={{fontSize:14,color:`rgba(245,237,214,0.55)`,fontWeight:600,letterSpacing:"0.04em"}}>{m.formSub}</p>
          </div>
          {status === "success" ? (
            <div style={{
              textAlign:"center",padding:"24px",border:`2px solid ${C.teal}`,
              color:C.cream,fontFamily:"'Pacifico',cursive",fontSize:20,lineHeight:1.6,
            }}>{m.success}</div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-field">
                <label className="form-label" style={{color:C.beige}}>{m.nameLabel}</label>
                <input className="form-input" name="name" placeholder={m.namePlaceholder} value={form.name} onChange={handle} required style={{background:"rgba(255,255,255,0.06)",color:C.cream,borderColor:`${C.beige}55`}} />
              </div>
              <div className="form-field">
                <label className="form-label" style={{color:C.beige}}>{m.emailLabel}</label>
                <input className="form-input" name="email" type="email" placeholder={m.emailPlaceholder} value={form.email} onChange={handle} required style={{background:"rgba(255,255,255,0.06)",color:C.cream,borderColor:`${C.beige}55`}} />
              </div>
              <div className="form-field">
                <label className="form-label" style={{color:C.beige}}>{m.roleLabel}</label>
                <input className="form-input" name="role" placeholder={m.rolePlaceholder} value={form.role} onChange={handle} required style={{background:"rgba(255,255,255,0.06)",color:C.cream,borderColor:`${C.beige}55`}} />
              </div>
              <div className="form-field">
                <label className="form-label" style={{color:C.beige}}>{m.messageLabel}</label>
                <textarea className="form-textarea" name="message" placeholder={m.messagePlaceholder} value={form.message} onChange={handle} style={{background:"rgba(255,255,255,0.06)",color:C.cream,borderColor:`${C.beige}55`,minHeight:90}} />
              </div>
              {status === "error" && (
                <div style={{background:"#B8503E22",border:`2px solid ${C.red}`,padding:"14px 18px",marginBottom:16,color:C.cream,fontWeight:700,fontSize:14}}>
                  {m.error}
                </div>
              )}
              <button className="submit-btn" type="submit" disabled={status === "submitting"}
                style={{background:C.red,borderColor:C.blush,boxShadow:`4px 4px 0 ${C.beige}44`}}>
                {status === "submitting" ? m.submitting : m.submit}
              </button>
            </form>
          )}
        </div>
      </section>

      <TextileBorder flip />
    </>
  );
}

function LaMesaReferralPage({ t, go }) {
  const m = t.laMesa;
  const [ref, setRef] = useState({yourName:"",theirName:"",theirEmail:"",theirPhone:"",theirBiz:"",theirWeb:"",need:m.refOptions[0],notes:""});
  const [refStatus, setRefStatus] = useState("idle");
  const handleRef = e => setRef({...ref, [e.target.name]: e.target.value});

  const submitRef = async e => {
    e.preventDefault();
    setRefStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          access_key:"bb35de9c-0515-4e74-9f2f-202d6fd033b8",
          subject:`La Mesa Referral — ${ref.theirName} via ${ref.yourName}`,
          name:ref.yourName,
          message:`Referred by: ${ref.yourName}\nTheir name: ${ref.theirName}\nEmail: ${ref.theirEmail}\nPhone: ${ref.theirPhone}\nBusiness: ${ref.theirBiz || "Not provided"}\nWebsite: ${ref.theirWeb || "Not provided"}\nNeeds: ${ref.need}\n\n${ref.notes || "No additional notes."}`,
        }),
      });
      const data = await res.json();
      setRefStatus(data.success ? "success" : "error");
    } catch { setRefStatus("error"); }
  };

  return (
    <>
      <section style={{background:C.espresso,paddingTop:100,paddingBottom:56,paddingLeft:40,paddingRight:40,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.06,pointerEvents:"none"}}>
          <Sunburst size={600} color={C.gold} opacity={0.8} />
        </div>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{display:"inline-block",border:`2px solid ${C.teal}`,padding:"5px 20px",marginBottom:24,fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:700,color:C.teal}}>
            {m.badge}
          </div>
          <h1 style={{fontFamily:"'Pacifico',cursive",fontSize:"clamp(36px,7vw,64px)",color:C.cream,lineHeight:1,marginBottom:16}}>{m.refTitle}</h1>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:16,color:`rgba(245,237,214,0.7)`,fontWeight:600,maxWidth:480,margin:"0 auto 28px",lineHeight:1.8}}>{m.refSub}</p>
          <button onClick={() => go("La Mesa")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:`rgba(245,237,214,0.45)`,letterSpacing:"0.12em",textTransform:"uppercase",textDecoration:"underline",transition:"color 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.color=`rgba(245,237,214,0.8)`}
            onMouseLeave={e=>e.currentTarget.style.color=`rgba(245,237,214,0.45)`}>
            ← Back to La Mesa
          </button>
        </div>
      </section>

      <TextileBorder flip />

      <section className="section" style={{background:C.parchment}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          {refStatus === "success" ? (
            <div style={{textAlign:"center",padding:"40px 24px",border:`2px solid ${C.teal}`,color:C.espresso,fontFamily:"'Pacifico',cursive",fontSize:20,lineHeight:1.6}}>
              {m.refSuccess}
            </div>
          ) : (
            <>
              {/* Step 1 — Verify Identity */}
              <div style={{border:`2px solid ${C.teal}`,padding:"32px 36px",marginBottom:8,background:C.cream,boxShadow:`3px 3px 0 rgba(90,158,150,0.18)`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                  <div style={{background:C.teal,color:C.cream,fontSize:9,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",padding:"4px 10px",flexShrink:0}}>Step 1</div>
                  <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:C.teal,fontWeight:700}}>Identity Verification</div>
                </div>
                <p style={{fontSize:15,lineHeight:1.8,color:"#4a3728",fontWeight:600,marginBottom:24}}>
                  Before submitting a referral, please confirm your identity.
                </p>
                <button type="button"
                  style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",background:C.espresso,color:C.cream,border:`2px solid ${C.espresso}`,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.08em",padding:"15px 28px",cursor:"pointer",boxShadow:`3px 3px 0 ${C.espresso}33`,transition:"opacity 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.82"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
                    <rect x="2" y="5" width="20" height="15" rx="2" stroke="#F5EDD6" strokeWidth="1.8"/>
                    <path d="M2 10h20" stroke="#F5EDD6" strokeWidth="1.8"/>
                    <rect x="14" y="13.5" width="5" height="3" rx="0.8" fill="#F5EDD6" opacity="0.9"/>
                  </svg>
                  Verify Identity with Apple Wallet
                </button>
                <p style={{fontSize:12,color:"#999",lineHeight:1.7,marginTop:16,fontWeight:600,margin:"16px 0 0"}}>
                  Don't have an ID in Apple Wallet? Email{" "}
                  <a href="mailto:hello@pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>hello@pancon.cafe</a>
                  {" "}to verify manually before submitting.
                </p>
              </div>

              {/* Step 2 divider */}
              <div style={{display:"flex",alignItems:"center",gap:12,margin:"28px 0"}}>
                <div style={{flex:1,height:1,background:C.espresso,opacity:0.1}} />
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{background:C.espresso,color:C.cream,fontSize:9,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",padding:"4px 10px"}}>Step 2</div>
                  <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:C.espresso,fontWeight:700,opacity:0.45}}>Submit Your Referral</div>
                </div>
                <div style={{flex:1,height:1,background:C.espresso,opacity:0.1}} />
              </div>

              <form onSubmit={submitRef}>
                <div className="form-field">
                  <label className="form-label">{m.refYourName}</label>
                  <input className="form-input" name="yourName" placeholder={m.refYourNamePlaceholder} value={ref.yourName} onChange={handleRef} required />
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refTheirName}</label>
                  <input className="form-input" name="theirName" placeholder={m.refTheirNamePlaceholder} value={ref.theirName} onChange={handleRef} required />
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refTheirEmail}</label>
                  <input className="form-input" type="email" name="theirEmail" placeholder={m.refTheirEmailPlaceholder} value={ref.theirEmail} onChange={handleRef} required />
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refTheirPhone}</label>
                  <input className="form-input" type="tel" name="theirPhone" placeholder={m.refTheirPhonePlaceholder} value={ref.theirPhone} onChange={handleRef} required />
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refTheirBiz}</label>
                  <input className="form-input" name="theirBiz" placeholder={m.refTheirBizPlaceholder} value={ref.theirBiz} onChange={handleRef} required />
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refTheirWeb}</label>
                  <input className="form-input" name="theirWeb" placeholder={m.refTheirWebPlaceholder} value={ref.theirWeb} onChange={handleRef} />
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refNeed}</label>
                  <select className="form-select" name="need" value={ref.need} onChange={handleRef}>
                    {m.refOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">{m.refNotes}</label>
                  <textarea className="form-textarea" name="notes" placeholder={m.refNotesPlaceholder} value={ref.notes} onChange={handleRef} style={{minHeight:80}} />
                </div>
                {refStatus === "error" && (
                  <div style={{background:"#B8503E22",border:`2px solid ${C.red}`,padding:"14px 18px",marginBottom:16,color:C.espresso,fontWeight:700,fontSize:14}}>
                    {m.refError}
                  </div>
                )}
                <button className="submit-btn" type="submit" disabled={refStatus === "submitting"}>
                  {refStatus === "submitting" ? m.refSubmitting : m.refSubmit}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <TextileBorder flip />
    </>
  );
}

function PrivacyPolicyPage({ go }) {
  const sLabel = {fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:10};
  const sTitle = {fontFamily:"'Lilita One',cursive",fontSize:"clamp(20px,3vw,28px)",color:C.espresso,marginBottom:16,lineHeight:1.2};
  const body = {fontSize:15,lineHeight:1.9,color:"#4a3728",fontWeight:600,marginBottom:16};
  const hr = {borderTop:`2px solid ${C.espresso}`,opacity:0.12,marginBottom:52};

  return (
    <>
      <section style={{background:C.espresso,paddingTop:100,paddingBottom:56,paddingLeft:40,paddingRight:40,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.06,pointerEvents:"none"}}>
          <Sunburst size={600} color={C.gold} opacity={0.8} />
        </div>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:16}}>Legal</div>
          <h1 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(40px,7vw,72px)",color:C.cream,lineHeight:1.1,marginBottom:20}}>
            Privacy <span style={{color:C.blush}}>Policy</span>
          </h1>
          <p style={{fontSize:12,color:`rgba(245,237,214,0.4)`,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700}}>
            Effective Date: May 21, 2026 &nbsp;·&nbsp; Last Updated: May 21, 2026
          </p>
        </div>
      </section>

      <TextileBorder flip />

      <section className="section" style={{background:C.parchment}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>

          <p style={{...body,fontSize:16,marginBottom:56}}>
            Café Con Pan LLC ("we," "us," or "our") is committed to being transparent about how we handle your information. This Privacy Policy applies to our website at <strong>pancon.cafe</strong> and the services we offer through it — including identity verification via Apple Wallet, invoice payment processing through Helcim, and our La Mesa partner referral network.
          </p>

          {/* Identity Verification */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Apple Wallet</div>
            <h2 style={sTitle}>Identity Verification via Verify with Wallet on the Web</h2>
            <p style={body}>Café Con Pan uses Apple's <strong>Verify with Wallet on the Web</strong> feature to confirm the identity of individuals seeking access to the La Mesa partner network. This verification is used solely to establish that a person is who they claim to be before granting access to the La Mesa referral program.</p>
            <p style={body}><strong>What we collect:</strong> Through this verification, we receive only the <strong>name</strong> as it appears on your government-issued ID or Apple Digital ID stored in Apple Wallet. We do not receive or store your ID number, date of birth, photo, address, or any other information from your identity document.</p>
            <p style={body}><strong>How we use it:</strong> Your verified name is used only to confirm your identity for the purpose of La Mesa partner access. It is not used for marketing, advertising, or any purpose beyond identity confirmation.</p>
            <p style={body}><strong>Data retention:</strong> Verified identity data is not stored beyond the active verification session unless it is necessary to associate the verification with your La Mesa referral record. In that case, only your verified name is retained as part of your partner record, and it is held only as long as your partnership remains active.</p>
            <p style={body}>We do not sell, share, or disclose verification data to any third party. Apple's handling of your Wallet credentials is governed by Apple's own Privacy Policy.</p>
          </div>

          <div style={hr} />

          {/* Payment Processing */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Payments</div>
            <h2 style={sTitle}>Invoice Payment Processing</h2>
            <p style={body}>Invoice payments on Café Con Pan are processed through <strong>Helcim</strong>, a third-party payment processor. When you click "Pay Now" at pancon.cafe/#pay, you are directed to a Helcim-hosted payment page.</p>
            <p style={body}>We do not collect, store, or have access to your payment card information, bank account details, or billing address. All payment data is handled directly and securely by Helcim. Helcim's privacy practices are governed by their own Privacy Policy.</p>
          </div>

          <div style={hr} />

          {/* Email */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Communications</div>
            <h2 style={sTitle}>Email & Business Communications</h2>
            <p style={body}>Our business email addresses — <strong>hello@pancon.cafe</strong> and <strong>jason@pancon.cafe</strong> — are managed through <strong>Google Workspace</strong>. When you email us or we communicate with you, that correspondence is handled through Google's platform and subject to Google's Privacy Policy.</p>
            <p style={body}>We use your email address to respond to your inquiries, deliver project communications, send invoices, and — if you opt in — keep you updated on Café Con Pan news and launches. We do not send unsolicited marketing emails. You can request removal from our list at any time by emailing <a href="mailto:hello@pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>hello@pancon.cafe</a>.</p>
          </div>

          <div style={hr} />

          {/* Forms */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Contact & Sign-Ups</div>
            <h2 style={sTitle}>Forms & Email Sign-Ups</h2>
            <p style={body}>Contact forms and email sign-up forms on this site are processed through <strong>Web3Forms</strong>, a third-party form submission service. When you submit a form, your information — name, email, and any message you include — is transmitted securely to Web3Forms and forwarded to us.</p>
            <p style={body}>We use the information you submit to respond to your inquiry, follow up on service requests, or add you to our mailing list if you opted in. We do not sell or share this information with advertisers or unaffiliated third parties.</p>
          </div>

          <div style={hr} />

          {/* Cookies */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Website</div>
            <h2 style={sTitle}>Cookies & Analytics</h2>
            <p style={body}>Café Con Pan does not use tracking cookies, advertising cookies, or third-party analytics platforms such as Google Analytics. We do not build behavioral profiles of our visitors and we do not serve targeted ads.</p>
            <p style={body}>Your browser may store locally cached data to support normal website functionality, but we do not use this data to track or identify you. You can clear your browser cache at any time through your browser settings.</p>
          </div>

          <div style={hr} />

          {/* Data Sharing */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Third Parties</div>
            <h2 style={sTitle}>How We Share Information</h2>
            <p style={body}>We do not sell your personal information. We do not share your information with advertisers, data brokers, or marketing platforms. The only third parties that handle your data as part of our services are:</p>
            <div style={{border:`2px solid ${C.espresso}22`,padding:"24px 28px",background:C.cream,marginBottom:16}}>
              {[
                {name:"Apple",role:"Verify with Wallet on the Web identity verification"},
                {name:"Helcim",role:"Invoice payment processing"},
                {name:"Google Workspace",role:"Business email (hello@pancon.cafe · jason@pancon.cafe)"},
                {name:"Web3Forms",role:"Contact form and email sign-up processing"},
              ].map((p,i,arr) => (
                <div key={p.name} style={{display:"flex",gap:16,alignItems:"flex-start",paddingBottom:i<arr.length-1?16:0,marginBottom:i<arr.length-1?16:0,borderBottom:i<arr.length-1?`1px solid ${C.espresso}15`:"none"}}>
                  <div style={{fontWeight:700,color:C.espresso,fontSize:14,minWidth:140}}>{p.name}</div>
                  <div style={{fontSize:14,color:"#555",fontWeight:600,lineHeight:1.6}}>{p.role}</div>
                </div>
              ))}
            </div>
            <p style={body}>Each of these providers operates under their own privacy policies and data security standards. We may disclose information if required by law or in response to a valid legal process.</p>
          </div>

          <div style={hr} />

          {/* Your Rights */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Your Rights</div>
            <h2 style={sTitle}>Accessing & Deleting Your Information</h2>
            <p style={body}>You have the right to request access to the personal information we hold about you, and to request that we correct or delete it. To make a request, email us at <a href="mailto:hello@pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>hello@pancon.cafe</a> with the subject line "Privacy Request."</p>
            <p style={body}>We will respond to verified requests within 30 days. Some information may be retained as required by law or for legitimate business purposes, such as invoice records.</p>
          </div>

          <div style={hr} />

          {/* Children */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Age</div>
            <h2 style={sTitle}>Children's Privacy</h2>
            <p style={body}>Our services are not directed at individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us at <a href="mailto:hello@pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>hello@pancon.cafe</a> and we will promptly delete it.</p>
          </div>

          <div style={hr} />

          {/* Governing Law */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Legal</div>
            <h2 style={sTitle}>Governing Law</h2>
            <p style={body}>This Privacy Policy is governed by the laws of the <strong>Commonwealth of Virginia, United States</strong>. Any disputes arising under this policy shall be subject to the jurisdiction of the courts of the Commonwealth of Virginia.</p>
          </div>

          <div style={hr} />

          {/* Changes */}
          <div style={{marginBottom:52}}>
            <div style={sLabel}>Updates</div>
            <h2 style={sTitle}>Changes to This Policy</h2>
            <p style={body}>We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page. Continued use of our website after any changes constitutes your acceptance of the updated policy. If changes are significant, we may also notify you by email if we have your contact information.</p>
          </div>

          <div style={hr} />

          {/* Contact */}
          <div style={{marginBottom:0}}>
            <div style={sLabel}>Questions?</div>
            <h2 style={sTitle}>Contact Us</h2>
            <p style={{...body,marginBottom:24}}>If you have questions about this Privacy Policy or how we handle your information, we're here.</p>
            <div style={{border:`3px solid ${C.espresso}`,padding:"32px 36px",background:C.cream,boxShadow:`4px 4px 0 ${C.espresso}`,maxWidth:480}}>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:20,color:C.espresso,marginBottom:16}}>Café Con Pan LLC</div>
              <div style={{fontSize:14,lineHeight:2,color:"#4a3728",fontWeight:600}}>
                <div>Email: <a href="mailto:hello@pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>hello@pancon.cafe</a></div>
                <div>Website: <a href="https://pancon.cafe" style={{color:C.teal,textDecoration:"none",fontWeight:700}}>pancon.cafe</a></div>
                <div>Jurisdiction: Commonwealth of Virginia, United States</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <TextileBorder />
    </>
  );
}

export default function CafeConPan() {
  const [page, setPage] = useState(getPageFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState(getBrowserLang);
  const [gameActive, setGameActive] = useState(false);
  const [secretNavActive, setSecretNavActive] = useState(false);
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
      typedRef.current = (typedRef.current + e.key).slice(-11).toUpperCase();
      if (typedRef.current.endsWith("CAFE")) setGameActive(true);
      if (typedRef.current.endsWith("1242202JFRM")) setSecretNavActive(true);
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
      case "Home": return <HomePage go={go} t={t} lang={lang} />;
      case "Tech Services": return <TechPage go={go} t={t} />;
      case "Community": return <CommunityPage t={t} go={go} />;
      case "Our Story": return <AboutPage t={t} />;
      case "Contact": return <ContactPage t={t} />;
      case "La Mesa": return <LaMesaPage t={t} go={go} />;
      case "La Mesa Referral": return <LaMesaReferralPage t={t} go={go} />;
      case "Pay": return <PayPage t={t} />;
      case "Privacy Policy": return <PrivacyPolicyPage go={go} />;
      default: return <HomePage go={go} t={t} lang={lang} />;
    }
  };

  return (
    <>
      {gameActive && <CafeGame onClose={() => setGameActive(false)} />}
      {secretNavActive && (
        <div onClick={() => setSecretNavActive(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e => e.stopPropagation()} style={{background:C.espresso,border:`2px solid ${C.gold}`,boxShadow:`6px 6px 0 ${C.gold}44`,padding:"40px 48px",minWidth:280,textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:24}}>Admin Access</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["Pay","Pay"],["La Mesa Referral","La Mesa Referral"],["La Mesa","La Mesa"]].map(([label,page]) => (
                <button key={page} onClick={() => { go(page); setSecretNavActive(false); }}
                  style={{background:"none",border:`2px solid ${C.beige}33`,color:C.cream,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em",textTransform:"uppercase",padding:"12px 24px",transition:"border-color 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${C.beige}33`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setSecretNavActive(false)} style={{marginTop:24,background:"none",border:"none",cursor:"pointer",fontSize:11,color:`rgba(245,237,214,0.3)`,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Close</button>
          </div>
        </div>
      )}
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
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:4}}>{t.socials.followLabel}</div>
          <div style={{display:"flex",gap:16}}>
            <a href={t.socials.instagram} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
            >{t.socials.instagramLabel}</a>
            <a href={t.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
            >{t.socials.linkedinLabel}</a>
            <a href={t.socials.twitter} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
            >{t.socials.twitterLabel}</a>
            <a href={t.socials.tiktok} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
            >{t.socials.tiktokLabel}</a>
            {t.socials.youtube&&<a href={t.socials.youtube} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>{t.socials.youtubeLabel}</a>}
            {t.socials.facebook&&<a href={t.socials.facebook} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>{t.socials.facebookLabel}</a>}
            {t.socials.discord&&<a href={t.socials.discord} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>{t.socials.discordLabel}</a>}
          </div>
        </div>
<div style={{fontSize:11,color:`rgba(245,237,214,0.35)`,fontWeight:600,textAlign:"center",maxWidth:480,lineHeight:1.6}}>{t.footer.disclaimer}</div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <div className="footer-copy">{t.footer.copy}</div>
          <button onClick={() => go("Privacy Policy")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:10,color:`rgba(245,237,214,0.2)`,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"underline",transition:"color 0.2s",padding:0}}
            onMouseEnter={e=>e.currentTarget.style.color=`rgba(245,237,214,0.55)`}
            onMouseLeave={e=>e.currentTarget.style.color=`rgba(245,237,214,0.2)`}
          >{t.privacy.footerLink}</button>
        </div>
      </footer>
    </>
  );
}
