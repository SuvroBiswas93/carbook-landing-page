import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render: (item: T) => ReactNode
  className?: string
  mobileHidden?: boolean
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  idKey: keyof T
  emptyMessage?: string
  minWidth?: string
  rowClassName?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  idKey,
  emptyMessage = 'No data.',
  minWidth = 'min-w-150',
  rowClassName = '',
}: ResponsiveTableProps<T>) {
  const mobileColumns = columns.filter((column) => !column.mobileHidden)

  if (data.length === 0) {
    return <p className="p-8 text-center text-[#8c8378]">{emptyMessage}</p>
  }

  return (
    <>
      <table className={`hidden w-full ${minWidth} text-left text-sm xl:table`}>
        <thead className="border-b border-[#e7e0d5] text-xs uppercase tracking-wider text-[#a49b8f]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`p-5 ${column.className ?? ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={String(item[idKey])}
              className={`border-b border-[#f0ebe3] last:border-0 ${rowClassName}`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`p-5 ${column.className ?? ''}`}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-[#f0ebe3] xl:hidden">
        {data.map((item) => (
          <li key={String(item[idKey])} className="space-y-3 p-4 sm:p-5">
            {mobileColumns.map((column) => (
              <div
                key={column.key}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[#a49b8f]">
                  {column.label}
                </span>
                <span className="min-w-0 break-words text-right text-sm text-[#282622]">
                  {column.render(item)}
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}