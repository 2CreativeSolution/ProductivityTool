import React, { useState } from 'react'

import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const EMPLOYEES_QUERY = gql`
  query EmployeesQuery {
    users {
      id
      name
      email
      department
      designation
      employeeId
      dateOfJoining
      reportingManagerUser {
        name
        email
      }
      roles
      projectAllocations {
        id
        role
        hoursAllocated
        isActive
        project {
          name
          code
          status
        }
      }
    }
  }
`

const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      department
      designation
      employeeId
    }
  }
`

const EmployeeManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [editDialog, setEditDialog] = useState({ isOpen: false })
  const [viewMode, setViewMode] = useState('table') // 'table' or 'details'

  const { data, loading, refetch } = useQuery(EMPLOYEES_QUERY)

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE_MUTATION, {
    onCompleted: () => {
      toast.success('Employee updated successfully')
      setEditDialog({ isOpen: false })
      refetch()
    },
    onError: (error) => {
      toast.error(`Error updating employee: ${error.message}`)
    },
  })

  const departments = [
    'ENGINEERING',
    'DESIGN',
    'MARKETING',
    'SALES',
    'HR',
    'FINANCE',
    'OPERATIONS',
  ]

  const designations = [
    'JUNIOR_DEVELOPER',
    'SENIOR_DEVELOPER',
    'LEAD_DEVELOPER',
    'ARCHITECT',
    'DESIGNER',
    'SENIOR_DESIGNER',
    'MARKETING_SPECIALIST',
    'SALES_REPRESENTATIVE',
    'HR_SPECIALIST',
    'ACCOUNTANT',
    'PROJECT_MANAGER',
    'PRODUCT_MANAGER',
  ]

  const getDepartmentColor = (department) => {
    const colors = {
      ENGINEERING: 'bg-blue-100 text-blue-800',
      DESIGN: 'bg-purple-100 text-purple-800',
      MARKETING: 'bg-green-100 text-green-800',
      SALES: 'bg-yellow-100 text-yellow-800',
      HR: 'bg-pink-100 text-pink-800',
      FINANCE: 'bg-gray-100 text-gray-800',
      OPERATIONS: 'bg-orange-100 text-orange-800',
    }
    return colors[department] || 'bg-gray-100 text-gray-800'
  }

  const getActiveProjectsCount = (allocations) => {
    return allocations.filter((allocation) => {
      if (!allocation.isActive) return false
      const status = allocation.project.status?.toLowerCase()
      return status === 'active' || status === 'on hold'
    }).length
  }

  const getTotalHours = (allocations) => {
    return allocations
      .filter((allocation) => {
        if (!allocation.isActive) return false
        const status = allocation.project.status?.toLowerCase()
        return status === 'active' || status === 'on hold'
      })
      .reduce(
        (total, allocation) => total + (allocation.hoursAllocated || 0),
        0
      )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Employee Directory & Project Allocations
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage employee information and view their current project
            assignments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Active Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Hours/Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data?.users?.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name || 'No Name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.email}
                        </div>
                        {employee.employeeId && (
                          <div className="text-xs text-gray-400">
                            ID: {employee.employeeId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {employee.department ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getDepartmentColor(employee.department)}`}
                      >
                        {employee.department.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {employee.designation?.replace(/_/g, ' ') || 'Not set'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getActiveProjectsCount(employee.projectAllocations)}
                    </div>
                    {employee.projectAllocations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {employee.projectAllocations
                          .filter((a) => a.isActive)
                          .slice(0, 2)
                          .map((a) => a.project.name)
                          .join(', ')}
                        {getActiveProjectsCount(employee.projectAllocations) >
                          2 && '...'}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getTotalHours(employee.projectAllocations)}h
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {employee.reportingManagerUser?.name || 'Not assigned'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => {
                        console.log('Edit clicked for employee:', employee.name) // Debug log
                        setSelectedEmployee(employee)
                        setEditDialog({ isOpen: true })
                        setViewMode('table')
                      }}
                      className="mr-3 font-medium text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        console.log(
                          'View Details clicked for employee:',
                          employee.name
                        ) // Debug log
                        setSelectedEmployee(employee)
                        setEditDialog({ isOpen: false })
                        setViewMode('details')
                      }}
                      className="font-medium text-green-600 hover:text-green-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Panel with Slide Animation */}
      {selectedEmployee && viewMode === 'details' && !editDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedEmployee(null)
              setViewMode('table')
            }
          }}
        >
          <div className="animate-slide-in-right h-full w-full max-w-2xl translate-x-0 transform overflow-y-auto bg-white shadow-2xl transition-all duration-500 ease-out">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedEmployee.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Employee Details & Project Assignments
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmployee(null)
                    setViewMode('table')
                  }}
                  className="group flex h-12 w-12 transform items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-red-600 hover:shadow-xl"
                  title="Close Details"
                >
                  <span className="text-2xl font-bold leading-none transition-transform duration-200 group-hover:rotate-90">
                    ×
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Employee Information Section */}
              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <i className="ri-user-line text-blue-600"></i>
                  Employee Information
                </h4>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-900">
                        {selectedEmployee.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                      <span className="font-medium text-gray-600">
                        Employee ID:
                      </span>
                      <span className="text-gray-900">
                        {selectedEmployee.employeeId || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                      <span className="font-medium text-gray-600">
                        Department:
                      </span>
                      <span className="text-gray-900">
                        {selectedEmployee.department?.replace('_', ' ') ||
                          'Not set'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                      <span className="font-medium text-gray-600">
                        Designation:
                      </span>
                      <span className="text-gray-900">
                        {selectedEmployee.designation?.replace(/_/g, ' ') ||
                          'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                      <span className="font-medium text-gray-600">
                        Reporting Manager:
                      </span>
                      <span className="text-gray-900">
                        {selectedEmployee.reportingManagerUser?.name ||
                          'Not assigned'}
                      </span>
                    </div>
                    {selectedEmployee.dateOfJoining && (
                      <div className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                        <span className="font-medium text-gray-600">
                          Date of Joining:
                        </span>
                        <span className="text-gray-900">
                          {new Date(
                            selectedEmployee.dateOfJoining
                          ).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-blue-600">
                    {getActiveProjectsCount(
                      selectedEmployee.projectAllocations
                    )}
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    Active Projects
                  </div>
                </div>
                <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-green-600">
                    {getTotalHours(selectedEmployee.projectAllocations)}h
                  </div>
                  <div className="text-sm font-medium text-green-700">
                    Total Hours/Day
                  </div>
                </div>
              </div>

              {/* Current Project Allocations */}
              <div>
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <i className="ri-briefcase-line text-green-600"></i>
                  Current Project Allocations
                </h4>
                <div className="space-y-3">
                  {selectedEmployee.projectAllocations
                    .filter((allocation) => allocation.isActive)
                    .map((allocation) => (
                      <div
                        key={allocation.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="mb-1 font-semibold text-gray-900">
                              {allocation.project.name}
                            </h5>
                            <p className="mb-2 text-sm text-gray-600">
                              <i className="ri-user-star-line mr-1"></i>
                              Role: {allocation.role}
                            </p>
                            <p className="text-sm text-gray-600">
                              <i className="ri-code-line mr-1"></i>
                              Project Code: {allocation.project.code}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="mb-1 text-lg font-bold text-gray-900">
                              {allocation.hoursAllocated}h/day
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                allocation.project.status === 'ACTIVE'
                                  ? 'border border-green-200 bg-green-100 text-green-800'
                                  : 'border border-gray-200 bg-gray-100 text-gray-800'
                              }`}
                            >
                              {allocation.project.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {selectedEmployee.projectAllocations.filter((a) => a.isActive)
                    .length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 text-center">
                      <i className="ri-briefcase-line mb-2 block text-4xl text-gray-300"></i>
                      <p className="text-sm italic text-gray-500">
                        No active project allocations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Dialog */}
      {editDialog.isOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Employee
              </h3>
              <button
                onClick={() => setEditDialog({ isOpen: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                updateEmployee({
                  variables: {
                    id: selectedEmployee.id,
                    input: {
                      name: formData.get('name'),
                      department: formData.get('department'),
                      designation: formData.get('designation'),
                      employeeId: formData.get('employeeId'),
                    },
                  },
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedEmployee.name || ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  defaultValue={selectedEmployee.employeeId || ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  name="department"
                  defaultValue={selectedEmployee.department || ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <select
                  name="designation"
                  defaultValue={selectedEmployee.designation || ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Designation</option>
                  {designations.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditDialog({ isOpen: false })}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement
