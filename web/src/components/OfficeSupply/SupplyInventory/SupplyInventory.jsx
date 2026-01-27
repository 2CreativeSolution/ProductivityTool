import { useState } from 'react'

import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import { Link, routes } from '@redwoodjs/router'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import Header from 'src/components/Header/Header'

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
  mutation UpdateOfficeSupplyFromInventory($id: Int!, $input: UpdateOfficeSupplyInput!) {
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
  const [selectedCategory, setSelectedCategory] = useState('')
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

  const [createSupply] = useMutation(CREATE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply created successfully!')
      refetch()
      setShowForm(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [updateSupply] = useMutation(UPDATE_OFFICE_SUPPLY, {
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

  const filteredSupplies = data?.officeSupplies?.filter((supply) => {
    const matchesSearch =
      supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.category.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      !selectedCategory || supply.category.id.toString() === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(data?.officeSupplies?.map((s) => s.category))]

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
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pt-32">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-lg md:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                  {isAdmin ? 'Supply Management' : 'Office Supplies'}
                </h1>
                <p className="mt-2 text-sm text-gray-600 md:text-base">
                  {isAdmin
                    ? 'Manage inventory and track supply requests'
                    : 'Browse available supplies and make requests'}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
                <Link
                  to={routes.supplyRequests()}
                  className="flex transform items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-700 hover:to-teal-700 hover:shadow-xl md:px-6 md:py-3 md:text-base"
                >
                  <ShoppingCartIcon className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Request Supplies</span>
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex transform items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl md:px-6 md:py-3 md:text-base"
                  >
                    <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Add New Supply</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 flex space-x-1 rounded-xl bg-white/20 p-1">
              <div className="flex-1 rounded-lg bg-white/50 px-2 py-3 text-center text-xs font-medium text-blue-700 md:px-4 md:text-sm">
                📦 Inventory
              </div>
              <Link
                to={routes.supplyRequests()}
                className="flex-1 rounded-lg px-2 py-3 text-center text-xs font-medium text-gray-600 transition-colors hover:bg-white/30 hover:text-gray-800 md:px-4 md:text-sm"
              >
                📝 My Requests
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
              <div className="rounded-xl border border-white/20 bg-white/50 p-3 backdrop-blur-sm md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="mb-2 self-start rounded-lg bg-blue-100 p-2 sm:mb-0 md:p-3">
                    <ChartBarIcon className="h-4 w-4 text-blue-600 md:h-6 md:w-6" />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-gray-600 md:text-sm">
                      Total Supplies
                    </p>
                    <p className="text-lg font-bold text-gray-900 md:text-2xl">
                      {data?.officeSupplies?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/50 p-3 backdrop-blur-sm md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="mb-2 self-start rounded-lg bg-red-100 p-2 sm:mb-0 md:p-3">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600 md:h-6 md:w-6" />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-gray-600 md:text-sm">
                      Low Stock Items
                    </p>
                    <p className="text-lg font-bold text-gray-900 md:text-2xl">
                      {data?.officeSupplies?.filter(
                        (supply) => supply.stockCount < 10
                      )?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/50 p-3 backdrop-blur-sm md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="mb-2 self-start rounded-lg bg-green-100 p-2 sm:mb-0 md:p-3">
                    <ClipboardDocumentListIcon className="h-4 w-4 text-green-600 md:h-6 md:w-6" />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-gray-600 md:text-sm">
                      Categories
                    </p>
                    <p className="text-lg font-bold text-gray-900 md:text-2xl">
                      {categories.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/50 p-3 backdrop-blur-sm md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="mb-2 self-start rounded-lg bg-yellow-100 p-2 sm:mb-0 md:p-3">
                    <ChartBarIcon className="h-4 w-4 text-yellow-600 md:h-6 md:w-6" />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-gray-600 md:text-sm">
                      Total Value
                    </p>
                    <p className="text-lg font-bold text-gray-900 md:text-2xl">
                      $
                      {data?.officeSupplies
                        ?.reduce(
                          (total, supply) =>
                            total + supply.stockCount * (supply.unitPrice || 0),
                          0
                        )
                        .toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-lg md:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search supplies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-4 text-sm backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:text-base"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:text-base"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 md:text-base"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Supply List */}
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-lg">
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
            ) : filteredSupplies?.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <ClipboardDocumentListIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p>No supplies found matching your criteria.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full">
                    <thead className="bg-white/20 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Supply
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Stock Count
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Unit Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Total Value
                        </th>
                        {isAdmin && (
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/20">
                      {filteredSupplies?.map((supply) => (
                        <tr
                          key={supply.id}
                          className="transition-colors duration-200 hover:bg-white/10"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {supply.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {supply.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                              {supply.category.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold">
                              {supply.stockCount}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold">
                              ${supply.unitPrice?.toFixed(2) || '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold">
                              $
                              {(
                                supply.stockCount * (supply.unitPrice || 0)
                              ).toFixed(2)}
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingSupply(supply)
                                    setShowForm(true)
                                  }}
                                  className="rounded-lg p-2 text-green-600 transition-colors duration-200 hover:bg-green-100"
                                  title="Edit Supply"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(supply.id, supply.name)
                                  }
                                  className="rounded-lg p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
                                  title="Delete Supply"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="divide-y divide-gray-200/20 md:hidden">
                  {filteredSupplies?.map((supply) => (
                    <div
                      key={supply.id}
                      className="p-4 transition-colors duration-200 hover:bg-white/10"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {supply.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {supply.description}
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {supply.category.name}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="ml-4 flex space-x-1">
                            <button
                              onClick={() => {
                                setEditingSupply(supply)
                                setShowForm(true)
                              }}
                              className="rounded-lg p-2 text-green-600 transition-colors duration-200 hover:bg-green-100"
                              title="Edit Supply"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(supply.id, supply.name)
                              }
                              className="rounded-lg p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
                              title="Delete Supply"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-4 border-t border-gray-200/20 pt-3">
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Stock
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {supply.stockCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Unit Price
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${supply.unitPrice?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Total Value
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            $
                            {(
                              supply.stockCount * (supply.unitPrice || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SupplyInventory
