import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';

/**
 * Sort direction constants
 * @enum {string}
 */
const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
  NONE: 'none',
};

/**
 * Sort indicator icon component
 * @param {Object} props
 * @param {string} props.direction - Current sort direction
 * @returns {React.ReactElement}
 */
function SortIcon({ direction }) {
  if (direction === SORT_DIRECTIONS.ASC) {
    return (
      <svg className="w-3.5 h-3.5 text-accent-blue" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    );
  }

  if (direction === SORT_DIRECTIONS.DESC) {
    return (
      <svg className="w-3.5 h-3.5 text-accent-blue" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }

  return (
    <svg className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

SortIcon.propTypes = {
  direction: PropTypes.string.isRequired,
};

/**
 * Resolves the display value for a cell
 * @param {*} value - The raw cell value
 * @param {Object} column - The column definition
 * @param {Object} row - The full row data
 * @returns {React.ReactNode} The rendered cell content
 */
function resolveCellValue(value, column, row) {
  if (typeof column.render === 'function') {
    return column.render(value, row);
  }

  if (value === null || value === undefined) {
    return <span className="text-slate-500">—</span>;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

/**
 * Compares two values for sorting
 * @param {*} a - First value
 * @param {*} b - Second value
 * @param {string} direction - Sort direction
 * @returns {number} Comparison result
 */
function compareValues(a, b, direction) {
  const multiplier = direction === SORT_DIRECTIONS.ASC ? 1 : -1;

  if (a === null || a === undefined) return 1 * multiplier;
  if (b === null || b === undefined) return -1 * multiplier;

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier;
  }

  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();

  if (strA < strB) return -1 * multiplier;
  if (strA > strB) return 1 * multiplier;
  return 0;
}

/**
 * Desktop table header component
 * @param {Object} props
 * @param {Array<Object>} props.columns - Column definitions
 * @param {string|null} props.sortKey - Current sort column key
 * @param {string} props.sortDirection - Current sort direction
 * @param {boolean} props.sortable - Whether sorting is enabled
 * @param {function} props.onSort - Sort handler
 * @returns {React.ReactElement}
 */
function TableHeader({ columns, sortKey, sortDirection, sortable, onSort }) {
  return (
    <thead>
      <tr className="border-b border-white/10">
        {columns.map((column) => {
          const isSorted = sortKey === column.key;
          const currentDirection = isSorted ? sortDirection : SORT_DIRECTIONS.NONE;
          const isColumnSortable = sortable && column.sortable !== false;

          return (
            <th
              key={column.key}
              className={classNames(
                'px-4 py-3',
                'text-left text-xs font-semibold uppercase tracking-wider',
                'text-slate-400',
                isColumnSortable ? 'cursor-pointer select-none group' : '',
                column.headerClassName
              )}
              style={column.width ? { width: column.width } : undefined}
              onClick={isColumnSortable ? () => onSort(column.key) : undefined}
              aria-sort={
                isSorted
                  ? sortDirection === SORT_DIRECTIONS.ASC
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              <div className="flex items-center gap-1.5">
                <span>{column.label || column.key}</span>
                {isColumnSortable && (
                  <SortIcon direction={currentDirection} />
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

TableHeader.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      headerClassName: PropTypes.string,
    })
  ).isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string.isRequired,
  sortable: PropTypes.bool.isRequired,
  onSort: PropTypes.func.isRequired,
};

/**
 * Desktop table row component
 * @param {Object} props
 * @param {Object} props.row - Row data object
 * @param {Array<Object>} props.columns - Column definitions
 * @param {number} props.index - Row index
 * @param {function} [props.onRowClick] - Row click handler
 * @returns {React.ReactElement}
 */
function TableRow({ row, columns, index, onRowClick }) {
  const isEven = index % 2 === 0;
  const isClickable = typeof onRowClick === 'function';

  const handleClick = () => {
    if (isClickable) {
      onRowClick(row, index);
    }
  };

  const handleKeyDown = (event) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onRowClick(row, index);
    }
  };

  return (
    <tr
      className={classNames(
        'border-b border-white/5',
        'transition-all duration-300 ease-in-out',
        isEven ? 'bg-secondary-500/10' : 'bg-transparent',
        'hover:bg-accent-blue/5',
        isClickable ? 'cursor-pointer' : ''
      )}
      onClick={handleClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
    >
      {columns.map((column) => {
        const value = row[column.key];
        return (
          <td
            key={column.key}
            className={classNames(
              'px-4 py-3',
              'text-sm text-slate-200',
              column.cellClassName
            )}
          >
            {resolveCellValue(value, column, row)}
          </td>
        );
      })}
    </tr>
  );
}

TableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      render: PropTypes.func,
      cellClassName: PropTypes.string,
    })
  ).isRequired,
  index: PropTypes.number.isRequired,
  onRowClick: PropTypes.func,
};

/**
 * Tablet/mobile stacked card layout for a single row
 * @param {Object} props
 * @param {Object} props.row - Row data object
 * @param {Array<Object>} props.columns - Column definitions
 * @param {number} props.index - Row index
 * @param {function} [props.onRowClick] - Row click handler
 * @returns {React.ReactElement}
 */
function StackedCard({ row, columns, index, onRowClick }) {
  const isEven = index % 2 === 0;
  const isClickable = typeof onRowClick === 'function';

  const handleClick = () => {
    if (isClickable) {
      onRowClick(row, index);
    }
  };

  const handleKeyDown = (event) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onRowClick(row, index);
    }
  };

  return (
    <div
      className={classNames(
        'rounded-xl p-4',
        'border border-white/5',
        'transition-all duration-300 ease-in-out',
        isEven ? 'bg-secondary-500/20' : 'bg-secondary-500/10',
        'hover:bg-accent-blue/5',
        'hover:border-white/10',
        isClickable ? 'cursor-pointer' : ''
      )}
      onClick={handleClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
    >
      <div className="space-y-2">
        {columns.map((column) => {
          const value = row[column.key];
          return (
            <div key={column.key} className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex-shrink-0 pt-0.5">
                {column.label || column.key}
              </span>
              <span className="text-sm text-slate-200 text-right">
                {resolveCellValue(value, column, row)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StackedCard.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  index: PropTypes.number.isRequired,
  onRowClick: PropTypes.func,
};

/**
 * Empty state component when no data is available
 * @returns {React.ReactElement}
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg
        className="w-12 h-12 text-slate-500 mb-4"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-slate-400 font-medium">No data available</p>
      <p className="text-xs text-slate-500 mt-1">Try adjusting your query or filters</p>
    </div>
  );
}

/**
 * Responsive data table component with zebra striping per design system.
 * Desktop: full table layout. Tablet: stacked card layout. Mobile: horizontal scroll.
 * Supports sortable columns, row click handlers, and custom cell renderers.
 *
 * @param {Object} props
 * @param {Array<Object>} props.columns - Column definitions array, each with:
 *   - {string} key - Data key for the column
 *   - {string} [label] - Display label for the column header
 *   - {boolean} [sortable=true] - Whether the column is sortable (when table sortable is true)
 *   - {string} [width] - CSS width for the column
 *   - {function} [render] - Custom render function (value, row) => ReactNode
 *   - {string} [headerClassName] - Additional class names for the header cell
 *   - {string} [cellClassName] - Additional class names for body cells
 * @param {Array<Object>} props.data - Array of row data objects
 * @param {function} [props.onRowClick] - Callback when a row is clicked, receives (row, index)
 * @param {boolean} [props.sortable=false] - Whether columns are sortable
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The data table component
 */
export function DataTable({ columns, data, onRowClick, sortable = false, className }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.NONE);

  /**
   * Handles column sort toggling
   * @param {string} key - The column key to sort by
   */
  const handleSort = useCallback((key) => {
    if (!sortable) return;

    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDirection(SORT_DIRECTIONS.ASC);
        return key;
      }
      return key;
    });

    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDirection) => {
          if (prevDirection === SORT_DIRECTIONS.NONE) return SORT_DIRECTIONS.ASC;
          if (prevDirection === SORT_DIRECTIONS.ASC) return SORT_DIRECTIONS.DESC;
          return SORT_DIRECTIONS.NONE;
        });
      }
      return key;
    });
  }, [sortable]);

  /**
   * Sorted data based on current sort state
   */
  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    if (!sortable || !sortKey || sortDirection === SORT_DIRECTIONS.NONE) {
      return [...data];
    }

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return compareValues(aVal, bVal, sortDirection);
    });
  }, [data, sortable, sortKey, sortDirection]);

  const validColumns = useMemo(() => {
    if (!Array.isArray(columns)) return [];
    return columns.filter(
      (col) => col && typeof col === 'object' && col.key && typeof col.key === 'string'
    );
  }, [columns]);

  if (validColumns.length === 0) {
    return null;
  }

  const hasData = sortedData.length > 0;

  return (
    <div
      className={classNames('w-full', className)}
      role="region"
      aria-label="Data table"
    >
      {/* Desktop: Full table layout (hidden below lg) */}
      <div className="hidden lg:block">
        <div
          className={classNames(
            'glass-card overflow-hidden',
            'border border-white/5'
          )}
        >
          {hasData ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <TableHeader
                  columns={validColumns}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  sortable={sortable}
                  onSort={handleSort}
                />
                <tbody>
                  {sortedData.map((row, index) => (
                    <TableRow
                      key={row.id || `row-${index}`}
                      row={row}
                      columns={validColumns}
                      index={index}
                      onRowClick={onRowClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Tablet: Stacked card layout (hidden below sm and above lg) */}
      <div className="hidden sm:block lg:hidden">
        {hasData ? (
          <div className="space-y-3">
            {sortedData.map((row, index) => (
              <div
                key={row.id || `card-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <StackedCard
                  row={row}
                  columns={validColumns}
                  index={index}
                  onRowClick={onRowClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card">
            <EmptyState />
          </div>
        )}
      </div>

      {/* Mobile: Horizontal scroll table (hidden above sm) */}
      <div className="block sm:hidden">
        {hasData ? (
          <div
            className={classNames(
              'glass-card overflow-hidden',
              'border border-white/5'
            )}
          >
            <div className="overflow-x-auto -mx-0 no-scrollbar">
              <table className="w-full min-w-[600px]">
                <TableHeader
                  columns={validColumns}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  sortable={sortable}
                  onSort={handleSort}
                />
                <tbody>
                  {sortedData.map((row, index) => (
                    <TableRow
                      key={row.id || `mobile-row-${index}`}
                      row={row}
                      columns={validColumns}
                      index={index}
                      onRowClick={onRowClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center py-2 border-t border-white/5">
              <span className="text-xs text-slate-500">← Scroll to see more →</span>
            </div>
          </div>
        ) : (
          <div className="glass-card">
            <EmptyState />
          </div>
        )}
      </div>

      {/* Row count footer */}
      {hasData && (
        <div className="mt-3 px-1">
          <span className="text-xs text-slate-500 tabular-nums">
            {sortedData.length} {sortedData.length === 1 ? 'row' : 'rows'}
          </span>
        </div>
      )}
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      render: PropTypes.func,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  className: PropTypes.string,
};

export default DataTable;