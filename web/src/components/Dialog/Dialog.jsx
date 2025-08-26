import React, { useState, useEffect } from 'react'

const Dialog = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ReturnAssetDialog = ({ isOpen, onClose, onConfirm, assetName }) => {
  const [condition, setCondition] = useState('Good')
  const [returnNotes, setReturnNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onConfirm({ condition, returnNotes })
      onClose()
      setCondition('Good')
      setReturnNotes('')
    } catch (error) {
      console.error('Error returning asset:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setCondition('Good')
      setReturnNotes('')
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Return Asset">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="mb-4 text-sm text-gray-600">
            You are about to return: <strong>{assetName}</strong>
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Asset Condition *
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Return Notes (Optional)
          </label>
          <textarea
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="Any notes about the asset condition or return..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Returning...' : 'Return Asset'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

const AssetRequestDialog = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  assets,
}) => {
  const [requestType, setRequestType] = useState('category') // 'category' or 'specific'
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAsset, setSelectedAsset] = useState('')
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState('Medium')
  const [expectedDuration, setExpectedDuration] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const requestData = {
        reason,
        urgency,
        expectedDuration: expectedDuration || null,
      }

      if (requestType === 'category' && selectedCategory) {
        requestData.assetCategoryId = parseInt(selectedCategory)
      } else if (requestType === 'specific' && selectedAsset) {
        requestData.specificAssetId = parseInt(selectedAsset)
      }

      await onSubmit(requestData)
      handleClose()
    } catch (error) {
      console.error('Error submitting request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setRequestType('category')
      setSelectedCategory('')
      setSelectedAsset('')
      setReason('')
      setUrgency('Medium')
      setExpectedDuration('')
    }
  }

  const availableAssets =
    assets?.filter((asset) => asset.status === 'Available') || []

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Request Asset">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Request Type *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="category"
                checked={requestType === 'category'}
                onChange={(e) => setRequestType(e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              Asset Category
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="specific"
                checked={requestType === 'specific'}
                onChange={(e) => setRequestType(e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              Specific Asset
            </label>
          </div>
        </div>

        {requestType === 'category' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Category *
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {requestType === 'specific' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Specific Asset *
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select an asset</option>
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id.toString()}>
                  {asset.assetId} - {asset.name} ({asset.model})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Reason for Request *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you need this asset..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Urgency *
          </label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Expected Duration (Optional)
          </label>
          <select
            value={expectedDuration}
            onChange={(e) => setExpectedDuration(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Not specified</option>
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="Permanent">Permanent</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              loading ||
              !reason ||
              (requestType === 'category' && !selectedCategory) ||
              (requestType === 'specific' && !selectedAsset)
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

const ApprovalDialog = ({
  isOpen,
  onClose,
  onApprove,
  request,
  availableAssets,
}) => {
  const [selectedAsset, setSelectedAsset] = useState('')
  const [fulfillmentNotes, setFulfillmentNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-select the specific asset when dialog opens
  React.useEffect(() => {
    if (isOpen && request?.specificAsset) {
      // Check if the specific asset is available
      const specificAsset = availableAssets?.find(
        (asset) =>
          asset.id === request.specificAsset.id && asset.status === 'Available'
      )
      if (specificAsset) {
        setSelectedAsset(request.specificAsset.id.toString())
      }
    } else if (isOpen && !request?.specificAsset) {
      // Reset selection for category-based requests
      setSelectedAsset('')
    }
  }, [isOpen, request, availableAssets])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onApprove(
        request.id,
        selectedAsset ? parseInt(selectedAsset) : null,
        fulfillmentNotes
      )
      handleClose()
    } catch (error) {
      console.error('Error approving request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setSelectedAsset('')
      setFulfillmentNotes('')
    }
  }

  // Filter assets based on request type
  const filteredAssets =
    availableAssets?.filter((asset) => {
      if (request?.specificAsset) {
        // For specific asset requests, show only that asset if it's available
        return (
          asset.id === request.specificAsset.id && asset.status === 'Available'
        )
      }
      if (request?.assetCategory?.id) {
        // For category requests, show all available assets in that category
        return (
          asset.category?.id === request.assetCategory.id &&
          asset.status === 'Available'
        )
      }
      // For general requests, show all available assets
      return asset.status === 'Available'
    }) || []

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Approve Asset Request">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Request Details</h4>
          <p className="mt-1 text-sm text-gray-600">{request?.reason}</p>
          <div className="mt-2 flex space-x-4 text-sm">
            <span className="text-gray-500">
              Urgency: <strong>{request?.urgency}</strong>
            </span>
            {request?.expectedDuration && (
              <span className="text-gray-500">
                Duration: <strong>{request?.expectedDuration}</strong>
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {request?.specificAsset
                ? 'Asset Assignment (Specific Asset Requested)'
                : 'Assign Asset (Optional)'}
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {request?.specificAsset ? (
                filteredAssets.length > 0 ? (
                  <>
                    <option value="">Don't assign the requested asset</option>
                    {filteredAssets.map((asset) => (
                      <option key={asset.id} value={asset.id.toString()}>
                        {asset.assetId} - {asset.name} ({asset.model}) -
                        REQUESTED ASSET
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">Requested asset is not available</option>
                )
              ) : (
                <>
                  <option value="">Approve without immediate assignment</option>
                  {filteredAssets.map((asset) => (
                    <option key={asset.id} value={asset.id.toString()}>
                      {asset.assetId} - {asset.name} ({asset.model})
                    </option>
                  ))}
                </>
              )}
            </select>
            {filteredAssets.length === 0 && request?.specificAsset && (
              <p className="mt-1 text-sm text-red-600">
                The requested specific asset is not available for assignment
              </p>
            )}
            {filteredAssets.length === 0 && !request?.specificAsset && (
              <p className="mt-1 text-sm text-yellow-600">
                No available assets found for this request type
              </p>
            )}
            {request?.specificAsset && filteredAssets.length > 0 && (
              <p className="mt-1 text-sm text-blue-600">
                This user requested a specific asset. It has been automatically
                selected for assignment.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fulfillment Notes (Optional)
            </label>
            <textarea
              value={fulfillmentNotes}
              onChange={(e) => setFulfillmentNotes(e.target.value)}
              placeholder="Any notes about the approval or assignment..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Approving...' : 'Approve Request'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

export {
  Dialog,
  ConfirmDialog,
  ReturnAssetDialog,
  AssetRequestDialog,
  ApprovalDialog,
}
