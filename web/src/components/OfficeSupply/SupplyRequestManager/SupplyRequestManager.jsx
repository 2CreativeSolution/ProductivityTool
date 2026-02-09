import { useMemo, useState } from 'react'

import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
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
import {
  AppDialog,
  AdminDataTable,
  AppDialogContent,
  DataTableSelectFilterHeader,
  DialogClose,
  Pill,
  SummaryMetricCard,
} from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'

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

const formatCurrency = (value) => {
  if (value == null) return '-'

  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US')
}

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

  const allRequests = useMemo(
    () => requestsData?.mySupplyRequests || [],
    [requestsData]
  )

  const sortedRequests = useMemo(
    () =>
      [...allRequests].sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
      ),
    [allRequests]
  )

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredRequests = useMemo(() => {
    if (!normalizedSearchTerm) {
      return sortedRequests
    }

    return sortedRequests.filter((request) => {
      const supplyName = (request?.supply?.name || '').toLowerCase()
      const categoryName = (request?.supply?.category?.name || '').toLowerCase()
      const justification = (request?.justification || '').toLowerCase()

      return (
        supplyName.includes(normalizedSearchTerm) ||
        categoryName.includes(normalizedSearchTerm) ||
        justification.includes(normalizedSearchTerm)
      )
    })
  }, [normalizedSearchTerm, sortedRequests])

  const statusFilterOptions = useMemo(() => {
    const statuses = new Set(
      allRequests.map((request) => request.status).filter(Boolean)
    )

    return Array.from(statuses).map((status) => ({
      label: status,
      value: status,
    }))
  }, [allRequests])

  const urgencyFilterOptions = useMemo(() => {
    const urgencies = new Set(
      allRequests.map((request) => request.urgency).filter(Boolean)
    )

    return Array.from(urgencies).map((urgency) => ({
      label: urgency,
      value: urgency,
    }))
  }, [allRequests])

  const statusCounts = allRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1
    return acc
  }, {})
  const totalRequests = allRequests.length
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
        <AppDialog open={showForm} onOpenChange={setShowForm}>
          <AppDialogContent
            size="lg"
            header
            title={
              editingRequest ? 'Edit Supply Request' : 'New Supply Request'
            }
            scrollable
            footerContent={
              <div className="flex items-center justify-end gap-3">
                <DialogClose asChild>
                  <button
                    type="button"
                    className={buttonVariants({ variant: 'outline' })}
                    onClick={() => setEditingRequest(null)}
                  >
                    Cancel
                  </button>
                </DialogClose>
                <Submit
                  form="supply-request-form"
                  className={buttonVariants({ variant: 'primary' })}
                >
                  {editingRequest ? 'Update Request' : 'Submit Request'}
                </Submit>
              </div>
            }
          >
            <Form
              id="supply-request-form"
              onSubmit={onSubmit}
              className="space-y-6"
            >
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
                <FieldError name="supplyId" className="text-sm text-red-500" />
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
                  <FieldError name="urgency" className="text-sm text-red-500" />
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
            </Form>
          </AppDialogContent>
        </AppDialog>

        {/* Requests Table */}
        <div className="overflow-hidden rounded-md border bg-white">
          <AdminDataTable
            columns={[
              {
                accessorKey: 'supply.name',
                header: 'Supply',
                cell: ({ row }) => (
                  <div>
                    <div className="font-semibold text-slate-900">
                      {row.original.supply?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Category: {row.original.supply?.category?.name || '-'}
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: 'quantityRequested',
                header: 'Req Qty',
              },
              {
                accessorKey: 'supply.stockCount',
                header: 'Stock',
                cell: ({ row }) => row.original.supply?.stockCount ?? '-',
              },
              {
                accessorKey: 'supply.unitPrice',
                header: 'Unit Price',
                cell: ({ row }) =>
                  formatCurrency(row.original.supply?.unitPrice),
              },
              {
                accessorKey: 'totalCost',
                header: 'Total Cost',
                cell: ({ row }) => formatCurrency(row.original.totalCost),
              },
              {
                accessorKey: 'urgency',
                header: ({ column }) => (
                  <DataTableSelectFilterHeader
                    column={column}
                    label="Urgency"
                    options={urgencyFilterOptions}
                    allLabel="All"
                  />
                ),
                filterFn: (row, id, value) => row.getValue(id) === value,
                cell: ({ row }) => (
                  <Pill
                    variant="default"
                    size="sm"
                    className={getUrgencyColor(row.original.urgency)}
                  >
                    {row.original.urgency}
                  </Pill>
                ),
              },
              {
                accessorKey: 'status',
                header: ({ column }) => (
                  <DataTableSelectFilterHeader
                    column={column}
                    label="Status"
                    options={statusFilterOptions}
                    allLabel="All"
                  />
                ),
                filterFn: (row, id, value) => row.getValue(id) === value,
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <Pill
                      variant="default"
                      size="sm"
                      className={getStatusColor(row.original.status)}
                    >
                      {row.original.status}
                    </Pill>
                    {row.original.isOverdue &&
                    row.original.status === 'PENDING' ? (
                      <Pill
                        variant="default"
                        size="sm"
                        className="bg-red-100 text-red-700"
                      >
                        Overdue
                      </Pill>
                    ) : null}
                  </div>
                ),
              },
              {
                accessorKey: 'createdAt',
                header: 'Requested',
                cell: ({ row }) => formatDate(row.original.createdAt),
              },
              {
                accessorKey: 'approvedAt',
                header: 'Approved/Rejected',
                cell: ({ row }) => formatDate(row.original.approvedAt),
              },
              {
                accessorKey: 'justification',
                header: 'Justification',
                enableSorting: false,
                cell: ({ row }) => (
                  <div
                    className="max-w-[16rem] whitespace-normal break-words text-sm leading-5 text-slate-700"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={row.original.justification || ''}
                  >
                    {row.original.justification || '-'}
                  </div>
                ),
              },
              {
                accessorKey: 'approverNotes',
                header: 'Approver Notes',
                enableSorting: false,
                cell: ({ row }) => (
                  <div
                    className="max-w-[16rem] whitespace-normal break-words text-sm leading-5 text-slate-700"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={row.original.approverNotes || ''}
                  >
                    {row.original.approverNotes || '-'}
                  </div>
                ),
              },
              {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                enableSorting: false,
                cell: ({ row }) => {
                  const request = row.original
                  if (request.status !== 'PENDING') {
                    return (
                      <div className="text-right text-xs text-slate-500">-</div>
                    )
                  }

                  return (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="text-[11px] font-semibold uppercase tracking-wide text-[#322e85] transition hover:text-[#2b2773]"
                        onClick={() => {
                          setEditingRequest(request)
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        title={`Delete request ${request.id}`}
                        aria-label={`Delete request ${request.id}`}
                        className="inline-flex items-center text-red-600 transition hover:text-red-700"
                        onClick={() =>
                          handleDelete(request.id, request.supply.name)
                        }
                      >
                        <i className="ri-delete-bin-line text-base" />
                      </button>
                    </div>
                  )
                },
              },
            ]}
            data={filteredRequests}
            emptyMessage={
              requestsLoading
                ? 'Loading your requests...'
                : requestsError
                  ? `Error loading requests: ${requestsError.message}`
                  : 'No supply requests found.'
            }
            pagination
            pageSizeOptions={[10, 20, 50, 100]}
            initialPageSize={10}
          />
        </div>
      </AppContentShell>
    </>
  )
}

export default SupplyRequestManager
