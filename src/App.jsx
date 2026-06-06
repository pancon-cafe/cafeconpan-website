import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import CafeGame from "./CafeGame";
import { P, catalogText } from "./pricing";
const QuoteBuilder   = lazy(() => import("./QuoteBuilder"));
const AuditBuilder   = lazy(() => import("./AuditBuilder"));

const C = {
  cream: "#F5EDD6",
  espresso: "#3D2B1F",
  red: "#B8503E",
  blush: "#F2B0AC",
  beige: "#D4A97A",
  teal: "#5A9E96",
  gold: "#C8922A",
  parchment: "#EDE0C4",
  // dark tool tokens (shared with The Cupping & The Pour)
  bg:    '#0D0702',
  surf:  '#1B0E07',
  card:  '#241408',
  b0:    'rgba(212,169,122,0.13)',
  b1:    'rgba(212,169,122,0.28)',
  muted: '#7A5830',
  dim:   '#3D2818',
  dkCream: '#E0C89A',
  white: '#F5EDD8',
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
    nav: { items:["Home","Tech Services","Our Story","Contact"], cta:"Get Started", langBtn:"ES" },
    hero: { stamp:"☕ Honduran American Roots · Est. 2025", subtitle:"Tech · Coffee · Culture · Community", origin:"Before most people had internet at home, the café was where you went to get connected — online, to each other, to the tools that made business possible. We carry that forward, for small businesses built on Apple.", cta:"Get Started →", ctaSecondary:"See Our Services →", scroll:"Scroll", steps:["Intro call","Tech audit","Your roadmap"] },
    story: { eyebrow:"Our Story", title:"More Than a", titleSpan:"Cup of Coffee", body:"The name comes from Honduras. Every morning, abuela made coffee in a bowl — you'd soak your rosquillas and ojaldras in it like soup. That ritual was never just about coffee. It was about showing up for the people at your table. That's still what we do — just now with Apple devices and carrier contracts instead of pan dulce.", storyCta:"Read the full story →" },
    painPoints: {
      eyebrow:"Real Talk",
      title:"Does This Sound",
      titleSpan:"Familiar?",
      sub:"You didn't start your business to become an IT person. But somewhere along the way, the tech stuff started costing you time, money, and headaches you didn't sign up for.",
      cards:[
        { title:"Your business email is a @gmail.com, @yahoo.com, or @outlook.com.", desc:"Nothing wrong with those — except when one of them is the email on your business card. Clients notice. It signals you're not quite official yet, even when you absolutely are." },
        { title:"Your personal phone is your business phone.", desc:"Same number for family, clients, vendors, and late-night emergencies. No separation. No boundary. No way to ever really clock out." },
        { title:"Someone bought iPads at Best Buy and set them up with personal Apple IDs.", desc:"It worked — until someone quit. Now those devices have company contacts, emails, and apps tied to a personal account you can't access or control." },
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
        { n:"01", icon:"⌨️", title:"Tech Services", badge:"Available Now", desc:"Apple-focused device management, IT consulting, and carrier services. One trusted partner from day one to fully operational. Available now.", cta:"Explore →", page:"Tech Services" },
        { n:"02", icon:"☕", title:"Coffee & Community", badge:"Coming Soon", desc:"A Honduran-rooted café experience built around Central American single-origin coffee, pan dulce, and a physical space with a boardroom where clients meet and deals get done. Coming soon.", cta:"See What's Coming →", page:"Contact" },
        { n:"03", icon:"🌱", title:"The Bigger Vision", badge:"The Full Picture", desc:"Family land in Honduras. A café with a boardroom. An investment arm that grows alongside the clients we believe in. This is the full picture.", cta:"Read Our Story →", page:"Our Story" },
      ],
    },
    biggerPicture: { emailPlaceholder:"Stay in the loop — drop your email", emailBtn:"I'm In" },
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
      quote:"Every morning without fail, my grandma made coffee in a bowl. Rosquillas and ojaldras soaked in like soup. I was five years old. I've never stopped thinking about that cup.",
      quoteAttr:"— Jason, Founder",
      paragraphs:[
        "My grandmother was not a small woman in the world. People knew her name across Honduras — her family name, her children, her grandchildren. She was funny, sharp, generous beyond measure, and tough exactly when she needed to be. She spent her life quietly acquiring land, piece by piece, making sure her sons and daughters would be okay long after she was gone. She knew something most people spend their whole lives figuring out — that the most important thing you can leave someone isn't money. It's roots.",
        "My dad has owned land in Honduras since he was a teenager. That land is one of his last living connections to her. It's one of mine too. One day, coffee will grow on that land — not just as a crop, but as a continuation. Something for our generation, and the ones after it, to point to and say: this is where we come from.",
        "The summer I spent working in my uncle's plantain fields in Honduras is one I'll never forget. I was the oldest, so naturally I was put to work while my siblings were on vacation. No industrial equipment — just cows, horses, handmade wooden tools, and the kind of heat that makes you understand in your body what labor actually means. It took all day. My back hurt. And I wasn't upset for a single moment of it. Working alongside my cousins, I felt proud. Humbled. I understood for the first time what it meant to have been born in the United States — not as something to take for granted, but as something to honor.",
        "Growing up between two worlds teaches you things that can't be put on a resume. It makes you grow up faster. It hands you responsibility before you think you're ready for it. It shows you that the way people build relationships and do business in Honduras is not the same as on the East Coast, and the East Coast is not the same as Hawaii — and that knowing the difference is a skill most people never develop.",
        "It also shows you what it feels like to be treated differently. Middle school. High school. The slow realization that other people see something in you that you never saw in yourself as a kid. That experience is uncomfortable. It's also one of the most clarifying things that can happen to a person. It's part of why people find it easy to get close to me. And it's part of why I built something that speaks directly to the people who have navigated that same road — who are exceptional at what they do, but have had to figure out the infrastructure of American business without a map.",
        "I want to retire my parents. That's the honest truth of it. They have worked every single day to keep a roof over our heads and food on the table. Their health isn't always going to hold. I want them to spend the rest of their lives proud, present, and free — with their grandchildren, with each other, without worrying. If I could do it tomorrow I would.",
        "And beyond that — I'm betting on myself. On the roots in my DNA, the work ethic that was built in those fields, the relationships forged between two cultures, and the simple belief that the café has always been where community and opportunity meet.",
        "Café Con Pan started in a bowl of coffee in Honduras. It's becoming something you can build your business on.",
        "One cup and one connection at a time.",
      ],
      storyCta:"Let's Build Something Together →",
    },
    socials:{
      discord:"https://discordapp.com/users/1508469925134729250",
      facebook:"https://www.facebook.com/share/1E4yWafzsU/?mibextid=wwXIfr",
      instagram:"https://instagram.com/icafeconpan",
      linkedin:"https://linkedin.com/company/cafeconpan",
      tiktok:"https://tiktok.com/@icafeconpan",
      twitter:"https://twitter.com/icafeconpan",
      youtube:"https://youtube.com/@icafeconpan",
      discordLabel:"Discord",
      facebookLabel:"Facebook",
      instagramLabel:"Instagram",
      linkedinLabel:"LinkedIn",
      tiktokLabel:"TikTok",
      twitterLabel:"Twitter",
      youtubeLabel:"YouTube",
      followLabel:"Socials", contactNote:"Follow Us ↓",
    },
    contact:{
      eyebrow:"Get in Touch", title:"Let's", titleSpan:"Talk",
      sub:"For existing clients, press, partnerships, and everything outside the usual process. Looking to get started with tech services? Use the intake form instead — it gets you further, faster.",
      newClientEyebrow:"New to Café Con Pan?",
      newClientBody:"Looking to get started with tech services? Use the intake form — it's faster for both of us.",
      intakeCta:"Take Me to the Intake Form →",
      info:[{label:"Email",val:"hello@pancon.cafe"},{label:"Phone",val:"(771) CAFE-131",val2:"(771) 223-3131"},{label:"Response Time",val:"Within 24 Hours"},{label:"Business",val:"Cafe Con Pan LLC"},{label:"Services",val:"Tech · Coffee · Culture"}],
      nameLabel:"Your Name", namePlaceholder:"Full name",
      emailLabel:"Email Address", emailPlaceholder:"Your email address",
      inquiryLabel:"Inquiry Type", messageLabel:"Message", messagePlaceholder:"What can we help you with?",
      inquiryPlaceholder:"Select an inquiry type...",
      options:["Existing Client — Follow-up","Partnership Inquiry","Press & Media","Coffee & Events — Stay in the Loop","Something Else"],
      submit:"Send It →", submitting:"Sending...",
      success:"Message sent! We'll be in touch soon. ☕",
      error:"Something went wrong. Please try again or email us directly at hello@pancon.cafe.",
    },
    softCta:{ eyebrow:"Not Sure Where to Start?", body:"No pitch, no pressure. Just a conversation about where your business is and what might actually help.", btn:"Let's Just Talk →", emailEyebrow:"Not Ready Yet?", emailBody:"Follow the journey and we'll reach out when the time is right." },
    footer:{ tagline:"Tech · Coffee · Culture", copy:"© 2026 Cafe Con Pan LLC", disclaimer:"We provide guidance and implementation support — not legal, tax, or financial advice. For those needs, we recommend working with a licensed professional." },
    pay:{ eyebrow:"Pay Your Invoice", title:"Quick &", titleSpan:"Secure", body:"Enter your invoice number and amount on the next page. Payment is processed securely through Helcim.", cta:"Pay Now →", questions:"Questions? Email" },
    privacy:{ footerLink:"Privacy Policy" },
    techServices:{
      eyebrow:"Tech Services",
      heroTitle:"Built Around", heroTitleSpan:"Your Business",
      heroSub:"We don't sell packages off a menu. We assess your business first, then build a plan specific to what you actually need.",
      heroQuote:"Every engagement starts with The Audit. No surprises, no hidden fees — your Total Investment Summary is signed before any work begins.",
      auditEyebrow:"Step One", auditTitle:"The", auditTitleSpan:"Audit",
      auditSub:"Before we build anything, we assess everything. A full technology review of your business — scored, prioritized, and turned into a clear roadmap you keep forever.",
      auditRemote:"Remote", auditOnsite:"On-Site",
      auditFeatures:["Full assessment across 6 tech categories","Overall score + per-category scoring","Prioritized findings with severity ratings","Custom roadmap broken out by phase","Opportunities specific to your industry","30-day credit toward your project"],
      auditCta:"Start with an Audit →",
      foundationEyebrow:"The Baseline", foundationTitle:"Foundation Core", foundationStartingAt:"Starting at",
      foundationSub:"The infrastructure everything else runs on. Every client we work with gets this built first — it's the foundation your business needs before any other tech layer makes sense.",
      foundationItems:[
        { title:"Business Email & Domain",   desc:"A professional email on your own domain, properly configured and secured." },
        { title:"Apple Business Manager",    desc:"Apple's unified business platform — the backbone of everything Apple-related in your company." },
        { title:"MDM Enrollment",            desc:"Your first device properly enrolled and managed. The starting point for your entire fleet." },
        { title:"Apple Brands — Full Layer", desc:"Your full brand presence across Apple's ecosystem — Branded Mail, Verify with Apple Wallet, Tap to Pay branding, and Apple Maps Business Profile. Delivered as part of every Foundation engagement." },
      ],
      modulesEyebrow:"Add-On Modules", modulesTitle:"What We", modulesTitleSpan:"Build",
      modulesSub:"Your audit tells us which of these apply. Each module is scoped, quoted, and scheduled before any work begins.",
      modulesNote:"Module pricing is scoped after your audit and included in your Total Investment Summary.",
      modules:[
        { group:"Devices", items:[
          { id:"C1", name:"Zero-Touch Device Setup",      desc:"New devices arrive pre-configured and ready to use. Your staff turns them on, signs in, and gets to work — no IT department required." },
          { id:"C2", name:"Existing Device Enrollment",   desc:"Already have devices in use? We enroll them into your management system so they're properly secured, updated, and under your control." },
        ]},
        { group:"Connectivity", items:[
          { id:"D1", name:"Carrier Audit & Recommendation", desc:"We analyze your current carrier plans, identify what you're overpaying for, and recommend the right setup for your team size and location." },
          { id:"D2", name:"Carrier Implementation",         desc:"We handle the carrier changes — new lines, plan switches, number porting — so you don't have to navigate telecom alone." },
          { id:"E",  name:"Business Internet Setup",        desc:"We source and configure the right ISP for your business location, from installation coordination to network setup." },
        ]},
        { group:"Brand & Communication", items:[
          { id:"G", name:"Apple Brands Layer",      desc:"Included with Foundation Core. Available as a standalone service for businesses that already have their Apple infrastructure in place but haven't built their brand layer yet." },
          { id:"H", name:"AI Phone System",         desc:"A professional phone experience built on Twilio — intelligent call routing, automated greetings, and custom handling for your team and hours." },
          { id:"J", name:"Apple Business Messages", desc:"An official messaging channel on Apple devices. Customers contact you directly from Maps, Search, and Safari — right from their iPhone." },
        ]},
        { group:"Web", items:[
          { id:"F", name:"Business Website", desc:"A clean, professional website designed and launched for your business. Built for discoverability and built to represent you well." },
        ]},
      ],
      partnerEyebrow:"After the Build", partnerTitle:"Ongoing", partnerTitleSpan:"Partnership",
      partnerSub:"We don't disappear after setup. Both plans keep your business running, your tech current, and Jason on speed dial.",
      partnerPlan1Name:"Apple Operations", partnerPlan1Desc:"Ongoing device management, security updates, app deployment, and support for your Apple fleet. Per device — scales as your team grows.",
      partnerPlan2Name:"Partner Access",   partnerPlan2Desc:"Direct access to Jason and the full CCP network — carrier management, vendor relationships, priority support, and a trusted contact for everything tech.",
      partnerStartingAt:"Starting at",
      ctaEyebrow:"Ready?", ctaTitle:"Start with", ctaTitleSpan:"The Audit",
      ctaSub:"Fill out a quick intake form and we'll reach out within 24 hours to schedule your intro call.",
      ctaDisclaimer:"No surprises, no hidden fees — your Total Investment Summary is signed before any work begins.",
      ctaBtn:"Get Started →",
      credsEyebrow:"Credentials & Structure", credsTitle:"Built to", credsTitleSpan:"Back It Up",
      credsSub:"Certifications, legal structure, and partner programs in place before going to market — because credibility is built before the first client, not after.",
      credsBadges:[
        {label:"MDM Certifications",val:"Jamf · Mosyle · Hands-On"},
        {label:"Apple Partnership",val:"ACN — Applied"},
        {label:"Carrier Approach",val:"100% Agnostic"},
        {label:"Business Status",val:"LLC · EIN"},
        {label:"Procurement",val:"Reseller Exempt"},
        {label:"Gov Contracting",val:"SAM · CAGE Registered"},
      ],
      credsCta:"Request a Consultation →",
    },
    discovery:{
      eyebrow:"Get Started", title:"Tell Us About", titleSpan:"Your Business",
      sub:"Fill this out and we'll reach out within 24 hours. We'll go over your setup, find the gaps, and map out a clear tech roadmap — starting with a quick intro call.",
      steps:["Intro call","Tech audit","Your roadmap"],
      nameLabel:"Your name", namePlaceholder:"First and last name",
      emailLabel:"Your email", emailPlaceholder:"Your email address",
      phoneLabel:"Phone number", phonePlaceholder:"Best number to reach you",
      bestTimeLabel:"Best time to reach you",
      bestTimeOptions:["Morning","Afternoon","Evening"],
      q1Label:"Business name & what you do", q1Placeholder:"Tell us your business name and describe what you do day-to-day.",
      devicesOptions:["iPhone","iPad","Mac","Windows PC","Android","Unknown/Mixed"],
      q2Label:"Devices your team currently uses",
      servicesLabel:"What area do you need help with?",
      servicesNotSure:"Not sure yet",
      q3Label:"Biggest tech frustration", q3Placeholder:"What's the most frustrating technology problem in your business right now?",
      q4Label:"What you wish your business could do", q4Placeholder:"What would you love your business to be able to do that it can't today?",
      q5Label:"Timeline or deadline", q5Placeholder:"Any specific date or urgency we should know about? (optional)",
      calendlyLink:"Or skip ahead and pick a time directly →",
      submit:"Send It Over →", sending:"Sending…",
      trustNote:"No pitch, no pressure. We'll reach out within 24 hours to confirm your intro call.",
      successTitle:"You're in. ☕", successBody:"We got your info and we'll reach out within 24 hours to schedule your intro call — the first step toward your tech roadmap.", backToHome:"Back to Home →",
    },
    resources:{
      eyebrow:"Tools & Resources", title:"The Stack", titleSpan:"We Trust",
      sub:"Every tool on this page is something I've either used myself, recommend to clients, or trust enough to put my name behind. No fluff, no random affiliates.",
      comingSoon:"More coming soon.",
      disclaimer:"Some of these links are referral or affiliate links. If you sign up through them, I may earn a small credit or commission — at no extra cost to you. I only recommend things I'd tell a friend to use.",
      categories:{ productivity:"Productivity & Communication", infrastructure:"Business Infrastructure", devices:"Devices & Tech", carriers:"Carriers & Connectivity" },
      badges:{ iUseThis:"I use this", clientExclusive:"Client exclusive", iSetThisUp:"I set this up", trustedReferral:"Trusted Referral", trustedPartner:"Trusted Partner" },
      btn:{ getStarted:"Get Started →", learnMore:"Learn More →", getAccess:"Get Access →", contactMe:"Contact Me →", letsTalk:"Let's Talk →" },
    },
  },
  es: {
    nav: { items:["Inicio","Servicios Tech","Nuestra Historia","Contacto"], cta:"Comenzar", langBtn:"EN" },
    hero: { stamp:"☕ Raíces Hondureño-Americanas · Est. 2025", subtitle:"Tech · Café · Cultura · Comunidad", origin:"Antes de que la mayoría tuviera internet en casa, el café era donde ibas a conectarte — en línea, con los demás, con las herramientas que hacían posible el negocio. Nosotros llevamos eso hacia adelante, para pequeños negocios construidos en Apple.", cta:"Comenzar →", ctaSecondary:"Ver Nuestros Servicios →", scroll:"Desliza", steps:["Llamada inicial","Auditoría tech","Tu plan de acción"] },
    story: { eyebrow:"Nuestra Historia", title:"Más Que una", titleSpan:"Taza de Café", body:"El nombre viene de Honduras. Cada mañana, la abuela preparaba el café en un tazón — remojabas las rosquillas y las ojaldras como si fuera sopa. Ese ritual nunca fue solo sobre el café. Era sobre estar presente para las personas en tu mesa. Eso es lo que seguimos haciendo — solo que ahora con dispositivos Apple y contratos de carrier en lugar de pan dulce.", storyCta:"Leer la historia completa →" },
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
        { title:"Alguien compró los iPads en una tienda y los configuró con un Apple ID personal.", desc:"Funcionó — hasta que alguien se fue. Ahora esos dispositivos tienen contactos, correos y aplicaciones del negocio vinculados a una cuenta personal a la que no tienes acceso." },
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
        { n:"01", icon:"⌨️", title:"Servicios Tech", badge:"Disponible Ahora", desc:"Gestión de dispositivos Apple, consultoría IT y servicios de carrier. Un solo socio de confianza desde el primer día hasta estar completamente operativo. Disponible ahora.", cta:"Explorar →", page:"Tech Services" },
        { n:"02", icon:"☕", title:"Café & Comunidad", badge:"Próximamente", desc:"Una experiencia de café con raíces hondureñas centrada en café de origen único centroamericano, pan dulce y un espacio físico con sala de juntas donde los clientes se reúnen y se cierran tratos. Próximamente.", cta:"Ver lo que Viene →", page:"Contact" },
        { n:"03", icon:"🌱", title:"La Visión Completa", badge:"El Panorama Completo", desc:"Tierras familiares en Honduras. Un café con sala de juntas. Un brazo de inversión que crece junto a los clientes en los que creemos. Este es el panorama completo.", cta:"Nuestra Historia →", page:"Our Story" },
      ],
    },
    biggerPicture: { emailPlaceholder:"Tu correo — mantente al día", emailBtn:"¡Apúntame!" },
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
      quote:"Cada mañana sin falta, preparaba café en un tazón. Las rosquillas y ojaldras se remojaban como sopa. Tenía cinco años. Nunca he dejado de pensar en esa taza.",
      quoteAttr:"— Jason, Founder",
      paragraphs:[
        "Mi abuela no era una mujer pequeña en el mundo. La gente conocía su nombre en toda Honduras — su apellido, sus hijos, sus nietos. Era graciosa, aguda, generosa sin medida, y firme exactamente cuando hacía falta. Pasó su vida adquiriendo tierras silenciosamente, pedazo a pedazo, asegurándose de que sus hijos e hijas estarían bien mucho después de que ella se fuera. Sabía algo que la mayoría de las personas pasa toda la vida tratando de entender — que lo más importante que puedes dejarle a alguien no es dinero. Son raíces.",
        "Mi papá ha tenido tierras en Honduras desde que era adolescente. Esa tierra es una de sus últimas conexiones vivas con ella. Y también una de las mías. Algún día, café crecerá en esa tierra — no solo como cultivo, sino como continuación. Algo a lo que nuestra generación, y las que vengan después, puedan señalar y decir: aquí es de donde venimos.",
        "El verano que pasé trabajando en los platanales de mi tío en Honduras es uno que nunca olvidaré. Yo era el mayor, así que naturalmente me pusieron a trabajar mientras mis hermanos estaban de vacaciones. Sin maquinaria industrial — solo vacas, caballos, herramientas de madera hechas a mano, y el tipo de calor que te hace entender en el cuerpo lo que realmente significa el trabajo. Tomó todo el día. Me dolía la espalda. Y no estuve molesto ni un solo momento. Trabajando junto a mis primos, me sentí orgulloso. Humilde. Entendí por primera vez lo que significaba haber nacido en los Estados Unidos — no como algo que dar por sentado, sino como algo que honrar.",
        "Crecer entre dos mundos te enseña cosas que no se pueden poner en un currículum. Te hace madurar más rápido. Te pone responsabilidades en los hombros antes de que creas estar listo. Te muestra que la forma en que las personas construyen relaciones y hacen negocios en Honduras no es la misma que en la Costa Este, y la Costa Este no es lo mismo que Hawái — y que conocer esa diferencia es una habilidad que la mayoría de las personas nunca desarrolla.",
        "También te muestra lo que se siente ser tratado diferente. La secundaria. La preparatoria. La lenta comprensión de que otras personas ven algo en ti que tú nunca viste en ti mismo de niño. Esa experiencia es incómoda. También es una de las cosas más clarificadoras que le pueden pasar a una persona. Es parte de por qué la gente encuentra fácil acercarse a mí. Y es parte de por qué construí algo que habla directamente a las personas que han recorrido ese mismo camino — que son excepcionales en lo que hacen, pero que tuvieron que descifrar la infraestructura del negocio americano sin un mapa.",
        "Quiero jubilar a mis padres. Esa es la verdad honesta de todo esto. Han trabajado todos y cada uno de los días para poner un techo sobre nuestras cabezas y comida en la mesa. Su salud no siempre va a aguantar. Quiero que pasen el resto de sus vidas orgullosos, presentes y libres — con sus nietos, el uno con el otro, sin preocupaciones. Si pudiera hacerlo mañana, lo haría.",
        "Y más allá de eso — estoy apostando por mí mismo. Por las raíces en mi ADN, la ética de trabajo forjada en esos campos, las relaciones construidas entre dos culturas, y la simple creencia de que el café siempre ha sido donde la comunidad y la oportunidad se encuentran.",
        "Café Con Pan comenzó en un tazón de café en Honduras. Se está convirtiendo en algo sobre lo que puedes construir tu negocio.",
        "Una taza y una conexión a la vez.",
      ],
      storyCta:"Construyamos Algo Juntos →",
    },
    socials:{
      discord:"https://discordapp.com/users/1508469925134729250",
      facebook:"https://www.facebook.com/share/1E4yWafzsU/?mibextid=wwXIfr",
      instagram:"https://instagram.com/icafeconpan",
      linkedin:"https://linkedin.com/company/cafeconpan",
      tiktok:"https://tiktok.com/@icafeconpan",
      twitter:"https://twitter.com/icafeconpan",
      youtube:"https://youtube.com/@icafeconpan",
      discordLabel:"Discord",
      facebookLabel:"Facebook",
      instagramLabel:"Instagram",
      linkedinLabel:"LinkedIn",
      tiktokLabel:"TikTok",
      twitterLabel:"Twitter",
      youtubeLabel:"YouTube",
      followLabel:"Redes Sociales", contactNote:"Síguenos ↓",
    },
    contact:{
      eyebrow:"Ponte en Contacto", title:"", titleSpan:"Hablemos",
      sub:"Para clientes actuales, prensa, alianzas y todo lo que está fuera del proceso habitual. ¿Buscas empezar con servicios tech? Usa el formulario de inicio — es más rápido para ambos.",
      newClientEyebrow:"¿Nuevo en Café Con Pan?",
      newClientBody:"¿Quieres empezar con servicios tech? Usa el formulario de inicio — es más rápido para ambos.",
      intakeCta:"Ir al Formulario de Inicio →",
      info:[{label:"Correo",val:"hello@pancon.cafe"},{label:"Teléfono",val:"(771) CAFE-131",val2:"(771) 223-3131"},{label:"Tiempo de Respuesta",val:"Dentro de 24 Horas"},{label:"Negocio",val:"Cafe Con Pan LLC"},{label:"Servicios",val:"Tech · Café · Cultura"}],
      nameLabel:"Tu Nombre", namePlaceholder:"Nombre completo",
      emailLabel:"Correo Electrónico", emailPlaceholder:"Tu correo electrónico",
      inquiryLabel:"Tipo de Consulta", messageLabel:"Mensaje", messagePlaceholder:"¿En qué podemos ayudarte?",
      inquiryPlaceholder:"Selecciona un tipo de consulta...",
      options:["Cliente Actual — Seguimiento","Consulta de Asociación","Prensa y Medios","Café & Eventos — Mantente al Día","Otro"],
      submit:"Enviar →", submitting:"Enviando...",
      success:"¡Mensaje enviado! Estaremos en contacto pronto. ☕",
      error:"Algo salió mal. Inténtalo de nuevo o escríbenos directamente a hello@pancon.cafe.",
    },
    softCta:{ eyebrow:"¿No Sabes Por Dónde Empezar?", body:"Sin presión, sin discurso. Solo una conversación sobre dónde está tu negocio y qué podría ayudar.", btn:"Hablemos →", emailEyebrow:"¿Todavía No Estás Listo?", emailBody:"Síguenos y te contactaremos cuando sea el momento." },
    footer:{ tagline:"Tech · Café · Cultura", copy:"© 2026 Cafe Con Pan LLC", disclaimer:"Ofrecemos orientación y apoyo operativo — no asesoría legal, fiscal ni financiera. Para esas necesidades, recomendamos trabajar con un profesional licenciado." },
    pay:{ eyebrow:"Paga tu Factura", title:"Rápido y", titleSpan:"Seguro", body:"Ingresa el número de factura y el monto en la siguiente página. El pago se procesa de forma segura a través de Helcim.", cta:"Pagar Ahora →", questions:"¿Preguntas? Escríbenos a" },
    privacy:{ footerLink:"Política de Privacidad" },
    techServices:{
      eyebrow:"Servicios Tech",
      heroTitle:"Construido Alrededor de", heroTitleSpan:"Tu Negocio",
      heroSub:"No vendemos paquetes de un menú. Primero evaluamos tu negocio, luego construimos un plan específico para lo que realmente necesitas.",
      heroQuote:"Todo compromiso comienza con La Auditoría. Sin sorpresas, sin cargos ocultos — tu Resumen de Inversión Total se firma antes de que comience cualquier trabajo.",
      auditEyebrow:"Paso Uno", auditTitle:"La", auditTitleSpan:"Auditoría",
      auditSub:"Antes de construir nada, evaluamos todo. Una revisión tecnológica completa de tu negocio — calificada, priorizada y convertida en una hoja de ruta clara que conservas para siempre.",
      auditRemote:"Remota", auditOnsite:"En Persona",
      auditFeatures:["Evaluación completa en 6 categorías tecnológicas","Puntuación general + calificación por categoría","Hallazgos priorizados con clasificaciones de severidad","Hoja de ruta personalizada dividida por fase","Oportunidades específicas para tu industria","Crédito de 30 días hacia tu proyecto"],
      auditCta:"Comenzar con una Auditoría →",
      foundationEyebrow:"La Base", foundationTitle:"Foundation Core", foundationStartingAt:"Desde",
      foundationSub:"La infraestructura sobre la que todo lo demás funciona. Cada cliente con el que trabajamos tiene esto construido primero — es la base que tu negocio necesita antes de que cualquier otra capa tecnológica tenga sentido.",
      foundationItems:[
        { title:"Correo y Dominio Empresarial", desc:"Un correo profesional en tu propio dominio, correctamente configurado y protegido." },
        { title:"Apple Business Manager",       desc:"La plataforma empresarial unificada de Apple — la columna vertebral de todo lo relacionado con Apple en tu empresa." },
        { title:"Inscripción MDM",              desc:"Tu primer dispositivo correctamente inscrito y gestionado. El punto de partida para toda tu flota." },
        { title:"Apple Brands — Capa Completa", desc:"Tu presencia de marca completa en el ecosistema de Apple — Correo con Marca, Verificar con Apple Wallet, branding de Tap to Pay y Perfil de Negocio en Apple Maps. Incluido en cada proyecto Foundation." },
      ],
      modulesEyebrow:"Módulos Adicionales", modulesTitle:"Lo Que", modulesTitleSpan:"Construimos",
      modulesSub:"Tu auditoría nos dice cuáles aplican. Cada módulo se define, cotiza y programa antes de que comience cualquier trabajo.",
      modulesNote:"El precio de los módulos se determina después de tu auditoría y se incluye en tu Resumen de Inversión Total.",
      modules:[
        { group:"Dispositivos", items:[
          { id:"C1", name:"Configuración Zero-Touch",             desc:"Los nuevos dispositivos llegan preconfigurados y listos para usar. Tu personal los enciende, inicia sesión y comienza a trabajar — sin necesidad de un departamento de TI." },
          { id:"C2", name:"Inscripción de Dispositivos Existentes", desc:"¿Ya tienes dispositivos en uso? Los inscribimos en tu sistema de gestión para que estén correctamente protegidos, actualizados y bajo tu control." },
        ]},
        { group:"Conectividad", items:[
          { id:"D1", name:"Auditoría de Carrier",               desc:"Analizamos tus planes actuales de carrier, identificamos lo que estás pagando de más y recomendamos la configuración adecuada para el tamaño y ubicación de tu equipo." },
          { id:"D2", name:"Implementación de Carrier",          desc:"Gestionamos los cambios de carrier — nuevas líneas, cambios de plan, portabilidad de número — para que no tengas que navegar las telecomunicaciones solo." },
          { id:"E",  name:"Internet Empresarial",               desc:"Buscamos y configuramos el ISP adecuado para tu ubicación comercial, desde la coordinación de instalación hasta la configuración de red." },
        ]},
        { group:"Marca y Comunicación", items:[
          { id:"G", name:"Capa Apple Brands",         desc:"Incluido con Foundation Core. Disponible como servicio independiente para empresas que ya tienen su infraestructura Apple pero aún no han construido su capa de marca." },
          { id:"H", name:"Sistema Telefónico IA",     desc:"Una experiencia telefónica profesional construida en Twilio — enrutamiento inteligente de llamadas, saludos automatizados y manejo personalizado para tu equipo y horarios." },
          { id:"J", name:"Apple Business Messages",   desc:"Un canal de mensajería oficial en dispositivos Apple. Los clientes te contactan directamente desde Maps, Search y Safari — desde su iPhone." },
        ]},
        { group:"Web", items:[
          { id:"F", name:"Sitio Web Empresarial", desc:"Un sitio web limpio y profesional diseñado y lanzado para tu negocio. Construido para la visibilidad y para representarte bien." },
        ]},
      ],
      partnerEyebrow:"Después de la Construcción", partnerTitle:"Asociación", partnerTitleSpan:"Continua",
      partnerSub:"No desaparecemos después de la configuración. Ambos planes mantienen tu negocio funcionando, tu tecnología al día y a Jason disponible.",
      partnerPlan1Name:"Apple Operations", partnerPlan1Desc:"Gestión continua de dispositivos, actualizaciones de seguridad, implementación de apps y soporte para tu flota Apple. Por dispositivo — escala a medida que crece tu equipo.",
      partnerPlan2Name:"Partner Access",   partnerPlan2Desc:"Acceso directo a Jason y a toda la red CCP — gestión de carrier, relaciones con proveedores, soporte prioritario y un contacto de confianza para todo lo relacionado con tecnología.",
      partnerStartingAt:"Desde",
      ctaEyebrow:"¿Listo?", ctaTitle:"Comienza con", ctaTitleSpan:"La Auditoría",
      ctaSub:"Completa un formulario rápido y nos comunicaremos en 24 horas para programar tu llamada inicial.",
      ctaDisclaimer:"Sin sorpresas, sin cargos ocultos — tu Resumen de Inversión Total se firma antes de que comience cualquier trabajo.",
      ctaBtn:"Comenzar →",
      credsEyebrow:"Credenciales y Estructura", credsTitle:"Construido para", credsTitleSpan:"Respaldarlo",
      credsSub:"Certificaciones, estructura legal y programas de socios en marcha antes de salir al mercado — porque la credibilidad se construye antes del primer cliente, no después.",
      credsBadges:[
        {label:"Certificaciones MDM",val:"Jamf · Mosyle · Hands-On"},
        {label:"Asociación Apple",val:"ACN — Aplicado"},
        {label:"Enfoque Carrier",val:"100% Independiente"},
        {label:"Estado del Negocio",val:"LLC · EIN"},
        {label:"Adquisición",val:"Exención Revendedor"},
        {label:"Contratación Gov",val:"SAM · CAGE Registrado"},
      ],
      credsCta:"Solicitar una Consulta →",
    },
    discovery:{
      eyebrow:"Comenzar", title:"Cuéntanos Sobre", titleSpan:"Tu Negocio",
      sub:"Completa esto y nos comunicaremos en menos de 24 horas. Revisaremos tu configuración, encontraremos las brechas y trazaremos un plan tech claro — empezando con una llamada introductoria.",
      steps:["Llamada inicial","Auditoría tech","Tu plan de acción"],
      nameLabel:"Tu nombre", namePlaceholder:"Nombre y apellido",
      emailLabel:"Tu correo", emailPlaceholder:"Tu correo electrónico",
      phoneLabel:"Número de teléfono", phonePlaceholder:"El mejor número para contactarte",
      bestTimeLabel:"Mejor hora para contactarte",
      bestTimeOptions:["Mañana","Tarde","Noche"],
      q1Label:"Nombre del negocio y qué haces", q1Placeholder:"Cuéntanos el nombre de tu negocio y describe lo que haces día a día.",
      devicesOptions:["iPhone","iPad","Mac","Windows PC","Android","No sé/Mixto"],
      q2Label:"Dispositivos que usa tu equipo",
      servicesLabel:"¿En qué área necesitas ayuda?",
      servicesNotSure:"Aún no lo sé",
      q3Label:"Tu mayor frustración tecnológica", q3Placeholder:"¿Cuál es el problema tecnológico más frustrante en tu negocio ahora mismo?",
      q4Label:"Lo que desearías que tu negocio pudiera hacer", q4Placeholder:"¿Qué te gustaría que tu negocio pudiera hacer hoy que todavía no puede?",
      q5Label:"Plazo o fecha límite", q5Placeholder:"¿Alguna fecha específica o urgencia que debamos saber? (opcional)",
      calendlyLink:"O salta directo y elige un horario →",
      submit:"Enviar →", sending:"Enviando…",
      trustNote:"Sin presión. Nos comunicamos en menos de 24 horas para confirmar tu llamada introductoria.",
      successTitle:"Ya estás dentro. ☕", successBody:"Recibimos tu información y nos comunicaremos en menos de 24 horas para agendar tu llamada introductoria — el primer paso hacia tu plan tech.", backToHome:"Volver al Inicio →",
    },
    resources:{
      eyebrow:"Herramientas y Recursos", title:"El Stack", titleSpan:"En Que Confiamos",
      sub:"Cada herramienta en esta página es algo que he usado personalmente, recomiendo a clientes, o en lo que confío lo suficiente como para poner mi nombre. Sin relleno, sin afiliados al azar.",
      comingSoon:"Más próximamente.",
      disclaimer:"Algunos de estos enlaces son de referido o afiliados. Si te registras a través de ellos, es posible que gane un pequeño crédito o comisión — sin costo adicional para ti. Solo recomiendo cosas que le diría a un amigo que use.",
      categories:{ productivity:"Productividad y Comunicación", infrastructure:"Infraestructura Empresarial", devices:"Dispositivos y Tecnología", carriers:"Operadoras y Conectividad" },
      badges:{ iUseThis:"Lo uso yo", clientExclusive:"Exclusivo para clientes", iSetThisUp:"Yo lo configuro", trustedReferral:"Referido de confianza", trustedPartner:"Socio de confianza" },
      btn:{ getStarted:"Comenzar →", learnMore:"Más Info →", getAccess:"Solicitar Acceso →", contactMe:"Contáctame →", letsTalk:"Hablemos →" },
    },
  },
};

const getBrowserLang = () => {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("es") ? "es" : "en";
};

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Nunito',sans-serif;background:${C.cream};overflow-x:hidden}
  input,select,textarea{font-size:16px}

  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
  @keyframes pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-36px)}to{opacity:1;transform:translateX(0)}}
  @keyframes btnPulse{0%,100%{border-color:${C.espresso}}50%{border-color:${C.gold}}}
  .fade-up{animation:fadeUp 0.6s ease forwards}
  .pop{animation:pop 0.5s ease forwards}
  .page{animation:pageIn 0.25s ease forwards}

  .grain{position:fixed;inset:0;pointer-events:none;z-index:200;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity:0.5}

  :root{--safe-top:env(safe-area-inset-top,0px);--nav-h:calc(64px + var(--safe-top))}
  nav{position:fixed;top:0;left:0;right:0;z-index:100;
    background:${C.espresso};
    display:flex;align-items:center;justify-content:space-between;
    padding:var(--safe-top) 40px 0;height:var(--nav-h);
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
  .nav-cta-btn{background:${C.red};color:${C.cream};cursor:pointer;
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
    padding:calc(80px + var(--safe-top)) 40px 140px;position:relative;overflow:hidden;text-align:center}
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
  .hero-cta{background:${C.red};color:${C.cream};
    border:3px solid ${C.espresso};
    font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;
    letter-spacing:0.1em;text-transform:uppercase;
    padding:16px 40px;cursor:pointer;
    box-shadow:4px 4px 0 ${C.espresso};
    transition:transform 0.1s,box-shadow 0.1s}
  .hero-cta:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 ${C.espresso}}
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

  .service-card{background:${C.cream};
    border:3px solid ${C.espresso};
    padding:36px;
    box-shadow:5px 5px 0 ${C.espresso};
    transition:transform 0.15s,box-shadow 0.15s,background 0.15s,border-color 0.15s;cursor:default}
  .service-card:hover{transform:translate(-2px,-2px);background:${C.parchment};border-color:${C.espresso};box-shadow:7px 7px 0 ${C.espresso}}
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
    align-items:start;max-width:1000px;margin:0 auto}
  .about-visual{position:sticky;top:100px;align-self:start}
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
    display:flex;flex-direction:column;align-items:center;
    text-align:center;gap:24px}
  .footer-logo{font-family:'Pacifico',cursive;font-size:22px;color:${C.cream}}
  .footer-logo span{color:${C.blush}}
  .footer-tagline{font-size:12px;letter-spacing:0.15em;text-transform:uppercase;
    color:${C.teal};font-weight:700}
  .footer-copy{font-size:12px;color:rgba(245,237,214,0.4);font-weight:600}
  .no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}
  .no-scrollbar::-webkit-scrollbar{display:none}
  .resource-row{display:flex;flex-direction:row;overflow-x:auto;padding:8px 8px 16px;scroll-snap-type:x mandatory;gap:24px}
  .resource-card{flex:0 0 300px;width:300px;scroll-snap-align:start}
  @media(min-width:768px){
    .resource-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));overflow-x:visible;padding:8px;scroll-snap-type:unset}
    .resource-card{flex:unset;width:auto}
  }


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

  .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:600px){.form-grid-2{grid-template-columns:1fr}}

  @keyframes brewFill{from{width:0}to{width:100%}}
  @keyframes brewPulse{0%,100%{opacity:0.25}50%{opacity:1}}
  .brew-bar{animation:brewFill 2s cubic-bezier(0.4,0,0.6,1) forwards}
  .brew-dots{animation:brewPulse 0.8s ease-in-out infinite}

  @keyframes socialFlash{0%,100%{opacity:0.6;color:#F5EDD6}40%{opacity:1;color:#F2B0AC}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
  .scroll-indicator{animation:bounce 1.5s ease-in-out infinite}
  .scroll-btn{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:3;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0}
  .scroll-btn-mobile{display:none;background:none;border:none;cursor:pointer;flex-direction:column;align-items:center;gap:4px;padding:0;margin:20px auto 0}

  @media(max-width:768px){
    nav{padding:var(--safe-top) 20px 0}
    .nav-links{display:none}
    .nav-links.open{display:flex;flex-direction:column;position:fixed;top:var(--nav-h);left:0;right:0;background:${C.espresso};padding:16px 20px 24px;gap:2px;z-index:99;border-bottom:3px solid ${C.beige}}
    .nav-btn{width:100%;text-align:left;padding:12px 10px;font-size:14px}
    .nav-cta-btn{width:100%;text-align:center;margin-top:12px;padding:14px 20px}
    .lang-btn{margin-top:8px;width:100%;text-align:center}
    .nav-hamburger{display:flex}
    .hero{padding:calc(100px + var(--safe-top)) 24px 80px;min-height:100vh}
    .scroll-btn{display:none}
    .scroll-btn-mobile{display:flex}
    .section{padding:56px 24px}
    .about-grid{grid-template-columns:1fr;gap:36px}
    .about-visual{position:static}
    .contact-grid{grid-template-columns:1fr;gap:36px}
    .grid-3,.grid-2{grid-template-columns:1fr}
    .grid-2>*:last-child:nth-child(odd){max-width:100%;grid-column:auto}
    .creds-row{gap:12px}
    footer{flex-direction:column;text-align:center;padding:40px 24px;gap:16px}
    .email-row{flex-direction:column}
    .email-input,.email-btn{width:100%;box-sizing:border-box}
    .email-btn{padding:14px 20px;text-align:center}
  }
  .teams-store-row{display:grid;grid-template-columns:1.2fr 1.6fr 1.2fr;gap:12px;align-items:center}
  @media(max-width:640px){
    .teams-store-row{display:flex;flex-direction:column;gap:4px;align-items:center;text-align:center}
  }
`;

const navKeys = ["Home","Tech Services","Our Story","Contact"];

const PAGE_HASH = {
  "Home":"home","Tech Services":"tech-services",
  "Our Story":"our-story","Contact":"contact","La Mesa":"la-mesa","Pay":"pay",
  "La Mesa Referral":"la-mesa-referral",
  "Privacy Policy":"privacy-policy",
  "The Grind":"the-grind",
  "The Pour":"quote-builder",
  "The Cupping":"audit-builder",
  "Apple Teams":"apple-teams",
  "Discovery":"discovery",
  "Resources":"resources",
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
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:17,fontWeight:800,fontStyle:"italic",color:C.espresso,lineHeight:1.6,marginBottom:32}}>"{t.painPoints.bridge}"</p>
        <button className="hero-cta" onClick={() => go("Discovery")}>{t.painPoints.cta}</button>
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
          <p style={{fontSize:15,color:C.espresso,opacity:0.7,fontStyle:"italic",fontFamily:"'Nunito',sans-serif",margin:"12px auto 24px",lineHeight:1.7,maxWidth:520}}>{t.hero.origin}</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginTop:32,marginBottom:16}}>
            <button className="hero-cta" onClick={() => go("Discovery")}>{t.hero.cta}</button>
            <button onClick={() => go("Tech Services")} style={{
              background:"transparent",color:C.espresso,
              border:`3px solid ${C.espresso}`,
              fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:800,
              letterSpacing:"0.1em",textTransform:"uppercase",
              padding:"16px 40px",cursor:"pointer",
              boxShadow:`4px 4px 0 ${C.espresso}`,
              transition:"transform 0.1s,box-shadow 0.1s"
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow=`2px 2px 0 ${C.espresso}`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`4px 4px 0 ${C.espresso}`;}}
            >{t.hero.ctaSecondary}</button>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {t.hero.steps.map((s, i) => (
              <span key={s} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:C.espresso,opacity:0.55,fontFamily:"'Nunito',sans-serif",fontWeight:700,letterSpacing:"0.05em"}}>{s}</span>
                {i < t.hero.steps.length - 1 && <span style={{fontSize:11,color:C.espresso,opacity:0.3}}>→</span>}
              </span>
            ))}
          </div>
          <button onClick={() => { const el = document.getElementById("story"); if (el) window.scrollTo({top: el.offsetTop - 64, behavior:"smooth"}); }} className="scroll-btn-mobile">
            <div style={{fontSize:13,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,color:C.espresso,opacity:0.4}}>{t.hero.scroll}</div>
            <div className="scroll-indicator" style={{fontSize:20,color:C.espresso,opacity:0.4,lineHeight:1}}>↓</div>
          </button>
        </div>
        <button onClick={() => { const el = document.getElementById("story"); if (el) window.scrollTo({top: el.offsetTop - 64, behavior:"smooth"}); }} className="scroll-btn">
          <div style={{fontSize:13,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,color:C.espresso,opacity:0.4}}>{t.hero.scroll}</div>
          <div className="scroll-indicator" style={{fontSize:20,color:C.espresso,opacity:0.4,lineHeight:1}}>↓</div>
        </button>
      </section>

      <div id="story"><TextileBorder /></div>

      <PainPointsSection go={go} t={t} />

      <TextileBorder flip />

      {lang === "es" && <ParaTiSection t={t} />}

      <section className="section">
        <div className="section-header">
          <div className="section-eyebrow">{t.story.eyebrow}</div>
          <h2 className="section-title">{t.story.title} <span>{t.story.titleSpan}</span></h2>
        </div>
        <p className="section-sub" style={{maxWidth:640,margin:"0 auto",textAlign:"center"}}>{t.story.body}</p>
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={() => go("Our Story")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,color:C.teal,textDecoration:"underline",padding:0}}>
            {t.story.storyCta}
          </button>
        </div>
      </section>

      <TextileBorder flip />

      <section id="pillars" className="section section-dark">
        <div className="section-header">
          <div className="section-eyebrow" style={{color:C.teal}}>{t.pillars.eyebrow}</div>
          <h2 className="section-title section-title-light">{t.pillars.title} <span>{t.pillars.titleSpan}</span></h2>
        </div>
        <div className="grid-3">
          {t.pillars.cards.map(p => (
            <div key={p.n} onClick={() => go(p.page)} style={{
              background:"rgba(255,255,255,0.05)", border:`2px solid ${C.beige}33`,
              padding:32,
              cursor:"pointer", transition:"opacity 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity=0.85}
            onMouseLeave={e => e.currentTarget.style.opacity=1}>
              <div style={{fontSize:36,marginBottom:12}}>{p.icon}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:22,color:C.cream,marginBottom:8}}>{p.title}</div>
              <span style={{display:"inline-block",background:p.n==="01"?C.teal:p.n==="02"?C.red:C.gold,color:C.cream,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",padding:"4px 10px",marginBottom:12}}>{p.badge}</span>
              <p style={{fontSize:14,lineHeight:1.8,color:"rgba(245,237,214,0.65)",fontWeight:600,marginBottom:16}}>{p.desc}</p>
              <span style={{
                display:"inline-block",
                background:"transparent",
                color:C.cream,
                border:`2px solid ${C.beige}55`,
                fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                padding:"5px 12px"
              }}>{p.cta}</span>
            </div>
          ))}
        </div>
      </section>

      <TextileBorder flip />

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


function AboutPage({ t, go }) {
  return (
    <>
      <section className="section" style={{paddingTop:"calc(100px + env(safe-area-inset-top, 0px))"}}>
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
              {t.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div style={{marginTop:32}}>
              <button className="hero-cta" onClick={() => go("Discovery")}>{t.about.storyCta}</button>
            </div>
          </div>
        </div>
      </section>
      <TextileBorder />
    </>
  );
}

function ContactPage({ t, go, scrollToSocials, setGameActive }) {
  const [form, setForm] = useState({name:"",email:"",inquiry:"",message:""});
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
        setForm({name:"",email:"",inquiry:"",message:""});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="section" style={{paddingTop:"calc(100px + env(safe-area-inset-top, 0px))"}}>
      <div className="section-header">
        <div className="section-eyebrow">{t.contact.eyebrow}</div>
        <h2 className="section-title">{t.contact.title && `${t.contact.title} `}<span>{t.contact.titleSpan}</span></h2>
        <p className="section-sub">{t.contact.sub}</p>
      </div>

      <div style={{maxWidth:640,margin:"0 auto 40px",padding:"0 24px"}}>
        <div style={{background:C.espresso,border:`2px solid ${C.teal}33`,borderRadius:4,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:4}}>{t.contact.newClientEyebrow}</div>
            <div style={{fontSize:14,color:C.cream,fontWeight:600,lineHeight:1.5}}>{t.contact.newClientBody}</div>
          </div>
          <button onClick={() => go("Discovery")} style={{background:C.teal,border:"none",borderRadius:4,color:C.espresso,padding:"11px 20px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.05em",whiteSpace:"nowrap",flexShrink:0}}>
            {t.contact.intakeCta}
          </button>
        </div>
      </div>

      <div className="contact-grid">
        <div>
          {t.contact.info.map(i => (
            <div key={i.label} className="contact-info-item">
              <div className="contact-info-label">{i.label}</div>
              <div className="contact-info-val">{i.val}{i.val2 && <div style={{opacity:0.7,fontSize:"0.9em",marginTop:2}}>{i.val2}</div>}</div>
            </div>
          ))}
          <div className="contact-info-item" onClick={scrollToSocials} style={{cursor:"pointer"}}>
            <div className="contact-info-label">{t.socials.followLabel}</div>
            <div className="contact-info-val" style={{textDecoration:"underline",textUnderlineOffset:3}}>{t.socials.contactNote}</div>
          </div>
          <div style={{marginTop:32}}>
            <div style={{cursor:"pointer",display:"inline-block",opacity:0.85,transition:"opacity 0.2s"}}
              onClick={() => setGameActive(true)}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0.85}
              title="☕"
            >
              <SteamSVG />
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
            <select className="form-select" name="inquiry" value={form.inquiry} onChange={handle} required>
              <option value="" disabled>{t.contact.inquiryPlaceholder}</option>
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
      <section className="section section-alt" style={{paddingTop:"calc(100px + env(safe-area-inset-top, 0px))",position:"relative",overflow:"hidden"}}>
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

const AUTH_KEY = 'ccp_google_auth';

function GoogleAuthGate({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.exp && Date.now() < parsed.exp) return parsed;
      }
    } catch {}
    return null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) requestAnimationFrame(() => window.scrollTo(0, 0));
  }, [user]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json();
        if (info.hd !== 'pancon.cafe') {
          setError('Access restricted to @pancon.cafe accounts.');
          setLoading(false);
          return;
        }
        const session = { email: info.email, name: info.name, exp: Date.now() + 24 * 60 * 60 * 1000 };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        setUser(session);
      } catch {
        setError('Sign-in failed. Please try again.');
        setLoading(false);
      }
    },
    onError: () => { setError('Sign-in failed. Please try again.'); setLoading(false); },
  });

  if (user) return children;

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.espresso}}>
      <div style={{background:"rgba(255,255,255,0.05)",border:`2px solid ${C.gold}`,padding:"48px 40px",minWidth:300,textAlign:"center"}}>
        <div style={{fontFamily:"'Pacifico',cursive",fontSize:22,color:C.cream,marginBottom:4}}>Café Con <span style={{color:C.blush}}>Pan</span></div>
        <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.gold,fontWeight:700,marginBottom:28}}>Admin Access</div>
        {error && <div style={{fontSize:12,color:C.red,marginBottom:16,letterSpacing:"0.05em"}}>{error}</div>}
        <button
          onClick={() => { setError(null); login(); }}
          disabled={loading}
          style={{display:"flex",alignItems:"center",gap:10,background:"#fff",color:"#3c4043",border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:600,fontSize:14,padding:"12px 20px",borderRadius:4,margin:"0 auto",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",opacity:loading ? 0.6 : 1}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        <div style={{marginTop:16,fontSize:11,color:C.beige,opacity:0.5,letterSpacing:"0.08em"}}>@pancon.cafe accounts only</div>
      </div>
    </div>
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
        background:C.espresso,paddingTop:"calc(100px + env(safe-area-inset-top, 0px))",paddingBottom:72,
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
      <section style={{background:C.espresso,paddingTop:"calc(100px + env(safe-area-inset-top, 0px))",paddingBottom:56,paddingLeft:40,paddingRight:40,textAlign:"center",position:"relative",overflow:"hidden"}}>
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

function PrivacyPolicyPage({ lang }) {
  const sLabel = {fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:10};
  const sTitle = {fontFamily:"'Lilita One',cursive",fontSize:"clamp(20px,3vw,28px)",color:C.espresso,marginBottom:16,lineHeight:1.2};
  const body = {fontSize:15,lineHeight:1.9,color:"#4a3728",fontWeight:600,marginBottom:16};
  const hr = {borderTop:`2px solid ${C.espresso}`,opacity:0.12,marginBottom:52};

  return (
    <>
      <section style={{background:C.espresso,paddingTop:"calc(100px + env(safe-area-inset-top, 0px))",paddingBottom:56,paddingLeft:40,paddingRight:40,textAlign:"center",position:"relative",overflow:"hidden"}}>
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

      {lang === "es" && (
        <div style={{background:C.blush,padding:"16px 24px",textAlign:"center"}}>
          <p style={{fontSize:14,color:C.espresso,fontWeight:700,margin:0,lineHeight:1.6}}>
            Esta política solo está disponible en inglés. Para preguntas, escríbenos a{" "}
            <a href="mailto:hello@pancon.cafe" style={{color:C.espresso,textDecoration:"underline"}}>hello@pancon.cafe</a>.
          </p>
        </div>
      )}

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


function DiscoveryPage({ go, t, prefillRef }) {
  const d = t.discovery;
  const DEVICES = d.devicesOptions;
  const PACKAGES = ["Foundation Core","Device Setup & MDM","Carrier & Internet","Branding & Communication","Business Website","Ongoing Operations"];
  const blank = {name:"",email:"",phone:"",bestTime:"",bizDesc:"",devices:[],services:[],frustration:"",wishList:"",timeline:""};
  const [form, setForm] = useState(() => {
    const pf = prefillRef?.current || null;
    if (prefillRef) prefillRef.current = null;
    return { ...blank, services: pf?.serviceIdxs?.map(i => PACKAGES[i]).filter(Boolean) || [] };
  });
  const [status, setStatus] = useState("idle");

  const toggle = val => setForm(f => ({...f, devices: f.devices.includes(val) ? f.devices.filter(x=>x!==val) : [...f.devices,val]}));

  const submit = async e => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          access_key:"bb35de9c-0515-4e74-9f2f-202d6fd033b8",
          subject:"Pre-Call Questionnaire — " + (form.name||"New Submission"),
          name:form.name,
          email:form.email,
          replyto:form.email,
          message:`PHONE: ${form.phone||"Not provided"}\nBEST TIME: ${form.bestTime||"Not specified"}\n\nBUSINESS: ${form.bizDesc}\n\nDEVICES: ${form.devices.join(", ")||"Not specified"}\n\nINTERESTED IN: ${form.services.map(s=>s==="not-sure"?"Not sure yet":s).join(", ")||"Not specified"}\n\nFRUSTRATION: ${form.frustration}\n\nWISH LIST: ${form.wishList}\n\nTIMELINE: ${form.timeline||"Not specified"}`,
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch { setStatus("error"); }
  };

  const fld = {display:"block",width:"100%",padding:"12px 14px",fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:600,color:C.espresso,background:C.cream,border:`2px solid ${C.espresso}22`,borderRadius:0,outline:"none",boxSizing:"border-box",marginTop:6};
  const lbl = {fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:C.espresso,opacity:0.6,display:"block",marginBottom:2};
  const chip = active => ({display:"inline-block",padding:"6px 14px",border:`2px solid ${active?C.teal:C.espresso}`,background:active?C.teal:"transparent",color:active?C.cream:C.espresso,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",transition:"all 0.15s"});

  return (
    <>
      <section style={{background:C.espresso,paddingTop:"calc(100px + env(safe-area-inset-top, 0px))",paddingBottom:56,paddingLeft:"clamp(24px,5vw,40px)",paddingRight:"clamp(24px,5vw,40px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.06,pointerEvents:"none"}}><Sunburst size={600} color={C.gold} opacity={0.8} /></div>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:16}}>{d.eyebrow}</div>
          <h1 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(40px,7vw,72px)",color:C.cream,lineHeight:1.1,marginBottom:16}}>{d.title} <span style={{color:C.gold}}>{d.titleSpan}</span></h1>
          <p style={{fontSize:15,color:`rgba(245,237,214,0.6)`,fontWeight:600,maxWidth:480,margin:"0 auto 28px"}}>{d.sub}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
            {d.steps.map((step,i) => (
              <span key={step} style={{display:"inline-flex",alignItems:"center",gap:8}}>
                {i > 0 && <span style={{fontSize:12,color:`rgba(245,237,214,0.3)`}}>→</span>}
                <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:`rgba(245,237,214,0.55)`}}>{step}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <TextileBorder flip />

      <section className="section" style={{background:C.parchment}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          {status === "success" ? (
            <div style={{textAlign:"center",padding:"48px 24px"}}>
              <h2 style={{fontFamily:"'Lilita One',cursive",fontSize:48,color:C.espresso,marginBottom:16}}>{d.successTitle}</h2>
              <p style={{fontSize:15,color:"#555",fontWeight:600,lineHeight:1.7,maxWidth:400,margin:"0 auto 32px"}}>{d.successBody}</p>
              <button onClick={() => go("Home")} style={{background:"none",border:"none",color:C.teal,fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}}>{d.backToHome}</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{display:"flex",flexDirection:"column",gap:24}}>

                <div className="form-grid-2">
                  <div>
                    <label style={lbl}>{d.nameLabel} *</label>
                    <input style={fld} required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder={d.namePlaceholder} />
                  </div>
                  <div>
                    <label style={lbl}>{d.phoneLabel} *</label>
                    <input style={fld} required type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder={d.phonePlaceholder} />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label style={lbl}>{d.emailLabel} *</label>
                    <input style={fld} required type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder={d.emailPlaceholder} />
                  </div>
                  <div>
                    <label style={lbl}>{d.bestTimeLabel}</label>
                    <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:8}}>
                      {d.bestTimeOptions.map(opt=>(
                        <button type="button" key={opt} style={chip(form.bestTime===opt)} onClick={()=>setForm(f=>({...f,bestTime:f.bestTime===opt?"":opt}))}>{opt}</button>
                      ))}
                    </div>
                    <a href="https://calendly.com/jason-pancon/30min" target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:10,fontSize:13,color:C.teal,textDecoration:"underline",textUnderlineOffset:3,fontFamily:"'Nunito',sans-serif",fontWeight:700,cursor:"pointer"}}>{d.calendlyLink}</a>
                  </div>
                </div>

                <div>
                  <label style={lbl}>{d.q1Label} *</label>
                  <textarea style={{...fld,minHeight:90,resize:"vertical"}} required value={form.bizDesc} onChange={e=>setForm(f=>({...f,bizDesc:e.target.value}))} placeholder={d.q1Placeholder} />
                </div>

                <div>
                  <label style={lbl}>{d.q2Label}</label>
                  <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:8}}>{DEVICES.map(dev=><button type="button" key={dev} style={chip(form.devices.includes(dev))} onClick={()=>toggle(dev)}>{dev}</button>)}</div>
                </div>

                <div>
                  <label style={lbl}>{d.servicesLabel}</label>
                  <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:8}}>
                    {PACKAGES.map(pkg=>(
                      <button type="button" key={pkg} style={chip(form.services.includes(pkg))}
                        onClick={()=>setForm(f=>({...f,services:f.services.includes(pkg)?f.services.filter(x=>x!==pkg):[...f.services,pkg]}))}>
                        {pkg}
                      </button>
                    ))}
                    <button type="button" style={chip(form.services.includes("not-sure"))}
                      onClick={()=>setForm(f=>({...f,services:f.services.includes("not-sure")?f.services.filter(x=>x!=="not-sure"):[...f.services,"not-sure"]}))}>
                      {d.servicesNotSure}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={lbl}>{d.q3Label} *</label>
                  <textarea style={{...fld,minHeight:90,resize:"vertical"}} required value={form.frustration} onChange={e=>setForm(f=>({...f,frustration:e.target.value}))} placeholder={d.q3Placeholder} />
                </div>

                <div>
                  <label style={lbl}>{d.q4Label} *</label>
                  <textarea style={{...fld,minHeight:90,resize:"vertical"}} required value={form.wishList} onChange={e=>setForm(f=>({...f,wishList:e.target.value}))} placeholder={d.q4Placeholder} />
                </div>

                <div>
                  <label style={lbl}>{d.q5Label}</label>
                  <input style={fld} value={form.timeline} onChange={e=>setForm(f=>({...f,timeline:e.target.value}))} placeholder={d.q5Placeholder} />
                </div>

                <div>
                  <p style={{fontSize:13,fontStyle:"italic",textAlign:"center",color:`rgba(61,43,31,0.6)`,marginBottom:16}}>{d.trustNote}</p>
                  <button type="submit" className="hero-cta" style={{alignSelf:"flex-start"}} disabled={status==="submitting"}>
                    {status==="submitting" ? d.sending : d.submit}
                  </button>
                </div>
                {status==="error" && <p style={{fontSize:13,color:C.red,fontWeight:700}}>Something went wrong — please try again or email hello@pancon.cafe.</p>}
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

const RESOURCE_CATEGORIES = [
  { categoryKey:"productivity", cards:[
    { name:"Google Workspace", badgeKey:"iUseThis", badgeColor:C.teal, url:"https://referworkspace.app.goo.gl/kjNC",
      desc:"Business email, Drive, Docs, Meet — the full suite. What I use to run Café Con Pan day to day.",
      descEs:"Suite completa de negocios — correo, Drive, Docs, Meet. Lo que uso para gestionar Café Con Pan día a día." },
    { name:"Calendly", badgeKey:"iUseThis", badgeColor:C.teal, url:"https://calendly.com/signup",
      desc:"How I let clients book discovery calls without the back-and-forth. Set your availability once and let people book directly.",
      descEs:"Así permito que mis clientes agenden llamadas sin tanto ida y vuelta. Configura tu disponibilidad una vez y deja que las personas reserven directamente." },
  ]},
  { categoryKey:"infrastructure", cards:[
    { name:"Apple Business", badgeKey:"iSetThisUp", badgeColor:C.teal, btnLabelKey:"learnMore", url:"https://business.apple.com",
      desc:"Apple's unified business platform — manage your devices, apps, people, and Apple presence all in one place. Formerly known as Apple Business Manager. I help clients get set up and running from day one.",
      descEs:"La plataforma unificada de Apple para negocios — administra dispositivos, apps, personas y tu presencia Apple en un solo lugar. Antes conocida como Apple Business Manager. Ayudo a mis clientes a configurarla desde el primer día." },
    { name:"Chase Business Checking", badgeKey:"iUseThis", badgeColor:C.teal, url:"CHASE_BUSINESS_REFERRAL_LINK",
      desc:"Where Café Con Pan banks. Solid business checking with a large ATM network, easy online banking, and branch access when you need it. One of the first things I recommend setting up when launching a business.",
      descEs:"Donde opera Café Con Pan. Cuenta corriente de negocios sólida con amplia red de cajeros, banca en línea fácil y acceso a sucursales cuando lo necesitas. Una de las primeras cosas que recomiendo al lanzar un negocio." },
    { name:"Cloudflare", badgeKey:"iUseThis", badgeColor:C.teal, url:"CLOUDFLARE_REFERRAL_LINK",
      desc:"Where pancon.cafe lives. Fast, secure, free tier that covers most small businesses. I use it for DNS, hosting, and SSL — all in one place.",
      descEs:"Donde vive pancon.cafe. Rápido, seguro, con una capa gratuita que cubre a la mayoría de los pequeños negocios. Lo uso para DNS, hosting y SSL — todo en un solo lugar." },
    { name:"Helcim", badgeKey:"iUseThis", badgeColor:C.teal, url:"HELCIM_REFERRAL_LINK",
      desc:"The payment processor I recommend for small businesses. No monthly fees, transparent pricing, and they actually treat small businesses like real customers.",
      descEs:"El procesador de pagos que recomiendo para pequeños negocios. Sin cuotas mensuales, precios transparentes y realmente tratan a los pequeños negocios como clientes reales." },
    { name:"Namecheap", badgeKey:"iUseThis", badgeColor:C.teal, url:"NAMECHEAP_REFERRAL_LINK",
      desc:"Where I register domains. Simple, affordable, and straightforward — no dark patterns or surprise upsells at checkout.",
      descEs:"Donde registro dominios. Simple, accesible y directo — sin patrones engañosos ni sorpresas en el checkout." },
  ]},
  { categoryKey:"devices", cards:[
    { name:"Apple Custom Store for Business", badgeKey:"clientExclusive", badgeColor:C.red, btnLabelKey:"getAccess", internal:"Discovery",
      desc:"Access Apple's exclusive business storefront — custom-configured devices, business pricing, and direct procurement. Not publicly available. You need to be set up through Café Con Pan to get access.",
      descEs:"Acceso a la tienda empresarial exclusiva de Apple — dispositivos con configuración personalizada, precios para negocios y adquisición directa. No está disponible al público. Necesitas ser configurado a través de Café Con Pan para obtener acceso." },
    { name:"Jamf", badgeKey:"iUseThis", badgeColor:C.teal, btnLabelKey:"learnMore", url:"JAMF_REFERRAL_LINK",
      desc:"The industry standard for Apple device management at scale. Enterprise-grade MDM trusted by some of the biggest Apple deployments in the world. Full Jamf deployment is included in my Apple Operations package.",
      descEs:"El estándar de la industria para gestión de dispositivos Apple a escala. MDM de nivel empresarial utilizado por algunos de los mayores despliegues Apple del mundo. El despliegue completo de Jamf está incluido en mi paquete Apple Operations." },
    { name:"Mosyle", badgeKey:"iUseThis", badgeColor:C.teal, btnLabelKey:"learnMore", url:"MOSYLE_REFERRAL_LINK",
      desc:"My go-to MDM for Apple device management. Powerful, intuitive, and built specifically for Apple environments. Full Mosyle deployment is included in my Apple Operations package.",
      descEs:"Mi MDM preferido para gestión de dispositivos Apple. Potente, intuitivo y construido específicamente para entornos Apple. El despliegue completo de Mosyle está incluido en mi paquete Apple Operations." },
  ]},
  { categoryKey:"carriers", cards:[
    { name:"AT&T", badgeKey:"iUseThis", badgeColor:C.teal, btnLabelKey:"letsTalk", internal:"Discovery",
      desc:"My personal mobile carrier. Great coverage in the DMV and solid business plan options. Carrier setup and plan optimization is included in my Connectivity Consulting service.",
      descEs:"Mi operadora móvil personal. Gran cobertura en el DMV y sólidas opciones de planes empresariales. La configuración de carrier y optimización de planes está incluida en mi servicio de Consultoría de Conectividad." },
    { name:"Comcast Business", badgeKey:"trustedReferral", badgeColor:C.beige, btnLabelKey:"contactMe", internal:"Discovery",
      desc:"Business internet and connectivity solutions. Interested? Reach out to me directly — I submit the referral on your behalf through my network and make sure you get taken care of.",
      descEs:"Soluciones de internet y conectividad para negocios. ¿Interesado? Contáctame directamente — envío el referido en tu nombre a través de mi red y me aseguro de que te atiendan bien." },
    { name:"T-Mobile", badgeKey:"trustedPartner", badgeColor:C.beige, btnLabelKey:"letsTalk", internal:"Discovery",
      desc:"Competitive business plans with strong value at scale. A solid option depending on your coverage needs and team size. Carrier setup and plan optimization is included in my Connectivity Consulting service.",
      descEs:"Planes empresariales competitivos con gran valor a escala. Una opción sólida según tus necesidades de cobertura y tamaño del equipo. La configuración de carrier y optimización de planes está incluida en mi servicio de Consultoría de Conectividad." },
    { name:"Verizon", badgeKey:"iUseThis", badgeColor:C.teal, btnLabelKey:"letsTalk", internal:"Discovery",
      desc:"My personal mobile and internet provider. Strong coverage, reliable service, and a plan worth auditing if you haven't looked at it recently. Carrier setup and plan optimization is included in my Connectivity Consulting service.",
      descEs:"Mi proveedor personal de móvil e internet. Buena cobertura, servicio confiable y un plan que vale la pena revisar si no lo has visto recientemente. La configuración de carrier y optimización de planes está incluida en mi servicio de Consultoría de Conectividad." },
  ]},
];

function ResourcesPage({ go, t, lang }) {
  const r = t.resources;
  const cardStyle = {
    background: C.cream,
    border: `3px solid ${C.espresso}`,
    boxShadow: `5px 5px 0 ${C.espresso}`,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "transform 0.15s,box-shadow 0.15s,background 0.15s,border-color 0.15s",
    cursor: "default",
  };

  return (
    <>
      <section id="resources" className="section" style={{paddingTop:"calc(100px + env(safe-area-inset-top, 0px))"}}>
        <div className="section-header">
          <div className="section-eyebrow">{r.eyebrow}</div>
          <h2 className="section-title">{r.title} <span>{r.titleSpan}</span></h2>
          <p className="section-sub" style={{maxWidth:640,margin:"12px auto 0",textAlign:"center"}}>{r.sub}</p>
        </div>

        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",gap:56}}>
          {RESOURCE_CATEGORIES.map(cat => (
            <div key={cat.categoryKey}>
              <div style={{fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700,color:C.espresso,borderBottom:`2px solid ${C.espresso}`,paddingBottom:10,marginBottom:24,opacity:0.55}}>
                {r.categories[cat.categoryKey]}
              </div>
              {cat.cards.length === 0 ? (
                <div style={{fontSize:13,color:"#999",fontStyle:"italic",fontWeight:600}}>{r.comingSoon}</div>
              ) : (
                <div className="resource-row no-scrollbar">
                  {[...cat.cards].sort((a,b) => a.name.localeCompare(b.name)).map(card => (
                    <div key={card.name} className="resource-card" style={cardStyle}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.background=C.parchment;e.currentTarget.style.borderColor=card.badgeColor;e.currentTarget.style.boxShadow=`7px 7px 0 ${card.badgeColor}`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.background=C.cream;e.currentTarget.style.borderColor=C.espresso;e.currentTarget.style.boxShadow=`5px 5px 0 ${C.espresso}`;}}
                    >
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                        <div style={{fontFamily:"'Lilita One',cursive",fontSize:20,color:C.espresso,lineHeight:1.2}}>{card.name}</div>
                        {card.badgeKey && (
                          <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#fff",background:card.badgeColor,padding:"3px 8px",whiteSpace:"nowrap",flexShrink:0,marginTop:3}}>
                            {r.badges[card.badgeKey]}
                          </span>
                        )}
                      </div>
                      <p style={{fontSize:14,lineHeight:1.8,color:"#555",fontWeight:600,margin:0}}>{lang === "es" && card.descEs ? card.descEs : card.desc}</p>
                      {card.internal ? (
                        <button onClick={() => go(card.internal)} style={{
                          display:"inline-block",marginTop:"auto",alignSelf:"flex-start",
                          background:C.espresso,color:C.cream,border:"none",cursor:"pointer",
                          fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:12,
                          letterSpacing:"0.1em",textTransform:"uppercase",
                          padding:"10px 20px",textDecoration:"none",
                          boxShadow:`3px 3px 0 ${C.gold}`,
                          transition:"transform 0.1s,box-shadow 0.1s",
                        }}
                          onMouseEnter={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow=`1px 1px 0 ${C.gold}`;}}
                          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`3px 3px 0 ${C.gold}`;}}
                        >{r.btn[card.btnLabelKey || "getStarted"]}</button>
                      ) : (
                        <a href={card.url} target="_blank" rel="noopener noreferrer" style={{
                          display:"inline-block",marginTop:"auto",
                          background:C.espresso,color:C.cream,
                          fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:12,
                          letterSpacing:"0.1em",textTransform:"uppercase",
                          padding:"10px 20px",textDecoration:"none",
                          boxShadow:`3px 3px 0 ${C.gold}`,
                          transition:"transform 0.1s,box-shadow 0.1s",
                          alignSelf:"flex-start",
                        }}
                          onMouseEnter={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow=`1px 1px 0 ${C.gold}`;}}
                          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`3px 3px 0 ${C.gold}`;}}
                        >{r.btn[card.btnLabelKey || "getStarted"]}</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{textAlign:"center",fontSize:12,fontStyle:"italic",color:"rgba(61,43,31,0.45)",fontWeight:600,maxWidth:600,margin:"56px auto 0",lineHeight:1.7}}>{r.disclaimer}</p>
      </section>
      <TextileBorder flip />
    </>
  );
}

const APPLE_STORES = [
  { region:"Remote", stores:[
    {city:"Austin, TX",    name:"Remote Business Team",          email:"mamezquita@apple.com",                        phone:"(917) 443-1103"},
  ]},
  { region:"Delaware", stores:[
    {city:"Newark",        name:"Christiana Mall",               email:"",                                            phone:"(302) 533-3513"},
  ]},
  { region:"Hawaii", stores:[
    {city:"Honolulu",      name:"Ala Moana",                     email:"alamoanabusiness@apple.com",                  phone:"(808) 983-7653"},
    {city:"Honolulu",      name:"Kahala",                        email:"kahalabusiness@apple.com",                    phone:"(808) 738-4403"},
  ]},
  { region:"Maryland", stores:[
    {city:"Annapolis",     name:"Annapolis",                     email:"",                                            phone:"(410) 972-3293"},
    {city:"Bethesda",      name:"Bethesda Row",                  email:"",                                            phone:"(301) 634-0883"},
    {city:"Columbia",      name:"Columbia",                      email:"",                                            phone:"(410) 423-1803"},
    {city:"Bethesda",      name:"Montgomery Mall",               email:"",                                            phone:"(301) 634-9933"},
  ]},
  { region:"North Carolina", stores:[
    {city:"Huntersville",  name:"Birkdale Village",              email:"",                                            phone:"(704) 972-0983"},
    {city:"Charlotte",     name:"SouthPark",                     email:"",                                            phone:"(704) 972-3283"},
    {city:"Durham",        name:"Southpoint",                    email:"",                                            phone:"(919) 474-6943"},
    {city:"Greensboro",    name:"Friendly Center",               email:"",                                            phone:"(336) 291-0483"},
    {city:"Raleigh",       name:"Crabtree Valley Mall",          email:"",                                            phone:"(919) 334-3403"},
  ]},
  { region:"Pennsylvania", stores:[
    {city:"King of Prussia",name:"King of Prussia",              email:"",                                            phone:"(484) 636-5093"},
    {city:"Lancaster",     name:"Park City",                     email:"",                                            phone:"(717) 295-8803"},
    {city:"Whitehall",     name:"Lehigh Valley",                 email:"",                                            phone:"(610) 266-4863"},
    {city:"Philadelphia",  name:"Walnut Street",                 email:"",                                            phone:"(215) 861-6403"},
    {city:"Pittsburgh",    name:"Ross Park",                     email:"",                                            phone:"(412) 318-0653"},
    {city:"Pittsburgh",    name:"Shadyside",                     email:"",                                            phone:"(412) 316-2463"},
    {city:"Pittsburgh",    name:"South Hills Village",           email:"",                                            phone:"(412) 308-1973"},
    {city:"Ardmore",       name:"Suburban Square",               email:"",                                            phone:"(610) 726-9403"},
    {city:"Willow Grove",  name:"Willow Grove Park",             email:"",                                            phone:"(215) 346-8163"},
  ]},
  { region:"South Carolina", stores:[
    {city:"Charleston",    name:"Charleston",                    email:"",                                            phone:"(843) 727-0403"},
    {city:"Greenville",    name:"Haywood Mall",                  email:"",                                            phone:"(864) 987-7583"},
  ]},
  { region:"Virginia", stores:[
    {city:"Arlington",     name:"Clarendon",                     email:"clarendonbusiness@apple.com",                 phone:"(703) 623-7973"},
    {city:"Fairfax",       name:"Fairfax Corner",                email:"fairfaxcornerbusiness@apple.com",             phone:"(703) 251-7403"},
    {city:"Virginia Beach",name:"Lynnhaven Mall",                email:"",                                            phone:"(757) 306-2483"},
    {city:"Arlington",     name:"Pentagon City",                 email:"",                                            phone:"(703) 236-1553"},
    {city:"Reston",        name:"Reston",                        email:"restonbusiness@apple.com",                    phone:"(571) 449-4803"},
    {city:"Richmond",      name:"Short Pump Town Center",        email:"",                                            phone:"(804) 420-3003"},
    {city:"Woodbridge",    name:"Stonebridge Potomac Town Center",email:"stonebridgepotomactowncenterbusiness@apple.com",    phone:"(703) 986-2033"},
    {city:"McLean",        name:"Tysons Corner",                 email:"tysonscornerbusiness@apple.com",              phone:"(703) 336-8453"},
  ]},
  { region:"Washington DC", stores:[
    {city:"Washington",    name:"Carnegie Library",              email:"carnegielibrarybusiness@apple.com",           phone:"(202) 609-6403"},
    {city:"Washington",    name:"Georgetown",                    email:"georgetownbusiness@apple.com",                phone:"(202) 572-1463"},
  ]},
];

function AppleTeamsPage() {
  const dim = "rgba(245,237,214,0.38)";
  return (
    <div style={{minHeight:"100vh",background:C.espresso,padding:"calc(100px + env(safe-area-inset-top, 0px)) clamp(20px,5vw,56px) 80px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:12}}>Internal Reference</div>
          <h1 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(28px,5vw,42px)",color:C.cream,margin:"0 0 14px"}}>Apple Business Teams</h1>
          <a href="https://www.apple.com/retail/" target="_blank" rel="noopener noreferrer"
            style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:C.teal,textDecoration:"none",letterSpacing:"0.06em",fontWeight:700,transition:"color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.color=C.gold}
            onMouseLeave={e=>e.currentTarget.style.color=C.teal}
          >Find the Closest Store ↗</a>
        </div>

        {APPLE_STORES.map(({ region, stores }) => (
          <div key={region} style={{marginBottom:48}}>
            <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,color:C.gold,borderBottom:`1px solid rgba(200,146,42,0.3)`,paddingBottom:10,marginBottom:20}}>
              {region}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {stores.map(({ city, name, email, phone }) => (
                <div key={name} className="teams-store-row" style={{background:"rgba(255,255,255,0.04)",border:`1px solid rgba(212,169,122,0.12)`,padding:"14px 20px"}}>
                  <div>
                    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:C.cream}}>{name}</div>
                    <div style={{fontSize:11,color:dim,marginTop:2}}>{city}</div>
                  </div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontStyle: email ? "normal" : "italic",overflowWrap:"anywhere"}}>
                    {email
                      ? <a href={`mailto:${email}`}
                          style={{color:C.teal,textDecoration:"none",fontWeight:700,transition:"color 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.color=C.gold}
                          onMouseLeave={e=>e.currentTarget.style.color=C.teal}
                        >{email}</a>
                      : <span style={{color:dim}}>—</span>}
                  </div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontStyle: phone ? "normal" : "italic",overflowWrap:"anywhere"}}>
                    {phone
                      ? <a href={`tel:${phone.replace(/\D/g,"")}`}
                          style={{color:C.teal,textDecoration:"none",fontWeight:700,transition:"color 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.color=C.gold}
                          onMouseLeave={e=>e.currentTarget.style.color=C.teal}
                        >{phone}</a>
                      : <span style={{color:dim}}>—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TheGrindPage({ go }) {
  const DEVICES = ["iPhone","iPad","Mac","Windows PC","Android","Unknown/Mixed"];
  const SIZES   = ["Solo","2–5","6–15","15+"];

  const blank = { bizName:"", personName:"", clientEmail:"", clientPhone:"", industry:"", whatTheyDo:"", painPoints:"", teamSize:"", devices:[], extra:"" };
  const [form, setForm]       = useState(blank);
  const [result, setResult]   = useState(null);
  const [brewing, setBrewing] = useState(false);
  const [error, setError]     = useState(null);
  const [isDesktop, setIsDesktop]   = useState(() => window.innerWidth >= 700);
  const [intakePaste, setIntakePaste] = useState('');
  const [parsing, setParsing]         = useState(false);
  const [parseError, setParseError]   = useState(null);
  const [intakeFilled, setIntakeFilled] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = (field, val) => setForm(f => ({
    ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
  }));

  async function brew(e) {
    e.preventDefault();
    setBrewing(true);
    setError(null);

    const prompt = `You are helping Jason Reyes, founder of Cafe Con Pan LLC (Apple-focused tech consultancy for small businesses), prepare for an intro call with a potential client.

CLIENT:
- Business: ${form.bizName}
- Contact: ${form.personName || 'Not provided'}
- Industry: ${form.industry}
- What they do: ${form.whatTheyDo}
- Why they reached out / pain points: ${form.painPoints || 'Not specified'}
- Team size: ${form.teamSize || 'Unknown'}
- Current devices: ${form.devices.length ? form.devices.join(', ') : 'Unknown'}
- Extra context: ${form.extra || 'None'}

CCP SERVICE CATALOG:
${catalogText()}

Respond with ONLY valid JSON — no markdown, no code fences — in this exact shape:
{
  "discoveryQuestions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "lookFor": ["observation 1", "observation 2", "observation 3", "observation 4"],
  "opportunities": [
    { "headline": "short title (5-8 words)", "description": "2-3 sentences specific to this business and industry" }
  ],
  "likelyServices": ["service name 1", "service name 2"],
  "serviceRationale": "2-3 sentences. Honest assessment of fit. If the situation suggests services beyond the obvious, say so."
}

discoveryQuestions: 5-7 smart, specific questions tailored to their industry and situation. Not generic — make them count.
lookFor: 4-6 specific things to observe, probe, or pay attention to during this call or a follow-up audit visit.
opportunities: 3-5 creative, specific ways technology could transform how this type of business operates. Think beyond the obvious. These should make Jason look brilliant on the call.
likelyServices: 2-6 services from the catalog that likely apply. Use the module names (e.g. "Foundation Core", "Module D1", "Recurring Partner Access").
serviceRationale: If the situation suggests a different fit than expected, say so directly.`;

    try {
      const res = await fetch('https://anthropic-proxy.cafe-con-pan-llc.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const raw = data.content[0].text.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
      setResult(JSON.parse(raw));
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setBrewing(false);
    }
  }

  function beginAudit() {
    localStorage.setItem('ccp_grind_handoff', JSON.stringify({
      clientName:  form.bizName,
      contactName: form.personName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
    }));
    window.location.hash = '#audit-builder';
  }

  async function parseIntake() {
    if (!intakePaste.trim()) return;
    setParsing(true);
    setParseError(null);
    // Strip HTML that iOS Mail / Gmail apps inject when copying
    const plain = intakePaste
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ').trim();
    try {
      const res = await fetch('https://anthropic-proxy.cafe-con-pan-llc.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [{ role: 'user', content: `Extract client info from this intake form submission. Respond with ONLY valid JSON, no markdown, no code fences:
{
  "bizName": "business name",
  "personName": "contact or submitter name",
  "clientEmail": "their email address or empty string",
  "clientPhone": "their phone number or empty string",
  "industry": "industry or business type (infer from description if not explicit)",
  "whatTheyDo": "what the business does day to day",
  "painPoints": "combine frustration, wish list, and reason for reaching out into 2-3 sentences",
  "teamSize": "one of exactly: Solo, 2–5, 6–15, 15+",
  "devices": ["array using only values from: iPhone, iPad, Mac, Windows PC, Android, Unknown/Mixed"],
  "extra": "timeline, services selected, referral source, and any other useful context"
}

INTAKE SUBMISSION:
${plain}` }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const raw = data.content[0].text.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '');
      const p = JSON.parse(raw);
      setForm(f => ({
        ...f,
        bizName:     p.bizName     || f.bizName,
        personName:  p.personName  || f.personName,
        clientEmail: p.clientEmail || f.clientEmail,
        clientPhone: p.clientPhone || f.clientPhone,
        industry:    p.industry    || f.industry,
        whatTheyDo:  p.whatTheyDo  || f.whatTheyDo,
        painPoints:  p.painPoints  || f.painPoints,
        teamSize:    SIZES.includes(p.teamSize) ? p.teamSize : f.teamSize,
        devices:     Array.isArray(p.devices) ? p.devices.filter(d => DEVICES.includes(d)) : f.devices,
        extra:       p.extra       || f.extra,
      }));
      setIntakeFilled(true);
      setIntakePaste('');
    } catch (err) {
      setParseError(err.message || "Couldn't parse the intake — try again or fill manually.");
    } finally {
      setParsing(false);
    }
  }

  const fld  = { display:"block", width:"100%", boxSizing:"border-box", background:C.card, border:`1px solid ${C.b0}`, borderRadius:8, padding:"12px 14px", color:C.dkCream, fontSize:16, outline:"none", fontFamily:"'Nunito',sans-serif", marginTop:6 };
  const lbl  = { fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, color:C.muted, display:"block", marginBottom:6 };
  const chip = active => ({ display:"inline-block", padding:"6px 14px", border:`1px solid ${active ? C.teal : C.b1}`, background: active ? C.teal : "transparent", color: active ? C.bg : C.dkCream, fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase", transition:"all 0.15s" });

  // ── Output section card
  const OutSection = ({ label, color, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, color: color || C.teal, marginBottom:12 }}>{label}</div>
      {children}
    </div>
  );

  const GrindForm = () => (
    <form onSubmit={brew}>
      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
        <div>
          <span style={lbl}>Business Name *</span>
          <input style={fld} required value={form.bizName} onChange={e=>setForm(f=>({...f,bizName:e.target.value}))} placeholder="e.g. Maria's Salon LLC" />
        </div>
        <div>
          <span style={lbl}>Contact Name</span>
          <input style={fld} value={form.personName} onChange={e=>setForm(f=>({...f,personName:e.target.value}))} placeholder="e.g. Maria Gonzalez" />
        </div>
        <div>
          <span style={lbl}>Industry *</span>
          <input style={fld} required value={form.industry} onChange={e=>setForm(f=>({...f,industry:e.target.value}))} placeholder="e.g. Restaurant, Dental Office, Barbershop…" />
        </div>
        <div>
          <span style={lbl}>What they do *</span>
          <textarea style={{...fld, minHeight:80, resize:"vertical"}} required value={form.whatTheyDo} onChange={e=>setForm(f=>({...f,whatTheyDo:e.target.value}))} placeholder="Brief description of their business and day-to-day operations…" />
        </div>
        <div>
          <span style={lbl}>Why they reached out / pain points</span>
          <textarea style={{...fld, minHeight:80, resize:"vertical"}} value={form.painPoints} onChange={e=>setForm(f=>({...f,painPoints:e.target.value}))} placeholder="What problems are they facing? What made them reach out?" />
        </div>
        <div>
          <span style={lbl}>Team size</span>
          <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:8 }}>
            {SIZES.map(s => <button type="button" key={s} style={chip(form.teamSize===s)} onClick={()=>setForm(f=>({...f,teamSize:s}))}>{s}</button>)}
          </div>
        </div>
        <div>
          <span style={lbl}>Current devices</span>
          <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:8 }}>
            {DEVICES.map(d => <button type="button" key={d} style={chip(form.devices.includes(d))} onClick={()=>toggle("devices",d)}>{d}</button>)}
          </div>
        </div>
        <div>
          <span style={lbl}>Extra context</span>
          <textarea style={{...fld, minHeight:80, resize:"vertical"}} value={form.extra} onChange={e=>setForm(f=>({...f,extra:e.target.value}))} placeholder="Referral source, budget signals, specific goals, anything else…" />
        </div>
        {error && <div style={{ fontSize:13, color:C.red, fontWeight:700, padding:"10px 14px", background:`${C.red}15`, border:`1px solid ${C.red}44`, borderRadius:6 }}>{error}</div>}
        <button type="submit" disabled={brewing} style={{ alignSelf:"flex-start", background:C.beige, border:"none", borderRadius:9, color:C.bg, padding:"13px 28px", cursor:brewing?"not-allowed":"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.05em", opacity:brewing?0.5:1 }}>
          {brewing ? "Brewing…" : "Brew the Brief →"}
        </button>
      </div>
    </form>
  );

  const GrindResult = () => result ? (
    <div>
      <div style={{ marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.b0}` }}>
        <div style={{ fontFamily:"'Lilita One',cursive", fontSize:isDesktop?22:28, color:C.white, marginBottom:4 }}>{form.bizName}</div>
        {form.personName && <div style={{ fontSize:isDesktop?12:14, color:C.muted, fontWeight:600 }}>{form.personName} · {form.industry}</div>}
      </div>
      <OutSection label="Ask These Questions">
        {result.discoveryQuestions?.map((q, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
            <span style={{ fontSize:isDesktop?10:11, color:C.teal, fontWeight:700, flexShrink:0, marginTop:2 }}>{i+1}.</span>
            <span style={{ fontSize:isDesktop?13:14, color:C.dkCream, lineHeight:1.6, fontWeight:600 }}>{q}</span>
          </div>
        ))}
      </OutSection>
      <OutSection label="What to Look For" color={C.gold}>
        {result.lookFor?.map((item, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
            <span style={{ fontSize:isDesktop?13:14, color:C.gold, flexShrink:0, marginTop:1 }}>→</span>
            <span style={{ fontSize:isDesktop?13:14, color:C.dkCream, lineHeight:1.6, fontWeight:600 }}>{item}</span>
          </div>
        ))}
      </OutSection>
      <OutSection label="Creative Opportunities" color={C.red}>
        {result.opportunities?.map((opp, i) => (
          <div key={i} style={{ borderLeft:`3px solid ${C.red}`, paddingLeft:isDesktop?12:14, marginBottom:isDesktop?12:14 }}>
            <div style={{ fontSize:isDesktop?12:13, fontWeight:800, color:C.dkCream, marginBottom:3 }}>{opp.headline}</div>
            <div style={{ fontSize:isDesktop?12:13, color:C.muted, lineHeight:1.6, fontWeight:600 }}>{opp.description}</div>
          </div>
        ))}
      </OutSection>
      <OutSection label="Services That Likely Apply">
        <div style={{ display:"flex", flexWrap:"wrap", gap:isDesktop?6:8, marginBottom:isDesktop?10:12 }}>
          {result.likelyServices?.map(s => (
            <span key={s} style={{ background:`${C.teal}18`, border:`1px solid ${C.teal}44`, color:C.dkCream, fontFamily:"'Nunito',sans-serif", fontSize:isDesktop?11:12, fontWeight:700, padding:isDesktop?"4px 10px":"5px 12px", borderRadius:4 }}>{s}</span>
          ))}
        </div>
        {result.serviceRationale && (
          <p style={{ fontSize:isDesktop?12:13, color:C.muted, lineHeight:1.7, fontWeight:600, margin:0 }}>{result.serviceRationale}</p>
        )}
      </OutSection>
      <div style={{ borderTop:`1px solid ${C.b0}`, paddingTop:isDesktop?20:24, display:"flex", flexDirection:isDesktop?"column":"row", gap:isDesktop?10:12, flexWrap:"wrap" }}>
        <button onClick={beginAudit} style={{ background:C.teal, border:"none", borderRadius:9, color:C.bg, padding:isDesktop?"12px 20px":"13px 24px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:isDesktop?13:14, letterSpacing:"0.05em" }}>
          Begin Audit for {form.bizName} →
        </button>
        <button onClick={() => { setResult(null); setForm(blank); }} style={{ background:"none", border:`1px solid ${C.b0}`, color:C.muted, borderRadius:9, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:isDesktop?12:13, letterSpacing:"0.08em", textTransform:"uppercase", padding:isDesktop?"10px 20px":"13px 24px" }}>
          New Client
        </button>
      </div>
    </div>
  ) : null;

  const IntakePanel = () => intakeFilled ? (
    <div style={{ marginBottom:24, padding:"10px 14px", background:`${C.teal}15`, border:`1px solid ${C.teal}33`, borderRadius:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:12, color:C.teal, fontWeight:700 }}>Auto-filled from intake ✓</span>
      <button type="button" onClick={() => { setIntakeFilled(false); setIntakePaste(''); }} style={{ background:"none", border:"none", fontSize:11, color:C.muted, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>Clear</button>
    </div>
  ) : (
    <div style={{ marginBottom:24, background:C.card, border:`1px solid ${C.b1}`, borderRadius:8, padding:"16px" }}>
      <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Auto-fill from Intake Email</div>
      <textarea
        value={intakePaste}
        onChange={e => setIntakePaste(e.target.value)}
        placeholder={"Paste the Web3Forms email body here and we'll fill in the fields automatically…"}
        style={{ display:"block", width:"100%", boxSizing:"border-box", background:C.surf, border:`1px solid ${C.b0}`, borderRadius:6, padding:"10px 12px", color:C.dkCream, fontSize:13, outline:"none", fontFamily:"'Nunito',sans-serif", marginTop:4, minHeight:88, resize:"vertical" }}
      />
      {parseError && <div style={{ marginTop:6, fontSize:12, color:C.red, fontWeight:700 }}>{parseError}</div>}
      <button
        type="button"
        onClick={parseIntake}
        disabled={!intakePaste.trim() || parsing}
        style={{ marginTop:10, background:!intakePaste.trim() || parsing ? C.dim : C.beige, border:"none", borderRadius:7, color:!intakePaste.trim() || parsing ? C.muted : C.bg, padding:"9px 18px", cursor:!intakePaste.trim() || parsing ? "not-allowed" : "pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:12, letterSpacing:"0.05em" }}
      >
        {parsing ? "Parsing…" : "Auto-fill from Intake →"}
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:C.bg, minHeight:"100vh", color:C.dkCream, paddingTop:64,
      ...(isDesktop ? {} : { display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', position:'relative' }) }}>

      {/* Sticky header — matches The Cupping & The Pour */}
      <div style={{ background:C.surf, borderBottom:`1px solid ${C.b0}`, padding:"13px 20px 0", position:"sticky", top:64, zIndex:50, flexShrink:0 }}>
        <div style={{ maxWidth: isDesktop ? 1040 : 480, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:10 }}>
            {[["The Grind","the-grind"],["The Cupping","audit-builder"],["The Pour","quote-builder"]].map(([name,hash],i) => (
              <span key={hash} style={{ display:"flex", alignItems:"center", gap:6 }}>
                {i > 0 && <span style={{ fontSize:9, color:C.muted }}>→</span>}
                <button onClick={() => { if (name !== "The Grind") window.location.hash = `#${hash}`; }}
                  disabled={name === "The Grind"}
                  style={{ background:"none", border:"none", padding:"0 0 2px", cursor:name==="The Grind"?"default":"pointer", fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:name==="The Grind"?C.teal:C.muted, borderBottom:name==="The Grind"?`1px solid ${C.teal}`:"1px solid transparent", transition:"color 0.15s" }}
                  onMouseEnter={e=>{ if(name!=="The Grind") e.currentTarget.style.color=C.dkCream; }}
                  onMouseLeave={e=>{ if(name!=="The Grind") e.currentTarget.style.color=C.muted; }}
                >{name}</button>
              </span>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
            <span style={{ fontSize:11, color:C.beige, textTransform:"uppercase", letterSpacing:"0.14em" }}>
              ☕ Café Con Pan · The Grind
            </span>
            <span style={{ fontSize:9, background:"rgba(184,80,62,0.13)", color:"#D47060", border:"1px solid rgba(184,80,62,0.22)", borderRadius:3, padding:"2px 7px", letterSpacing:"0.1em", textTransform:"uppercase" }}>Internal</span>
          </div>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", paddingBottom:10 }}>
            Pre-Call Prep
          </div>
        </div>
      </div>

      {isDesktop ? (
        /* ── DESKTOP TWO-COLUMN ── */
        <div style={{ display:"flex", maxWidth:1040, margin:"0 auto", minHeight:"calc(100vh - 136px)" }}>

          {/* Left: form (always visible on desktop) */}
          <div style={{ flex:1, padding:"32px 40px 40px", overflowY:"auto" }}>
            <h2 style={{ fontFamily:"'Lilita One',cursive", fontSize:24, lineHeight:1.3, color:C.white, margin:"0 0 24px 0" }}>
              Tell me about your prospect.
            </h2>
            <IntakePanel />
            <GrindForm />
          </div>

          {/* Right: pre-call brief (sticky sidebar) */}
          <div style={{ width:340, flexShrink:0, padding:"28px 28px", borderLeft:`1px solid ${C.b0}`, position:"sticky", top:136, alignSelf:"start", maxHeight:"calc(100vh - 136px)", overflowY:"auto" }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Pre-Call Brief</div>
            {brewing ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ display:"inline-block", transform:"scale(1.5)", transformOrigin:"center top", marginBottom:36 }}><SteamSVG /></div>
                <div style={{ fontFamily:"'Lilita One',cursive", fontSize:20, color:C.dkCream }}>Brewing<span className="brew-dots">...</span></div>
                <div style={{ width:160, height:4, background:C.b0, margin:"14px auto 0", overflow:"hidden" }}>
                  <div className="brew-bar" style={{ height:"100%", background:C.beige }} />
                </div>
              </div>
            ) : result ? (
              <GrindResult />
            ) : (
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.8, fontWeight:600 }}>
                Fill in the client info and hit "Brew the Brief" to generate your pre-call prep.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── MOBILE SINGLE COLUMN ── */
        <div style={{ padding:"32px 24px 80px" }}>
          {brewing ? (
            <div style={{ textAlign:"center", padding:"64px 24px" }}>
              <div style={{ display:"inline-block", transform:"scale(2)", transformOrigin:"center top", marginBottom:56 }}><SteamSVG /></div>
              <div style={{ fontFamily:"'Lilita One',cursive", fontSize:26, color:C.dkCream }}>Brewing<span className="brew-dots">...</span></div>
              <div style={{ width:200, height:5, background:C.b0, margin:"20px auto 0", overflow:"hidden" }}>
                <div className="brew-bar" style={{ height:"100%", background:C.beige }} />
              </div>
              <p style={{ marginTop:14, fontSize:11, color:C.muted, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>Grinding the beans...</p>
            </div>
          ) : result ? (
            <div>
              <div style={{ marginBottom:32, paddingBottom:20, borderBottom:`1px solid ${C.b0}` }}>
                <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700, color:C.teal, marginBottom:6 }}>Pre-Call Brief</div>
              </div>
              <GrindResult />
            </div>
          ) : (
            <>
              <IntakePanel />
              <GrindForm />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TechServicesPage({ go, t }) {
  const ts = t.techServices;
  const MODULE_COLORS = { Devices:"Dispositivos", Connectivity:"Conectividad", "Brand & Communication":"Marca y Comunicación", Web:"Web" };
  const groupColor = g => ({ Devices:C.teal, Dispositivos:C.teal, Connectivity:C.gold, Conectividad:C.gold, "Brand & Communication":C.red, "Marca y Comunicación":C.red })[g] ?? C.beige;

  return (
    <>
      {/* ── PHILOSOPHY HERO ── */}
      <section style={{background:C.espresso,paddingTop:"calc(100px + env(safe-area-inset-top, 0px))",paddingBottom:64,paddingLeft:"clamp(24px,5vw,40px)",paddingRight:"clamp(24px,5vw,40px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",opacity:0.05,pointerEvents:"none"}}><Sunburst size={700} color={C.gold} opacity={0.8} /></div>
        <div style={{position:"relative",zIndex:2,maxWidth:640,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:16}}>{ts.eyebrow}</div>
          <h1 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(36px,6vw,64px)",color:C.cream,lineHeight:1.1,marginBottom:20}}>
            {ts.heroTitle} <span style={{color:C.gold}}>{ts.heroTitleSpan}</span>
          </h1>
          <p style={{fontSize:16,color:"rgba(245,237,214,0.7)",fontWeight:600,lineHeight:1.8,maxWidth:520,margin:"0 auto 32px"}}>
            {ts.heroSub}
          </p>
          <div style={{background:"rgba(212,169,122,0.08)",border:"1px solid rgba(212,169,122,0.22)",borderRadius:4,padding:"20px 28px",maxWidth:520,margin:"0 auto"}}>
            <p style={{fontSize:14,color:C.beige,fontWeight:700,lineHeight:1.8,margin:0,fontStyle:"italic"}}>
              "{ts.heroQuote}"
            </p>
          </div>
        </div>
      </section>

      <TextileBorder flip />

      {/* ── THE AUDIT ── */}
      <section className="section" style={{background:C.parchment}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{marginBottom:40}}>
            <div className="section-eyebrow">{ts.auditEyebrow}</div>
            <h2 className="section-title">{ts.auditTitle} <span>{ts.auditTitleSpan}</span></h2>
            <p className="section-sub">{ts.auditSub}</p>
          </div>

          <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:32}}>
            {[{label:ts.auditRemote,price:`$${P.audit.remote}`},{label:ts.auditOnsite,price:`$${P.audit.onsite}`}].map(opt => (
              <div key={opt.label} style={{flex:1,minWidth:180,background:C.espresso,borderRadius:4,padding:"24px 28px",textAlign:"center"}}>
                <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:C.beige,fontWeight:700,marginBottom:8}}>{opt.label}</div>
                <div style={{fontFamily:"'Lilita One',cursive",fontSize:44,color:C.cream,lineHeight:1}}>{opt.price}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:12,marginBottom:36}}>
            {ts.auditFeatures.map(item => (
              <div key={item} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{color:C.teal,fontWeight:800,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
                <span style={{fontSize:14,color:C.espresso,fontWeight:600,lineHeight:1.5}}>{item}</span>
              </div>
            ))}
          </div>

          <button className="hero-cta" onClick={() => go("Discovery")}>{ts.auditCta}</button>
        </div>
      </section>

      <TextileBorder />

      {/* ── FOUNDATION CORE ── */}
      <section className="section section-dark">
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:28}}>
            <div>
              <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:C.beige,opacity:0.6,fontWeight:700,marginBottom:8}}>{ts.foundationEyebrow}</div>
              <h2 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(28px,4vw,44px)",color:C.cream,margin:0,lineHeight:1.1}}>{ts.foundationTitle}</h2>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.beige,opacity:0.5,marginBottom:4}}>{ts.foundationStartingAt}</div>
              <div style={{fontFamily:"'Lilita One',cursive",fontSize:44,color:C.gold,lineHeight:1}}>${P.foundation.toLocaleString()}</div>
            </div>
          </div>

          <p style={{fontSize:15,color:"rgba(245,237,214,0.65)",fontWeight:600,lineHeight:1.8,marginBottom:32,maxWidth:520}}>
            {ts.foundationSub}
          </p>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20}}>
            {ts.foundationItems.map(item => (
              <div key={item.title} style={{borderLeft:`3px solid rgba(212,169,122,0.25)`,paddingLeft:16}}>
                <div style={{fontSize:13,fontWeight:800,color:C.cream,marginBottom:4}}>{item.title}</div>
                <div style={{fontSize:13,color:"rgba(245,237,214,0.5)",lineHeight:1.6,fontWeight:600}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TextileBorder flip />

      {/* ── MODULE CATALOG ── */}
      <section className="section" style={{background:C.parchment}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{marginBottom:40}}>
            <div className="section-eyebrow">{ts.modulesEyebrow}</div>
            <h2 className="section-title">{ts.modulesTitle} <span>{ts.modulesTitleSpan}</span></h2>
            <p className="section-sub">{ts.modulesSub}</p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:40}}>
            {ts.modules.map(grp => {
              const color = groupColor(grp.group);
              return (
                <div key={grp.group}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,paddingBottom:10,borderBottom:`1px solid ${C.espresso}15`}}>
                    <div style={{width:3,height:18,background:color,borderRadius:2,flexShrink:0}} />
                    <span style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,color:C.espresso,opacity:0.45}}>{grp.group}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:20}}>
                    {grp.items.map(item => (
                      <div key={item.id} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                        <div style={{width:28,height:28,borderRadius:3,background:color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,fontWeight:800,color:color===C.beige?C.espresso:C.cream,letterSpacing:"0.04em",marginTop:1}}>
                          {item.id}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:800,color:C.espresso,marginBottom:3}}>{item.name}</div>
                          <div style={{fontSize:13,color:"#6B5040",lineHeight:1.7,fontWeight:600}}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{marginTop:40,padding:"14px 20px",background:`${C.espresso}07`,border:`1px solid ${C.espresso}15`,borderRadius:4,fontSize:13,color:C.espresso,opacity:0.6,fontWeight:600,fontStyle:"italic",textAlign:"center",lineHeight:1.6}}>
            {ts.modulesNote}
          </div>
        </div>
      </section>

      <TextileBorder />

      {/* ── ONGOING PARTNERSHIP ── */}
      <section className="section section-dark">
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{marginBottom:36}}>
            <div style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:12}}>{ts.partnerEyebrow}</div>
            <h2 style={{fontFamily:"'Lilita One',cursive",fontSize:"clamp(28px,4vw,44px)",color:C.cream,lineHeight:1.1,marginBottom:12}}>{ts.partnerTitle} <span style={{color:C.gold}}>{ts.partnerTitleSpan}</span></h2>
            <p style={{fontSize:15,color:"rgba(245,237,214,0.6)",fontWeight:600,lineHeight:1.8,maxWidth:500,margin:0}}>{ts.partnerSub}</p>
          </div>

          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[
              {name:ts.partnerPlan1Name, range:`${ts.partnerStartingAt} $${P.ops.annual} / device / mo`, color:C.teal, desc:ts.partnerPlan1Desc},
              {name:ts.partnerPlan2Name, range:`${ts.partnerStartingAt} $${P.pa.annual} / mo`,           color:C.gold, desc:ts.partnerPlan2Desc},
            ].map(plan => (
              <div key={plan.name} style={{flex:1,minWidth:260,border:"1px solid rgba(212,169,122,0.12)",borderRadius:4,padding:"24px"}}>
                <div style={{width:3,height:14,background:plan.color,borderRadius:2,marginBottom:12}} />
                <div style={{fontSize:14,fontWeight:800,color:C.cream,marginBottom:4}}>{plan.name}</div>
                <div style={{fontSize:10,letterSpacing:"0.1em",color:plan.color,fontWeight:700,marginBottom:14,textTransform:"uppercase"}}>{plan.range}</div>
                <div style={{fontSize:13,color:"rgba(245,237,214,0.5)",lineHeight:1.7,fontWeight:600}}>{plan.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TextileBorder />

      {/* ── CREDENTIALS ── */}
      <section className="section section-dark">
        <div className="section-header">
          <div className="section-eyebrow" style={{color:C.teal}}>{ts.credsEyebrow}</div>
          <h2 className="section-title section-title-light">{ts.credsTitle} <span>{ts.credsTitleSpan}</span></h2>
          <p className="section-sub section-sub-light">{ts.credsSub}</p>
        </div>
        <div className="creds-row">
          {ts.credsBadges.map(c => (
            <div key={c.label} className="cred-badge">
              <div className="cred-badge-label">{c.label}</div>
              <div className="cred-badge-val">{c.val}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:48}}>
          <button className="hero-cta" onClick={() => go("Discovery")}>{ts.credsCta}</button>
        </div>
      </section>

      <TextileBorder flip />

      {/* ── FINAL CTA ── */}
      <section className="section" style={{background:C.parchment,textAlign:"center"}}>
        <div style={{maxWidth:520,margin:"0 auto"}}>
          <div className="section-eyebrow">{ts.ctaEyebrow}</div>
          <h2 className="section-title">{ts.ctaTitle} <span>{ts.ctaTitleSpan}</span></h2>
          <p className="section-sub" style={{marginBottom:8}}>{ts.ctaSub}</p>
          <p style={{fontSize:13,color:C.espresso,opacity:0.5,fontWeight:600,fontStyle:"italic",marginBottom:36,lineHeight:1.7}}>
            {ts.ctaDisclaimer}
          </p>
          <button className="hero-cta" onClick={() => go("Discovery")}>{ts.ctaBtn}</button>
        </div>
      </section>
    </>
  );
}

export default function CafeConPan() {
  const [page, setPage] = useState(getPageFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState(getBrowserLang);
  const [gameActive, setGameActive] = useState(false);
  const [secretNavActive, setSecretNavActive] = useState(false);
  const [highlightSocials, setHighlightSocials] = useState(false);
  const scrollPositions = useRef({});
  const isBackNav = useRef(false);
  const isProgrammaticNav = useRef(false);
  const pageRef = useRef(page);
  const copyClickCount = useRef(0);
  const copyClickTimer = useRef(null);
  const discoveryPrefill = useRef(null);

  const t = STRINGS[lang];
  const sLinkFt = {fontSize:12,color:C.cream,opacity:0.6,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",transition:"opacity 0.2s"};
  const scrollToSocials = () => {
    document.getElementById("footer-socials")?.scrollIntoView({behavior:"smooth"});
    setHighlightSocials(true);
    setTimeout(() => setHighlightSocials(false), 3200);
  };
  const go = (p, state = null) => {
    if (state) discoveryPrefill.current = state;
    if (p === "Home" && page === "Home") { window.location.reload(); return; }
    scrollPositions.current[page] = window.scrollY;
    isProgrammaticNav.current = true;
    setPage(p); setMenuOpen(false);
    window.location.hash = PAGE_HASH[p];
  };

  useEffect(() => {
    pageRef.current = page;
    if (isBackNav.current) {
      const y = scrollPositions.current[page] ?? 0;
      requestAnimationFrame(() => window.scrollTo(0, y));
      isBackNav.current = false;
    } else {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }, [page]);

  useEffect(() => {
    const onHash = () => {
      if (isProgrammaticNav.current) { isProgrammaticNav.current = false; return; }
      scrollPositions.current[pageRef.current] = window.scrollY;
      isBackNav.current = true;
      setPage(getPageFromHash());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);


  const renderPage = () => {
    switch(page) {
      case "Home": return <HomePage go={go} t={t} lang={lang} />;
      case "Tech Services": return <TechServicesPage go={go} t={t} />;
      case "Community": return null;
      case "Our Story": return <AboutPage t={t} go={go} />;
      case "Contact": return <ContactPage t={t} go={go} scrollToSocials={scrollToSocials} setGameActive={setGameActive} />;
      case "La Mesa": return <GoogleAuthGate><LaMesaPage t={t} go={go} /></GoogleAuthGate>;
      case "La Mesa Referral": return <GoogleAuthGate><LaMesaReferralPage t={t} go={go} /></GoogleAuthGate>;
      case "Pay": return <PayPage t={t} />;
      case "Privacy Policy": return <PrivacyPolicyPage lang={lang} />;
      case "The Grind": return <GoogleAuthGate><TheGrindPage go={go} /></GoogleAuthGate>;
      case "The Pour": return <GoogleAuthGate><Suspense fallback={null}><QuoteBuilder /></Suspense></GoogleAuthGate>;
      case "The Cupping": return <GoogleAuthGate><Suspense fallback={null}><AuditBuilder /></Suspense></GoogleAuthGate>;
      case "Apple Teams": return <GoogleAuthGate><AppleTeamsPage /></GoogleAuthGate>;
      case "Discovery": return <DiscoveryPage go={go} t={t} prefillRef={discoveryPrefill} />;
      case "Resources": return <ResourcesPage go={go} t={t} lang={lang} />;
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
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[
                { label:"Tools", items:[["The Grind","the-grind",true],["The Cupping","audit-builder",true],["The Pour","quote-builder",true]] },
                { label:"La Mesa", items:[["La Mesa","la-mesa",true],["La Mesa Referral","la-mesa-referral",true]] },
                { label:"Other", items:[["Apple Teams","apple-teams",true],["Pay","pay",false]] },
              ].map((section,si) => (
                <div key={section.label}>
                  {si>0&&<div style={{height:1,background:`${C.beige}22`,margin:"14px 0 10px"}}/>}
                  <div style={{fontSize:9,color:C.teal,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>{section.label}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {section.items.map(([label,hash,locked])=>(
                      <button key={hash} onClick={()=>{go(label);setSecretNavActive(false);}}
                        style={{background:"none",border:`2px solid ${locked?`${C.beige}33`:`${C.teal}44`}`,color:locked?C.cream:C.teal,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em",textTransform:"uppercase",padding:"10px 24px",transition:"border-color 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=locked?C.gold:C.teal}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=locked?`${C.beige}33`:`${C.teal}44`}>
                        {locked&&<span style={{fontSize:10,opacity:0.5}}>🔒</span>}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
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
          <button className="nav-cta-btn" onClick={() => go("Discovery")}>{t.nav.cta}</button>
          <button className="lang-btn" onClick={() => setLang(lang === "en" ? "es" : "en")}>{t.nav.langBtn}</button>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>
      <main key={page} className="page" style={{paddingTop:0}}>{renderPage()}</main>
      <TextileBorder />
      <footer>
        <div className="footer-logo">Café Con <span>Pan</span></div>
        <div className="footer-tagline">{t.footer.tagline}</div>
        <div id="footer-socials" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:4}}>{t.socials.followLabel}</div>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"12px 24px",textAlign:"center"}}>
            {[
              {href:t.socials.discord,   label:t.socials.discordLabel},
              {href:t.socials.facebook,  label:t.socials.facebookLabel},
              {href:t.socials.instagram, label:t.socials.instagramLabel},
              {href:t.socials.linkedin,  label:t.socials.linkedinLabel},
              {href:t.socials.tiktok,    label:t.socials.tiktokLabel},
              {href:t.socials.twitter,   label:t.socials.twitterLabel},
              {href:t.socials.youtube,   label:t.socials.youtubeLabel},
            ].filter(s => s.href).map(({href,label},i) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{...sLinkFt, animation:highlightSocials?`socialFlash 0.75s ease ${i*400}ms both`:undefined}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.6}
              >{label}</a>
            ))}
          </div>
        </div>
        <div style={{fontSize:11,color:`rgba(245,237,214,0.35)`,fontWeight:600,textAlign:"center",maxWidth:480,lineHeight:1.6}}>{t.footer.disclaimer}</div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <div className="footer-copy">
            <span onClick={() => {
              clearTimeout(copyClickTimer.current);
              copyClickCount.current += 1;
              if (copyClickCount.current >= 3) {
                copyClickCount.current = 0;
                setSecretNavActive(true);
              } else {
                copyClickTimer.current = setTimeout(() => { copyClickCount.current = 0; }, 1500);
              }
            }} style={{cursor:"default"}}>©</span>
            {t.footer.copy.replace(/^©/, "")}
          </div>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={() => go("Resources")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:10,color:C.teal,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"underline",transition:"color 0.2s",padding:0}}
              onMouseEnter={e=>e.currentTarget.style.color=C.beige}
              onMouseLeave={e=>e.currentTarget.style.color=C.teal}
            >Resources</button>
            <button onClick={() => go("Privacy Policy")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:10,color:`rgba(245,237,214,0.2)`,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"underline",transition:"color 0.2s",padding:0}}
              onMouseEnter={e=>e.currentTarget.style.color=`rgba(245,237,214,0.55)`}
              onMouseLeave={e=>e.currentTarget.style.color=`rgba(245,237,214,0.2)`}
            >{t.privacy.footerLink}</button>
          </div>
        </div>
      </footer>
    </>
  );
}
