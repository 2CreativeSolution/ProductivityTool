import React, {
  useCallback,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import { useQuery, gql } from '@apollo/client'
import JsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import ExceptionForm from 'src/components/ExceptionForm'
import FormModal from 'src/components/FormModal'
import { AdminDataTable, Pill } from 'src/components/ui'
import { buttonVariants } from 'src/components/ui/button'
import { Widget } from 'src/components/ui/widget'

const ATTENDANCE_QUERY = gql`
  query AttendanceQuery($userId: Int) {
    attendances(userId: $userId) {
      id
      date
      clockIn
      clockOut
      duration
      status
      breaks {
        id
        breakIn
        breakOut
      }
    }
  }
`

const EXCEPTION_REQUESTS_QUERY = gql`
  query GetUserWithExceptions($id: Int!) {
    user(id: $id) {
      id
      name
      exceptionRequests {
        id
        type
        reason
        date
        status
        createdAt
      }
    }
  }
`

const formatAttendanceDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { timeZone: 'UTC' })

const formatAttendanceTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

const getAttendanceDuration = (record) => {
  const breaks = record.breaks || []
  const totalBreakMs = breaks.reduce((sum, currentBreak) => {
    if (!currentBreak.breakIn || !currentBreak.breakOut) {
      return sum
    }

    return (
      sum + (new Date(currentBreak.breakOut) - new Date(currentBreak.breakIn))
    )
  }, 0)

  const officeMs =
    record.clockIn && record.clockOut
      ? Math.max(
          new Date(record.clockOut) - new Date(record.clockIn) - totalBreakMs,
          0
        )
      : 0

  const hours = Math.floor(officeMs / 1000 / 60 / 60)
  const minutes = Math.floor((officeMs / 1000 / 60) % 60)

  return record.clockIn && record.clockOut ? `${hours}h ${minutes}m` : '-'
}

const getStatusBadgeClassName = (status) => {
  if (status === 'Present') {
    return 'border-green-200 bg-green-100 text-green-800'
  }

  if (status === 'Late') {
    return 'border-yellow-200 bg-yellow-100 text-yellow-800'
  }

  if (status === 'Leave') {
    return 'border-blue-200 bg-blue-100 text-blue-800'
  }

  return 'border-red-200 bg-red-100 text-red-800'
}

const Attendance = forwardRef(({ userId }, ref) => {
  const { currentUser } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const { data, loading, error, refetch } = useQuery(ATTENDANCE_QUERY, {
    variables: { userId },
    fetchPolicy: 'network-only',
    skip: !userId,
  })

  const {
    data: exceptionData,
    loading: exceptionLoading,
    error: exceptionError,
    refetch: refetchExceptions,
  } = useQuery(EXCEPTION_REQUESTS_QUERY, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  })

  const [exceptionRequests, setExceptionRequests] = useState([])
  const [attendances, setAttendances] = useState([])

  const [exceptionPage, setExceptionPage] = useState(1)
  const exceptionItemsPerPage = 5
  const exceptionTotalPages = Math.ceil(
    exceptionRequests.length / exceptionItemsPerPage
  )
  const exceptionDisplayPage = exceptionTotalPages === 0 ? 0 : exceptionPage

  const paginatedExceptions = useMemo(() => {
    const sorted = [...exceptionRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    return sorted.slice(
      (exceptionPage - 1) * exceptionItemsPerPage,
      exceptionPage * exceptionItemsPerPage
    )
  }, [exceptionRequests, exceptionPage, exceptionItemsPerPage])

  const attendanceColumns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatAttendanceDate(row.original.date),
      },
      {
        accessorKey: 'clockIn',
        header: 'Clock In',
        cell: ({ row }) => formatAttendanceTime(row.original.clockIn),
      },
      {
        accessorKey: 'clockOut',
        header: 'Clock Out',
        cell: ({ row }) => formatAttendanceTime(row.original.clockOut),
      },
      {
        id: 'duration',
        header: 'Duration',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-gray-900">
            {getAttendanceDuration(row.original)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Pill className={getStatusBadgeClassName(row.original.status)}>
            {row.original.status}
          </Pill>
        ),
      },
    ],
    []
  )

  useEffect(() => {
    if (!data?.attendances) {
      return
    }

    setAttendances((currentAttendances) =>
      JSON.stringify(data.attendances) === JSON.stringify(currentAttendances)
        ? currentAttendances
        : data.attendances
    )
  }, [data])

  useEffect(() => {
    if (exceptionData?.user?.exceptionRequests) {
      const sorted = [...exceptionData.user.exceptionRequests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setExceptionRequests(sorted)
    }
  }, [exceptionData])

  const exportAttendancePDF = useCallback(() => {
    if (!attendances.length) {
      toast.error('No attendance records to export 😓')
      return
    }

    const pdf = new JsPDF()
    const title = `${currentUser?.name || 'User'}'s Attendance History`
    pdf.setFontSize(16)
    pdf.text(title, 14, 20)

    const headers = ['Date', 'Clock In', 'Clock Out', 'Duration', 'Status']

    const dataRows = attendances.map((record) => [
      formatAttendanceDate(record.date),
      formatAttendanceTime(record.clockIn),
      formatAttendanceTime(record.clockOut),
      getAttendanceDuration(record),
      record.status,
    ])

    autoTable(pdf, {
      head: [headers],
      body: dataRows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    pdf.save('attendance-history.pdf')
  }, [attendances, currentUser?.name])

  const exportAttendanceCSV = useCallback(() => {
    if (!attendances.length) {
      toast.error('No attendance records to export 😓')
      return
    }

    const csvData = attendances.map((rec) => ({
      ...rec,
      breaks: (rec.breaks || [])
        .map(
          (currentBreak, index) =>
            `#${index + 1}: ${currentBreak.breakIn ? formatAttendanceTime(currentBreak.breakIn) : ''} - ${
              currentBreak.breakOut
                ? formatAttendanceTime(currentBreak.breakOut)
                : ''
            }`
        )
        .join('; '),
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${(currentUser?.name || 'user').toLowerCase()}_attendance_history.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [attendances, currentUser?.name])

  const exportHandler = useCallback(
    (type) => {
      if (type === 'csv') {
        exportAttendanceCSV()
        return
      }

      if (type === 'pdf') {
        exportAttendancePDF()
      }
    },
    [exportAttendanceCSV, exportAttendancePDF]
  )

  useImperativeHandle(
    ref,
    () => ({
      exportAttendance: exportHandler,
    }),
    [exportHandler]
  )

  useEffect(() => {
    const handler = () => {
      refetch().then(() => {
        // Optionally handle after refetch
      })
    }
    window.addEventListener('attendanceUpdated', handler)

    const storageHandler = (event) => {
      if (event.key === 'attendanceUpdated') {
        refetch()
      }
    }
    window.addEventListener('storage', storageHandler)

    return () => {
      window.removeEventListener('attendanceUpdated', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [refetch])

  useEffect(() => {
    const handler = () => {
      console.log(
        'User: exceptionRequestsUpdated event received, refetching...'
      )
      refetchExceptions()
    }
    window.addEventListener('exceptionRequestsUpdated', handler)

    const storageHandler = (event) => {
      if (event.key === 'exceptionRequestsUpdated') {
        console.log(
          'User: exceptionRequestsUpdated storage event, refetching...'
        )
        refetchExceptions()
      }
    }
    window.addEventListener('storage', storageHandler)

    return () => {
      window.removeEventListener('exceptionRequestsUpdated', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [refetchExceptions])

  useEffect(() => {
    setExceptionPage((currentPage) => {
      const maxPage = Math.max(1, exceptionTotalPages)
      return Math.min(Math.max(currentPage, 1), maxPage)
    })
  }, [exceptionTotalPages])

  return (
    <>
      <Toaster toastOptions={{ duration: 4000 }} />
      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        <section className="attendance-section flex-1">
          {loading ? (
            <div className="rounded-md border bg-white px-4 py-6 text-sm text-gray-600">
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
              Error: {error.message}
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border bg-white">
              <AdminDataTable
                columns={attendanceColumns}
                data={attendances}
                emptyMessage="No attendance records found."
                pagination
                pageSizeOptions={[5, 10, 20]}
                initialPageSize={5}
              />
            </div>
          )}
        </section>

        {/* Exception Management Section */}
        <Widget className="flex w-full flex-col p-4 lg:w-1/3">
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Exception Management
          </h2>
          <button
            className={`${buttonVariants({ variant: 'primary' })} mb-4 w-full`}
            onClick={() => setShowModal(true)}
          >
            Submit New Exception
          </button>

          <div className="mb-6 space-y-3">
            {exceptionLoading ? (
              <div>Loading...</div>
            ) : exceptionError ? (
              <div className="text-red-500">
                Error: {exceptionError.message}
              </div>
            ) : !exceptionData?.user ? (
              <div className="text-red-500">User not found or not loaded.</div>
            ) : paginatedExceptions.length === 0 ? (
              <div className="text-gray-500">
                You have not submitted any requests.
              </div>
            ) : (
              paginatedExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="flex flex-col rounded-lg border bg-gray-50 px-4 py-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      {ex.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold
                      ${ex.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${ex.status === 'Approved' ? 'bg-green-100 text-green-700' : ''}
                      ${ex.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}`}
                    >
                      {ex.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(ex.date).toLocaleDateString('en-GB', {
                      timeZone: 'UTC',
                    })}{' '}
                  </div>
                  <p className="max-h-24 max-w-xs overflow-y-auto break-words text-sm text-gray-700">
                    {ex.reason}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              className={buttonVariants({
                variant: 'primaryOutline',
                size: 'sm',
              })}
              disabled={exceptionPage <= 1 || exceptionTotalPages === 0}
              onClick={() => setExceptionPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {exceptionDisplayPage} of {exceptionTotalPages}
            </span>
            <button
              className={buttonVariants({
                variant: 'primaryOutline',
                size: 'sm',
              })}
              disabled={
                exceptionTotalPages === 0 ||
                exceptionPage >= exceptionTotalPages
              }
              onClick={() =>
                setExceptionPage((prev) =>
                  Math.min(prev + 1, Math.max(exceptionTotalPages, 1))
                )
              }
            >
              Next
            </button>
          </div>
          {showModal && (
            <FormModal onClose={() => setShowModal(false)}>
              <h2 className="mb-4 text-xl font-bold">
                Submit Exception Request
              </h2>
              <ExceptionForm
                onSuccess={async () => {
                  setShowModal(false)
                  const result = await refetchExceptions()
                  if (result.data?.user?.exceptionRequests) {
                    const sorted = [...result.data.user.exceptionRequests]
                      .sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                      )
                      .reverse()
                    setExceptionRequests(sorted)
                  }
                  window.dispatchEvent(new Event('exceptionRequestsUpdated'))
                  window.localStorage.setItem(
                    'exceptionRequestsUpdated',
                    Date.now()
                  )
                }}
              />
            </FormModal>
          )}
        </Widget>
      </div>
    </>
  )
})

Attendance.displayName = 'Attendance'

export default Attendance
