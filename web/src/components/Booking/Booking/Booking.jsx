import React, { useState, useEffect } from 'react'

import { format } from 'date-fns'
import Calendar from 'react-calendar'
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'

import { useMutation, useQuery } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
//import { toast } from '@redwoodjs/web/toast'
import BookingLog from 'src/components/BookingLog/BookingLog'
import { buttonVariants } from 'src/components/ui/button'
import { Widget } from 'src/components/ui/widget'
import {
  parseBookingDateTime,
  toBookingDateTimeInput,
} from 'src/lib/bookingDateTime'

import 'react-calendar/dist/Calendar.css'

import MeetingRoomSelector from '../BookingForm/MeetingRoomSelector'
const CREATE_BOOKING = gql`
  mutation CreateBookingMutation($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
    }
  }
`

const BOOKINGS_QUERY = gql`
  query BookingsForForm {
    bookings {
      id
      startTime
      endTime
      meetingRoomId
    }
  }
`

export const BookingForm = ({ refetchBookings }) => {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [createBooking] = useMutation(CREATE_BOOKING)
  const [selectRoomId, setSelectedRoomId] = useState('')
  const { data: bookingsData, refetch: refetchBookingsData } = useQuery(
    BOOKINGS_QUERY,
    {
      variables: { userId: currentUser?.id },
    }
  )

  const slots = [
    { start: '09:00 AM', end: '09:30 AM' },
    { start: '09:30 AM', end: '10:00 AM' },
    { start: '10:00 AM', end: '10:30 AM' },
    { start: '10:30 AM', end: '11:00 AM' },
    { start: '11:00 AM', end: '11:30 AM' },
    { start: '11:30 AM', end: '12:00 PM' },
    { start: '12:00 PM', end: '12:30 PM' },
    { start: '12:30 PM', end: '01:00 PM' },
    { start: '01:00 PM', end: '01:30 PM' },
    { start: '01:30 PM', end: '02:00 PM' },
    { start: '02:00 PM', end: '02:30 PM' },
    { start: '02:30 PM', end: '03:00 PM' },
    { start: '03:00 PM', end: '03:30 PM' },
    { start: '03:30 PM', end: '04:00 PM' },
    { start: '04:00 PM', end: '04:30 PM' },
    { start: '04:30 PM', end: '05:00 PM' },
  ]

  // Helper to parse slot time string to Date object on selectedDate
  const parseSlotTime = (date, timeStr) => {
    const [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier === 'PM' && hours !== 12) {
      hours += 12
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0
    }
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }

  // Check if slot is in the past relative to now
  const isSlotInPast = (slot) => {
    const now = new Date()
    const slotEnd = parseSlotTime(selectedDate, slot.end)
    return slotEnd <= now
  }

  // Check if slot overlaps with any existing booking for the SAME meeting room
  const isSlotBooked = (slot) => {
    if (!bookingsData || !bookingsData.bookings || !selectRoomId) return false
    const slotStart = parseSlotTime(selectedDate, slot.start)
    const slotEnd = parseSlotTime(selectedDate, slot.end)

    return bookingsData.bookings.some((booking) => {
      // Only check bookings for the same meeting room
      if (booking.meetingRoomId !== Number(selectRoomId)) {
        return false
      }

      const bookingStart = parseBookingDateTime(booking.startTime)
      const bookingEnd = parseBookingDateTime(booking.endTime)
      if (!bookingStart || !bookingEnd) {
        return false
      }
      // Check if slot overlaps with booking
      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      )
    })
  }

  const toggleSlotSelection = (slot) => {
    // Prevent selecting disabled slots
    if (isSlotInPast(slot) || isSlotBooked(slot)) {
      return
    }
    setSelectedSlots((prev) =>
      prev.some((s) => s.start === slot.start && s.end === slot.end)
        ? prev.filter((s) => s.start !== slot.start || s.end !== slot.end)
        : [...prev, slot]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.')
      setSuccess('')
      return
    }

    if (!title.trim()) {
      setError('Please enter a meeting title.')
      setSuccess('')
      return
    }

    if (!selectRoomId) {
      setError('Please select a meeting room.')
      setSuccess('')
      return
    }

    // Use parseSlotTime for mobile compatibility!
    const startTime = parseSlotTime(selectedDate, selectedSlots[0].start)
    const endTime = parseSlotTime(
      selectedDate,
      selectedSlots[selectedSlots.length - 1].end
    )

    if (
      !startTime ||
      isNaN(startTime.getTime()) ||
      !endTime ||
      isNaN(endTime.getTime())
    ) {
      setError('Invalid start or end time.')
      setSuccess('')
      return
    }

    try {
      await createBooking({
        variables: {
          input: {
            title,
            userId: currentUser.id,
            startTime: toBookingDateTimeInput(startTime),
            endTime: toBookingDateTimeInput(endTime),
            notes,
            meetingRoomId: selectRoomId ? Number(selectRoomId) : null,
          },
        },
      })
      setSuccess('Booking successful!')
      setError('')
      setTitle('')
      setSelectedSlots([])
      setNotes('')

      // Notify other components about the update
      window.dispatchEvent(new Event('bookingsUpdated'))
      window.localStorage.setItem('bookingsUpdated', Date.now())

      if (refetchBookings) refetchBookings()
      if (refetchBookingsData) refetchBookingsData()
    } catch (err) {
      console.error('Error creating booking:', err)
      setError(err.message)
      setSuccess('')
    }
  }

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  return (
    <div className="w-full space-y-8">
      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2"
      >
        {/* Calendar Column */}
        <Widget className="w-full p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-center gap-2 text-red-500 md:mb-6">
            <FaRegCalendarAlt className="text-xl" />
            <h2 className="text-lg font-semibold tracking-wide md:text-xl">
              Choose Date
            </h2>
          </div>
          <div className="flex justify-center">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              className="react-calendar w-full max-w-[350px] rounded-2xl p-2 md:max-w-[700px] md:p-6"
              tileClassName={({ date }) =>
                format(date, 'yyyy-MM-dd') ===
                format(selectedDate, 'yyyy-MM-dd')
                  ? 'bg-red-500 text-white font-semibold rounded-xl shadow-md'
                  : 'hover:bg-red-100 hover:shadow-sm rounded-xl transition-all'
              }
            />
          </div>
        </Widget>

        {/* Time Slots Column */}
        <Widget className="flex w-full flex-col items-center p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-red-500 md:mb-4">
            <FaRegClock className="text-xl" />
            <h2 className="text-lg font-semibold tracking-wide md:text-xl">
              Choose Time Slots
            </h2>
          </div>
          <p className="mb-4 text-center text-sm font-medium text-gray-600 md:mb-6 md:text-base">
            {format(selectedDate, 'eeee, MMMM do yyyy')}
          </p>
          <div className="grid max-h-[400px] w-full max-w-[520px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 md:gap-4">
            {slots
              .filter((slot) => !isSlotInPast(slot) && !isSlotBooked(slot))
              .map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleSlotSelection(slot)}
                  className={`transform rounded-xl border py-2 text-sm font-semibold transition duration-200 md:py-3 md:text-base ${
                    selectedSlots.some(
                      (s) => s.start === slot.start && s.end === slot.end
                    )
                      ? 'scale-105 bg-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-800 hover:scale-105 hover:bg-red-100'
                  }`}
                >
                  {slot.start} - {slot.end}
                </button>
              ))}
          </div>
          {slots.filter((slot) => !isSlotInPast(slot) && !isSlotBooked(slot))
            .length === 0 && (
            <p className="mt-4 text-center text-gray-600">
              No available slots for the selected date. Please choose another
              date or check back later.
            </p>
          )}
        </Widget>

        {/* Meeting Title and Notes */}
        <div className="col-span-1 mt-2 flex flex-col gap-4 md:col-span-2">
          <div>
            <MeetingRoomSelector
              selectedRoomId={selectRoomId}
              onChange={(roomId) => setSelectedRoomId(roomId)}
            />
          </div>
          <input
            type="text"
            placeholder="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rw-input w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:ring focus:ring-red-500"
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rw-input w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:ring focus:ring-red-500"
          />
        </div>

        <div className="col-span-1 mt-2 flex md:col-span-2">
          <button
            type="submit"
            className={buttonVariants({ variant: 'primary' })}
            disabled={!selectRoomId}
          >
            Book Now
          </button>
        </div>
      </form>
      {error && (
        <div className="mb-2 text-sm font-medium text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-2 text-sm font-medium text-green-600">{success}</div>
      )}
      <BookingLog />
    </div>
  )
}

export const BookingDetail = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800">Booking Detail</h2>
      <p className="text-gray-600">Details about the booking will go here.</p>
    </div>
  )
}

export default BookingForm
