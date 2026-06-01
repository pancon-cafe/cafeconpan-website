import { Font } from '@react-pdf/renderer';

let _registered = false;

export function registerCCPFonts() {
  if (_registered) return;
  _registered = true;
  // Disable mid-word hyphenation — react-pdf hyphenates aggressively by default.
  Font.registerHyphenationCallback(word => [word]);
}
