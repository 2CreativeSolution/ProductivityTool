import { useMemo } from 'react'

import { gql } from 'graphql-tag'

import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import {
  AdminDataTable,
  DataTableSelectFilterHeader,
  Pill,
} from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'

const ADMIN_VACATION_REQUESTS_QUERY = gql`
  query AdminVacationRequestsList {
    vacationRequests {
      id
      startDate
      endDate
      reason
      status
      user {
        id
        name
        email
      }
    }
  }
`

const APPROVE_VACATION_REQUEST_MUTATION = gql`
  mutation ApproveVacationRequestFromAdminList($id: Int!) {
    approveVacationRequest(id: $id) {
      id
      status
    }
  }
`

const REJECT_VACATION_REQUEST_MUTATION = gql`
  mutation RejectVacationRequestFromAdminList(
    $id: Int!
    $input: RejectVacationRequestInput!
  ) {
    rejectVacationRequest(id: $id, input: $input) {
      id
      status
      rejectionReason
    }
  }
`

const formatDate = (dateString) => {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

const getDurationDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
}

const statusPillClass = (status) => {
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-800'
  if (status === 'Approved') return 'bg-green-100 text-green-800'
  if (status === 'Rejected') return 'bg-red-100 text-red-800'
  if (status === 'Cancelled') return 'bg-slate-100 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

const rowActionTextClass =
  'text-[11px] font-semibold uppercase tracking-wide text-[#322e85] transition hover:text-[#2b2773]'
const statusFilterOptions = ['Pending', 'Approved', 'Rejected', 'Cancelled']

const AdminVacationRequests = ({ searchTerm = '' }) => {
  const { data, loading, error, refetch } = useQuery(
    ADMIN_VACATION_REQUESTS_QUERY
  )

  const [approveVacationRequest, { loading: approveLoading }] = useMutation(
    APPROVE_VACATION_REQUEST_MUTATION,
    {
      onCompleted: async () => {
        toast.success('Vacation request approved')
        await refetch()
      },
      onError: (mutationError) => {
        toast.error(mutationError.message)
      },
    }
  )

  const [rejectVacationRequest, { loading: rejectLoading }] = useMutation(
    REJECT_VACATION_REQUEST_MUTATION,
    {
      onCompleted: async () => {
        toast.success('Vacation request rejected')
        await refetch()
      },
      onError: (mutationError) => {
        toast.error(mutationError.message)
      },
    }
  )

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const filteredRequests = useMemo(() => {
    const allRequests = data?.vacationRequests || []

    return allRequests.filter((request) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        (request.user?.name || '')
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        (request.user?.email || '')
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        (request.reason || '').toLowerCase().includes(normalizedSearchTerm)

      return matchesSearch
    })
  }, [data?.vacationRequests, normalizedSearchTerm])

  const handleApprove = async (id) => {
    const isConfirmed = window.confirm(
      'Approve this vacation request? This action will update the employee request status immediately.'
    )
    if (!isConfirmed) {
      return
    }

    await approveVacationRequest({ variables: { id } })
  }

  const handleReject = async (id) => {
    const rejectionReason = window.prompt(
      'Enter rejection reason for this vacation request:'
    )

    if (rejectionReason === null) {
      return
    }

    const normalizedReason = rejectionReason.trim()
    if (!normalizedReason) {
      toast.error('Rejection reason is required')
      return
    }

    await rejectVacationRequest({
      variables: {
        id,
        input: { rejectionReason: normalizedReason },
      },
    })
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">Loading vacation requests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          Error loading vacation requests: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <AdminDataTable
        columns={[
          {
            accessorKey: 'user',
            header: 'Name',
            enableSorting: false,
            cell: ({ row }) => (
              <div className="font-semibold text-slate-900">
                {row.original.user?.name || 'Unknown'}
              </div>
            ),
          },
          {
            accessorKey: 'startDate',
            header: 'Dates',
            cell: ({ row }) => {
              const request = row.original
              return (
                <div>
                  <div className="font-medium text-slate-900">
                    {formatDate(request.startDate)} -{' '}
                    {formatDate(request.endDate)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {getDurationDays(request.startDate, request.endDate)} day
                    {getDurationDays(request.startDate, request.endDate) === 1
                      ? ''
                      : 's'}
                  </div>
                </div>
              )
            },
          },
          {
            accessorKey: 'reason',
            header: 'Reason',
            enableSorting: false,
            cell: ({ row }) => {
              const reason = (row.original.reason || '').trim()

              return (
                <div
                  className="max-w-[18rem] whitespace-normal break-words text-sm leading-5 text-slate-700"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={reason}
                >
                  {reason}
                </div>
              )
            },
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
              <Pill
                variant="default"
                size="sm"
                className={statusPillClass(row.original.status)}
              >
                {row.original.status}
              </Pill>
            ),
          },
          {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            enableSorting: false,
            cell: ({ row }) => {
              const request = row.original
              if (request.status !== 'Pending') {
                return (
                  <div className="text-right text-xs text-slate-500">-</div>
                )
              }

              return (
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className={rowActionTextClass}
                    disabled={approveLoading || rejectLoading}
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={buttonVariants({
                      variant: 'destructive',
                      size: 'xs',
                    })}
                    disabled={approveLoading || rejectLoading}
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </button>
                </div>
              )
            },
          },
        ]}
        data={filteredRequests}
        emptyMessage="No vacation requests found."
        pagination
        pageSizeOptions={[10, 20, 50, 100]}
        initialPageSize={10}
      />
    </div>
  )
}

export default AdminVacationRequests
