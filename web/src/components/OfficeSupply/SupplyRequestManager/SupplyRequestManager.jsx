import { useState } from 'react'

import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  SelectField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { Pill, SummaryMetricCard } from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'

import SupplyRequestCard from '../SupplyRequestCard/SupplyRequestCard'

const GET_MY_SUPPLY_REQUESTS = gql`
  query GetMySupplyRequests {
    mySupplyRequests {
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
      supply {
        id
        name
        stockCount
        unitPrice
        category {
          id
          name
        }
      }
    }
  }
`

const GET_OFFICE_SUPPLIES = gql`
  query GetOfficeSuppliesForRequests {
    officeSupplies {
      id
      name
      stockCount
      unitPrice
      category {
        id
        name
      }
    }
  }
`

const CREATE_SUPPLY_REQUEST = gql`
  mutation CreateSupplyRequest($input: CreateSupplyRequestInput!) {
    createSupplyRequest(input: $input) {
      id
      quantityRequested
      justification
      urgency
      status
      supply {
        name
      }
    }
  }
`

const UPDATE_SUPPLY_REQUEST = gql`
  mutation UpdateSupplyRequest($id: Int!, $input: UpdateSupplyRequestInput!) {
    updateSupplyRequest(id: $id, input: $input) {
      id
      quantityRequested
      justification
      urgency
      status
    }
  }
`

const DELETE_SUPPLY_REQUEST = gql`
  mutation DeleteSupplyRequest($id: Int!) {
    deleteSupplyRequest(id: $id) {
      id
    }
  }
`

const SupplyRequestManager = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: requestsData,
    loading: requestsLoading,
    error: requestsError,
    refetch,
  } = useQuery(GET_MY_SUPPLY_REQUESTS)
  const { data: suppliesData } = useQuery(GET_OFFICE_SUPPLIES)

  const [createRequest] = useMutation(CREATE_SUPPLY_REQUEST, {
    onCompleted: () => {
      toast.success('Supply request created successfully!')
      setShowForm(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [updateRequest] = useMutation(UPDATE_SUPPLY_REQUEST, {
    onCompleted: () => {
      toast.success('Supply request updated successfully!')
      setShowForm(false)
      setEditingRequest(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [deleteRequest] = useMutation(DELETE_SUPPLY_REQUEST, {
    onCompleted: () => {
      toast.success('Supply request deleted successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data) => {
    const input = {
      supplyId: parseInt(data.supplyId),
      quantityRequested: parseInt(data.quantityRequested),
      justification: data.justification,
      urgency: data.urgency,
    }

    if (editingRequest) {
      updateRequest({ variables: { id: editingRequest.id, input } })
    } else {
      createRequest({ variables: { input } })
    }
  }

  const handleDelete = async (id, supplyName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the request for "${supplyName}"?`
      )
    ) {
      await deleteRequest({ variables: { id } })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return null
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

  const filteredRequests = requestsData?.mySupplyRequests?.filter((request) => {
    const matchesSearch =
      request.supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.justification.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const statusCounts =
    requestsData?.mySupplyRequests?.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1
      return acc
    }, {}) || {}
  const totalRequests = requestsData?.mySupplyRequests?.length || 0
  const pendingCount = statusCounts.PENDING || 0
  const approvedCount = statusCounts.APPROVED || 0
  const rejectedCount = statusCounts.REJECTED || 0
  const pendingRate = totalRequests
    ? Math.round((pendingCount / totalRequests) * 100)
    : 0
  const approvedRate = totalRequests
    ? Math.round((approvedCount / totalRequests) * 100)
    : 0
  const rejectedRate = totalRequests
    ? Math.round((rejectedCount / totalRequests) * 100)
    : 0

  return (
    <>
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="My Supply Requests"
          description="Request and track office supplies for your work needs"
        >
          <Input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search requests..."
            aria-label="Search supply requests"
            className="h-9 w-64 border-slate-300 bg-white"
          />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            New Request
          </button>
        </PageHeader>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetricCard
            size="sm"
            title="Total Requests"
            value={totalRequests.toLocaleString('en-US')}
            subtitle="Submitted requests"
            icon={<DocumentTextIcon />}
            trend={{ direction: 'neutral', label: 'all' }}
          />

          <SummaryMetricCard
            size="sm"
            title="Pending"
            value={pendingCount.toLocaleString('en-US')}
            subtitle="Waiting for review"
            icon={<ClockIcon />}
            trend={{ direction: 'neutral', label: `${pendingRate}%` }}
          />

          <SummaryMetricCard
            size="sm"
            title="Approved"
            value={approvedCount.toLocaleString('en-US')}
            subtitle="Accepted requests"
            icon={<CheckCircleIcon />}
            trend={{ direction: 'positive', label: `${approvedRate}%` }}
          />

          <SummaryMetricCard
            size="sm"
            title="Rejected"
            value={rejectedCount.toLocaleString('en-US')}
            subtitle="Declined requests"
            icon={<XCircleIcon />}
            trend={{ direction: 'negative', label: `${rejectedRate}%` }}
          />
        </div>

        {/* Request Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
              <h3 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                {editingRequest ? 'Edit Supply Request' : 'New Supply Request'}
              </h3>

              <Form onSubmit={onSubmit} className="space-y-6">
                <FormError
                  error={null}
                  wrapperClassName="rw-form-error-wrapper"
                  titleClassName="rw-form-error-title"
                  listClassName="rw-form-error-list"
                />

                {/* Supply Selection */}
                <div className="space-y-2">
                  <Label
                    name="supplyId"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Select Supply *
                  </Label>
                  <SelectField
                    name="supplyId"
                    defaultValue={editingRequest?.supply?.id}
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    validation={{ required: true }}
                  >
                    <option value="">Choose a supply...</option>
                    {suppliesData?.officeSupplies?.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name} ({supply.stockCount} available)
                      </option>
                    ))}
                  </SelectField>
                  <FieldError
                    name="supplyId"
                    className="text-sm text-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label
                      name="quantityRequested"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Quantity Requested *
                    </Label>
                    <NumberField
                      name="quantityRequested"
                      defaultValue={editingRequest?.quantityRequested}
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                      validation={{ required: true, min: 1 }}
                    />
                    <FieldError
                      name="quantityRequested"
                      className="text-sm text-red-500"
                    />
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label
                      name="urgency"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Urgency Level *
                    </Label>
                    <SelectField
                      name="urgency"
                      defaultValue={editingRequest?.urgency || 'MEDIUM'}
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      validation={{ required: true }}
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </SelectField>
                    <FieldError
                      name="urgency"
                      className="text-sm text-red-500"
                    />
                  </div>
                </div>

                {/* Justification */}
                <div className="space-y-2">
                  <Label
                    name="justification"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Justification *
                  </Label>
                  <TextAreaField
                    name="justification"
                    defaultValue={editingRequest?.justification}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Explain why you need this supply..."
                    validation={{ required: true }}
                  />
                  <FieldError
                    name="justification"
                    className="text-sm text-red-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingRequest(null)
                    }}
                    className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <Submit className="transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
                    {editingRequest ? 'Update Request' : 'Submit Request'}
                  </Submit>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur-lg">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your requests...</p>
            </div>
          ) : requestsError ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-red-600 shadow-xl backdrop-blur-lg">
              <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12" />
              <p>Error loading requests: {requestsError.message}</p>
            </div>
          ) : filteredRequests?.length === 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-gray-600 shadow-xl backdrop-blur-lg">
              <DocumentTextIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p>No supply requests found.</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className={`${buttonVariants({ variant: 'primary' })} mt-4`}
              >
                Create Your First Request
              </button>
            </div>
          ) : (
            filteredRequests?.map((request) => (
              <SupplyRequestCard
                key={request.id}
                icon={getStatusIcon(request.status)}
                title={request.supply.name}
                subtitle={request.supply.category.name}
                metrics={
                  <>
                    <span className="text-sm font-medium">
                      {request.quantityRequested} items
                    </span>
                    {request.supply.unitPrice && (
                      <span className="text-sm text-gray-600">
                        Total: $
                        {request.totalCost?.toFixed(2) ||
                          (
                            request.quantityRequested * request.supply.unitPrice
                          ).toFixed(2)}
                      </span>
                    )}
                  </>
                }
                badges={
                  <>
                    <Pill className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Pill>
                    <Pill className={getStatusColor(request.status)}>
                      {request.status}
                    </Pill>
                  </>
                }
                details={
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Justification:</span>{' '}
                    {request.justification}
                  </p>
                }
                notes={request.approverNotes}
                footer={
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span>
                        Requested:{' '}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      {request.approvedAt && (
                        <span className="ml-4">
                          {request.status === 'APPROVED'
                            ? 'Approved'
                            : 'Rejected'}
                          : {new Date(request.approvedAt).toLocaleDateString()}
                        </span>
                      )}
                      {request.isOverdue && request.status === 'PENDING' && (
                        <span className="ml-4 font-medium text-red-600">
                          Overdue
                        </span>
                      )}
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRequest(request)
                            setShowForm(true)
                          }}
                          className={buttonVariants({
                            variant: 'secondary',
                            size: 'sm',
                          })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(request.id, request.supply.name)
                          }
                          className={buttonVariants({
                            variant: 'destructive',
                            size: 'sm',
                          })}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                }
              />
            ))
          )}
        </div>
      </AppContentShell>
    </>
  )
}

export default SupplyRequestManager
