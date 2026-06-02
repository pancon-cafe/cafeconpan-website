/**
 * CCP Technology Audit Report PDF Document
 *
 * Multi-page narrative deliverable: cover → executive summary + scores
 * → detailed findings → recommended roadmap.
 *
 * ── Required prop shape ──────────────────────────────────────────────────────
 * {
 *   reportId:         string,      // 'CCP-AUD-2024-001'
 *   date:             string,      // 'June 1, 2024'
 *   preparedBy:       string,      // 'Jason F. Reyes'
 *   client: {
 *     businessName:   string,
 *     contactName:    string,
 *     email:          string,
 *     phone?:         string,
 *   },
 *   executiveSummary: string,      // 2–4 paragraph narrative
 *   overallScore:     number,      // 0–100
 *   categories: Array<{
 *     name:    string,
 *     score:   number,             // 0–100
 *     status:  'critical'|'warning'|'good'|'excellent',
 *     summary: string,             // 1–2 sentences
 *   }>,
 *   findings: Array<{
 *     id:             string,      // 'F-001'
 *     category:       string,
 *     severity:       'critical'|'high'|'medium'|'low',
 *     finding:        string,
 *     impact:         string,
 *     recommendation: string,
 *     effort:         'Low'|'Medium'|'High',
 *   }>,
 *   roadmap: Array<{
 *     phase: string,               // 'Immediate (0–30 days)'
 *     items: string[],
 *   }>,
 *   opportunities?: Array<{
 *     headline: string,
 *     description: string,
 *   }>,
 * }
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, SP, PAGE } from './tokens';
import {
  CCPPage,
  CCPSection,
  CCPInfoRow,
  CCPDivider,
  CCPCallout,
  CCPHeader,
  CCPFooter,
} from './Shell';
import { CCPTable, CCPTableHead, CCPTableRow } from './Table';
import { registerCCPFonts } from './fonts';

registerCCPFonts();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return C.teal;
  if (score >= 60) return C.beige;
  if (score >= 40) return '#CC7A2A';  // amber
  return C.red;
}

function scoreLabel(score) {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'NEEDS WORK';
  return 'CRITICAL';
}

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

function severityColor(sev) {
  return {
    critical: C.red,
    high:     '#E8854A',
    medium:   C.beige,
    low:      C.teal,
  }[sev] ?? C.cream;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cover Page
// ─────────────────────────────────────────────────────────────────────────────

const coverS = StyleSheet.create({
  page: {
    backgroundColor: C.espresso,
    fontFamily:      F.serif,
    color:           C.cream,
  },
  topBar: {
    paddingHorizontal: PAGE.px,
    paddingTop:        PAGE.px,
    paddingBottom:     SP[4],
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: C.teal,
    borderBottomStyle: 'solid',
  },
  wordmark: {
    fontSize:      16,
    fontWeight:    700,
    color:         C.beige,
    letterSpacing: 2,
  },
  wordmarkSub: {
    fontSize:      F.size.xs,
    color:         C.teal,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop:     3,
  },
  badge: {
    borderWidth:       0.75,
    borderColor:       C.beige,
    borderStyle:       'solid',
    paddingHorizontal: SP[2],
    paddingVertical:   SP[1],
    borderRadius:      2,
  },
  badgeText: {
    fontSize:      F.size.xs,
    color:         C.beige,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  center: {
    flex:              1,
    justifyContent:    'center',
    paddingHorizontal: PAGE.px + SP[8],
    paddingVertical:   SP[12],
  },
  titleLine: {
    fontSize:      F.size['4xl'],
    fontWeight:    700,
    color:         C.beige,
    letterSpacing: 0.5,
    lineHeight:    1.1,
  },
  titleLineWhite: {
    fontSize:      F.size['4xl'],
    fontWeight:    700,
    color:         C.white,
    letterSpacing: 0.5,
    lineHeight:    1.1,
  },
  accentLine: {
    width:           56,
    height:          3,
    backgroundColor: C.teal,
    borderRadius:    2,
    marginTop:       SP[4],
    marginBottom:    SP[4],
  },
  clientName: {
    fontSize:      F.size.xl,
    color:         C.cream,
    letterSpacing: 0.5,
    marginBottom:  SP[1],
  },
  preparedFor: {
    fontSize:      F.size.sm,
    color:         C.muted,
    letterSpacing: 0.3,
  },
  metaBlock: {
    paddingHorizontal: PAGE.px,
    paddingBottom:     PAGE.px,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom:  SP[1] + 2,
  },
  metaLabel: {
    fontSize:      F.size.xs,
    color:         C.muted,
    width:         80,
    letterSpacing: 0.2,
  },
  metaValue: {
    fontSize:      F.size.xs,
    color:         C.cream,
    letterSpacing: 0.2,
    flex:          1,
  },
  confidentialRow: {
    marginTop:     SP[4],
    flexDirection: 'row',
    alignItems:    'center',
  },
  confLine: {
    flex:            1,
    height:          0.5,
    backgroundColor: C.redDim,
  },
  confText: {
    fontSize:         F.size['2xs'],
    color:            C.red,
    letterSpacing:    3,
    marginHorizontal: SP[2],
    textTransform:    'uppercase',
  },
});

function CoverPage({ data }) {
  return (
    <Page size="LETTER" style={coverS.page}>
      {/* Top: wordmark + badge */}
      <View style={coverS.topBar}>
        <View>
          <Text style={coverS.wordmark}>Cafe Con Pan</Text>
          <Text style={coverS.wordmarkSub}>Technology Services</Text>
        </View>
        <View style={coverS.badge}>
          <Text style={coverS.badgeText}>Audit Report</Text>
        </View>
      </View>

      {/* Center: title + client */}
      <View style={coverS.center}>
        <Text style={coverS.titleLine}>Technology</Text>
        <Text style={coverS.titleLine}>Assessment</Text>
        <Text style={coverS.titleLineWhite}>Report</Text>
        <View style={coverS.accentLine} />
        <Text style={coverS.clientName}>{data.client.businessName}</Text>
        <Text style={coverS.preparedFor}>
          Prepared for {data.client.contactName}
        </Text>
      </View>

      {/* Bottom: metadata */}
      <View style={coverS.metaBlock}>
        <View style={coverS.metaRow}>
          <Text style={coverS.metaLabel}>Report ID</Text>
          <Text style={coverS.metaValue}>{data.reportId}</Text>
        </View>
        <View style={coverS.metaRow}>
          <Text style={coverS.metaLabel}>Date</Text>
          <Text style={coverS.metaValue}>{data.date}</Text>
        </View>
        <View style={coverS.metaRow}>
          <Text style={coverS.metaLabel}>Prepared by</Text>
          <Text style={coverS.metaValue}>{data.preparedBy}</Text>
        </View>
        <View style={coverS.metaRow}>
          <Text style={coverS.metaLabel}>Contact</Text>
          <Text style={coverS.metaValue}>jason@pancon.cafe  ·  808-868-6161</Text>
        </View>

        {/* Confidential strip */}
        <View style={coverS.confidentialRow}>
          <View style={coverS.confLine} />
          <Text style={coverS.confText}>Confidential</Text>
          <View style={coverS.confLine} />
        </View>
      </View>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Score Card
// ─────────────────────────────────────────────────────────────────────────────

const cardS = StyleSheet.create({
  card: {
    backgroundColor: C.espCard,
    borderRadius:    3,
    padding:         SP[3],
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
  },
  cardTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   SP[2],
  },
  catName: {
    fontSize:      F.size.sm,
    fontWeight:    700,
    color:         C.beige,
    letterSpacing: 0.3,
    flex:          1,
    marginRight:   SP[2],
  },
  scoreNum: {
    fontSize:      F.size.lg,
    fontWeight:    700,
  },
  scoreSuffix: {
    fontSize:      F.size.xs,
    color:         C.muted,
  },
  barBg: {
    height:          5,
    backgroundColor: C.espresso,
    borderRadius:    3,
    marginBottom:    SP[2],
  },
  barFill: {
    height:       5,
    borderRadius: 3,
  },
  statusRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SP[1],
  },
  statusLabel: {
    fontSize:      F.size['2xs'],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  catSummary: {
    fontSize:      F.size.xs,
    color:         C.muted,
    lineHeight:    1.5,
    letterSpacing: 0.2,
    marginTop:     SP[1],
  },
});

function CategoryCard({ category }) {
  const color = scoreColor(category.score);
  return (
    <View style={[cardS.card, { borderLeftColor: color }]} wrap={false}>
      <View style={cardS.cardTop}>
        <Text style={cardS.catName}>{category.name}</Text>
        <Text style={[cardS.scoreNum, { color }]}>
          {category.score}
          <Text style={cardS.scoreSuffix}>/100</Text>
        </Text>
      </View>
      <View style={cardS.barBg}>
        <View
          style={[
            cardS.barFill,
            { width: `${category.score}%`, backgroundColor: color },
          ]}
        />
      </View>
      <View style={cardS.statusRow}>
        <Text style={[cardS.statusLabel, { color }]}>
          {scoreLabel(category.score)}
        </Text>
      </View>
      <Text style={cardS.catSummary}>{category.summary}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report styles
// ─────────────────────────────────────────────────────────────────────────────

const rs = StyleSheet.create({
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

  // Overall score box
  overallBox: {
    backgroundColor: C.espCard,
    borderRadius:    3,
    padding:         SP[4],
    marginBottom:    SP[4],
    flexDirection:   'row',
    alignItems:      'center',
  },
  overallLeft: {
    flex: 1,
    marginRight: SP[6],
  },
  overallScoreLabel: {
    fontSize:      F.size.xs,
    color:         C.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  SP[1],
  },
  overallScoreNum: {
    fontSize:   F.size['3xl'],
    fontWeight: 700,
  },
  overallScoreMeta: {
    fontSize:      F.size.xs,
    color:         C.muted,
    marginTop:     SP[1],
    letterSpacing: 0.3,
  },
  overallBarBg: {
    height:          10,
    backgroundColor: C.espresso,
    borderRadius:    5,
    width:           160,
  },
  overallBarFill: {
    height:       10,
    borderRadius: 5,
  },

  // Category grid — 2 columns
  catGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  catCol: {
    width: '50%',
  },

  // Findings table columns
  // [ID, Category, Finding, Severity, Effort]
  // handled inline with widths array

  // Roadmap
  phase: {
    marginBottom: SP[4],
  },
  phaseLabel: {
    fontSize:      F.size.sm,
    fontWeight:    700,
    color:         C.teal,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom:  SP[2],
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    marginBottom:  SP[1] + 2,
  },
  phaseArrow: {
    width:         14,
    fontSize:      F.size.xs,
    color:         C.teal,
    marginTop:     1,
  },
  phaseText: {
    flex:          1,
    fontSize:      F.size.xs,
    color:         C.cream,
    lineHeight:    1.5,
    letterSpacing: 0.2,
  },
});

// Findings table columns
const FIND_COLS   = ['ID', 'Category', 'Finding', 'Severity', 'Effort'];
const FIND_WIDTHS = [30, 68, null, 52, 38]; // null = flex:1

// ─────────────────────────────────────────────────────────────────────────────
// Document
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditReportDocument({ data }) {
  const overallColor = scoreColor(data.overallScore);

  // Sort findings by severity (critical first)
  const sortedFindings = [...data.findings].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9)
  );

  return (
    <Document
      title={`Technology Assessment Report — ${data.client.businessName}`}
      author="Cafe Con Pan LLC"
      subject="Technology Assessment"
      creator="pancon.cafe"
    >
      {/* ── Cover (no header/footer — standalone branding page) ─────────────── */}
      <CoverPage data={data} />

      {/* ── Executive Summary + Category Scores ─────────────────────────────── */}
      <CCPPage docType="Audit Report">

        {/* Overall score callout */}
        <CCPSection title="Executive Summary" style={{ marginTop: SP[1] }} />

        <View style={rs.overallBox} wrap={false}>
          <View style={rs.overallLeft}>
            <Text style={rs.overallScoreLabel}>Overall Technology Score</Text>
            <Text style={[rs.overallScoreNum, { color: overallColor }]}>
              {data.overallScore}
              <Text style={{ fontSize: F.size.md, color: C.muted, fontWeight: 400 }}>
                {' '}/ 100
              </Text>
            </Text>
            <Text style={rs.overallScoreMeta}>
              {data.client.businessName}  ·  {data.date}
            </Text>
          </View>
          <View style={rs.overallBarBg}>
            <View
              style={[
                rs.overallBarFill,
                {
                  width:           `${data.overallScore}%`,
                  backgroundColor: overallColor,
                },
              ]}
            />
          </View>
        </View>

        <Text style={rs.bodyText}>{data.executiveSummary}</Text>

        {/* Category score grid */}
        <CCPSection title="Assessment Areas" />

        <View style={rs.catGrid}>
          {data.categories.map((cat, i) => (
            <View
              key={i}
              style={[
                rs.catCol,
                i % 2 === 0 ? { paddingRight: SP[2] } : { paddingLeft: SP[2] },
                { marginBottom: SP[3] },
              ]}
            >
              <CategoryCard category={cat} />
            </View>
          ))}
        </View>
      </CCPPage>

      {/* ── Detailed Findings + Roadmap ───────────────────────────────────────── */}
      <CCPPage docType="Audit Report">

        <CCPSection title="Detailed Findings" style={{ marginTop: SP[1] }} />
        <Text style={[rs.mutedText, { marginBottom: SP[3] }]}>
          Findings are sorted by severity. Severity reflects the risk to business
          continuity, data security, or compliance posture if left unaddressed.
        </Text>

        <CCPTable>
          <CCPTableHead columns={FIND_COLS} widths={FIND_WIDTHS} />
          {sortedFindings.map((f, i) => (
            <CCPTableRow
              key={f.id}
              alt={i % 2 === 1}
              widths={FIND_WIDTHS}
              cells={[
                { value: f.id,       variant: 'muted' },
                { value: f.category, variant: 'muted' },
                { value: f.finding },
                {
                  value:   f.severity.toUpperCase(),
                  variant:
                    f.severity === 'critical' ? 'red' :
                    f.severity === 'high'     ? 'highlight' : 'default',
                },
                { value: f.effort },
              ]}
            />
          ))}
        </CCPTable>

        {/* Recommended roadmap */}
        <CCPSection title="Recommended Roadmap" />
        <Text style={[rs.mutedText, { marginBottom: SP[4] }]}>
          Prioritized implementation plan balancing risk reduction, business
          continuity, and effort. Items within each phase can often run in parallel.
        </Text>

        {data.roadmap.map((phase, i) => (
          <View key={i} style={rs.phase} wrap={false}>
            <Text style={rs.phaseLabel}>{phase.phase}</Text>
            {phase.items.map((item, j) => (
              <View key={j} style={rs.phaseItem}>
                <Text style={rs.phaseArrow}>→</Text>
                <Text style={rs.phaseText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Opportunities */}
        {data.opportunities?.length > 0 && (
          <>
            <CCPSection title="Opportunities" />
            <Text style={[rs.mutedText, { marginBottom: SP[4] }]}>
              The following opportunities are not gaps to fix — they are possibilities
              to explore. Each represents a way technology could help{' '}
              {data.client.businessName} grow, differentiate, or operate better.
            </Text>
            {data.opportunities.map((opp, i) => (
              <View key={i} wrap={false} style={{
                borderLeftWidth: 3, borderLeftColor: C.teal, borderLeftStyle: 'solid',
                backgroundColor: C.espCard, borderRadius: 3,
                padding: SP[3], marginBottom: SP[3],
              }}>
                <Text style={{
                  fontSize: F.size.sm, fontWeight: 700, color: C.teal,
                  letterSpacing: 0.3, marginBottom: SP[1],
                }}>
                  {opp.headline}
                </Text>
                <Text style={rs.mutedText}>{opp.description}</Text>
              </View>
            ))}
          </>
        )}

        {/* Closing callout */}
        <CCPDivider mt={SP[6]} mb={SP[4]} />
        <CCPCallout accent="teal">
          <Text style={rs.bodyText}>
            This report was prepared exclusively for {data.client.businessName} by{' '}
            {data.preparedBy} of Cafe Con Pan LLC. The findings and recommendations
            are based on information gathered during the assessment and are intended
            solely to guide technology strategy decisions for this organization.
            Questions or follow-up? Reach us at jason@pancon.cafe or 808-868-6161.
          </Text>
        </CCPCallout>

      </CCPPage>
    </Document>
  );
}
