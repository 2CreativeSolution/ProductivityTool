export const schema = gql`
  type AttendanceBreak {
    id: Int!
    attendance: Attendance!
    attendanceId: Int!
    breakIn: DateTime!
    breakOut: DateTime
    duration: String
  }

  type Query {
    attendanceBreaks(attendanceId: Int!): [AttendanceBreak!]! @requireAuth
    attendanceBreak(id: Int!): AttendanceBreak @requireAuth
    # NEW: Fetch all breaks for a user in a date range (for weekly overview)
    attendanceBreaksForUserInRange(
      userId: Int!
      start: DateTime!
      end: DateTime!
    ): [AttendanceBreak!]! @requireAuth
  }

  input CreateAttendanceBreakInput {
    attendanceId: Int!
    breakIn: DateTime!
    breakOut: DateTime
    duration: String
  }

  input UpdateAttendanceBreakInput {
    attendanceId: Int
    breakIn: DateTime
    breakOut: DateTime
    duration: String
  }

  type Mutation {
    createAttendanceBreak(input: CreateAttendanceBreakInput!): AttendanceBreak!
      @requireAuth
    updateAttendanceBreak(
      id: Int!
      input: UpdateAttendanceBreakInput!
    ): AttendanceBreak! @requireAuth
    deleteAttendanceBreak(id: Int!): AttendanceBreak! @requireAuth
  }
`
