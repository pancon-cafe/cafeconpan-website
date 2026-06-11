// Single source of truth for all CCP service pricing.
// Update numbers here — The Pour, The Cupping, The Grind, and the
// Tech Services page all derive their prices from this file.

export const P = {
  audit:      { remote: 250, onsite: 450 },
  foundation: 1500,
  foundationComponents: {
    abm:    { full: 500, correction: 250 },
    mdm:    { full: 500, correction: 250 },
    email:  { full: 300, correction: 150 },
    brands: { full: 200, correction: 100 },
  },
  A: 150, B: 175,
  C1: 150, C2: 200, C3: 150, C4: 150,
  D1: 300, D2: 300, E: 300,
  F: 750, G: 450, H: 600, J: 400,
  flagship: { complete: { price: 4000, dev: 3 }, fleet: { price: 5000, dev: 10 } },
  ops: { m2m: 40, annual: 35, '2yr': 30 },
  pa:  { m2m: 350, annual: 300, '2yr': 250 },
  comm: { dev: 25, pa: 150 },
  ivr: 75, extra: 150,
  bundles: {
    comms:         950,  // D1 + D2 + H  (saves $250)
    connectivity:  475,  // D1 + E       (saves $125)
    launchPrep:    275,  // A + B        (saves $50)
    ofbEssentials: 300,  // B + C1×1     (saves $25)
  },
};

// Returns a formatted service catalog string for use in AI prompts.
// Import and call this in The Grind and The Cupping prompts so price
// changes here flow through automatically.
export function catalogText() {
  const fmt = n => `$${n.toLocaleString()}`;
  return [
    `- Foundation Core: up to ${fmt(P.foundation)} — final price determined by deliverable assessment: each of the 4 components is priced based on whether it is Missing, Exists Needs Correction, or Confirmed Clean. Components: Apple Business Manager (${fmt(P.foundationComponents.abm.full)} missing / ${fmt(P.foundationComponents.abm.correction)} correction), MDM + First Device Enrollment (${fmt(P.foundationComponents.mdm.full)} missing / ${fmt(P.foundationComponents.mdm.correction)} correction), Business Email & Domain (${fmt(P.foundationComponents.email.full)} missing / ${fmt(P.foundationComponents.email.correction)} correction), Apple Brands — Full Layer (${fmt(P.foundationComponents.brands.full)} missing / ${fmt(P.foundationComponents.brands.correction)} correction). Included in every engagement.`,
    `- Module C1: ${fmt(P.C1)}/device — new device zero-touch deployment`,
    `- Module C2: ${fmt(P.C2)}/device — existing device enrollment`,
    `- Module D1: ${fmt(P.D1)} — carrier audit & recommendation`,
    `- Module D2: ${fmt(P.D2)} add-on — carrier implementation`,
    `- Module E: ${fmt(P.E)} — ISP/business internet setup`,
    `- Bundle — Connectivity (D1 + E): ${fmt(P.bundles.connectivity)} (saves $125)`,
    `- Module G: ${fmt(P.G)} — Apple Brands standalone (existing Foundation clients who never had it built only). Apple Brands is the 4th Foundation deliverable — NOT a standalone add-on for new clients or any client currently in Foundation scope.`,
    `- Module H: ${fmt(P.H)} — CCP AI Phone System (proprietary AI-powered call routing, automated greetings, and custom call handling)`,
    `- Module F: ${fmt(P.F)} — business website`,
    `- Module J: ${fmt(P.J)} + MSP — Apple Business Messages`,
    `- Bundle — Communications (D1 + D2 + H): ${fmt(P.bundles.comms)} (saves $250)`,
    `- Recurring Apple Operations: ${fmt(P.ops['2yr'])}–${fmt(P.ops.m2m)}/device/mo (device count and enrollment scope confirmed at project kickoff — not assumed in reports)`,
    `- Recurring Partner Access: ${fmt(P.pa['2yr'])}–${fmt(P.pa.m2m)}/mo`,
    `- IVR Management: ${fmt(P.ivr)}/mo + usage`,
    `- Flagship — OFB Complete: ${fmt(P.flagship.complete.price)} — Foundation + all bundles, 3-device deployment, single fixed price. Devices 4–15 add $150 each.`,
    `- Flagship — OFB Fleet: ${fmt(P.flagship.fleet.price)} — Same as Complete but 10-device deployment. Best for fleet-first clients.`,
    `- ELIMINATED: The Apple Presence Bundle (C1 × 3 devices + G) no longer exists. Do not recommend it. Device deployment (C1/C2) and Apple Brands (now the 4th Foundation deliverable) are not bundled together.`,
  ].join('\n');
}
