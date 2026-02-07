import { useEffect, useState } from 'react'

import {
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'

const GET_CATEGORIES = gql`
  query GetOfficeSupplyCategoriesForManager {
    officeSupplyCategories {
      id
      name
      description
      supplies {
        id
        name
        stockCount
      }
    }
  }
`

const CREATE_CATEGORY = gql`
  mutation CreateOfficeSupplyCategory(
    $input: CreateOfficeSupplyCategoryInput!
  ) {
    createOfficeSupplyCategory(input: $input) {
      id
      name
      description
    }
  }
`

const UPDATE_CATEGORY = gql`
  mutation UpdateOfficeSupplyCategory(
    $id: Int!
    $input: UpdateOfficeSupplyCategoryInput!
  ) {
    updateOfficeSupplyCategory(id: $id, input: $input) {
      id
      name
      description
    }
  }
`

const DELETE_CATEGORY = gql`
  mutation DeleteOfficeSupplyCategory($id: Int!) {
    deleteOfficeSupplyCategory(id: $id) {
      id
    }
  }
`

const CategoryManager = ({ openCreateTrigger = 0 }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const { hasRole } = useAuth()

  const isAdmin = hasRole('ADMIN')

  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES)

  const [createCategory] = useMutation(CREATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category created successfully!')
      setShowForm(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category updated successfully!')
      setShowForm(false)
      setEditingCategory(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category deleted successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data) => {
    if (editingCategory) {
      updateCategory({ variables: { id: editingCategory.id, input: data } })
    } else {
      createCategory({ variables: { input: data } })
    }
  }

  const handleDelete = async (category) => {
    if (category.supplies && category.supplies.length > 0) {
      toast.error(
        'Cannot delete category with existing supplies. Move or delete supplies first.'
      )
      return
    }

    if (
      window.confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      await deleteCategory({ variables: { id: category.id } })
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  useEffect(() => {
    if (!isAdmin || openCreateTrigger === 0) {
      return
    }

    setEditingCategory(null)
    setShowForm(true)
  }, [isAdmin, openCreateTrigger])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Loading State */}
        {loading && (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="mr-3 h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Error Loading Categories
                </h3>
                <p className="text-red-600">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Non-Admin Notice */}
        {!loading && !error && !isAdmin && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="mr-3 h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  View Only Access
                </h3>
                <p className="text-yellow-700">
                  You can view supply categories, but admin privileges are
                  required to add, edit, or delete categories. Contact your
                  administrator for access.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-blue-100 p-3">
                      <FolderIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Categories
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.officeSupplyCategories?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-green-100 p-3">
                      <FolderIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Supplies
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.officeSupplyCategories?.reduce(
                          (total, cat) => total + (cat.supplies?.length || 0),
                          0
                        ) || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="rounded-lg bg-purple-100 p-3">
                      <FolderIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Average per Category
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.officeSupplyCategories?.length
                          ? Math.round(
                              data.officeSupplyCategories.reduce(
                                (total, cat) =>
                                  total + (cat.supplies?.length || 0),
                                0
                              ) / data.officeSupplyCategories.length
                            )
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Form Modal - Admin Only */}
            {showForm && isAdmin && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
                  <h3 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>

                  <Form onSubmit={onSubmit} className="space-y-6">
                    <FormError
                      error={null}
                      wrapperClassName="rw-form-error-wrapper"
                      titleClassName="rw-form-error-title"
                      listClassName="rw-form-error-list"
                    />

                    {/* Category Name */}
                    <div className="space-y-2">
                      <Label
                        name="name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Category Name *
                      </Label>
                      <TextField
                        name="name"
                        defaultValue={editingCategory?.name}
                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name"
                        validation={{ required: true }}
                      />
                      <FieldError
                        name="name"
                        className="text-sm text-red-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        name="description"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Description
                      </Label>
                      <TextAreaField
                        name="description"
                        defaultValue={editingCategory?.description}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter category description..."
                      />
                      <FieldError
                        name="description"
                        className="text-sm text-red-500"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false)
                          setEditingCategory(null)
                        }}
                        className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <Submit className="transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
                        {editingCategory
                          ? 'Update Category'
                          : 'Create Category'}
                      </Submit>
                    </div>
                  </Form>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-lg">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading categories...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">
                  <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12" />
                  <p>Error loading categories: {error.message}</p>
                </div>
              ) : data?.officeSupplyCategories?.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <FolderIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p>No categories found.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                  >
                    Create Your First Category
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                  {data?.officeSupplyCategories?.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-xl border border-white/20 bg-white/50 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/60 hover:shadow-lg"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 rounded-lg bg-blue-100 p-3">
                            <FolderIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {category.supplies?.length || 0} supplies
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="rounded-lg p-2 text-green-600 transition-colors duration-200 hover:bg-green-100"
                              title="Edit Category"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="rounded-lg p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
                              title="Delete Category"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {!isAdmin && (
                          <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                            View Only
                          </div>
                        )}
                      </div>

                      {category.description && (
                        <p className="mb-4 text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}

                      {category.supplies && category.supplies.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-gray-700">
                            Recent Supplies:
                          </p>
                          <div className="space-y-1">
                            {category.supplies.slice(0, 3).map((supply) => (
                              <div
                                key={supply.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="truncate text-gray-700">
                                  {supply.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {supply.stockCount} in stock
                                </span>
                              </div>
                            ))}
                            {category.supplies.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{category.supplies.length - 3} more supplies...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CategoryManager
