import { useState, useEffect } from 'react'

import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  DatetimeLocalField,
  NumberField,
  Submit,
  Select,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const GET_MEETING_ROOMS = gql`
  query GetMeetingRooms {
    meetingRooms {
      id
      name
    }
  }
`

const GET_MEETING_ROOM_BOOKINGS = gql`
  query GetMeetingRoomBookings($id: Int!) {
    meetingRoom(id: $id) {
      id
      name
      bookings {
        id
        startTime
        endTime
        user {
          name
          email
        }
      }
    }
  }
`

const BookingForm = (props) => {
  const { data, loading } = useQuery(GET_MEETING_ROOMS)
  const [selectedRoomId, setSelectedRoomId] = useState(
    props?.booking?.meetingRoomId || ''
  )
  const [selectedDate, setSelectedDate] = useState('')

  const { data: roomData, loading: roomLoading } = useQuery(
    GET_MEETING_ROOM_BOOKINGS,
    {
      variables: {
        id: parseInt(selectedRoomId),
      },
      skip: !selectedRoomId,
    }
  )

  useEffect(() => {
    // Set default date to today if not editing
    if (!props?.booking && !selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
    }
  }, [props?.booking, selectedDate])

  const onSubmit = (data) => {
    props.onSave(data, props?.booking?.id)
  }

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const bookedSlots =
    roomData?.meetingRoom?.bookings?.filter((slot) => {
      if (!selectedDate) {
        return false
      }
      const slotDate = new Date(slot.startTime).toISOString().split('T')[0]
      return slotDate === selectedDate
    }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-6 py-16">
      <div className="mx-auto max-w-[1600px] space-y-14 rounded-[2rem] border border-gray-200 bg-white/60 p-10 shadow-2xl backdrop-blur-xl md:p-16">
        <h1 className="text-center text-4xl font-extrabold text-gray-800 md:text-5xl">
          Book a Meeting Room
        </h1>

        <Form
          onSubmit={onSubmit}
          error={props.error}
          className="grid w-full grid-cols-1 items-start gap-16 md:grid-cols-2"
        >
          {/* Calendar Column */}
          <div className="w-full rounded-3xl border border-gray-300 bg-white/70 px-4 py-10 shadow-md backdrop-blur-md transition hover:shadow-xl sm:px-10">
            <div className="mb-6 flex items-center justify-center gap-2 text-red-500">
              <FaRegCalendarAlt className="text-xl" />
              <h2 className="text-xl font-semibold tracking-wide">
                Meeting Details
              </h2>
            </div>

            <Label
              name="title"
              className="rw-label mb-2 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              Title
            </Label>
            <TextField
              name="title"
              defaultValue={props.booking?.title}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="title"
              className="rw-field-error mt-1 text-red-500"
            />

            <Label
              name="notes"
              className="rw-label mb-2 mt-4 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              Notes
            </Label>
            <TextField
              name="notes"
              defaultValue={props.booking?.notes}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              errorClassName="rw-input rw-input-error"
            />
            <FieldError
              name="notes"
              className="rw-field-error mt-1 text-red-500"
            />
          </div>

          {/* Time Slots Column */}
          <div className="w-full rounded-3xl border border-gray-300 bg-white/70 px-4 py-10 shadow-md backdrop-blur-md transition hover:shadow-xl sm:px-10">
            <div className="mb-4 flex items-center gap-2 text-red-500">
              <FaRegClock className="text-xl" />
              <h2 className="text-xl font-semibold tracking-wide">
                Choose Time
              </h2>
            </div>

            <Label
              name="startTime"
              className="rw-label mb-2 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              Start Time
            </Label>
            <DatetimeLocalField
              name="startTime"
              defaultValue={formatDatetime(props.booking?.startTime)}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="startTime"
              className="rw-field-error mt-1 text-red-500"
            />

            <Label
              name="endTime"
              className="rw-label mb-2 mt-4 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              End Time
            </Label>
            <DatetimeLocalField
              name="endTime"
              defaultValue={formatDatetime(props.booking?.endTime)}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="endTime"
              className="rw-field-error mt-1 text-red-500"
            />

            <Label
              name="userId"
              className="rw-label mb-2 mt-4 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              User ID
            </Label>
            <NumberField
              name="userId"
              defaultValue={props.booking?.userId}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="userId"
              className="rw-field-error mt-1 text-red-500"
            />

            <Label
              name="meetingRoomId"
              className="rw-label mb-2 mt-4 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              Select Meeting Room
            </Label>
            <Select
              name="meetingRoomId"
              defaultValue={props.booking?.meetingRoomId}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
              disabled={loading}
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              <option value="">Select a meeting room</option>
              {data?.meetingRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
            <FieldError
              name="meetingRoomId"
              className="rw-field-error mt-1 text-red-500"
            />

            {/* Date Selection for Availability */}
            <Label
              name="bookingDate"
              className="rw-label mb-2 mt-4 font-semibold text-gray-700"
              errorClassName="rw-label rw-label-error"
            >
              Select Date to Check Availability
            </Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Availability Display */}
            {selectedRoomId && selectedDate && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-gray-700">
                  Room Availability for {selectedDate}
                </h3>
                {roomLoading ? (
                  <p className="text-gray-500">Checking availability...</p>
                ) : bookedSlots.length === 0 ? (
                  <p className="font-medium text-green-600">
                    ✅ This room is available all day!
                  </p>
                ) : (
                  <div>
                    <p className="mb-2 font-medium text-amber-600">
                      ⚠️ Already booked times:
                    </p>
                    <div className="space-y-2">
                      {bookedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="rounded border border-red-200 bg-red-50 p-2"
                        >
                          <div className="text-sm font-medium text-red-800">
                            {formatTime(slot.startTime)} -{' '}
                            {formatTime(slot.endTime)}
                          </div>
                          <div className="text-xs text-red-600">
                            Booked by: {slot.user.name} ({slot.user.email})
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      💡 Choose a different time slot to avoid conflicts
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-span-2 mt-8 flex justify-center">
            <Submit
              disabled={props.loading}
              className="rw-button rw-button-blue rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {props.loading ? 'Saving...' : 'Save Booking'}
            </Submit>
          </div>

          {props.error && (
            <div className="col-span-2 mt-4">
              <FormError
                error={props.error}
                wrapperClassName="rw-form-error-wrapper"
                titleClassName="rw-form-error-title"
                listClassName="rw-form-error-list"
              />
            </div>
          )}
        </Form>
      </div>
    </div>
  )
}

export default BookingForm
