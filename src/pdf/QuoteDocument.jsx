/**
 * CCP Quote PDF Document
 *
 * Client-facing quote with line items, pricing summary, terms, and signature block.
 * Exported as the default export for lazy-loading (keeps bundle size down).
 *
 * ── Required prop shape ──────────────────────────────────────────────────────
 * {
 *   quoteNumber:  string,      // e.g. 'CCP-Q-2024-001'
 *   date:         string,      // e.g. 'June 1, 2024'
 *   expiresDate:  string,      // e.g. 'July 1, 2024'
 *   preparedBy:   string,      // 'Jason F. Reyes'
 *   client: {
 *     businessName: string,
 *     contactName:  string,
 *     email:        string,
 *     phone?:       string,
 *   },
 *   lineItems: Array<{
 *     category:    string,     // e.g. 'Apple Presence'
 *     description: string,
 *     qty:         number,
 *     unitPrice:   number,
 *     total:       number,
 *   }>,
 *   subtotal:  number,
 *   tax?:      number,         // defaults to 0 (VA tech services typically untaxed)
 *   total:     number,
 *   notes?:    string,
 *   terms?:    string,         // falls back to CCP standard terms
 * }
 */

import React from 'react';
import { Document, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, SP } from './tokens';
import {
  CCPPage,
  CCPSection,
  CCPInfoRow,
  CCPDivider,
  CCPCallout,
  CCPColumns,
} from './Shell';
import { CCPTable, CCPTableHead, CCPTableRow } from './Table';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function usd(n) {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Client name — largest text on the content pages
  clientName: {
    fontSize:      F.size.lg,
    fontWeight:    700,
    color:         C.beige,
    letterSpacing: 0.5,
    marginBottom:  SP[2],
  },

  // Body text
  bodyText: {
    fontSize:      F.size.xs,
    color:         C.cream,
    lineHeight:    1.6,
    letterSpacing: 0.2,
  },
  mutedText: {
    fontSize:      F.size.xs,
    color:         C.muted,
    lineHeight:    1.5,
    letterSpacing: 0.2,
  },

  // Totals block (aligned right)
  totalsBox: {
    marginTop:       SP[4],
    alignSelf:       'flex-end',
    width:           230,
    backgroundColor: C.espCard,
    borderRadius:    3,
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
  },
  totalsLine: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   SP[1] + 2,
  },
  totalsLineLabel: {
    fontSize:      F.size.xs,
    color:         C.muted,
    letterSpacing: 0.3,
  },
  totalsLineValue: {
    fontSize:      F.size.xs,
    color:         C.cream,
    letterSpacing: 0.3,
  },
  totalsGrandRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    borderTopWidth:  0.75,
    borderTopColor:  C.beige,
    borderTopStyle:  'solid',
    paddingTop:      SP[2],
    marginTop:       SP[1],
  },
  totalsGrandLabel: {
    fontSize:      F.size.md,
    fontWeight:    700,
    color:         C.beige,
    letterSpacing: 0.5,
  },
  totalsGrandValue: {
    fontSize:      F.size.md,
    fontWeight:    700,
    color:         C.red,
  },

  // Signature block
  sigArea: {
    marginTop:     SP[8],
    flexDirection: 'row',
  },
  sigBox: {
    flex:        1,
    marginRight: SP[5],
  },
  sigBoxLast: {
    flex:        1,
    marginRight: 0,
  },
  sigLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: C.muted,
    borderBottomStyle: 'solid',
    height:            28,
    marginBottom:      SP[1],
  },
  sigLabel: {
    fontSize:      F.size.xs,
    color:         C.muted,
    letterSpacing: 0.5,
  },
});

// Column definitions for line items
const LINE_COLS   = ['Service / Package', 'Description', 'Qty', 'Unit Price', 'Total'];
const LINE_WIDTHS = [84, null, 24, 64, 64]; // null = flex:1

// ─────────────────────────────────────────────────────────────────────────────
// Standard terms (used if data.terms is not provided)
// ─────────────────────────────────────────────────────────────────────────────

function buildTerms(total) {
  const schedule = total < 2000
    ? 'A 50% deposit is required to schedule and begin work; the remaining 50% is due upon project completion.'
    : 'A 50% deposit is required to schedule and begin work; 25% is due at the project midpoint; and the remaining 25% is due upon completion.';
  return (
    'This quote is valid for 30 days from the date issued. ' + schedule + ' ' +
    'All services are performed by Cafe Con Pan LLC. Prices are in USD. Scope changes ' +
    'requested after work begins may result in a revised quote. By signing below, the ' +
    'client acknowledges the scope of work described above and authorizes Cafe Con Pan ' +
    'LLC to proceed on the agreed terms.'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Document
// ─────────────────────────────────────────────────────────────────────────────

export default function QuoteDocument({ data }) {
  const tax = data.tax ?? 0;

  return (
    <Document
      title={`Quote ${data.quoteNumber} — ${data.client.businessName}`}
      author="Cafe Con Pan LLC"
      subject="Service Quote"
      creator="pancon.cafe"
      keywords="quote, technology, apple, smb"
    >
      <CCPPage docType="Quote">

        {/* ── Client + Quote metadata ──────────────────────────────────────── */}
        <CCPSection title="Quote Details" style={{ marginTop: SP[1] }} />

        <CCPColumns
          left={
            <View>
              <Text style={s.clientName}>{data.client.businessName}</Text>
              <CCPInfoRow label="Prepared for" value={data.client.contactName} />
              <CCPInfoRow label="Email"        value={data.client.email} />
              <CCPInfoRow label="Phone"        value={data.client.phone} />
            </View>
          }
          right={
            <View>
              <CCPInfoRow label="Quote #"     value={data.quoteNumber} />
              <CCPInfoRow label="Date"        value={data.date} />
              <CCPInfoRow label="Expires"     value={data.expiresDate} />
              <CCPInfoRow label="Prepared by" value={data.preparedBy} />
            </View>
          }
        />

        <CCPDivider mt={SP[3]} mb={SP[2]} />

        {/* ── Line items ───────────────────────────────────────────────────── */}
        <CCPSection title="Scope of Work" />

        <CCPTable>
          <CCPTableHead columns={LINE_COLS} widths={LINE_WIDTHS} />
          {data.lineItems.map((item, i) => (
            <CCPTableRow
              key={i}
              alt={i % 2 === 1}
              widths={LINE_WIDTHS}
              cells={[
                { value: item.category,           variant: 'highlight' },
                { value: item.description },
                { value: String(item.qty),         align: 'center' },
                { value: usd(item.unitPrice),      align: 'right' },
                { value: usd(item.total),          align: 'right', variant: 'highlight' },
              ]}
            />
          ))}
        </CCPTable>

        {/* ── Totals ───────────────────────────────────────────────────────── */}
        <View style={s.totalsBox}>
          <View style={s.totalsLine}>
            <Text style={s.totalsLineLabel}>Subtotal</Text>
            <Text style={s.totalsLineValue}>{usd(data.subtotal)}</Text>
          </View>
          {tax > 0 && (
            <View style={s.totalsLine}>
              <Text style={s.totalsLineLabel}>Tax</Text>
              <Text style={s.totalsLineValue}>{usd(tax)}</Text>
            </View>
          )}
          {tax === 0 && (
            <View style={s.totalsLine}>
              <Text style={s.totalsLineLabel}>Tax</Text>
              <Text style={[s.totalsLineValue, { color: C.muted }]}>Not applicable</Text>
            </View>
          )}
          <View style={s.totalsGrandRow}>
            <Text style={s.totalsGrandLabel}>Total Investment</Text>
            <Text style={s.totalsGrandValue}>{usd(data.total)}</Text>
          </View>
        </View>

        {/* ── Notes (optional) ─────────────────────────────────────────────── */}
        {data.notes ? (
          <>
            <CCPSection title="Notes" />
            <CCPCallout accent="beige">
              <Text style={s.bodyText}>{data.notes}</Text>
            </CCPCallout>
          </>
        ) : null}

        {/* ── Terms ────────────────────────────────────────────────────────── */}
        <CCPSection title="Terms &amp; Acceptance" />
        <Text style={s.mutedText}>{data.terms ?? buildTerms(data.total)}</Text>

        {/* ── Signature block ───────────────────────────────────────────────── */}
        <View style={s.sigArea}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Client Signature</Text>
          </View>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Printed Name</Text>
          </View>
          <View style={s.sigBoxLast}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Date</Text>
          </View>
        </View>

      </CCPPage>
    </Document>
  );
}
