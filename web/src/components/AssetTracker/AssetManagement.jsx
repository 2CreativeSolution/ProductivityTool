import React, { useState } from 'react'

import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import FileUpload from '../FileUpload/FileUpload'

import AssetAssignmentForm from './AssetAssignmentForm'

const ASSET_CATEGORIES_QUERY = gql`
  query AssetCategoriesQuery {
    assetCategories {
      id
      name
      description
    }
  }
`

const CREATE_ASSET_MUTATION = gql`
  mutation CreateAsset($input: CreateAssetInput!) {
    createAsset(input: $input) {
      id
      assetId
      name
      model
    }
  }
`

const CREATE_ASSET_CATEGORY_MUTATION = gql`
  mutation CreateAssetCategory($input: CreateAssetCategoryInput!) {
    createAssetCategory(input: $input) {
      id
      name
      description
    }
  }
`

const AssetManagement = ({ onAssetCreated }) => {
  const [activeModal, setActiveModal] = useState(null)
  const [newAsset, setNewAsset] = useState({
    assetId: '',
    name: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    purchasePrice: '',
    vendor: '',
    categoryId: '',
    location: '',
    notes: '',
    proofOfPurchase: null,
  })
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  })

  const {
    data: categoriesData,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery(ASSET_CATEGORIES_QUERY)

  const [createAsset, { loading: creatingAsset }] = useMutation(
    CREATE_ASSET_MUTATION,
    {
      onCompleted: (data) => {
        toast.success(`Asset ${data.createAsset.assetId} created successfully`)
        setActiveModal(null)
        setNewAsset({
          assetId: '',
          name: '',
          model: '',
          serialNumber: '',
          purchaseDate: '',
          warrantyExpiry: '',
          purchasePrice: '',
          vendor: '',
          categoryId: '',
          location: '',
          notes: '',
          proofOfPurchase: null,
        })
        onAssetCreated?.()
      },
      onError: (error) => {
        toast.error(`Error creating asset: ${error.message}`)
      },
    }
  )

  const [createCategory, { loading: creatingCategory }] = useMutation(
    CREATE_ASSET_CATEGORY_MUTATION,
    {
      onCompleted: (data) => {
        toast.success(
          `Category "${data.createAssetCategory.name}" created successfully`
        )
        setActiveModal(null)
        setNewCategory({ name: '', description: '' })
        refetchCategories()
      },
      onError: (error) => {
        toast.error(`Error creating category: ${error.message}`)
      },
    }
  )

  const handleCreateAsset = async (e) => {
    e.preventDefault()

    const input = {
      ...newAsset,
      categoryId: parseInt(newAsset.categoryId),
      purchaseDate: new Date(newAsset.purchaseDate).toISOString(),
      purchasePrice: newAsset.purchasePrice
        ? parseFloat(newAsset.purchasePrice)
        : null,
      warrantyExpiry: newAsset.warrantyExpiry
        ? new Date(newAsset.warrantyExpiry).toISOString()
        : null,
    }

    // Handle proof of purchase file
    if (newAsset.proofOfPurchase) {
      input.proofOfPurchaseUrl = newAsset.proofOfPurchase.dataUrl
      input.proofOfPurchaseType = newAsset.proofOfPurchase.fileType
      input.proofOfPurchaseFileName = newAsset.proofOfPurchase.fileName
    }

    // Remove empty strings and proofOfPurchase object
    Object.keys(input).forEach((key) => {
      if (input[key] === '' || key === 'proofOfPurchase') {
        if (key === 'proofOfPurchase') {
          delete input[key]
        } else {
          input[key] = null
        }
      }
    })

    try {
      await createAsset({ variables: { input } })
    } catch (error) {
      console.error('Error creating asset:', error)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()

    if (!newCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      await createCategory({
        variables: {
          input: {
            name: newCategory.name.trim(),
            description: newCategory.description.trim() || null,
          },
        },
      })
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveModal('asset')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Asset
        </button>
        <button
          onClick={() => setActiveModal('category')}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Category
        </button>
        <button
          onClick={() => setActiveModal('assign')}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Assign Asset
        </button>
      </div>

      {/* Add Asset Modal */}
      {activeModal === 'asset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Asset
              </h3>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Asset ID *
                  </label>
                  <input
                    type="text"
                    value={newAsset.assetId}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, assetId: e.target.value })
                    }
                    placeholder="e.g., LP001, MON001"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={newAsset.categoryId}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, categoryId: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category...</option>
                    {categoriesData?.assetCategories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    value={newAsset.name}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, name: e.target.value })
                    }
                    placeholder="e.g., MacBook Pro 16-inch"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={newAsset.model}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, model: e.target.value })
                    }
                    placeholder="e.g., A2338"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={newAsset.serialNumber}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, serialNumber: e.target.value })
                    }
                    placeholder="e.g., C02Z91234567"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={newAsset.vendor}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, vendor: e.target.value })
                    }
                    placeholder="e.g., Apple Inc."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={newAsset.purchaseDate}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, purchaseDate: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    value={newAsset.warrantyExpiry}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        warrantyExpiry: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAsset.purchasePrice}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        purchasePrice: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newAsset.location}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, location: e.target.value })
                    }
                    placeholder="e.g., IT Storage Room"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={newAsset.notes}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, notes: e.target.value })
                  }
                  placeholder="Any additional notes about this asset..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Proof of Purchase Upload */}
              <div>
                <FileUpload
                  onFileSelect={(file) =>
                    setNewAsset({ ...newAsset, proofOfPurchase: file })
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  maxSize={5 * 1024 * 1024}
                  label="Proof of Purchase"
                  description="Upload receipt, invoice, or purchase order (PDF, JPG, PNG up to 5MB)"
                  currentFile={newAsset.proofOfPurchase}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAsset}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {creatingAsset ? 'Creating...' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {activeModal === 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Asset Category
              </h3>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="e.g., Laptop, Monitor, Phone"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this category..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {creatingCategory ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Assignment Modal */}
      {activeModal === 'assign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign Asset to Employee
              </h3>
            </div>

            <div className="p-6">
              <AssetAssignmentForm
                onSuccess={() => {
                  setActiveModal(null)
                  onAssetCreated?.()
                }}
              />
            </div>

            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetManagement
