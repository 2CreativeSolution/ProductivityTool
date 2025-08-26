import { useState } from 'react'

import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import { Form, FormError, Label, TextAreaField, Submit } from '@redwoodjs/forms'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const GET_PENDING_REQUESTS = gql`
  query GetPendingSupplyRequests {
    pendingSupplyRequests {
      id
      quantityRequested
      justification
      urgency
      status
      createdAt
      totalCost
      isOverdue
      user {
        id
        name
        email
      }
      supply {
        id
        name
        stockCount
        unitPrice
        category {
          name
        }
      }
    }
  }
`

const GET_ALL_REQUESTS = gql`
  query GetAllSupplyRequests {
    supplyRequests {
      id
      quantityRequested
      justification
      urgency
      status
      createdAt
      approvedAt
      approverNotes
      totalCost
      isOverdue
      user {
        id
        name
        email
      }
      supply {
        id
        name
        stockCount
        unitPrice
        category {
          name
        }
      }
    }
  }
`

const APPROVE_REQUEST = gql`
  mutation ApproveSupplyRequest($id: Int!, $approverNotes: String) {
    approveSupplyRequest(id: $id, approverNotes: $approverNotes) {
      id
      status
      approvedAt
      approverNotes
    }
  }
`

const REJECT_REQUEST = gql`
  mutation RejectSupplyRequest($id: Int!, $approverNotes: String!) {
    rejectSupplyRequest(id: $id, approverNotes: $approverNotes) {
      id
      status
      approvedAt
      approverNotes
    }
  }
`

const AdminSupplyRequestManager = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [processingRequest, setProcessingRequest] = useState(null)
  const [approverNotes, setApproverNotes] = useState('')
  const [actionType, setActionType] = useState('')

  const {
    data: pendingData,
    loading: pendingLoading,
    refetch: refetchPending,
  } = useQuery(GET_PENDING_REQUESTS)
  const {
    data: allData,
    loading: allLoading,
    refetch: refetchAll,
  } = useQuery(GET_ALL_REQUESTS, {
    skip: activeTab === 'pending',
  })

  const [approveRequest] = useMutation(APPROVE_REQUEST, {
    onCompleted: () => {
      toast.success('Request approved successfully!')
      setProcessingRequest(null)
      setApproverNotes('')
      refetchPending()
      refetchAll()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [rejectRequest] = useMutation(REJECT_REQUEST, {
    onCompleted: () => {
      toast.success('Request rejected successfully!')
      setProcessingRequest(null)
      setApproverNotes('')
      refetchPending()
      refetchAll()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleApprove = (request) => {
    setProcessingRequest(request)
    setActionType('approve')
  }

  const handleReject = (request) => {
    setProcessingRequest(request)
    setActionType('reject')
  }

  const submitAction = () => {
    if (actionType === 'approve') {
      approveRequest({
        variables: {
          id: processingRequest.id,
          approverNotes: approverNotes.trim() || null,
        },
      })
    } else {
      if (!approverNotes.trim()) {
        toast.error('Please provide a reason for rejection')
        return
      }
      rejectRequest({
        variables: {
          id: processingRequest.id,
          approverNotes: approverNotes.trim(),
        },
      })
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const currentData =
    activeTab === 'pending'
      ? pendingData?.pendingSupplyRequests
      : allData?.supplyRequests
  const currentLoading = activeTab === 'pending' ? pendingLoading : allLoading

  const filteredRequests = currentData?.filter((request) => {
    const matchesSearch =
      request.supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.justification.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesUrgency = !urgencyFilter || request.urgency === urgencyFilter

    return matchesSearch && matchesUrgency
  })

  const stats = {
    pending: pendingData?.pendingSupplyRequests?.length || 0,
    total: allData?.supplyRequests?.length || 0,
    approved:
      allData?.supplyRequests?.filter((r) => r.status === 'APPROVED').length ||
      0,
    rejected:
      allData?.supplyRequests?.filter((r) => r.status === 'REJECTED').length ||
      0,
    overdue:
      currentData?.filter((r) => r.isOverdue && r.status === 'PENDING')
        .length || 0,
    totalValue:
      currentData?.reduce(
        (sum, request) => sum + (request.totalCost || 0),
        0
      ) || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
          <div className="mb-6">
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
              Supply Request Management
            </h1>
            <p className="mt-2 text-gray-600">
              Review and approve employee supply requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-yellow-100 p-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.approved}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-red-100 p-3">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rejected}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-red-100 p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-lg">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 rounded-tl-2xl px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/10'
              }`}
            >
              Pending Requests ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 rounded-tr-2xl px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/10'
              }`}
            >
              All Requests ({stats.total})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Urgencies</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setUrgencyFilter('')
              }}
              className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Action Modal */}
        {processingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                {actionType === 'approve'
                  ? 'Approve Request'
                  : 'Reject Request'}
              </h3>

              <div className="mb-6 rounded-xl bg-white/50 p-4 backdrop-blur-sm">
                <h4 className="font-semibold text-gray-900">
                  {processingRequest.supply.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Requested by: {processingRequest.user.name} (
                  {processingRequest.user.email})
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {processingRequest.quantityRequested} items
                </p>
                <p className="text-sm text-gray-600">
                  Current Stock: {processingRequest.supply.stockCount} items
                </p>
                {processingRequest.supply.unitPrice && (
                  <p className="text-sm text-gray-600">
                    Total Cost: ${processingRequest.totalCost?.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {actionType === 'approve'
                      ? 'Notes (Optional)'
                      : 'Rejection Reason *'}
                  </label>
                  <textarea
                    value={approverNotes}
                    onChange={(e) => setApproverNotes(e.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder={
                      actionType === 'approve'
                        ? 'Add any notes for the requester...'
                        : 'Please explain why this request is being rejected...'
                    }
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setProcessingRequest(null)
                      setApproverNotes('')
                      setActionType('')
                    }}
                    className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAction}
                    className={`transform rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                      actionType === 'approve'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                    }`}
                  >
                    {actionType === 'approve'
                      ? 'Approve Request'
                      : 'Reject Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {currentLoading ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur-lg">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading requests...</p>
            </div>
          ) : filteredRequests?.length === 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-gray-600 shadow-xl backdrop-blur-lg">
              <DocumentTextIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p>No requests found matching your criteria.</p>
            </div>
          ) : (
            filteredRequests?.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-200 hover:shadow-2xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-blue-100 p-3">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.supply.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.supply.category.name}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm font-medium">
                          {request.quantityRequested} items
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {request.supply.stockCount} items
                        </span>
                        {request.supply.unitPrice && (
                          <span className="text-sm text-gray-600">
                            Cost: ${request.totalCost?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${getUrgencyColor(request.urgency)}`}
                    >
                      {request.urgency}
                    </span>
                    {activeTab === 'all' && (
                      <span
                        className={`rounded-full border px-3 py-1 text-sm ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    )}
                    {request.isOverdue && request.status === 'PENDING' && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested by:</span>{' '}
                        {request.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{' '}
                        {request.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Justification:</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {request.justification}
                      </p>
                    </div>
                  </div>
                </div>

                {request.approverNotes && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Admin Notes:</span>{' '}
                      {request.approverNotes}
                    </p>
                  </div>
                )}

                {request.status === 'PENDING' && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleReject(request)}
                      className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSupplyRequestManager
