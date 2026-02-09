import React, { useState, useEffect } from 'react'

import { useQuery, useMutation } from '@redwoodjs/web'

import { buttonVariants } from 'src/components/ui/button'
import { Widget } from 'src/components/ui/widget'
import {
  parseBookingDateTime,
  toBookingDateTimeInput,
} from 'src/lib/bookingDateTime'

const BOOKINGS_QUERY = gql`
  query UpcomingBookingsQuery($userId: Int!) {
    bookings(userId: $userId) {
      id
      title
      startTime
      endTime
      notes
      meetingRoom {
        id
        name
      }
    }
  }
`

const DELETE_BOOKING_MUTATION = gql`
  mutation DeleteBookingMutation($id: Int!) {
    deleteBooking(id: $id) {
      id
    }
  }
`

const FINISH_BOOKING_MUTATION = gql`
  mutation FinishBookingMutation($id: Int!, $endTime: DateTime!) {
    updateBooking(id: $id, input: { endTime: $endTime }) {
      id
      endTime
    }
  }
`

const getStatus = (startTime, endTime) => {
  const now = new Date()
  const start = parseBookingDateTime(startTime)
  const end = parseBookingDateTime(endTime)
  if (!start || !end) return 'Expired'
  if (now < start) return 'Upcoming'
  if (now >= start && now <= end) return 'Ongoing'
  if (now > end) return 'Expired'
  return 'Upcoming'
}

const statusColor = (status) => {
  if (status === 'Upcoming') return 'bg-yellow-400 text-white'
  if (status === 'Ongoing') return 'bg-green-500 text-white'
  if (status === 'Expired') return 'bg-gray-400 text-white'
  return ''
}

// Date card formatter: "Mon 12"
const dateCard = (dateStr) => {
  const date = parseBookingDateTime(dateStr)
  if (!date) return null
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  const day = date.getDate()
  return (
    <div className="mr-4 flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-gray-100 px-2 py-1">
      <span className="text-xs text-gray-500">{weekday}</span>
      <span className="text-lg font-bold text-gray-800">{day}</span>
    </div>
  )
}

const MEETINGS_PER_PAGE = 5

const MeetingList = ({
  bookings,
  onDeleteClick,
  showDelete,
  onFinishClick,
}) => {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(bookings.length / MEETINGS_PER_PAGE)
  const paginated = bookings.slice(
    (page - 1) * MEETINGS_PER_PAGE,
    page * MEETINGS_PER_PAGE
  )

  return (
    <>
      {paginated.length === 0 ? (
        <div className="p-4 text-sm text-gray-400">No meetings.</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {paginated.map((b) => {
            const status = getStatus(b.startTime, b.endTime)
            const startTime = parseBookingDateTime(b.startTime)
            const endTime = parseBookingDateTime(b.endTime)
            return (
              <div key={b.id} className="flex items-start p-4">
                {dateCard(b.startTime)}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{b.title}</h3>
                    <span className="text-sm text-gray-500">
                      {startTime
                        ? startTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}{' '}
                      -{' '}
                      {endTime
                        ? endTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{b.notes}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-600">
                    Meeting Room: {b.meetingRoom?.name || 'N/A'}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-bold ${statusColor(status)}`}
                    >
                      {status}
                    </span>
                    {showDelete && status === 'Upcoming' && (
                      <button
                        onClick={() => onDeleteClick(b)}
                        className="ml-2 rounded bg-red-500 px-2 py-1 text-xs text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                    {status === 'Ongoing' && (
                      <button
                        onClick={() => onFinishClick(b)}
                        className="ml-2 rounded bg-green-500 px-2 py-1 text-xs text-white transition hover:bg-red-700"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}

const UpcomingBookings = ({ userId }) => {
  const { data, loading, error, refetch } = useQuery(BOOKINGS_QUERY, {
    variables: { userId },
    fetchPolicy: 'network-only',
  })

  const [deleteBooking] = useMutation(DELETE_BOOKING_MUTATION, {
    onCompleted: () => {
      // Notify other components about the update
      window.dispatchEvent(new Event('bookingsUpdated'))
      window.localStorage.setItem('bookingsUpdated', Date.now())
    },
    refetchQueries: [{ query: BOOKINGS_QUERY, variables: { userId } }],
  })

  const [finishBooking] = useMutation(FINISH_BOOKING_MUTATION, {
    onCompleted: () => {
      // Notify other components about the update
      window.dispatchEvent(new Event('bookingsUpdated'))
      window.localStorage.setItem('bookingsUpdated', Date.now())
    },
    refetchQueries: [{ query: BOOKINGS_QUERY, variables: { userId } }],
  })

  // Popup state
  const [showPopup, setShowPopup] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState(null)
  const [showPast, setShowPast] = useState(false)

  // Local state for bookings
  const [bookings, setBookings] = useState([])

  // Update bookings when data changes
  useEffect(() => {
    if (data?.bookings) setBookings(data.bookings)
  }, [data])

  // Listen for booking updates (event-driven instead of polling)
  useEffect(() => {
    const handleBookingUpdated = async () => {
      console.log(
        '📅 UpcomingBookings: bookingsUpdated event received, refetching...'
      )
      const result = await refetch()
      if (result.data?.bookings) {
        setBookings(result.data.bookings)
      }
    }

    // Listen for custom event from booking components
    window.addEventListener('bookingsUpdated', handleBookingUpdated)

    // Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'bookingsUpdated') {
        console.log(
          '📅 UpcomingBookings: bookingsUpdated storage event, refetching...'
        )
        refetch().then((result) => {
          if (result.data?.bookings) {
            setBookings(result.data.bookings)
          }
        })
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refetch])

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking)
    setShowPopup(true)
  }

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking({ variables: { id: bookingToDelete.id } })
    }
    setShowPopup(false)
    setBookingToDelete(null)
  }

  const cancelDelete = () => {
    setShowPopup(false)
    setBookingToDelete(null)
  }

  const handleFinishClick = (booking) => {
    finishBooking({
      variables: {
        id: booking.id,
        endTime: toBookingDateTimeInput(new Date()),
      },
    })
  }

  if (loading && bookings.length === 0) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!bookings.length) return <div>No bookings yet.</div>

  const upcoming = bookings.filter(
    (b) => getStatus(b.startTime, b.endTime) === 'Upcoming'
  )
  const ongoing = bookings.filter(
    (b) => getStatus(b.startTime, b.endTime) === 'Ongoing'
  )
  const expired = bookings.filter(
    (b) => getStatus(b.startTime, b.endTime) === 'Expired'
  )

  return (
    <section className="col-span-1 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">My Bookings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPast(false)}
            className={buttonVariants({
              variant: showPast ? 'outline' : 'primary',
              size: 'sm',
            })}
          >
            Upcoming & Ongoing
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={buttonVariants({
              variant: showPast ? 'primary' : 'outline',
              size: 'sm',
            })}
          >
            Past Meetings
          </button>
        </div>
      </div>

      {!showPast ? (
        <>
          <Widget
            mode="compact"
            className="mb-4"
            header
            title="Upcoming Meetings"
          >
            <MeetingList
              bookings={upcoming}
              onDeleteClick={handleDeleteClick}
              showDelete={true}
            />
          </Widget>
          <Widget mode="compact" header title="Ongoing Meetings">
            <MeetingList
              bookings={ongoing}
              onFinishClick={handleFinishClick}
              showDelete={false}
            />
          </Widget>
        </>
      ) : (
        <Widget mode="compact" header title="Past Meetings">
          <MeetingList bookings={expired} showDelete={false} />
        </Widget>
      )}

      {/* Popup Card */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Delete Booking</h2>
            <p className="mb-6">
              Are you sure you want to delete{' '}
              <span className="font-bold">{bookingToDelete?.title}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default UpcomingBookings
