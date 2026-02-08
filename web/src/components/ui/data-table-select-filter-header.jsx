import { FunnelIcon } from '@heroicons/react/24/outline'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { cn } from 'src/lib/utils'

const normalizeFilterOptions = (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    return []
  }

  return options
    .map((option) => {
      if (typeof option === 'string' || typeof option === 'number') {
        const value = String(option)
        return { value, label: value }
      }

      if (
        option &&
        typeof option === 'object' &&
        Object.prototype.hasOwnProperty.call(option, 'value') &&
        Object.prototype.hasOwnProperty.call(option, 'label')
      ) {
        return {
          value: String(option.value),
          label: String(option.label),
        }
      }

      return null
    })
    .filter(Boolean)
}

const getFacetOptions = (column) => {
  const uniqueValues = column.getFacetedUniqueValues?.()

  if (!uniqueValues || typeof uniqueValues.keys !== 'function') {
    return []
  }

  return Array.from(uniqueValues.keys())
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map((value) => String(value))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }))
}

function DataTableSelectFilterHeader({
  column,
  label,
  options,
  allLabel = 'All',
  className = '',
}) {
  const selectOptions = normalizeFilterOptions(options)
  const resolvedOptions =
    selectOptions.length > 0 ? selectOptions : getFacetOptions(column)
  const selectedValue = String(column.getFilterValue() ?? '')
  const hasFilter = Boolean(selectedValue)

  const filterMenuItemClass = (active) =>
    cn(
      'relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition',
      active
        ? 'bg-white text-[#322e85]'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span>{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Filter ${label}`}
            className={cn(
              'grid h-7 w-7 place-items-center rounded-md text-inherit transition',
              hasFilter ? 'bg-white/20' : 'hover:bg-white/10'
            )}
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <DropdownMenuItem
            onSelect={() => column.setFilterValue(undefined)}
            className={filterMenuItemClass(!selectedValue)}
          >
            {allLabel}
          </DropdownMenuItem>
          {resolvedOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => column.setFilterValue(option.value)}
              className={filterMenuItemClass(selectedValue === option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { DataTableSelectFilterHeader }
