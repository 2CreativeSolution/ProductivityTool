import { DataTable } from 'src/components/ui/data-table'
import { cn } from 'src/lib/utils'

const ADMIN_DATA_TABLE_CLASS_NAME =
  '[&_thead_[data-slot=table-row]:hover]:bg-gray-800 [&_thead_[data-slot=table-row]]:border-b-0 [&_thead_[data-slot=table-row]]:bg-gray-900 [&_thead_th]:font-semibold [&_thead_th]:text-white'

function AdminDataTable({ className, ...props }) {
  return (
    <DataTable
      className={cn(ADMIN_DATA_TABLE_CLASS_NAME, className)}
      {...props}
    />
  )
}

export { AdminDataTable, ADMIN_DATA_TABLE_CLASS_NAME }
