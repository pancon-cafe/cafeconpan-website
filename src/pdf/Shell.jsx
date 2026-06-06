// CCP PDF — reusable layout components (CCPPage, CCPHeader, CCPFooter, CCPSection,
// CCPInfoRow, CCPDivider, CCPCallout, CCPBadge, CCPColumns). All use @react-pdf/renderer primitives.

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, SP, PAGE } from './tokens';
import { registerCCPFonts } from './fonts';

// Auto-register fonts when this module is imported
registerCCPFonts();

// ─────────────────────────────────────────────────────────────────────────────
// Style sheet
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  // ── Page ───────────────────────────────────────────────────────────────────
  page: {
    backgroundColor:  C.espresso,
    paddingTop:       PAGE.ptTop,
    paddingBottom:    PAGE.pbBot,
    paddingHorizontal: PAGE.px,
    fontFamily:  F.serif,
    fontSize:    F.size.base,
    color:       C.cream,
  },

  // ── Header (position:absolute + fixed = floats over content every page) ────
  header: {
    position:          'absolute',
    top:               0,
    left:              0,
    right:             0,
    height:            PAGE.headerH,
    backgroundColor:   C.espresso,
    paddingHorizontal: PAGE.px,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },
  headerRule: {
    position:        'absolute',
    bottom:          0,
    left:            PAGE.px,
    right:           PAGE.px,
    height:          1,
    backgroundColor: C.teal,
  },
  wordmark: {
    fontSize:      15,
    fontWeight:    400,
    color:         C.beige,
    letterSpacing: 0.5,
  },
  wordmarkSub: {
    fontSize:      F.size['2xs'],
    color:         C.teal,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop:     2,
  },
  docBadge: {
    borderWidth:       0.75,
    borderColor:       C.beige,
    borderStyle:       'solid',
    paddingHorizontal: SP[2],
    paddingVertical:   SP[1],
    borderRadius:      2,
  },
  docBadgeText: {
    fontSize:      F.size.xs,
    color:         C.beige,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    height:            PAGE.footerH,
    backgroundColor:   C.espresso,
    paddingHorizontal: PAGE.px,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },
  footerRule: {
    position:        'absolute',
    top:             0,
    left:            PAGE.px,
    right:           PAGE.px,
    height:          0.75,
    backgroundColor: C.tealDim,
  },
  footerText: {
    fontSize:      F.size['2xs'],
    color:         C.muted,
    letterSpacing: 0.3,
  },
  footerDot: {
    fontSize:         F.size['2xs'],
    color:            C.teal,
    marginHorizontal: 4,
    opacity:          0.7,
  },

  // ── Section heading ────────────────────────────────────────────────────────
  section: {
    marginTop:     SP[5],
    marginBottom:  SP[3],
    flexDirection: 'row',
    alignItems:    'center',
  },
  sectionAccent: {
    width:           3,
    height:          12,
    backgroundColor: C.teal,
    marginRight:     SP[2],
    borderRadius:    1,
  },
  sectionTitle: {
    fontSize:      F.size.xs,
    fontWeight:    700,
    color:         C.beige,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  sectionRule: {
    flex:            1,
    marginLeft:      SP[3],
    height:          0.5,
    backgroundColor: C.espBorder,
  },

  // ── Info row ───────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    marginBottom:  SP[1] + 2,
  },
  infoLabel: {
    fontSize:      F.size.xs,
    color:         C.muted,
    width:         88,
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize:      F.size.xs,
    color:         C.cream,
    flex:          1,
    letterSpacing: 0.2,
  },

  // ── Callout box ────────────────────────────────────────────────────────────
  callout: {
    backgroundColor:  C.espCard,
    borderLeftWidth:  3,
    borderLeftColor:  C.teal,
    borderLeftStyle:  'solid',
    padding:          SP[3],
    marginVertical:   SP[2],
    borderRadius:     2,
  },
  calloutRed: {
    borderLeftColor:  C.red,
    backgroundColor:  '#120604',
  },
  calloutBeige: {
    borderLeftColor:  C.beige,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    height:          0.5,
    backgroundColor: C.espBorder,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fixed branded header — floats over content, appears on every page.
 * @param {string} docType — text for the right-side badge (e.g. "Quote")
 */
export function CCPHeader({ docType }) {
  return (
    <View style={s.header} fixed>
      {/* Left: wordmark + tagline */}
      <View>
        <Text style={s.wordmark}>Cafe Con Pan</Text>
        <Text style={s.wordmarkSub}>Technology Services</Text>
      </View>

      {/* Right: document type badge */}
      {docType ? (
        <View style={s.docBadge}>
          <Text style={s.docBadgeText}>{docType}</Text>
        </View>
      ) : null}

      {/* Bottom rule */}
      <View style={s.headerRule} />
    </View>
  );
}

// Fixed footer — contact info left, page number right, every page.
export function CCPFooter() {
  return (
    <View style={s.footer} fixed>
      {/* Top rule */}
      <View style={s.footerRule} />

      {/* Left: contact */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={s.footerText}>pancon.cafe</Text>
        <Text style={s.footerDot}>·</Text>
        <Text style={s.footerText}>jason@pancon.cafe</Text>
        <Text style={s.footerDot}>·</Text>
        <Text style={s.footerText}>(771) 223-3131</Text>
      </View>

      {/* Right: page number (rendered dynamically by react-pdf) */}
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

// Section heading: [teal bar] TITLE ──────────
export function CCPSection({ title, style }) {
  return (
    <View style={[s.section, style]}>
      <View style={s.sectionAccent} />
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

// Metadata label/value row. Returns null if value is falsy.
export function CCPInfoRow({ label, value, valueStyle }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, valueStyle]}>{value}</Text>
    </View>
  );
}

// Horizontal rule. color overrides default C.espBorder.
export function CCPDivider({ color, mt = SP[4], mb = SP[4] }) {
  return (
    <View
      style={[
        s.divider,
        { marginTop: mt, marginBottom: mb },
        color ? { backgroundColor: color } : null,
      ]}
    />
  );
}

// Left-accented highlight box. accent: 'teal' | 'red' | 'beige'.
export function CCPCallout({ accent = 'teal', style, children }) {
  return (
    <View
      style={[
        s.callout,
        accent === 'red'   ? s.calloutRed   : null,
        accent === 'beige' ? s.calloutBeige : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Colored status pill. status: 'critical' | 'high' | 'warning' | 'good' | 'excellent' | 'default'.
export function CCPBadge({ label, status = 'default' }) {
  const palette = {
    critical:  { bg: C.redDim,   fg: C.red   },
    high:      { bg: '#3D1E08',  fg: '#E8854A' },
    warning:   { bg: '#3D2800',  fg: C.beige  },
    good:      { bg: '#1A3B38',  fg: C.teal   },
    excellent: { bg: '#1E4A46',  fg: '#7ECCC5' },
    default:   { bg: C.espCard,  fg: C.cream  },
  };
  const col = palette[status] ?? palette.default;
  return (
    <View
      style={{
        backgroundColor:   col.bg,
        paddingHorizontal: SP[2],
        paddingVertical:   2,
        borderRadius:      2,
        alignSelf:         'flex-start',
      }}
    >
      <Text style={{ fontSize: F.size.xs, color: col.fg, letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}

// Two-column flex row.
export function CCPColumns({ left, right, gap = SP[6] }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1, marginRight: gap / 2 }}>{left}</View>
      <View style={{ flex: 1, marginLeft:  gap / 2 }}>{right}</View>
    </View>
  );
}

// Full US-Letter page with fixed branded header and footer. Auto-paginates on overflow.
export function CCPPage({ docType, style, children }) {
  return (
    <Page size="LETTER" style={[s.page, style]}>
      <CCPHeader docType={docType} />
      {children}
      <CCPFooter />
    </Page>
  );
}
