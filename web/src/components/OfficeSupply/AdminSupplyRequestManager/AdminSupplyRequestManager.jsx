import { useMemo, useState } from 'react'

import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { gql } from 'graphql-tag'

import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  AdminDataTable,
  AppDialog,
  AppDialogContent,
  Button,
  DataTableSelectFilterHeader,
  Label,
  Pill,
  SummaryMetricCard,
} from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'

const GET_ALL_REQUESTS = gql`
  query GetAllSupplyRequestsForAdminTable {
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

const urgencyPillClass = (urgency) => {
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

const statusPillClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const hasInsufficientStock = (request) => {
  const requested = Number(request?.quantityRequested || 0)
  const available = Number(request?.supply?.stockCount || 0)
  return available < requested
}

const AdminSupplyRequestManager = () => {
  const [processingRequest, setProcessingRequest] = useState(null)
  const [approverNotes, setApproverNotes] = useState('')
  const [actionType, setActionType] = useState('')

  const {
    data,
    loading,
    error,
    refetch: refetchAll,
  } = useQuery(GET_ALL_REQUESTS, {
    fetchPolicy: 'network-only',
  })

  const requests = useMemo(() => data?.supplyRequests || [], [data])
  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
      ),
    [requests]
  )

  const [approveRequest, { loading: approveLoading }] = useMutation(
    APPROVE_REQUEST,
    {
      onCompleted: () => {
        toast.success('Request approved successfully.')
        closeActionModal()
        refetchAll()
      },
      onError: (mutationError) => {
        toast.error(mutationError.message)
      },
    }
  )

  const [rejectRequest, { loading: rejectLoading }] = useMutation(
    REJECT_REQUEST,
    {
      onCompleted: () => {
        toast.success('Request rejected successfully.')
        closeActionModal()
        refetchAll()
      },
      onError: (mutationError) => {
        toast.error(mutationError.message)
      },
    }
  )

  const statusFilterOptions = useMemo(() => {
    const statuses = new Set(
      requests.map((request) => request.status).filter(Boolean)
    )

    return Array.from(statuses).map((status) => ({
      label: status,
      value: status,
    }))
  }, [requests])

  const urgencyFilterOptions = useMemo(() => {
    const urgencies = new Set(
      sortedRequests.map((request) => request.urgency).filter(Boolean)
    )

    return Array.from(urgencies).map((urgency) => ({
      label: urgency,
      value: urgency,
    }))
  }, [sortedRequests])

  const stats = useMemo(() => {
    const pending = sortedRequests.filter(
      (request) => request.status === 'PENDING'
    ).length
    const approved = sortedRequests.filter(
      (request) => request.status === 'APPROVED'
    ).length
    const rejected = sortedRequests.filter(
      (request) => request.status === 'REJECTED'
    ).length
    const overdue = sortedRequests.filter(
      (request) => request.isOverdue && request.status === 'PENDING'
    ).length
    const totalValue = sortedRequests.reduce(
      (sum, request) => sum + (request.totalCost || 0),
      0
    )
    const total = sortedRequests.length

    return {
      pending,
      approved,
      rejected,
      overdue,
      totalValue,
      total,
    }
  }, [sortedRequests])

  const pendingRate = stats.total
    ? Math.round((stats.pending / stats.total) * 100)
    : 0
  const approvedRate = stats.total
    ? Math.round((stats.approved / stats.total) * 100)
    : 0
  const rejectedRate = stats.total
    ? Math.round((stats.rejected / stats.total) * 100)
    : 0
  const overdueRate = stats.total
    ? Math.round((stats.overdue / stats.total) * 100)
    : 0

  const handleApprove = (request) => {
    setProcessingRequest(request)
    setActionType('approve')
  }

  const handleReject = (request) => {
    setProcessingRequest(request)
    setActionType('reject')
  }

  const closeActionModal = () => {
    setProcessingRequest(null)
    setApproverNotes('')
    setActionType('')
  }

  const submitAction = () => {
    if (!processingRequest) return

    if (actionType === 'approve') {
      const requested = Number(processingRequest.quantityRequested || 0)
      const available = Number(processingRequest.supply?.stockCount || 0)

      if (available < requested) {
        toast.error(
          `Insufficient stock: requested ${requested}, available ${available}.`
        )
        return
      }

      approveRequest({
        variables: {
          id: processingRequest.id,
          approverNotes: approverNotes.trim() || null,
        },
      })
      return
    }

    if (!approverNotes.trim()) {
      toast.error('Please provide a reason for rejection.')
      return
    }

    rejectRequest({
      variables: {
        id: processingRequest.id,
        approverNotes: approverNotes.trim(),
      },
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        Loading requests...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        Error loading requests: {error.message}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryMetricCard
          size="sm"
          title="Pending"
          value={stats.pending.toLocaleString('en-US')}
          subtitle="Open approvals"
          icon={<ClockIcon />}
          trend={{ direction: 'neutral', label: `${pendingRate}%` }}
        />
        <SummaryMetricCard
          size="sm"
          title="Approved"
          value={stats.approved.toLocaleString('en-US')}
          subtitle="Approved requests"
          icon={<CheckCircleIcon />}
          trend={{ direction: 'positive', label: `${approvedRate}%` }}
        />
        <SummaryMetricCard
          size="sm"
          title="Rejected"
          value={stats.rejected.toLocaleString('en-US')}
          subtitle="Rejected requests"
          icon={<XCircleIcon />}
          trend={{ direction: 'negative', label: `${rejectedRate}%` }}
        />
        <SummaryMetricCard
          size="sm"
          title="Overdue"
          value={stats.overdue.toLocaleString('en-US')}
          subtitle="Pending and overdue"
          icon={<ExclamationTriangleIcon />}
          trend={{ direction: 'negative', label: `${overdueRate}%` }}
        />
        <SummaryMetricCard
          size="sm"
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Value of listed requests"
          icon={<CurrencyDollarIcon />}
          trend={{ direction: 'positive', label: 'all' }}
        />
      </div>

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
              accessorKey: 'user.name',
              header: 'Requester',
              cell: ({ row }) => (
                <div>
                  <div className="font-semibold text-slate-900">
                    {row.original.user?.name || '-'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {row.original.user?.email || '-'}
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
              cell: ({ row }) => formatCurrency(row.original.supply?.unitPrice),
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
                  className={urgencyPillClass(row.original.urgency)}
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
                    className={statusPillClass(row.original.status)}
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
              accessorFn: (row) => (row.isOverdue ? 'Yes' : 'No'),
              id: 'overdue',
              header: ({ column }) => (
                <DataTableSelectFilterHeader
                  column={column}
                  label="Overdue"
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                  ]}
                  allLabel="All"
                />
              ),
              filterFn: (row, id, value) => row.getValue(id) === value,
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
                const insufficientStock = hasInsufficientStock(request)

                return (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#322e85] transition hover:text-[#2b2773] disabled:cursor-not-allowed disabled:text-gray-400"
                      disabled={insufficientStock}
                      title={
                        insufficientStock
                          ? `Insufficient stock (${request.supply?.stockCount ?? 0} available, ${request.quantityRequested} requested)`
                          : 'Approve'
                      }
                      onClick={() => handleApprove(request)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={buttonVariants({
                        variant: 'destructive',
                        size: 'xs',
                      })}
                      onClick={() => handleReject(request)}
                    >
                      Reject
                    </button>
                  </div>
                )
              },
            },
          ]}
          data={sortedRequests}
          emptyMessage="No supply requests found."
          pagination
          pageSizeOptions={[10, 20, 50, 100]}
          initialPageSize={10}
        />
      </div>

      <AppDialog
        open={Boolean(processingRequest)}
        onOpenChange={(open) => !open && closeActionModal()}
      >
        <AppDialogContent
          size="md"
          header
          footer
          title={
            actionType === 'approve' ? 'Approve Request' : 'Reject Request'
          }
          description="Review request details and add notes before submitting."
          footerContent={
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeActionModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={actionType === 'approve' ? 'primary' : 'destructive'}
                disabled={
                  approveLoading ||
                  rejectLoading ||
                  (actionType === 'approve' &&
                    processingRequest &&
                    hasInsufficientStock(processingRequest))
                }
                onClick={submitAction}
              >
                {actionType === 'approve' ? (
                  <span className="inline-flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve Request
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <XCircleIcon className="h-4 w-4" />
                    Reject Request
                  </span>
                )}
              </Button>
            </div>
          }
        >
          {processingRequest ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900">
                  {processingRequest.supply?.name || '-'}
                </h4>
                <p className="text-sm text-gray-600">
                  Requested by: {processingRequest.user?.name || '-'} (
                  {processingRequest.user?.email || '-'})
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {processingRequest.quantityRequested} items
                </p>
                <p className="text-sm text-gray-600">
                  Current Stock: {processingRequest.supply?.stockCount ?? '-'}{' '}
                  items
                </p>
                <p className="text-sm text-gray-600">
                  Total Cost: {formatCurrency(processingRequest.totalCost)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approver-notes">
                  {actionType === 'approve'
                    ? 'Notes (Optional)'
                    : 'Rejection Reason *'}
                </Label>
                {actionType === 'approve' &&
                hasInsufficientStock(processingRequest) ? (
                  <p className="text-sm text-red-600">
                    Cannot approve: requested{' '}
                    {processingRequest.quantityRequested} but only{' '}
                    {processingRequest.supply?.stockCount ?? 0} available.
                  </p>
                ) : null}
                <textarea
                  id="approver-notes"
                  value={approverNotes}
                  onChange={(event) => setApproverNotes(event.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any notes for the requester...'
                      : 'Please explain why this request is being rejected...'
                  }
                />
              </div>
            </div>
          ) : null}
        </AppDialogContent>
      </AppDialog>
    </div>
  )
}

export default AdminSupplyRequestManager
