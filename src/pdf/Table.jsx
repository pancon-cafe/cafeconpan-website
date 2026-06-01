/**
 * CCP PDF — Table Components
 *
 * Reusable branded table used in both Quote and Audit Report.
 *
 * Exports:
 *   CCPTable      — outer container
 *   CCPTableHead  — sticky-style header row (repeats on overflow pages via `fixed`)
 *   CCPTableRow   — data row with alternating backgrounds
 *
 * Usage:
 *   <CCPTable>
 *     <CCPTableHead columns={['Service', 'Price']} widths={[null, 80]} />
 *     {items.map((item, i) => (
 *       <CCPTableRow
 *         key={i}
 *         alt={i % 2 === 1}
 *         widths={[null, 80]}
 *         cells={[
 *           { value: item.name },
 *           { value: usd(item.price), align: 'right', variant: 'highlight' },
 *         ]}
 *       />
 *     ))}
 *   </CCPTable>
 *
 * Cell variants: 'default' | 'muted' | 'highlight' | 'red'
 * Cell align:    'left' (default) | 'center' | 'right'
 * widths:        array — each entry is a number (pt), or null for flex: 1
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, SP } from './tokens';

const s = StyleSheet.create({
  table: {
    width: '100%',
  },

  // Header row
  headRow: {
    flexDirection:     'row',
    backgroundColor:   C.espCard,
    borderTopWidth:    0.75,
    borderTopColor:    C.teal,
    borderTopStyle:    'solid',
    borderBottomWidth: 0.5,
    borderBottomColor: C.tealDim,
    borderBottomStyle: 'solid',
    paddingVertical:   SP[2],
    paddingHorizontal: SP[3],
  },
  headCell: {
    fontSize:      F.size.xs,
    fontWeight:    700,
    color:         C.teal,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingRight:  SP[2],
  },

  // Body rows
  bodyRow: {
    flexDirection:     'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.espBorder,
    borderBottomStyle: 'solid',
    paddingVertical:   SP[1] + 3,
    paddingHorizontal: SP[3],
    minHeight:         24,
  },
  bodyRowAlt: {
    backgroundColor: C.espAlt,
  },

  // Cell variants
  cell: {
    fontSize:      F.size.xs,
    color:         C.cream,
    letterSpacing: 0.2,
    paddingRight:  SP[2],
    lineHeight:    1.5,
  },
  cellMuted: {
    color:      C.muted,
  },
  cellHighlight: {
    color:      C.beige,
    fontWeight: 700,
  },
  cellRed: {
    color:      C.red,
    fontWeight: 700,
  },
});

/** Outer table wrapper */
export function CCPTable({ children, style }) {
  return <View style={[s.table, style]}>{children}</View>;
}

/**
 * Table header row.
 * @param {string[]} columns — column labels
 * @param {(number|null)[]} widths — pt widths per column; null = flex:1
 */
export function CCPTableHead({ columns, widths }) {
  return (
    <View style={s.headRow} fixed>
      {columns.map((col, i) => (
        <Text
          key={i}
          style={[
            s.headCell,
            widths?.[i] != null ? { width: widths[i] } : { flex: 1 },
          ]}
        >
          {col}
        </Text>
      ))}
    </View>
  );
}

/**
 * Table data row. Stays together (won't split across pages).
 *
 * @param {Array<{value:string, variant?:string, align?:string}>} cells
 * @param {(number|null)[]} widths
 * @param {boolean}         alt    — use alternating background
 * @param {object}          style  — additional row styles
 */
export function CCPTableRow({ cells, widths, alt = false, style }) {
  return (
    <View style={[s.bodyRow, alt ? s.bodyRowAlt : null, style]} wrap={false}>
      {cells.map((cell, i) => {
        const variantStyle =
          cell.variant === 'muted'     ? s.cellMuted :
          cell.variant === 'highlight' ? s.cellHighlight :
          cell.variant === 'red'       ? s.cellRed : null;

        return (
          <Text
            key={i}
            style={[
              s.cell,
              variantStyle,
              widths?.[i] != null ? { width: widths[i] } : { flex: 1 },
              cell.align === 'right'  ? { textAlign: 'right' }  : null,
              cell.align === 'center' ? { textAlign: 'center' } : null,
            ]}
          >
            {cell.value ?? ''}
          </Text>
        );
      })}
    </View>
  );
}
