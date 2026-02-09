const WALL_DATE_TIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)/

const isValidDate = (value) => value instanceof Date && !isNaN(value.getTime())

/**
 * Parse booking datetimes as local wall time to avoid timezone shifts
 * with legacy TIMESTAMP (without timezone) storage.
 */
export const parseBookingDateTime = (value) => {
  if (!value) return null

  const input = typeof value === 'string' ? value.trim() : String(value)
  const match = input.match(WALL_DATE_TIME_PATTERN)

  if (match) {
    return new Date(`${match[1]}T${match[2]}`)
  }

  const parsed = new Date(input)
  return isValidDate(parsed) ? parsed : null
}

/**
 * Serialize a local Date as fixed wall time with Z suffix so backend DateTime
 * accepts it while preserving local clock value in the current schema.
 */
export const toBookingDateTimeInput = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (!isValidDate(date)) return null

  const pad = (number, size = 2) => String(number).padStart(size, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())
  const millisecond = pad(date.getMilliseconds(), 3)

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`
}
