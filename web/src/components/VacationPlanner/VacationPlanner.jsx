import { useState, useMemo, useEffect } from 'react'

import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'

import { useMutation, useQuery } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import ConfirmDialog from 'src/components/ConfirmDialog/ConfirmDialog'
import FormModal from 'src/components/FormModal/FormModal'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Initialize the calendar localizer
const localizer = momentLocalizer(moment)

const USER_VACATION_REQUESTS = gql`
  query UserVacationRequests {
    userVacationRequests {
      id
      startDate
      endDate
      reason
      status
      rejectionReason
      originalRequestId
      createdAt
      originalRequest {
        id
        startDate
        endDate
        reason
        status
        rejectionReason
      }
    }
  }
`

const CREATE_VACATION_REQUEST = gql`
  mutation CreateVacationRequest($input: CreateVacationRequestInput!) {
    createVacationRequest(input: $input) {
      id
    }
  }
`

const RESUBMIT_VACATION_REQUEST = gql`
  mutation ResubmitVacationRequest(
    $originalId: Int!
    $input: CreateVacationRequestInput!
  ) {
    resubmitVacationRequest(originalId: $originalId, input: $input) {
      id
    }
  }
`

const DELETE_VACATION_REQUEST = gql`
  mutation DeleteVacationRequest($id: Int!) {
    deleteVacationRequest(id: $id) {
      id
    }
  }
`

const CANCEL_VACATION_REQUEST = gql`
  mutation CancelVacationRequest($id: Int!) {
    updateVacationRequest(id: $id, input: { status: "Cancelled" }) {
      id
      status
    }
  }
`

const VacationForm = ({ onSuccess, onCancel }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState(null)

  const [createVacationRequest, { loading }] = useMutation(
    CREATE_VACATION_REQUEST,
    {
      onCompleted: () => {
        onSuccess()
        toast.success('Vacation request submitted')
        // Notify other components about the update
        window.dispatchEvent(new Event('vacationRequestsUpdated'))
        window.localStorage.setItem('vacationRequestsUpdated', Date.now())
      },
      onError: (error) => {
        setFormError(error.message)
        toast.error('Error submitting request')
      },
      update: (cache, { data: { createVacationRequest } }) => {
        try {
          // Read the current data from cache
          const { userVacationRequests } = cache.readQuery({
            query: USER_VACATION_REQUESTS,
          })

          // Write the updated data back to cache
          cache.writeQuery({
            query: USER_VACATION_REQUESTS,
            data: {
              userVacationRequests: [
                createVacationRequest,
                ...userVacationRequests,
              ],
            },
          })
        } catch (error) {
          console.error('Error updating cache:', error)
        }
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      setFormError('End date must be after start date')
      return
    }

    createVacationRequest({
      variables: {
        input: {
          startDate: start,
          endDate: end,
          reason,
        },
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Reason
        </label>
        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded border px-3 py-2"
          rows="3"
        ></textarea>
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}

const VacationPlanner = () => {
  const { currentUser } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelRequestId, setCancelRequestId] = useState(null)
  const [cancelDialogType, setCancelDialogType] = useState('delete') // 'delete' or 'cancel'
  const [itemsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [showResubmitModal, setShowResubmitModal] = useState(false)
  const [resubmitRequest, setResubmitRequest] = useState(null)
  const today = new Date()

  const { data, loading, error, refetch } = useQuery(USER_VACATION_REQUESTS, {
    onCompleted: (data) => {
      console.log('🏖️ VacationPlanner: Query completed successfully', data)
    },
    onError: (error) => {
      console.log('❌ VacationPlanner: Query error', error)
    },
    fetchPolicy: 'network-only', // Ensure we always fetch fresh data
  })

  const [deleteVacationRequest] = useMutation(DELETE_VACATION_REQUEST, {
    onCompleted: () => {
      toast.success('Request deleted')
      // Notify other components about the update
      window.dispatchEvent(new Event('vacationRequestsUpdated'))
      window.localStorage.setItem('vacationRequestsUpdated', Date.now())
    },
    update: (cache, { data: { deleteVacationRequest } }) => {
      try {
        const { userVacationRequests } = cache.readQuery({
          query: USER_VACATION_REQUESTS,
        })

        cache.writeQuery({
          query: USER_VACATION_REQUESTS,
          data: {
            userVacationRequests: userVacationRequests.filter(
              (req) => req.id !== deleteVacationRequest.id
            ),
          },
        })
      } catch (error) {
        console.error('Error updating cache:', error)
      }
    },
  })

  const [cancelVacationRequest] = useMutation(CANCEL_VACATION_REQUEST, {
    onCompleted: () => {
      toast.success('Vacation cancelled')
      // Notify other components about the update
      window.dispatchEvent(new Event('vacationRequestsUpdated'))
      window.localStorage.setItem('vacationRequestsUpdated', Date.now())
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    },
    update: (cache, { data: { updateVacationRequest } }) => {
      try {
        const { userVacationRequests } = cache.readQuery({
          query: USER_VACATION_REQUESTS,
        })

        cache.writeQuery({
          query: USER_VACATION_REQUESTS,
          data: {
            userVacationRequests: userVacationRequests.map((req) =>
              req.id === updateVacationRequest.id
                ? { ...req, status: 'Cancelled' }
                : req
            ),
          },
        })
      } catch (error) {
        console.error('Error updating cache:', error)
      }
    },
  })

  const [resubmitVacationRequest, { loading: resubmitLoading }] = useMutation(
    RESUBMIT_VACATION_REQUEST,
    {
      onCompleted: () => {
        toast.success('Vacation request resubmitted')
        setShowResubmitModal(false)
        setResubmitRequest(null)
        refetch()
        // Notify other components about the update
        window.dispatchEvent(new Event('vacationRequestsUpdated'))
        window.localStorage.setItem('vacationRequestsUpdated', Date.now())
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`)
      },
    }
  )

  const vacationRequests = data?.userVacationRequests || []

  // Check if user is currently on vacation
  const activeVacation = useMemo(() => {
    return vacationRequests.find((req) => {
      if (req.status !== 'Approved') return false
      const start = new Date(req.startDate)
      const end = new Date(req.endDate)
      return today >= start && today <= end
    })
  }, [vacationRequests, today])

  // Format data for calendar view
  const calendarEvents = useMemo(() => {
    return vacationRequests.map((req) => ({
      id: req.id,
      title: `${req.status}: ${req.reason.substring(0, 20)}${req.reason.length > 20 ? '...' : ''}`,
      start: new Date(req.startDate),
      end: new Date(req.endDate),
      allDay: true,
      status: req.status,
    }))
  }, [vacationRequests])

  const paginatedRequests = useMemo(() => {
    return vacationRequests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [vacationRequests, currentPage, itemsPerPage])

  const totalPages = Math.ceil(vacationRequests.length / itemsPerPage)

  const openDeleteDialog = (id) => {
    setCancelRequestId(id)
    setCancelDialogType('delete')
    setShowCancelDialog(true)
  }

  const openCancelDialog = (id) => {
    setCancelRequestId(id)
    setCancelDialogType('cancel')
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = () => {
    if (cancelDialogType === 'delete') {
      deleteVacationRequest({
        variables: { id: cancelRequestId },
      })
    } else {
      cancelVacationRequest({
        variables: { id: cancelRequestId },
      })
    }
    setShowCancelDialog(false)
  }

  const handleResubmit = (rejectedRequest) => {
    setResubmitRequest(rejectedRequest)
    setShowResubmitModal(true)
  }

  const handleConfirmResubmit = (formData) => {
    resubmitVacationRequest({
      variables: {
        originalId: resubmitRequest.id,
        input: formData,
      },
    })
  }

  const formatDate = (dateString) => {
    // Create a date in UTC to avoid timezone shifts
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC', // Important! This ensures consistent date display
    })
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#FEF3C7', // Pending (yellow)
      borderRadius: '5px',
      opacity: 0.8,
      color: '#92400E',
      border: '1px solid #F59E0B',
      display: 'block',
    }

    if (event.status === 'Approved') {
      style.backgroundColor = '#D1FAE5' // green
      style.color = '#065F46'
      style.border = '1px solid #10B981'
    } else if (event.status === 'Rejected' || event.status === 'Cancelled') {
      style.backgroundColor = '#FEE2E2' // red
      style.color = '#991B1B'
      style.border = '1px solid #EF4444'
    }

    return { style }
  }

  useEffect(() => {
    console.log('🏖️ VacationPlanner state:', {
      loading,
      error: error?.message,
      dataLength: data?.userVacationRequests?.length,
    })
  }, [loading, error, data])

  // Add this useEffect to listen for changes from admin
  useEffect(() => {
    const handleVacationUpdated = async () => {
      console.log('User: vacationRequestsUpdated event received, refetching...')
      await refetch()
    }

    // Listen for custom event from admin component
    window.addEventListener('vacationRequestsUpdated', handleVacationUpdated)

    // Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'vacationRequestsUpdated') {
        console.log(
          'User: vacationRequestsUpdated storage event, refetching...'
        )
        refetch()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener(
        'vacationRequestsUpdated',
        handleVacationUpdated
      )
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refetch])

  return (
    <div className="vacation-planner rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <Toaster toastOptions={{ duration: 3000 }} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vacation Planner</h2>
          {activeVacation && (
            <div className="mt-1 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
              Currently on vacation
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center rounded bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Request Time Off
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading vacation requests</div>
      ) : viewMode === 'calendar' ? (
        <div className="mb-6 h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week']}
            defaultView="month"
          />
        </div>
      ) : paginatedRequests.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-gray-500">
            You haven't requested any time off yet.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700"
          >
            Request your first vacation
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedRequests.map((request) => {
                  const start = new Date(request.startDate)
                  const end = new Date(request.endDate)
                  const isActive =
                    today >= start &&
                    today <= end &&
                    request.status === 'Approved'

                  return (
                    <tr
                      key={request.id}
                      className={isActive ? 'bg-green-50' : undefined}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.startDate)} -{' '}
                          {formatDate(request.endDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.ceil(
                            (new Date(request.endDate) -
                              new Date(request.startDate)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{' '}
                          days
                          {isActive && (
                            <span className="ml-2 inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              Active now
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-h-24 max-w-xs overflow-y-auto break-words text-sm text-gray-900">
                          <div>{request.reason}</div>
                          {request.status === 'Rejected' &&
                            request.rejectionReason && (
                              <div className="mt-2 rounded border-l-2 border-red-200 bg-red-50 p-2 text-xs text-red-600">
                                <strong>Rejection Reason:</strong>{' '}
                                {request.rejectionReason}
                              </div>
                            )}
                          {request.originalRequestId && (
                            <div className="mt-1 text-xs">
                              <span className="rounded bg-orange-100 px-2 py-1 text-orange-700">
                                📝 Resubmission
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {request.status === 'Pending' && (
                            <button
                              onClick={() => openDeleteDialog(request.id)}
                              className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                          {request.status === 'Approved' && (
                            <button
                              onClick={() => openCancelDialog(request.id)}
                              className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                          {request.status === 'Rejected' && (
                            <button
                              onClick={() => handleResubmit(request)}
                              className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-900"
                            >
                              🔄 Resubmit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center">
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  <span className="sr-only">First</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  className="relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, idx) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = idx + 1
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx
                    } else {
                      pageNum = currentPage - 2 + idx
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium
                        ${
                          currentPage === pageNum
                            ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                )}

                <button
                  className="relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  <span className="sr-only">Last</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showModal && (
        <FormModal onClose={() => setShowModal(false)}>
          <h2 className="mb-4 text-xl font-bold">Request Time Off</h2>
          <VacationForm
            onSuccess={() => {
              setShowModal(false)
              refetch()
            }}
            onCancel={() => setShowModal(false)}
          />
        </FormModal>
      )}

      {showCancelDialog && (
        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleConfirmCancel}
          title={
            cancelDialogType === 'delete'
              ? 'Cancel Request'
              : 'Cancel Approved Vacation'
          }
          message={
            cancelDialogType === 'delete'
              ? 'Are you sure you want to cancel this vacation request? This action cannot be undone.'
              : 'Are you sure you want to cancel your approved vacation? Your manager will be notified of this cancellation.'
          }
          confirmText="Yes, Cancel"
          cancelText="No, Keep It"
          type="danger"
        />
      )}

      {/* Resubmission Modal */}
      {showResubmitModal && resubmitRequest && (
        <FormModal
          isOpen={showResubmitModal}
          onClose={() => setShowResubmitModal(false)}
        >
          <ResubmissionForm
            originalRequest={resubmitRequest}
            onSuccess={() => {
              setShowResubmitModal(false)
              setResubmitRequest(null)
              refetch()
            }}
            onCancel={() => {
              setShowResubmitModal(false)
              setResubmitRequest(null)
            }}
          />
        </FormModal>
      )}
    </div>
  )
}

// Resubmission Form Component
const ResubmissionForm = ({ originalRequest, onSuccess, onCancel }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState(originalRequest?.reason || '')
  const [formError, setFormError] = useState(null)

  const [resubmitVacationRequest, { loading }] = useMutation(
    RESUBMIT_VACATION_REQUEST,
    {
      onCompleted: () => {
        onSuccess()
        toast.success('Vacation request resubmitted successfully!')
        // Notify other components about the update
        window.dispatchEvent(new Event('vacationRequestsUpdated'))
        window.localStorage.setItem('vacationRequestsUpdated', Date.now())
      },
      onError: (error) => {
        setFormError(error.message)
        toast.error('Error resubmitting request')
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    if (!startDate || !endDate || !reason.trim()) {
      setFormError('All fields are required')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('End date must be after start date')
      return
    }

    // Convert dates to ISO DateTime strings to avoid GraphQL DateTime error
    const startDateTime = new Date(startDate)
    startDateTime.setHours(0, 0, 0, 0)

    const endDateTime = new Date(endDate)
    endDateTime.setHours(23, 59, 59, 999)

    resubmitVacationRequest({
      variables: {
        originalId: originalRequest.id,
        input: {
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          reason: reason.trim(),
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Resubmit Vacation Request
        </h3>
        <p className="text-sm text-gray-600">
          Your previous request was rejected. Please modify your request and
          resubmit.
        </p>
      </div>

      {/* Show original request details */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <h4 className="mb-2 font-medium text-gray-900">Previous Request:</h4>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Dates:</strong>{' '}
            {new Date(originalRequest.startDate).toLocaleDateString()} -{' '}
            {new Date(originalRequest.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Reason:</strong> {originalRequest.reason}
          </p>
          {originalRequest.rejectionReason && (
            <div className="mt-2 border-l-2 border-red-200 bg-red-50 p-2 text-red-700">
              <strong>Rejection Reason:</strong>{' '}
              {originalRequest.rejectionReason}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Reason for Vacation
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Please provide the reason for your vacation request..."
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Resubmitting...' : 'Resubmit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VacationPlanner
