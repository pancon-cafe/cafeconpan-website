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
    'All services are performed by Cafe Con Pan LLC. Prices are in USD. ' +
    'Third-party pass-through costs — including but not limited to domain registration, Google Workspace licenses, MDM software, AppleCare, MSP platform fees, and carrier charges — are the direct financial responsibility of the client and are not reflected in this quote. These costs will be identified and communicated in writing prior to any purchase being made on the client\'s behalf. ' +
    'Scope changes requested after work begins may result in a revised quote. ' +
    'By signing below, both parties acknowledge the scope of work described above and authorize Cafe Con Pan LLC to proceed on the agreed terms.'
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
          {data.discount > 0 && (
            <View style={s.totalsLine}>
              <Text style={s.totalsLineLabel}>Founding Client Discount (50%)</Text>
              <Text style={[s.totalsLineValue, { color: C.teal }]}>−{usd(data.discount)}</Text>
            </View>
          )}
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

        {/* ── Recurring managed services ───────────────────────────────────── */}
        {data.recurring && (
          <>
            <CCPSection title="Monthly Managed Services" />
            <CCPTable>
              <CCPTableHead columns={['Service', 'Monthly Rate']} widths={[null, 80]} />
              {data.recurring.lines.map((l, i) => (
                <CCPTableRow
                  key={i}
                  alt={i % 2 === 1}
                  widths={[null, 80]}
                  cells={[
                    { value: l.label },
                    { value: usd(l.price), align: 'right', variant: 'highlight' },
                  ]}
                />
              ))}
            </CCPTable>
            <View style={s.totalsBox}>
              <View style={s.totalsLine}>
                <Text style={s.totalsLineLabel}>Commitment</Text>
                <Text style={s.totalsLineValue}>{data.recurring.commitmentLabel}</Text>
              </View>
              <View style={s.totalsLine}>
                <Text style={s.totalsLineLabel}>Annual Total</Text>
                <Text style={s.totalsLineValue}>{usd(data.recurring.annual)}</Text>
              </View>
              <View style={s.totalsGrandRow}>
                <Text style={s.totalsGrandLabel}>Monthly Total</Text>
                <Text style={s.totalsGrandValue}>{usd(data.recurring.monthly)}</Text>
              </View>
            </View>
            <CCPCallout accent="teal" style={{ marginTop: SP[3] }}>
              <Text style={s.bodyText}>
                {'Recurring services are billed on the 1st or 14th of the month. Days between activation and the first billing date are provided as a complimentary onboarding window — no proration applies. Services continue for the full duration of the agreed commitment term. Early termination of an Annual or 2-Year agreement may result in a termination fee equal to the remaining contracted balance. Month-to-Month agreements require 30 days written notice to cancel.'}
              </Text>
            </CCPCallout>
          </>
        )}

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

        {/* ── Client signature ─────────────────────────────────────────────── */}
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

        {/* ── Cafe Con Pan countersignature ────────────────────────────────── */}
        <View style={[s.sigArea, { marginTop: SP[4] }]}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Cafe Con Pan LLC — Authorized Signature</Text>
          </View>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Printed Name & Title</Text>
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
