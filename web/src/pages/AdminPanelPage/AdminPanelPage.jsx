import React, { useState, useEffect } from 'react'

import {
  FolderIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'

import { Link } from '@redwoodjs/router'
import { Metadata, useQuery, useMutation, gql } from '@redwoodjs/web'

import AdminVacationManager from 'src/components/AdminVacationManager/AdminVacationManager'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import OutlookEmailTestComponent from 'src/components/OutlookEmailTestComponent/OutlookEmailTestComponent'

import MeetingRoomsSection from './MeetingRoomsSection'

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

const ALL_USERS_ATTENDANCE_QUERY = gql`
  query AllUsersAttendance {
    users {
      id
      name
      roles
      attendances {
        id
        duration
        status
        clockIn
        clockOut
      }
    }
  }
`

const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
      name
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

const OFFICE_HOURS_QUERY = gql`
  query OfficeHours {
    officeHourses {
      id
      startTime
      endTime
    }
  }
`
const UPDATE_OFFICE_HOURS = gql`
  mutation UpdateOfficeHours($id: Int!, $input: UpdateOfficeHoursInput!) {
    updateOfficeHours(id: $id, input: $input) {
      id
      startTime
      endTime
    }
  }
`

const UPDATE_USER_ROLES = gql`
  mutation UpdateUserRoles($id: Int!, $roles: [Role!]!) {
    updateUserRoles(id: $id, roles: $roles) {
      id
      roles
    }
  }
`

const AdminPanelPage = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const { data, loading, error, refetch } = useQuery(EXCEPTION_REQUESTS_QUERY, {
    fetchPolicy: 'network-only',
  })

  const {
    data: allUsersData,
    loading: allUsersLoading,
    error: allUsersError,
    refetch: refetchUsers,
  } = useQuery(ALL_USERS_ATTENDANCE_QUERY, { fetchPolicy: 'network-only' })

  const [meetingRoomsKey, setMeetingRoomsKey] = useState(0)
  const handleMeetingRoomsChanged = () => setMeetingRoomsKey((k) => k + 1)

  const [updateExceptionRequest] = useMutation(UPDATE_EXCEPTION_REQUEST, {
    onCompleted: () => {
      refetch()
      window.dispatchEvent(new Event('exceptionRequestsUpdated'))
      window.localStorage.setItem('exceptionRequestsUpdated', Date.now())
    },
  })

  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      refetchUsers()
    },
  })

  const {
    data: _officeHoursData,
    loading: _officeHoursLoading,
    error: _officeHoursError,
    refetch: _refetchOfficeHours,
  } = useQuery(OFFICE_HOURS_QUERY)
  const [_updateOfficeHours] = useMutation(UPDATE_OFFICE_HOURS, {
    onCompleted: () => _refetchOfficeHours(),
  })

  const [updateUserRoles] = useMutation(UPDATE_USER_ROLES, {
    onCompleted: () => refetchUsers(),
  })

  const _officeHours = _officeHoursData?.officeHours || {
    startTime: '09:00',
    endTime: '18:00',
  }
  const [startTime] = useState(_officeHours.startTime)
  const [endTime] = useState(_officeHours.endTime)

  const _handleSave = () => {
    _updateOfficeHours({
      variables: { id: _officeHours.id, input: { startTime, endTime } },
    })
  }

  const handleRoleChange = (user, role) => {
    const hasRole = user.roles.includes(role)
    const newRoles = hasRole
      ? user.roles.filter((r) => r !== role)
      : [...user.roles, role]
    updateUserRoles({ variables: { id: user.id, roles: newRoles } })
  }

  const [exceptionPage, setExceptionPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const itemsPerPage = 5

  const _paginatedExceptions = data?.exceptionRequests?.slice(
    (exceptionPage - 1) * itemsPerPage,
    exceptionPage * itemsPerPage
  )
  const paginatedUsers = allUsersData?.users?.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  )

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

  const pendingExceptions = (data?.exceptionRequests || [])
    .filter((form) => form.status === 'Pending')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .reverse()

  const paginatedPendingExceptions = pendingExceptions.slice(
    (exceptionPage - 1) * itemsPerPage,
    exceptionPage * itemsPerPage
  )

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
      <Metadata
        title="Admin Panel"
        description="Manage users and exception requests"
      />
      <AppSidebar />

      {/* Delete User Dialog */}
      {showDeleteDialog && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Delete User
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-red-600">
                {userToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                onClick={() => {
                  deleteUser({ variables: { id: userToDelete.id } })
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <h1 className="mb-10 text-center text-4xl font-extrabold tracking-tight text-blue-800">
          Admin Panel
        </h1>

        {/* Multi-Domain Email Testing System */}
        <div className="mb-10">
          <OutlookEmailTestComponent />
        </div>

        {/* Admin Quick Access */}
        <div className="mb-10 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
          <h2 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
            Admin Quick Access
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/admin/supply-categories"
              className="flex transform items-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
            >
              <div className="flex items-center">
                <FolderIcon className="mr-3 h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Manage Categories</h3>
                  <p className="text-sm text-green-100">
                    Add, edit & organize supply categories
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/supply-requests"
              className="flex transform items-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="mr-3 h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Supply Requests</h3>
                  <p className="text-sm text-blue-100">
                    Review & approve supply requests
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/office-supplies"
              className="flex transform items-center rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
            >
              <div className="flex items-center">
                <BuildingOfficeIcon className="mr-3 h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Inventory</h3>
                  <p className="text-sm text-purple-100">
                    Manage office supply inventory
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Manage Users Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Manage Users
            </h2>
            {allUsersLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : allUsersError ? (
              <div className="text-red-500">Error: {allUsersError.message}</div>
            ) : (allUsersData?.users || []).length === 0 ? (
              <div className="text-gray-500">No users found.</div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <label>
                          <input
                            type="checkbox"
                            checked={user.roles.includes('ADMIN')}
                            onChange={() => handleRoleChange(user, 'ADMIN')}
                          />{' '}
                          Admin
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={user.roles.includes('USER')}
                            onChange={() => handleRoleChange(user, 'USER')}
                          />{' '}
                          User
                        </label>
                        <button
                          className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteDialog(true)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    className="rounded bg-gray-200 px-4 py-2 font-medium transition hover:bg-gray-300"
                    disabled={userPage === 1}
                    onClick={() => setUserPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {userPage} of{' '}
                    {Math.ceil(allUsersData?.users?.length / itemsPerPage)}
                  </span>
                  <button
                    className="rounded bg-gray-200 px-4 py-2 font-medium transition hover:bg-gray-300"
                    disabled={
                      userPage ===
                      Math.ceil(allUsersData?.users?.length / itemsPerPage)
                    }
                    onClick={() => setUserPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Exception Requests Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Pending Exception Requests
            </h2>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error.message}</div>
            ) : pendingExceptions.length === 0 ? (
              <div className="text-gray-500">No pending requests.</div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedPendingExceptions.map((form) => (
                    <div
                      key={form.id}
                      className={`flex flex-col rounded-xl border-l-4 p-5 shadow-sm transition ${typeColors[form.type] || typeColors['Other']}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {form.user?.name || form.userId}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            form.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : form.status === 'Approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {form.status}
                        </span>
                      </div>
                      <div className="mb-1 flex items-center gap-2 text-sm italic text-gray-500">
                        <span
                          className={`h-2 w-2 rounded-full ${typeColors[form.type]?.split(' ')[0].replace('border', 'bg') || 'bg-gray-300'}`}
                        ></span>
                        {form.type}
                      </div>
                      <div className="mb-1 text-xs text-gray-500">
                        {form.date ? (
                          <>
                            Date:{' '}
                            {new Date(form.date).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </>
                        ) : null}
                      </div>
                      <p className="max-h-24 max-w-xs overflow-y-auto break-words text-sm text-gray-700">
                        {form.reason}
                      </p>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          className="rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-green-600"
                          onClick={() => handleAction(form.id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                          onClick={() => handleAction(form.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    className="rounded bg-gray-200 px-4 py-2 font-medium transition hover:bg-gray-300"
                    disabled={exceptionPage === 1}
                    onClick={() => setExceptionPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {exceptionPage} of{' '}
                    {Math.ceil(pendingExceptions.length / itemsPerPage)}
                  </span>
                  <button
                    className="rounded bg-gray-200 px-4 py-2 font-medium transition hover:bg-gray-300"
                    disabled={
                      exceptionPage ===
                      Math.ceil(pendingExceptions.length / itemsPerPage)
                    }
                    onClick={() => setExceptionPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Office Hours Section */}
        {/*
        <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Office Hours
          </h2>
          {officeHoursLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : officeHoursError ? (
            <div className="text-red-500">Error: {officeHoursError.message}</div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleSave() }} className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Save Office Hours
                </button>
              </div>
            </form>
          )}
        </div> */}

        {/* Meeting Rooms Section */}
        <div className="mt-12">
          <MeetingRoomsSection
            key={meetingRoomsKey}
            onChanged={handleMeetingRoomsChanged}
          />
        </div>

        {/* Vacation Management Section */}
        <div className="mt-8">
          <AdminVacationManager />
        </div>
      </div>
    </>
  )
}

export default AdminPanelPage
