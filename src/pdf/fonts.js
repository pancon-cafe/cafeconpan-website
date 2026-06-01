/**
 * CCP PDF — Font Registration
 *
 * Registers Lora (a Georgia-equivalent serif by Cyreal) via jsDelivr CDN.
 * Lora is visually near-identical to Georgia: old-style serifs, moderate contrast,
 * strong at small sizes in print — ideal for client-facing documents.
 *
 * Call registerCCPFonts() once before any PDF render (Shell.jsx does this
 * automatically, so you normally don't need to call it yourself).
 *
 * ── Offline / local fonts ──────────────────────────────────────────────────
 * If you need offline support, download the WOFF2 files from:
 *   https://fonts.google.com/specimen/Lora
 * Place them in /public/fonts/ and swap the CDN URLs for:
 *   '/fonts/lora-latin-400-normal.woff2'   etc.
 */

import { Font } from '@react-pdf/renderer';

// jsDelivr mirrors every npm package — these URLs are stable and versioned.
const CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.8/files';

let _registered = false;

export function registerCCPFonts() {
  if (_registered) return;
  _registered = true;
  // Disable mid-word hyphenation — react-pdf hyphenates aggressively by default.
  Font.registerHyphenationCallback(word => [word]);
}
