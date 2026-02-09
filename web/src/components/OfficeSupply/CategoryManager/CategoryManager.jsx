import { useEffect, useState } from 'react'

import {
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import {
  AppDialog,
  AppDialogContent,
  Button,
  Input,
  Label,
  SummaryMetricCard,
  Widget,
} from 'src/components/ui'
import { DialogClose } from 'src/components/ui/dialog'

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
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  })
  const [formError, setFormError] = useState('')
  const { hasRole } = useAuth()

  const isAdmin = hasRole('ADMIN')

  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES)

  const [createCategory] = useMutation(CREATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category created successfully!')
      closeFormModal()
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category updated successfully!')
      closeFormModal()
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
    setFormValues({
      name: category?.name || '',
      description: category?.description || '',
    })
    setFormError('')
    setEditingCategory(category)
    setShowForm(true)
  }

  const closeFormModal = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormValues({ name: '', description: '' })
    setFormError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const name = formValues.name.trim()
    const description = formValues.description.trim()

    if (!name) {
      setFormError('Category name is required.')
      return
    }

    setFormError('')
    onSubmit({
      name,
      description: description || null,
    })
  }

  useEffect(() => {
    if (!isAdmin || openCreateTrigger === 0) {
      return
    }

    setEditingCategory(null)
    setFormValues({ name: '', description: '' })
    setFormError('')
    setShowForm(true)
  }, [isAdmin, openCreateTrigger])

  const totalCategories = data?.officeSupplyCategories?.length || 0
  const totalSupplies =
    data?.officeSupplyCategories?.reduce(
      (total, category) => total + (category.supplies?.length || 0),
      0
    ) || 0
  const averagePerCategory = totalCategories
    ? Math.round(totalSupplies / totalCategories)
    : 0

  return (
    <div className="mx-auto max-w-6xl space-y-8">
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
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryMetricCard
              size="sm"
              title="Total Categories"
              value={totalCategories.toLocaleString('en-US')}
              subtitle="Configured categories"
              icon={<FolderIcon />}
              trend={{ direction: 'neutral', label: 'active' }}
            />

            <SummaryMetricCard
              size="sm"
              title="Total Supplies"
              value={totalSupplies.toLocaleString('en-US')}
              subtitle="Supplies across categories"
              icon={<ClipboardDocumentListIcon />}
              trend={{ direction: 'positive', label: 'tracked' }}
            />

            <SummaryMetricCard
              size="sm"
              title="Average / Category"
              value={averagePerCategory.toLocaleString('en-US')}
              subtitle="Average supplies in each category"
              icon={<ChartBarIcon />}
              trend={{
                direction: 'neutral',
                label: `${totalCategories} cats`,
              }}
            />
          </div>

          {/* Category Form Modal - Admin Only */}
          {isAdmin && (
            <AppDialog
              open={showForm}
              onOpenChange={(open) => !open && closeFormModal()}
            >
              <AppDialogContent
                size="md"
                header
                footer
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                description="Create and maintain office supply categories."
                footerContent={
                  <div className="flex items-center justify-end gap-3">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      form="category-form"
                      variant="primary"
                    >
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                }
              >
                <form
                  id="category-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {formError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {formError}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label
                      htmlFor="category-name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Category Name *
                    </Label>
                    <Input
                      id="category-name"
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className="h-auto w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                      placeholder="Enter category name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category-description"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Description
                    </Label>
                    <textarea
                      id="category-description"
                      value={formValues.description}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter category description..."
                    />
                  </div>
                </form>
              </AppDialogContent>
            </AppDialog>
          )}

          {/* Categories List */}
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
                onClick={() => {
                  setEditingCategory(null)
                  setFormValues({ name: '', description: '' })
                  setFormError('')
                  setShowForm(true)
                }}
                className="mt-4 transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              >
                Create Your First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data?.officeSupplyCategories?.map((category) => (
                <Widget
                  key={category.id}
                  className="bg-white/50 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/60 hover:shadow-lg"
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
                </Widget>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CategoryManager
