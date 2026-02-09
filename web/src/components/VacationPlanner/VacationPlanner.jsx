import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'

import { useMutation, useQuery } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import ConfirmDialog from 'src/components/ConfirmDialog/ConfirmDialog'
import { AdminDataTable, Pill } from 'src/components/ui'
import { AppDialog, AppDialogContent, DialogClose } from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'
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

const VacationForm = ({
  onSuccess,
  onCancel,
  formId,
  hideSubmitButton,
  onLoadingChange,
}) => {
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

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

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
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="vacation-start-date"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Start Date
        </label>
        <input
          id="vacation-start-date"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="vacation-end-date"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          End Date
        </label>
        <input
          id="vacation-end-date"
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="vacation-reason"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Reason
        </label>
        <textarea
          id="vacation-reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded border px-3 py-2"
          rows="3"
        ></textarea>
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      {!hideSubmitButton && (
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
      )}
    </form>
  )
}

const VacationPlanner = forwardRef(
  (
    {
      hideHeaderRequestButton = false,
      hideHeaderViewToggle = false,
      viewMode: controlledViewMode,
      onViewModeChange,
    },
    ref
  ) => {
    const [showModal, setShowModal] = useState(false)
    const [requestSubmitting, setRequestSubmitting] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelRequestId, setCancelRequestId] = useState(null)
    const [cancelDialogType, setCancelDialogType] = useState('delete') // 'delete' or 'cancel'
    const [internalViewMode, setInternalViewMode] = useState('list') // 'list' or 'calendar'
    const [showResubmitModal, setShowResubmitModal] = useState(false)
    const [resubmitRequest, setResubmitRequest] = useState(null)
    const [resubmitSubmitting, setResubmitSubmitting] = useState(false)

    const viewMode = controlledViewMode ?? internalViewMode
    const setViewMode = (nextMode) => {
      onViewModeChange?.(nextMode)
      if (controlledViewMode === undefined) {
        setInternalViewMode(nextMode)
      }
    }

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

    const vacationRequests = useMemo(
      () => data?.userVacationRequests ?? [],
      [data?.userVacationRequests]
    )

    // Check if user is currently on vacation
    const currentDate = new Date()
    const activeVacation = vacationRequests.find((req) => {
      if (req.status !== 'Approved') return false
      const start = new Date(req.startDate)
      const end = new Date(req.endDate)
      return currentDate >= start && currentDate <= end
    })

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
          return 'bg-green-100 text-green-800'
        case 'Rejected':
          return 'bg-red-100 text-red-800'
        case 'Cancelled':
          return 'bg-slate-100 text-slate-700'
        default:
          return 'bg-yellow-100 text-yellow-800'
      }
    }

    const getDurationDays = (startDate, endDate) =>
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1

    const exportVacationCSV = () => {
      if (!vacationRequests.length) {
        toast('No vacation requests to export.')
        return
      }

      const headers = [
        'ID',
        'Start Date',
        'End Date',
        'Duration Days',
        'Status',
        'Reason',
        'Rejection Reason',
        'Created At',
      ]

      const escapeCsv = (value) => {
        const stringValue =
          value === null || value === undefined ? '' : String(value)
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      const rows = vacationRequests.map((request) => [
        request.id,
        formatDate(request.startDate),
        formatDate(request.endDate),
        getDurationDays(request.startDate, request.endDate),
        request.status,
        request.reason,
        request.rejectionReason || '',
        formatDate(request.createdAt),
      ])

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(','))
        .join('\n')

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 10)

      link.href = url
      link.setAttribute('download', `vacation-requests-${timestamp}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    useImperativeHandle(ref, () => ({
      openRequestModal: () => setShowModal(true),
      exportVacationCSV,
    }))

    const vacationRequestColumns = [
      {
        accessorKey: 'startDate',
        header: 'Date Range',
        cell: ({ row }) => {
          const request = row.original
          const start = new Date(request.startDate)
          const end = new Date(request.endDate)
          const currentDate = new Date()
          const isActive =
            currentDate >= start &&
            currentDate <= end &&
            request.status === 'Approved'

          return (
            <div>
              <div className="font-medium text-slate-900">
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </div>
              <div className="text-xs text-slate-500">
                {getDurationDays(request.startDate, request.endDate)} day
                {getDurationDays(request.startDate, request.endDate) === 1
                  ? ''
                  : 's'}
                {isActive && (
                  <Pill size="sm" className="ml-2 bg-green-100 text-green-800">
                    Active now
                  </Pill>
                )}
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
          const request = row.original

          return (
            <div className="max-h-24 max-w-xs overflow-y-auto overflow-x-hidden whitespace-normal break-words text-sm text-gray-900">
              <div>{request.reason}</div>
              {request.status === 'Rejected' && request.rejectionReason && (
                <div className="mt-2 rounded border-l-2 border-red-200 bg-red-50 p-2 text-xs text-red-600">
                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                </div>
              )}
              {request.originalRequestId && (
                <div className="mt-2">
                  <Pill size="sm" className="bg-orange-100 text-orange-700">
                    Resubmission
                  </Pill>
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Pill size="sm" className={getStatusClass(row.original.status)}>
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

          if (request.status === 'Pending') {
            return (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => openDeleteDialog(request.id)}
                  className={buttonVariants({
                    variant: 'destructive',
                    size: 'xs',
                  })}
                >
                  Cancel
                </button>
              </div>
            )
          }

          if (request.status === 'Approved') {
            return (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => openCancelDialog(request.id)}
                  className={buttonVariants({
                    variant: 'destructive',
                    size: 'xs',
                  })}
                >
                  Cancel
                </button>
              </div>
            )
          }

          if (request.status === 'Rejected') {
            return (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleResubmit(request)}
                  className={buttonVariants({
                    variant: 'secondary',
                    size: 'xs',
                  })}
                >
                  Resubmit
                </button>
              </div>
            )
          }

          return <div className="text-right text-xs text-slate-500">-</div>
        },
      },
    ]

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

    const shouldRenderHeaderControls =
      !hideHeaderViewToggle || !hideHeaderRequestButton
    const shouldRenderTopBar =
      shouldRenderHeaderControls || Boolean(activeVacation)

    return (
      <div className="vacation-planner">
        <Toaster toastOptions={{ duration: 3000 }} />

        {shouldRenderTopBar && (
          <div
            className={`mb-6 flex items-center ${shouldRenderHeaderControls ? 'justify-between' : 'justify-start'}`}
          >
            <div>
              {activeVacation && (
                <Pill className="bg-green-100 text-green-800">
                  Currently on vacation
                </Pill>
              )}
            </div>
            {shouldRenderHeaderControls && (
              <div className="flex items-center space-x-3">
                {!hideHeaderViewToggle && (
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
                )}
                {!hideHeaderRequestButton && (
                  <button
                    onClick={() => setShowModal(true)}
                    className={buttonVariants({ variant: 'primary' })}
                  >
                    Request Time Off
                  </button>
                )}
              </div>
            )}
          </div>
        )}

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
        ) : vacationRequests.length === 0 ? (
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
              You haven&apos;t requested any time off yet.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className={`${buttonVariants({ variant: 'primary' })} mt-4`}
            >
              Request your first vacation
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border bg-white">
            <AdminDataTable
              columns={vacationRequestColumns}
              data={vacationRequests}
              emptyMessage="No vacation requests found."
              pagination
              pageSizeOptions={[5, 10, 20, 50]}
              initialPageSize={5}
            />
          </div>
        )}

        <AppDialog open={showModal} onOpenChange={setShowModal}>
          <AppDialogContent
            header
            title="Request Time Off"
            description="Submit a new vacation request for approval."
            scrollable
            footerContent={
              <div className="flex items-center justify-end gap-3">
                <DialogClose asChild>
                  <button className={buttonVariants({ variant: 'outline' })}>
                    Cancel
                  </button>
                </DialogClose>
                <button
                  className={buttonVariants({ variant: 'primary' })}
                  type="submit"
                  form="vacation-request-form"
                  disabled={requestSubmitting}
                >
                  {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            }
          >
            <VacationForm
              formId="vacation-request-form"
              hideSubmitButton
              onLoadingChange={setRequestSubmitting}
              onSuccess={() => {
                setShowModal(false)
                refetch()
              }}
              onCancel={() => setShowModal(false)}
            />
          </AppDialogContent>
        </AppDialog>

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
        <AppDialog open={showResubmitModal} onOpenChange={setShowResubmitModal}>
          {resubmitRequest ? (
            <AppDialogContent
              header
              title="Resubmit Vacation Request"
              description="Update your request details and resubmit for approval."
              scrollable
              footerContent={
                <div className="flex items-center justify-end gap-3">
                  <DialogClose asChild>
                    <button className={buttonVariants({ variant: 'outline' })}>
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    className={buttonVariants({ variant: 'primary' })}
                    type="submit"
                    form="vacation-resubmit-form"
                    disabled={resubmitSubmitting}
                  >
                    {resubmitSubmitting
                      ? 'Resubmitting...'
                      : 'Resubmit Request'}
                  </button>
                </div>
              }
            >
              <ResubmissionForm
                formId="vacation-resubmit-form"
                hideSubmitButton
                onLoadingChange={setResubmitSubmitting}
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
            </AppDialogContent>
          ) : null}
        </AppDialog>
      </div>
    )
  }
)

// Resubmission Form Component
const ResubmissionForm = ({
  originalRequest,
  onSuccess,
  onCancel,
  formId,
  hideSubmitButton,
  onLoadingChange,
}) => {
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
      },
      onError: (error) => {
        setFormError(error.message)
        toast.error('Error resubmitting request')
      },
    }
  )

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

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

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="resubmit-start-date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              id="resubmit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label
              htmlFor="resubmit-end-date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              id="resubmit-end-date"
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
          <label
            htmlFor="resubmit-reason"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Reason for Vacation
          </label>
          <textarea
            id="resubmit-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Please provide the reason for your vacation request..."
            required
          />
        </div>

        {!hideSubmitButton && (
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
        )}
      </form>
    </div>
  )
}

export default VacationPlanner
