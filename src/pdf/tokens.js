/**
 * CCP PDF — Brand Design Tokens
 * import { C, F, SP, PAGE } from './tokens';
 */

/** Color palette */
export const C = {
  // Page backgrounds
  espresso:   '#0D0702',   // primary page background
  espCard:    '#140C06',   // card / elevated surface
  espAlt:     '#1C120A',   // alternating table row
  espBorder:  '#2C1A10',   // subtle border, dividers

  // Brand
  beige:      '#D4A97A',   // primary accent — headings, highlights
  teal:       '#5A9E96',   // secondary accent — marks, meters
  tealDim:    '#3D7A73',   // muted teal for borders
  red:        '#B8503E',   // critical, pricing total
  redDim:     '#4A2018',   // muted red background

  // Text
  cream:      '#E0C89A',   // body text
  muted:      '#8B7355',   // labels, secondary text
  white:      '#FFFFFF',
};

/** Typography */
export const F = {
  serif: 'Lora',           // Georgia-equivalent, registered via fonts.js
  size: {
    '2xs': 6,
    xs:    7,
    sm:    8,
    base:  10,
    md:    11,
    lg:    14,
    xl:    18,
    '2xl': 24,
    '3xl': 32,
    '4xl': 44,
  },
};

/** Spacing scale (in points) */
export const SP = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
};

/**
 * Page layout constants for US Letter (612 × 792 pt).
 * ptTop / pbBot account for the fixed header + footer heights
 * plus a comfortable internal gap.
 */
export const PAGE = {
  width:   612,
  height:  792,
  px:      48,   // horizontal padding
  ptTop:   80,   // padding-top  (headerH=60 + 20pt gap)
  pbBot:   56,   // padding-bottom (footerH=36 + 20pt gap)
  headerH: 60,
  footerH: 36,
};
