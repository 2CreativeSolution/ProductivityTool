import * as React from 'react'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { buttonVariants } from 'src/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'
import { cn } from 'src/lib/utils'

function DataTable({
  columns,
  data,
  emptyMessage = 'No results.',
  className,
  pagination = false,
  pageSizeOptions = [10, 20, 50],
  initialPageSize,
}) {
  const [sorting, setSorting] = React.useState([])
  const defaultPageSize = initialPageSize || pageSizeOptions[0] || 10
  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  const table = useReactTable({
    data: data ?? [],
    columns: columns ?? [],
    state: {
      sorting,
      ...(pagination ? { pagination: paginationState } : {}),
    },
    onSortingChange: setSorting,
    ...(pagination ? { onPaginationChange: setPaginationState } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const currentPageSize =
    table.getState().pagination?.pageSize || defaultPageSize
  const pageCount = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns?.length ?? 1}
                className="h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows per page</span>
            <select
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
              value={currentPageSize}
              onChange={(event) =>
                table.setPageSize(Number(event.target.value))
              }
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Page {pageCount ? table.getState().pagination.pageIndex + 1 : 1}{' '}
              of {Math.max(pageCount, 1)} ({totalRows} rows)
            </span>
            <button
              type="button"
              className={buttonVariants({
                variant: 'primaryOutline',
                size: 'xs',
              })}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              type="button"
              className={buttonVariants({
                variant: 'primaryOutline',
                size: 'xs',
              })}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
