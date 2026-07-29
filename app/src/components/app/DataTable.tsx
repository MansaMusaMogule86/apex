/**
 * Data Table — design.md §8.4.
 * 44px rows, 13px text, sticky 40px header (bg-sunken, micro labels),
 * hairline dividers, row hover palm-50, checkbox column, sort carets,
 * selected rows palm-100, pagination footer "1–25 of 248".
 */
import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: ReactNode
  width?: number | string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  /** custom cell renderer; default renders row[key] */
  render?: (row: T, index: number) => ReactNode
  /** value extractor for sorting (defaults to row[key]) */
  sortValue?: (row: T) => string | number
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  /** row click — typically opens a RecordDrawer */
  onRowClick?: (row: T) => void
  selectable?: boolean
  /** filter chips + search + saved views slot (rendered above the table) */
  toolbar?: ReactNode
  /** pagination (controlled). Omit to hide footer. */
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  selectable,
  toolbar,
  page = 1,
  pageSize = 25,
  total,
  onPageChange,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return data
    const get =
      col.sortValue ?? ((row: T) => (row as Record<string, unknown>)[col.key] as string | number)
    return [...data].sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [data, sort, columns])

  const allChecked = sorted.length > 0 && sorted.every((r) => selected.has(rowKey(r)))
  const toggleAll = () => {
    setSelected(allChecked ? new Set<string>() : new Set(sorted.map(rowKey)))
  }
  const toggleOne = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totalCount = total ?? data.length
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(totalCount, page * pageSize)
  const pages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className={cn('overflow-hidden rounded-[10px] border border-line bg-surface', className)}>
      {toolbar && <div className="border-b border-line p-3">{toolbar}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-sunken">
              {selectable && (
                <th className="h-10 w-10 px-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 accent-palm-600"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'h-10 whitespace-nowrap px-3.5 text-micro font-semibold uppercase text-ink-500',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === col.key
                            ? s.dir === 'asc'
                              ? { key: col.key, dir: 'desc' }
                              : null
                            : { key: col.key, dir: 'asc' },
                        )
                      }
                      className="inline-flex items-center gap-1 uppercase tracking-[0.07em] hover:text-ink-900"
                    >
                      {col.header}
                      {sort?.key === col.key ? (
                        sort.dir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 text-ink-400" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const key = rowKey(row)
              const isSelected = selected.has(key)
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'h-11 border-t border-line text-[13px] text-ink-900 transition-colors duration-120',
                    isSelected ? 'bg-palm-100' : 'hover:bg-palm-50',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {selectable && (
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={isSelected}
                        onChange={() => toggleOne(key)}
                        className="h-3.5 w-3.5 accent-palm-600"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3.5 py-2',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render
                        ? col.render(row, i)
                        : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                  {emptyState ?? (
                    <p className="py-12 text-center text-[13px] text-ink-500">No records.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(total !== undefined || onPageChange) && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[12.5px] text-ink-500">
          <span className="tnum">
            {from}–{to} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-sunken disabled:opacity-40"
            >
              Previous
            </button>
            <span className="tnum px-1.5 font-mono text-[12px]">
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => onPageChange?.(page + 1)}
              className="rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-sunken disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
