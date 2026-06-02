/**
 * CCP PDF — Download Button
 *
 * Drop-in styled button that triggers a PDF download using react-pdf's
 * PDFDownloadLink. Matches the dark-espresso UI aesthetic of the quote builder.
 *
 * Usage — Quote PDF:
 *   import { lazy, Suspense } from 'react';
 *   import { DownloadPDFButton } from './lib/pdf/DownloadButton';
 *
 *   const QuoteDocument = lazy(() => import('./lib/pdf/QuoteDocument'));
 *
 *   function QuoteSummary({ quoteData }) {
 *     return (
 *       <div>
 *         {/* ...existing summary UI... *\/}
 *         <Suspense fallback={null}>
 *           <DownloadPDFButton
 *             doc={<QuoteDocument data={quoteData} />}
 *             filename={`CCP-Quote-${quoteData.quoteNumber}.pdf`}
 *             label="Download Quote PDF"
 *           />
 *         </Suspense>
 *       </div>
 *     );
 *   }
 *
 * Usage — Audit Report PDF:
 *   const AuditReportDocument = lazy(() => import('./lib/pdf/AuditReportDocument'));
 *
 *   <DownloadPDFButton
 *     doc={<AuditReportDocument data={auditData} />}
 *     filename={`CCP-Audit-${auditData.reportId}.pdf`}
 *     label="Download Report"
 *     variant="outline"
 *   />
 *
 * Props:
 *   doc       — React element (the Document component to render as PDF)
 *   filename  — string, e.g. 'CCP-Quote-001.pdf'
 *   label     — button text (default: 'Download PDF')
 *   variant   — 'solid' (default, beige bg) | 'outline' (beige border, transparent bg)
 *   size      — 'sm' | 'md' (default)
 */

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (plain objects — this is React DOM, not react-pdf)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = {
  display:        'flex',
  width:          '100%',
  boxSizing:      'border-box',
  justifyContent: 'center',
  alignItems:     'center',
  gap:            '8px',
  border:         'none',
  borderRadius:   '9px',
  fontFamily:     'Georgia, "Times New Roman", serif',
  fontWeight:     '700',
  letterSpacing:  '0.5px',
  cursor:         'pointer',
  textDecoration: 'none',
  transition:     'all 0.2s ease',
  whiteSpace:     'nowrap',
};

const VARIANTS = {
  solid: {
    default: { ...BASE, backgroundColor: '#D4A97A', color: '#0D0702' },
    hover:   { backgroundColor: '#C49060' },
    loading: { ...BASE, backgroundColor: '#4A3018', color: '#8B7355', cursor: 'not-allowed' },
    error:   { ...BASE, backgroundColor: '#4A1A0E', color: '#B8503E', cursor: 'default' },
  },
  outline: {
    default: {
      ...BASE,
      backgroundColor: 'transparent',
      color:           '#D4A97A',
      border:          '1px solid #D4A97A',
    },
    hover:   { backgroundColor: 'rgba(212,169,122,0.1)' },
    loading: {
      ...BASE,
      backgroundColor: 'transparent',
      color:           '#4A3018',
      border:          '1px solid #2C1A10',
      cursor:          'not-allowed',
    },
    error: {
      ...BASE,
      backgroundColor: 'transparent',
      color:           '#B8503E',
      border:          '1px solid #B8503E',
      cursor:          'default',
    },
  },
};

const SIZES = {
  sm: { padding: '7px 14px', fontSize: '11px' },
  md: { padding: '10px 20px', fontSize: '13px' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function DownloadIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SpinnerIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'ccp-spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes ccp-spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DownloadPDFButton({
  doc,
  filename = 'CCP-Document.pdf',
  label = 'Download PDF',
  variant = 'solid',
  size = 'md',
}) {
  const [hovered, setHovered] = React.useState(false);
  const v = VARIANTS[variant] ?? VARIANTS.solid;
  const sz = SIZES[size] ?? SIZES.md;

  return (
    <PDFDownloadLink document={doc} fileName={filename} style={{ display: 'block', width: '100%' }}>
      {({ loading, error }) => {
        if (error) {
          return (
            <span style={{ ...v.error, ...sz }}>
              ⚠ PDF error — try again
            </span>
          );
        }

        if (loading) {
          return (
            <span style={{ ...v.loading, ...sz }}>
              <SpinnerIcon />
              Preparing PDF…
            </span>
          );
        }

        return (
          <span
            style={{
              ...v.default,
              ...sz,
              ...(hovered ? v.hover : {}),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <DownloadIcon />
            {label}
          </span>
        );
      }}
    </PDFDownloadLink>
  );
}

export default DownloadPDFButton;
