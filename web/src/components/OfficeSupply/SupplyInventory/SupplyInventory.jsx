import { useState } from 'react'

import {
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import {
  AdminDataTable,
  DataTableSelectFilterHeader,
  Pill,
  SummaryMetricCard,
} from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'

import OfficeSupplyForm from '../OfficeSupplyForm/OfficeSupplyForm'

const GET_OFFICE_SUPPLIES = gql`
  query GetOfficeSuppliesForInventory {
    officeSupplies {
      id
      name
      description
      stockCount
      unitPrice
      createdAt
      updatedAt
      category {
        id
        name
      }
    }
  }
`

const DELETE_OFFICE_SUPPLY = gql`
  mutation DeleteOfficeSupply($id: Int!) {
    deleteOfficeSupply(id: $id) {
      id
    }
  }
`

const CREATE_OFFICE_SUPPLY = gql`
  mutation CreateOfficeSupplyFromInventory($input: CreateOfficeSupplyInput!) {
    createOfficeSupply(input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      categoryId
    }
  }
`

const UPDATE_OFFICE_SUPPLY = gql`
  mutation UpdateOfficeSupplyFromInventory(
    $id: Int!
    $input: UpdateOfficeSupplyInput!
  ) {
    updateOfficeSupply(id: $id, input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      categoryId
    }
  }
`

const SupplyInventory = () => {
  const { hasRole } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupply, setEditingSupply] = useState(null)

  const isAdmin = hasRole && hasRole('ADMIN')

  const { data, loading, error, refetch } = useQuery(GET_OFFICE_SUPPLIES)

  const [deleteSupply] = useMutation(DELETE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply deleted successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [_createSupply] = useMutation(CREATE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply created successfully!')
      refetch()
      setShowForm(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [_updateSupply] = useMutation(UPDATE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply updated successfully!')
      refetch()
      setEditingSupply(null)
      setShowForm(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      await deleteSupply({ variables: { id } })
    }
  }

  // Replace double-mutation: the form performs create/update itself and calls onSave afterwards.
  const handleFormSave = () => {
    refetch()
    setEditingSupply(null)
    setShowForm(false)
  }

  const filteredSupplies = (data?.officeSupplies ?? []).filter((supply) => {
    const matchesSearch =
      supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const allSupplies = data?.officeSupplies ?? []
  const lowStockThreshold = 10
  const categoryCount = new Set(
    allSupplies.map((supply) => supply.category?.id).filter(Boolean)
  ).size
  const lowStockCount = allSupplies.filter(
    (supply) => supply.stockCount < lowStockThreshold
  ).length
  const totalInventoryValue = allSupplies.reduce(
    (total, supply) => total + supply.stockCount * (supply.unitPrice || 0),
    0
  )
  const lowStockRate = allSupplies.length
    ? Math.round((lowStockCount / allSupplies.length) * 100)
    : 0
  const supplyActionTextClass =
    'text-[11px] font-semibold uppercase tracking-wide text-[#322e85] transition hover:text-[#2b2773]'
  const supplyTableColumns = [
    {
      accessorKey: 'name',
      header: 'Supply',
      cell: ({ row }) => {
        const supply = row.original

        return (
          <div>
            <div className="font-semibold text-gray-900">{supply.name}</div>
            <div className="text-sm text-gray-600">{supply.description}</div>
          </div>
        )
      },
    },
    {
      accessorFn: (row) => row.category?.name || 'Uncategorized',
      id: 'category',
      header: ({ column }) => (
        <DataTableSelectFilterHeader
          column={column}
          label="Category"
          allLabel="All"
        />
      ),
      filterFn: (row, id, value) => row.getValue(id) === value,
      cell: ({ row }) => (
        <Pill variant="brand" size="sm" className="uppercase tracking-wide">
          {row.original.category?.name || 'Uncategorized'}
        </Pill>
      ),
    },
    {
      accessorKey: 'stockCount',
      header: 'Stock Count',
      cell: ({ row }) => (
        <div className="w-full text-right font-semibold">
          {row.original.stockCount}
        </div>
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => (
        <div className="w-full text-right font-semibold">
          ${row.original.unitPrice?.toFixed(2) || '0.00'}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.stockCount * (row.unitPrice || 0),
      id: 'totalValue',
      header: 'Total Value',
      cell: ({ row }) => (
        <div className="w-full text-right font-semibold">
          $
          {(row.original.stockCount * (row.original.unitPrice || 0)).toFixed(2)}
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            enableSorting: false,
            cell: ({ row }) => {
              const supply = row.original

              return (
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSupply(supply)
                      setShowForm(true)
                    }}
                    className={supplyActionTextClass}
                    title="Edit Supply"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(supply.id, supply.name)}
                    className="rounded-lg p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
                    title="Delete Supply"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )
            },
          },
        ]
      : []),
  ]

  if (showForm && isAdmin) {
    return (
      <OfficeSupplyForm
        supply={editingSupply}
        onSave={handleFormSave}
        onCancel={() => {
          setShowForm(false)
          setEditingSupply(null)
        }}
      />
    )
  }

  return (
    <>
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title={isAdmin ? 'Supply Management' : 'Office Supplies'}
          description={
            isAdmin
              ? 'Manage inventory and track supply requests'
              : 'Browse available supplies and make requests'
          }
        >
          <Input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by supply, description, or category"
            aria-label="Search supplies"
            className="h-9 w-72 border-slate-300 bg-white"
          />
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Add New Supply
            </button>
          )}
        </PageHeader>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <SummaryMetricCard
            size="sm"
            title="Total Supplies"
            value={allSupplies.length.toLocaleString('en-US')}
            subtitle="Items in inventory"
            icon={<ChartBarIcon />}
            trend={{ direction: 'neutral', label: `${categoryCount} cats` }}
          />

          <SummaryMetricCard
            size="sm"
            title="Low Stock Items"
            value={lowStockCount.toLocaleString('en-US')}
            subtitle={`Below ${lowStockThreshold} units`}
            icon={<ExclamationTriangleIcon />}
            trend={{
              direction: lowStockCount > 0 ? 'negative' : 'positive',
              label: `${lowStockRate}%`,
            }}
          />

          <SummaryMetricCard
            size="sm"
            title="Categories"
            value={categoryCount.toLocaleString('en-US')}
            subtitle="Tracked categories"
            icon={<ClipboardDocumentListIcon />}
            trend={{ direction: 'neutral', label: 'active' }}
          />

          <SummaryMetricCard
            size="sm"
            title="Total Value"
            value={`$${totalInventoryValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            subtitle="Estimated inventory value"
            icon={<CurrencyDollarIcon />}
            trend={{ direction: 'positive', label: 'current' }}
          />
        </div>

        {/* Supply List */}
        <div className="overflow-hidden rounded-md border bg-white">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading supplies...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12" />
              <p>Error loading supplies: {error.message}</p>
            </div>
          ) : (
            <AdminDataTable
              columns={supplyTableColumns}
              data={filteredSupplies}
              pagination
              pageSizeOptions={[10, 20, 50, 100]}
              initialPageSize={10}
            />
          )}
        </div>
      </AppContentShell>
    </>
  )
}

export default SupplyInventory
