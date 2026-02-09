import React, { useState } from 'react'

import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  AppDialog,
  AppDialogContent,
  Button,
  buttonVariants,
} from 'src/components/ui'

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

const ACTION_KEYS = {
  ASSET: 'asset',
  CATEGORY: 'category',
  ASSIGN: 'assign',
}

const DEFAULT_VISIBLE_ACTIONS = [
  ACTION_KEYS.ASSET,
  ACTION_KEYS.CATEGORY,
  ACTION_KEYS.ASSIGN,
]

const MANAGEMENT_BUTTON_STYLES = {
  [ACTION_KEYS.ASSET]:
    'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
  [ACTION_KEYS.CATEGORY]:
    'rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500',
  [ACTION_KEYS.ASSIGN]:
    'rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500',
}

const DEFAULT_ACTION_LABELS = {
  [ACTION_KEYS.ASSET]: 'Add New Asset',
  [ACTION_KEYS.CATEGORY]: 'Add Category',
  [ACTION_KEYS.ASSIGN]: 'Assign Asset',
}

const HEADER_ACTION_LABELS = {
  [ACTION_KEYS.ASSET]: 'Add Asset',
  [ACTION_KEYS.CATEGORY]: 'Manage Categories',
  [ACTION_KEYS.ASSIGN]: 'Assign Asset',
}

const ASSIGN_ASSET_FORM_ID = 'assign-asset-modal-form'
const ADD_ASSET_FORM_ID = 'add-asset-modal-form'
const ADD_CATEGORY_FORM_ID = 'add-category-modal-form'
const DEFAULT_ASSIGN_FORM_STATE = {
  canSubmit: false,
  submitting: false,
}

const AssetManagement = ({
  onAssetCreated,
  visibleActions = DEFAULT_VISIBLE_ACTIONS,
  actionLabels = DEFAULT_ACTION_LABELS,
  useHeaderActionStyles = false,
  headerActionVariant = 'secondary',
  headerActionSize = 'sm',
}) => {
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
  const [assignFormState, setAssignFormState] = useState(
    DEFAULT_ASSIGN_FORM_STATE
  )

  const { data: categoriesData, refetch: refetchCategories } = useQuery(
    ASSET_CATEGORIES_QUERY
  )

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
        onAssetCreated?.()
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

  const enabledActions = DEFAULT_VISIBLE_ACTIONS.filter((actionKey) =>
    visibleActions.includes(actionKey)
  )

  const getActionLabel = (actionKey) => {
    if (actionLabels?.[actionKey]) return actionLabels[actionKey]
    return useHeaderActionStyles
      ? HEADER_ACTION_LABELS[actionKey]
      : DEFAULT_ACTION_LABELS[actionKey]
  }

  const getActionButtonClassName = (actionKey) => {
    if (useHeaderActionStyles) {
      return buttonVariants({
        variant: headerActionVariant,
        size: headerActionSize,
      })
    }

    return MANAGEMENT_BUTTON_STYLES[actionKey]
  }

  const openActionModal = (actionKey) => {
    if (actionKey === ACTION_KEYS.ASSIGN) {
      setAssignFormState(DEFAULT_ASSIGN_FORM_STATE)
    }
    setActiveModal(actionKey)
  }

  const closeAssignModal = () => {
    setActiveModal(null)
    setAssignFormState(DEFAULT_ASSIGN_FORM_STATE)
  }

  return (
    <div className={useHeaderActionStyles ? '' : 'space-y-6'}>
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {enabledActions.map((actionKey) => (
          <button
            type="button"
            key={actionKey}
            onClick={() => openActionModal(actionKey)}
            className={getActionButtonClassName(actionKey)}
          >
            {getActionLabel(actionKey)}
          </button>
        ))}
      </div>

      {/* Add Asset Modal */}
      <AppDialog
        open={activeModal === ACTION_KEYS.ASSET}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <AppDialogContent
          size="lg"
          header
          footer
          scrollable
          title="Add New Asset"
          description="Enter asset details and optional proof of purchase."
          footerClassName="sticky bottom-0 z-10 bg-white"
          footerContent={
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={ADD_ASSET_FORM_ID}
                variant="primary"
                disabled={creatingAsset}
              >
                {creatingAsset ? 'Creating...' : 'Create Asset'}
              </Button>
            </div>
          }
        >
          <form
            id={ADD_ASSET_FORM_ID}
            onSubmit={handleCreateAsset}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="asset-id"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Asset ID *
                </label>
                <input
                  id="asset-id"
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
                <label
                  htmlFor="asset-category"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>
                <select
                  id="asset-category"
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
                <label
                  htmlFor="asset-name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Asset Name *
                </label>
                <input
                  id="asset-name"
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
                <label
                  htmlFor="asset-model"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Model *
                </label>
                <input
                  id="asset-model"
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
                <label
                  htmlFor="asset-serial-number"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Serial Number
                </label>
                <input
                  id="asset-serial-number"
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
                <label
                  htmlFor="asset-vendor"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Vendor
                </label>
                <input
                  id="asset-vendor"
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
                <label
                  htmlFor="asset-purchase-date"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Purchase Date *
                </label>
                <input
                  id="asset-purchase-date"
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
                <label
                  htmlFor="asset-warranty-expiry"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Warranty Expiry
                </label>
                <input
                  id="asset-warranty-expiry"
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
                <label
                  htmlFor="asset-purchase-price"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Purchase Price
                </label>
                <input
                  id="asset-purchase-price"
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
                <label
                  htmlFor="asset-location"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  id="asset-location"
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
              <label
                htmlFor="asset-notes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="asset-notes"
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
          </form>
        </AppDialogContent>
      </AppDialog>

      {/* Add Category Modal */}
      <AppDialog
        open={activeModal === ACTION_KEYS.CATEGORY}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <AppDialogContent
          size="sm"
          header
          footer
          title="Add Asset Category"
          description="Create a category that can be used when adding assets."
          footerClassName="sticky bottom-0 z-10 bg-white"
          footerContent={
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={ADD_CATEGORY_FORM_ID}
                variant="primary"
                disabled={creatingCategory}
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          }
        >
          <form
            id={ADD_CATEGORY_FORM_ID}
            onSubmit={handleCreateCategory}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="asset-category-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category Name *
              </label>
              <input
                id="asset-category-name"
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
              <label
                htmlFor="asset-category-description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="asset-category-description"
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
          </form>
        </AppDialogContent>
      </AppDialog>

      {/* Asset Assignment Modal */}
      <AppDialog
        open={activeModal === ACTION_KEYS.ASSIGN}
        onOpenChange={(open) => !open && closeAssignModal()}
      >
        <AppDialogContent
          size="lg"
          header
          footer
          title="Assign Asset to Employee"
          description="Choose an available asset and assign it to a team member."
          footerClassName="sticky bottom-0 z-10 bg-white"
          footerContent={
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeAssignModal}
              >
                Close
              </Button>
              <Button
                type="submit"
                form={ASSIGN_ASSET_FORM_ID}
                variant="primary"
                disabled={
                  !assignFormState.canSubmit || assignFormState.submitting
                }
              >
                {assignFormState.submitting ? 'Assigning...' : 'Assign Asset'}
              </Button>
            </div>
          }
        >
          <AssetAssignmentForm
            formId={ASSIGN_ASSET_FORM_ID}
            showSubmitButton={false}
            onFormStateChange={setAssignFormState}
            onSuccess={() => {
              closeAssignModal()
              onAssetCreated?.()
            }}
          />
        </AppDialogContent>
      </AppDialog>
    </div>
  )
}

export default AssetManagement
