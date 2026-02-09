// src/components/ExceptionForm/ExceptionForm.jsx

import React, { useEffect, useMemo, useState } from 'react'

import { useMutation } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import { Input } from 'src/components/Forms/Input/Input'
import { Button } from 'src/components/ui'

const CREATE_EXCEPTION_REQUEST = gql`
  mutation CreateExceptionRequest($input: CreateExceptionRequestInput!) {
    createExceptionRequest(input: $input) {
      id
    }
  }
`

const FORM_TYPES = [
  'Late Arrival',
  'Early Departure',
  'Remote Work',
  'Missed Clock In/Out',
  'Sick Day',
  'Leave',
  'Vacation',
  'Other',
  'Training',
]

const getTodayDateString = () => new Date().toISOString().split('T')[0]

const FORM_CONTROL_CLASS_NAME = 'space-y-2'
const LABEL_CLASS_NAME = 'text-sm font-semibold text-gray-700'
const SELECT_CLASS_NAME =
  'h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 transition-[border-color,box-shadow] focus:border-[#322e85] focus:outline-none focus:ring-2 focus:ring-[#322e85]/30 focus-visible:border-[#322e85] focus-visible:ring-2 focus-visible:ring-[#322e85]/30'

const ExceptionForm = ({
  onSuccess,
  formId,
  hideSubmitButton,
  onLoadingChange,
}) => {
  const { currentUser } = useAuth()
  const inputIdPrefix = useMemo(
    () => `exception-form-${Math.random().toString(36).slice(2)}`,
    []
  )
  const resolvedFormId = formId || `${inputIdPrefix}-form`
  const [type, setType] = useState(FORM_TYPES[0])
  const [date, setDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [success, setSuccess] = useState(false)
  const [createExceptionRequest, { loading }] = useMutation(
    CREATE_EXCEPTION_REQUEST
  )

  const showFromToDates = useMemo(
    () => ['Remote Work', 'Leave', 'Vacation', 'Training'].includes(type),
    [type]
  )
  const showReadOnlyToday =
    type === 'Late Arrival' || type === 'Early Departure' || type === 'Sick Day'
  const showDateField = type === 'Missed Clock In/Out' || type === 'Other'

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

  const handleSubmit = async (e) => {
    e.preventDefault()

    let finalDate = ''
    if (
      type === 'Late Arrival' ||
      type === 'Early Departure' ||
      type === 'Sick Day'
    ) {
      finalDate = `${getTodayDateString()}T00:00:00Z`
    } else if (
      type === 'Remote Work' ||
      type === 'Leave' ||
      type === 'Vacation' ||
      type === 'Training'
    ) {
      finalDate = `${fromDate}T00:00:00Z`
    } else {
      finalDate = `${date}T00:00:00Z`
    }

    const finalReason =
      ['Remote Work', 'Leave', 'Vacation', 'Training'].includes(type) && toDate
        ? `${reason} (To: ${toDate})`
        : reason

    try {
      await createExceptionRequest({
        variables: {
          input: {
            userId: currentUser.id,
            type,
            date: finalDate,
            reason: finalReason,
            status: 'Pending',
          },
        },
      })
      window.dispatchEvent(new Event('exceptionRequestsUpdated'))
      window.localStorage.setItem('exceptionRequestsUpdated', Date.now())
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  return (
    <div>
      {success && (
        <div className="mb-4 font-semibold text-green-600">
          Request submitted!
        </div>
      )}
      <form id={resolvedFormId} onSubmit={handleSubmit} className="space-y-4">
        <div className={FORM_CONTROL_CLASS_NAME}>
          <label className={LABEL_CLASS_NAME} htmlFor={`${inputIdPrefix}-type`}>
            Type
          </label>
          <div className="flex items-center gap-2">
            <select
              id={`${inputIdPrefix}-type`}
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={SELECT_CLASS_NAME}
            >
              {FORM_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showReadOnlyToday && (
          <div className={FORM_CONTROL_CLASS_NAME}>
            <label
              className={LABEL_CLASS_NAME}
              htmlFor={`${inputIdPrefix}-today`}
            >
              Date
            </label>
            <Input
              framework="native"
              id={`${inputIdPrefix}-today`}
              type="date"
              value={getTodayDateString()}
              readOnly
              className="bg-gray-100 text-gray-600"
            />
          </div>
        )}

        {showFromToDates && (
          <>
            <div className={FORM_CONTROL_CLASS_NAME}>
              <label
                className={LABEL_CLASS_NAME}
                htmlFor={`${inputIdPrefix}-from`}
              >
                From
              </label>
              <Input
                framework="native"
                id={`${inputIdPrefix}-from`}
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className={FORM_CONTROL_CLASS_NAME}>
              <label
                className={LABEL_CLASS_NAME}
                htmlFor={`${inputIdPrefix}-to`}
              >
                To
              </label>
              <Input
                framework="native"
                id={`${inputIdPrefix}-to`}
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {showDateField && (
          <div className={FORM_CONTROL_CLASS_NAME}>
            <label
              className={LABEL_CLASS_NAME}
              htmlFor={`${inputIdPrefix}-date`}
            >
              Date
            </label>
            <Input
              framework="native"
              id={`${inputIdPrefix}-date`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        )}

        <div className={FORM_CONTROL_CLASS_NAME}>
          <label
            className={LABEL_CLASS_NAME}
            htmlFor={`${inputIdPrefix}-reason`}
          >
            Reason
          </label>
          <textarea
            id={`${inputIdPrefix}-reason`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="h-28 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 transition-[border-color,box-shadow] focus:border-[#322e85] focus:outline-none focus:ring-2 focus:ring-[#322e85]/30 focus-visible:border-[#322e85] focus-visible:ring-2 focus-visible:ring-[#322e85]/30"
          />
        </div>

        {!hideSubmitButton && (
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        )}
      </form>
    </div>
  )
}

export default ExceptionForm
