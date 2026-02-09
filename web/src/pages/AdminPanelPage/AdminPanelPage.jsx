import React, { useEffect, useMemo } from 'react'

import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

import { Metadata, useQuery, useMutation, gql } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import {
  AdminDataTable,
  DataTableSelectFilterHeader,
  Pill,
  SummaryMetricCard,
} from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'

const EXCEPTION_REQUESTS_QUERY = gql`
  query ExceptionRequests {
    exceptionRequests {
      id
      userId
      type
      reason
      date
      status
      user {
        name
      }
    }
  }
`

const ADMIN_OVERVIEW_QUERY = gql`
  query AdminOverviewSummary {
    users {
      id
    }
    meetingRooms {
      id
    }
    vacationRequests {
      id
      status
    }
  }
`

const UPDATE_EXCEPTION_REQUEST = gql`
  mutation UpdateExceptionRequest(
    $id: Int!
    $input: UpdateExceptionRequestInput!
  ) {
    updateExceptionRequest(id: $id, input: $input) {
      id
      status
    }
  }
`

const AdminPanelPage = () => {
  const { data, loading, error, refetch } = useQuery(EXCEPTION_REQUESTS_QUERY, {
    fetchPolicy: 'network-only',
  })

  const {
    data: overviewData,
    loading: overviewLoading,
    error: overviewError,
  } = useQuery(ADMIN_OVERVIEW_QUERY, { fetchPolicy: 'network-only' })

  const [updateExceptionRequest] = useMutation(UPDATE_EXCEPTION_REQUEST, {
    onCompleted: () => {
      refetch()
      window.dispatchEvent(new Event('exceptionRequestsUpdated'))
      window.localStorage.setItem('exceptionRequestsUpdated', Date.now())
    },
  })

  const handleAction = (id, status) => {
    updateExceptionRequest({ variables: { id, input: { status } } })
  }

  const typeColors = {
    'Late Arrival': 'border-orange-400 bg-orange-50',
    'Early Departure': 'border-yellow-400 bg-yellow-50',
    'Remote Work': 'border-teal-400 bg-teal-50',
    'Missed Clock In/Out': 'border-blue-400 bg-blue-50',
    Other: 'border-gray-200 bg-gray-50',
    'Sick Day': 'border-red-200 bg-red-50',
    Leave: 'border-indigo-200 bg-indigo-50',
    Vacation: 'border-green-200 bg-green-50',
    Training: 'border-orange-200 bg-orange-50',
  }

  const sortedExceptions = (data?.exceptionRequests || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const pendingExceptions = sortedExceptions.filter(
    (form) => form.status === 'Pending'
  )

  const statusFilterOptions = useMemo(() => {
    const statuses = new Set(
      sortedExceptions.map((exception) => exception.status).filter(Boolean)
    )
    return Array.from(statuses).map((status) => ({
      label: status,
      value: status,
    }))
  }, [sortedExceptions])

  const statusPillClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'Approved':
        return 'bg-green-100 text-green-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const totalUsers = overviewData?.users?.length || 0
  const meetingRoomsCount = overviewData?.meetingRooms?.length || 0
  const pendingVacationRequestsCount = (
    overviewData?.vacationRequests || []
  ).filter((request) => request.status === 'Pending').length

  const adminOverviewCards = [
    {
      key: 'totalUsers',
      title: 'Total Users',
      value: overviewLoading ? '...' : totalUsers.toLocaleString('en-US'),
      subtitle: 'Active accounts',
      icon: <UsersIcon className="h-6 w-6" />,
      trend: { direction: 'neutral', label: 'All users' },
    },
    {
      key: 'meetingRooms',
      title: 'Meeting Rooms',
      value: overviewLoading
        ? '...'
        : meetingRoomsCount.toLocaleString('en-US'),
      subtitle: 'Rooms available to book',
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      trend: { direction: 'neutral', label: 'Rooms' },
    },
    {
      key: 'pendingVacationRequests',
      title: 'Vacation Requests',
      value: overviewLoading
        ? '...'
        : pendingVacationRequestsCount.toLocaleString('en-US'),
      subtitle: 'Awaiting approval',
      icon: <CalendarDaysIcon className="h-6 w-6" />,
      trend: {
        direction: pendingVacationRequestsCount > 0 ? 'negative' : 'neutral',
        label: overviewLoading
          ? 'Pending'
          : `${pendingVacationRequestsCount} pending`,
      },
    },
    {
      key: 'pendingExceptions',
      title: 'Exception Requests',
      value: loading ? '...' : pendingExceptions.length.toLocaleString('en-US'),
      subtitle: 'Awaiting review',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      trend: {
        direction: pendingExceptions.length > 0 ? 'negative' : 'neutral',
        label: loading ? 'Pending' : `${pendingExceptions.length} pending`,
      },
    },
  ]

  useEffect(() => {
    const handler = async () => {
      console.log(
        'Admin: exceptionRequestsUpdated event received, refetching...'
      )
      const result = await refetch()
      console.log('Admin: refetch result:', result.data)
    }
    window.addEventListener('exceptionRequestsUpdated', handler)
    const storageHandler = (e) => {
      if (e.key === 'exceptionRequestsUpdated') {
        console.log(
          'Admin: exceptionRequestsUpdated storage event, refetching...'
        )
        refetch()
      }
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('exceptionRequestsUpdated', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [refetch])

  return (
    <>
      <Metadata title="Admin Panel" description="Admin overview" />
      <AppSidebar />

      <AppContentShell>
        <PageHeader title="Admin Panel" />

        <div className="mb-8">
          {overviewError ? (
            <div className="text-red-500">
              Error loading admin overview: {overviewError.message}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {adminOverviewCards.map((card) => (
                <SummaryMetricCard
                  key={card.key}
                  size="sm"
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  icon={card.icon}
                  trend={card.trend}
                />
              ))}
            </div>
          )}
        </div>

        {/* Exception Requests Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Exception Requests
          </h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error.message}</div>
          ) : (
            <div className="overflow-hidden rounded-md border bg-white">
              <AdminDataTable
                columns={[
                  {
                    accessorKey: 'user',
                    header: 'Employee',
                    enableSorting: false,
                    cell: ({ row }) => (
                      <div className="font-semibold text-slate-900">
                        {row.original.user?.name || row.original.userId}
                      </div>
                    ),
                  },
                  {
                    accessorKey: 'type',
                    header: 'Type',
                    enableSorting: false,
                    cell: ({ row }) => (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          typeColors[row.original.type] || typeColors['Other']
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${typeColors[row.original.type]?.split(' ')[0].replace('border', 'bg') || 'bg-gray-300'}`}
                        ></span>
                        {row.original.type}
                      </span>
                    ),
                  },
                  {
                    accessorKey: 'date',
                    header: 'Date',
                    cell: ({ row }) =>
                      row.original.date
                        ? new Date(row.original.date).toLocaleDateString(
                            'en-GB',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            }
                          )
                        : '—',
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
                    accessorKey: 'reason',
                    header: 'Reason',
                    enableSorting: false,
                    cell: ({ row }) => (
                      <div
                        className="max-w-[18rem] whitespace-normal break-words text-sm leading-5 text-slate-700"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={row.original.reason || ''}
                      >
                        {row.original.reason || '—'}
                      </div>
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
                          <div className="text-right text-xs text-slate-500">
                            -
                          </div>
                        )
                      }

                      return (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            className="text-sm font-medium text-[#322e85] transition hover:text-[#2b2773]"
                            onClick={() => handleAction(request.id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className={buttonVariants({
                              variant: 'destructive',
                              size: 'xs',
                            })}
                            onClick={() => handleAction(request.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )
                    },
                  },
                ]}
                data={sortedExceptions}
                emptyMessage="No exception requests found."
                pagination
                pageSizeOptions={[10, 20, 50, 100]}
                initialPageSize={10}
              />
            </div>
          )}
        </div>
      </AppContentShell>
    </>
  )
}

export default AdminPanelPage
