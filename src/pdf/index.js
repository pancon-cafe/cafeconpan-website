/**
 * CCP PDF System — module index
 *
 * Import shell primitives, table, tokens, and the download button from here.
 * Import the heavy Document components with lazy() to keep the initial bundle lean:
 *
 *   import { lazy, Suspense } from 'react';
 *   const QuoteDocument       = lazy(() => import('./lib/pdf/QuoteDocument'));
 *   const AuditReportDocument = lazy(() => import('./lib/pdf/AuditReportDocument'));
 */

// Shell layout components
export {
  CCPPage,
  CCPHeader,
  CCPFooter,
  CCPSection,
  CCPInfoRow,
  CCPDivider,
  CCPCallout,
  CCPBadge,
  CCPColumns,
} from './Shell';

// Table components
export { CCPTable, CCPTableHead, CCPTableRow } from './Table';

// Design tokens
export { C, F, SP, PAGE } from './tokens';

// Font registration (called automatically by Shell.jsx on import,
// but export here for manual use in custom documents)
export { registerCCPFonts } from './fonts';

// Download trigger button (React DOM component, not react-pdf)
export { DownloadPDFButton } from './DownloadButton';
