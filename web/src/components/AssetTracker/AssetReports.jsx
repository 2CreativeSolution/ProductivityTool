import React, { useState } from 'react'

import { useQuery, gql } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

const USER_ASSET_REPORT_QUERY = gql`
  query UserAssetReport($startDate: DateTime, $endDate: DateTime) {
    myAssetAssignmentReport(startDate: $startDate, endDate: $endDate) {
      totalAssignments
      activeAssignments
      returnedAssignments
      overdueAssignments
      assignments {
        id
        issueDate
        returnDate
        expectedReturnDate
        status
        department
        asset {
          id
          assetId
          name
          model
          category {
            name
          }
        }
      }
      assetsByCategory {
        categoryName
        count
        activeCount
        returnedCount
      }
      monthlyStats {
        month
        year
        assignedCount
        returnedCount
      }
    }
  }
`

const ADMIN_ASSET_REPORT_QUERY = gql`
  query AdminAssetReport($startDate: DateTime, $endDate: DateTime) {
    allUsersAssetReport(startDate: $startDate, endDate: $endDate) {
      totalAssignments
      activeAssignments
      returnedAssignments
      overdueAssignments
      assignments {
        id
        issueDate
        returnDate
        expectedReturnDate
        status
        department
        asset {
          id
          assetId
          name
          model
          category {
            name
          }
        }
        user {
          id
          name
          email
        }
      }
      assetsByCategory {
        categoryName
        count
        activeCount
        returnedCount
      }
      monthlyStats {
        month
        year
        assignedCount
        returnedCount
      }
    }
  }
`

const ALL_USERS_QUERY = gql`
  query AllUsersQuery {
    users {
      id
      name
      email
      assetAssignments {
        id
        status
        asset {
          id
          assetId
          name
        }
      }
    }
  }
`

const USER_ASSET_DETAIL_QUERY = gql`
  query UserAssetDetailQuery($userId: Int!) {
    user(id: $userId) {
      id
      name
      email
      assetAssignments {
        id
        issueDate
        returnDate
        expectedReturnDate
        status
        condition
        issueNotes
        returnNotes
        asset {
          id
          assetId
          name
          model
          purchasePrice
          category {
            name
          }
        }
      }
    }
  }
`

const DEPARTMENT_ASSETS_QUERY = gql`
  query DepartmentAssetsQuery($department: String!) {
    assetAssignments {
      id
      issueDate
      returnDate
      expectedReturnDate
      status
      department
      asset {
        id
        assetId
        name
        model
        category {
          name
        }
      }
      user {
        id
        name
        email
      }
    }
  }
`

const AssetReports = () => {
  const { currentUser } = useAuth()
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [activeReportTab, setActiveReportTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState('')

  const isAdmin = currentUser?.roles?.includes('ADMIN')

  // Load different data based on admin features
  const { data: allUsersData, loading: usersLoading } = useQuery(
    ALL_USERS_QUERY,
    {
      skip: !isAdmin,
    }
  )

  const { data: selectedUserData, loading: selectedUserLoading } = useQuery(
    USER_ASSET_DETAIL_QUERY,
    {
      variables: { userId: selectedUser?.id },
      skip: !isAdmin || !selectedUser,
    }
  )

  const { data: departmentData, loading: departmentLoading } = useQuery(
    DEPARTMENT_ASSETS_QUERY,
    {
      variables: { department: selectedDepartment },
      skip: !isAdmin || !selectedDepartment,
    }
  )

  // Use different queries based on user role and admin view
  const {
    data: reportData,
    loading: reportLoading,
    refetch: refetchReport,
  } = useQuery(isAdmin ? ADMIN_ASSET_REPORT_QUERY : USER_ASSET_REPORT_QUERY, {
    variables: {
      startDate: reportDateRange.startDate + 'T00:00:00.000Z',
      endDate: reportDateRange.endDate + 'T23:59:59.999Z',
    },
    skip: isAdmin && activeReportTab !== 'overview',
  })

  // Extract the report data based on user role
  const report = isAdmin
    ? reportData?.allUsersAssetReport
    : reportData?.myAssetAssignmentReport

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A'
  }

  const formatCurrency = (amount) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A'
  }

  const calculateTotalValue = (assignments) => {
    return (
      assignments?.reduce((total, assignment) => {
        return total + (assignment.asset.purchasePrice || 0)
      }, 0) || 0
    )
  }

  const handleReportDateChange = (field, value) => {
    setReportDateRange((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateReport = () => {
    refetchReport({
      startDate: reportDateRange.startDate + 'T00:00:00.000Z',
      endDate: reportDateRange.endDate + 'T23:59:59.999Z',
    })
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setActiveReportTab('employee')
  }

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department)
    setActiveReportTab('department')
  }

  const getDepartmentAssets = () => {
    if (!departmentData?.assetAssignments || !selectedDepartment) return []
    return departmentData.assetAssignments.filter(
      (assignment) => assignment.department === selectedDepartment
    )
  }

  const getUniqueDepartments = () => {
    if (!reportData?.allUsersAssetReport?.assignments) return []
    const departments = new Set()
    reportData.allUsersAssetReport.assignments.forEach((assignment) => {
      if (assignment.department) {
        departments.add(assignment.department)
      }
    })
    return Array.from(departments).sort()
  }

  const exportToCSV = (data, filename) => {
    if (!data?.length) return

    const headers = [
      'Asset ID',
      'Asset Name',
      'Category',
      isAdmin ? 'Employee' : '',
      isAdmin ? 'Email' : '',
      'Department',
      'Issue Date',
      'Expected Return',
      'Return Date',
      'Status',
      'Value',
    ].filter(Boolean)

    const csvContent = [
      headers.join(','),
      ...data.map((assignment) =>
        [
          assignment.asset.assetId,
          `"${assignment.asset.name}"`,
          assignment.asset.category.name,
          isAdmin
            ? `"${assignment.user?.name || assignment.user?.email || 'N/A'}"`
            : '',
          isAdmin ? assignment.user?.email || 'N/A' : '',
          assignment.department || 'N/A',
          formatDate(assignment.issueDate),
          formatDate(assignment.expectedReturnDate),
          formatDate(assignment.returnDate),
          assignment.status,
          assignment.asset.purchasePrice || 0,
        ]
          .filter((_, index) => isAdmin || ![3, 4].includes(index))
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (reportLoading || (isAdmin && usersLoading)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading report...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pt-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
              Asset Reports
            </h1>
            <p className="mt-2 text-gray-600">
              {isAdmin
                ? 'Comprehensive asset assignment reports and analytics'
                : 'Your personal asset assignment report'}
            </p>
          </div>
        </div>

        {/* Admin Tab Navigation */}
        {isAdmin && (
          <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
            <div className="mb-6 flex space-x-6 border-b border-white/20 pb-4">
              <button
                onClick={() => setActiveReportTab('overview')}
                className={`border-b-2 pb-2 font-medium transition-colors duration-200 ${
                  activeReportTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                All Users Overview
              </button>
              <button
                onClick={() => setActiveReportTab('employees')}
                className={`border-b-2 pb-2 font-medium transition-colors duration-200 ${
                  activeReportTab === 'employees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                Employee List
              </button>
              <button
                onClick={() => setActiveReportTab('departments')}
                className={`border-b-2 pb-2 font-medium transition-colors duration-200 ${
                  activeReportTab === 'departments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                Department Reports
              </button>
            </div>
          </div>
        )}

        {/* Regular User Report */}
        {!isAdmin && (
          <>
            {/* Date Range Filters */}
            <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Report Filters
              </h3>
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={reportDateRange.startDate}
                    onChange={(e) =>
                      handleReportDateChange('startDate', e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={reportDateRange.endDate}
                    onChange={(e) =>
                      handleReportDateChange('endDate', e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleGenerateReport}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                  {report?.assignments?.length > 0 && (
                    <button
                      onClick={() =>
                        exportToCSV(
                          report.assignments.map((assignment) => ({
                            ...assignment,
                            user: currentUser,
                          })),
                          `my-asset-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`
                        )
                      }
                      className="rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-green-700"
                    >
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* User Report Content */}
            {report && (
              <>
                {/* Summary Statistics */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.totalAssignments}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Assignments
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {report.activeAssignments}
                    </div>
                    <div className="text-sm text-gray-600">
                      Currently Active
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {report.returnedAssignments}
                    </div>
                    <div className="text-sm text-gray-600">Returned Assets</div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {report.overdueAssignments}
                    </div>
                    <div className="text-sm text-gray-600">Overdue Returns</div>
                  </div>
                </div>

                {/* Assignment History */}
                <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">
                    My Assignment History
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Asset
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Issue Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Return Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {report.assignments.map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {assignment.asset.assetId}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {assignment.asset.name} -{' '}
                                  {assignment.asset.model}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                {assignment.asset.category.name}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {formatDate(assignment.issueDate)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {assignment.returnDate
                                ? formatDate(assignment.returnDate)
                                : '-'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  assignment.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : assignment.status === 'Returned'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {assignment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Admin Views */}
        {isAdmin && (
          <>
            {/* All Users Overview Tab */}
            {activeReportTab === 'overview' && (
              <>
                {/* Date Range Filters */}
                <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Report Filters
                  </h3>
                  <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={reportDateRange.startDate}
                        onChange={(e) =>
                          handleReportDateChange('startDate', e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={reportDateRange.endDate}
                        onChange={(e) =>
                          handleReportDateChange('endDate', e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleGenerateReport}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-blue-700"
                      >
                        Generate Report
                      </button>
                      {report?.assignments?.length > 0 && (
                        <button
                          onClick={() =>
                            exportToCSV(
                              report.assignments,
                              `all-users-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`
                            )
                          }
                          className="rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-green-700"
                        >
                          Export CSV
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {report && (
                  <>
                    {/* Summary Statistics */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                      <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {report.totalAssignments}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Assignments
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {report.activeAssignments}
                        </div>
                        <div className="text-sm text-gray-600">
                          Currently Active
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {report.returnedAssignments}
                        </div>
                        <div className="text-sm text-gray-600">
                          Returned Assets
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {report.overdueAssignments}
                        </div>
                        <div className="text-sm text-gray-600">
                          Overdue Returns
                        </div>
                      </div>
                    </div>

                    {/* Assets by Category */}
                    {report.assetsByCategory.length > 0 && (
                      <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                        <h4 className="mb-4 text-lg font-semibold text-gray-900">
                          Assets by Category
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Active
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Returned
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {report.assetsByCategory.map((category) => (
                                <tr
                                  key={category.categoryName}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {category.categoryName}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {category.count}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">
                                    {category.activeCount}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {category.returnedCount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Assignment History */}
                    <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        All User Assignment History
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Asset
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                User
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Department
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Issue Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Return Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {report.assignments.map((assignment) => (
                              <tr
                                key={assignment.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.asset.assetId}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {assignment.asset.name} -{' '}
                                      {assignment.asset.model}
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                    {assignment.asset.category.name}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.user?.name ||
                                        assignment.user?.email ||
                                        'N/A'}
                                    </div>
                                    {assignment.user?.email &&
                                      assignment.user?.name && (
                                        <div className="text-sm text-gray-500">
                                          {assignment.user.email}
                                        </div>
                                      )}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  {assignment.department ? (
                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                      {assignment.department}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400">
                                      Not specified
                                    </span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {formatDate(assignment.issueDate)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {assignment.returnDate
                                    ? formatDate(assignment.returnDate)
                                    : '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                      assignment.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : assignment.status === 'Returned'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {assignment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Employee List Tab */}
            {activeReportTab === 'employees' && (
              <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">
                  Employee List
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allUsersData?.users?.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {user.name || user.email}
                          </h5>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {user.assetAssignments?.filter(
                              (a) => a.status === 'Active'
                            ).length || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Active Assets
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Employee Report */}
            {activeReportTab === 'employee' && selectedUser && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setActiveReportTab('employees')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    ← Back to Employee List
                  </button>
                </div>

                {selectedUserLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading user report...
                    </span>
                  </div>
                ) : selectedUserData?.user ? (
                  <div>
                    {/* Employee Info */}
                    <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Employee Report:{' '}
                        {selectedUserData.user.name ||
                          selectedUserData.user.email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Email: {selectedUserData.user.email}
                      </p>

                      {/* Summary Stats */}
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded border bg-white/20 p-3 text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {selectedUserData.user.assetAssignments?.filter(
                              (a) => a.status === 'Active'
                            ).length || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            Currently Assigned
                          </div>
                        </div>
                        <div className="rounded border bg-white/20 p-3 text-center">
                          <div className="text-xl font-bold text-green-600">
                            {selectedUserData.user.assetAssignments?.filter(
                              (a) => a.status === 'Returned'
                            ).length || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            Previously Assigned
                          </div>
                        </div>
                        <div className="rounded border bg-white/20 p-3 text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(
                              calculateTotalValue(
                                selectedUserData.user.assetAssignments?.filter(
                                  (a) => a.status === 'Active'
                                )
                              )
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Current Asset Value
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Button */}
                    {selectedUserData.user.assetAssignments?.length > 0 && (
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() =>
                            exportToCSV(
                              selectedUserData.user.assetAssignments.map(
                                (assignment) => ({
                                  ...assignment,
                                  user: selectedUserData.user,
                                })
                              ),
                              `${selectedUserData.user.name || 'user'}-asset-report-${new Date().toISOString().split('T')[0]}.csv`
                            )
                          }
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Export Employee Assets to CSV
                        </button>
                      </div>
                    )}

                    {/* Assets Table */}
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        Asset Assignment History
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Asset
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Issue Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Return Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {selectedUserData.user.assetAssignments?.map(
                              (assignment) => (
                                <tr
                                  key={assignment.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {assignment.asset.assetId}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {assignment.asset.name} -{' '}
                                        {assignment.asset.model}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                      {assignment.asset.category.name}
                                    </span>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {formatDate(assignment.issueDate)}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {assignment.returnDate
                                      ? formatDate(assignment.returnDate)
                                      : assignment.expectedReturnDate
                                        ? `Expected: ${formatDate(assignment.expectedReturnDate)}`
                                        : 'Not set'}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        assignment.status === 'Active'
                                          ? 'bg-green-100 text-green-800'
                                          : assignment.status === 'Returned'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {assignment.status}
                                    </span>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {formatCurrency(
                                      assignment.asset.purchasePrice
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>

                      {(!selectedUserData.user.assetAssignments ||
                        selectedUserData.user.assetAssignments.length ===
                          0) && (
                        <div className="py-8 text-center">
                          <p className="text-gray-500">
                            This employee has no asset assignments.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      Unable to load employee asset data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Department Reports Tab */}
            {activeReportTab === 'departments' && (
              <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">
                  Select Department
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getUniqueDepartments().map((department) => (
                    <div
                      key={department}
                      onClick={() => handleDepartmentSelect(department)}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div className="text-center">
                        <h5 className="text-sm font-medium text-gray-900">
                          {department}
                        </h5>
                        <div className="mt-1 text-sm text-blue-600">
                          {report?.assignments?.filter(
                            (a) => a.department === department
                          ).length || 0}{' '}
                          assignments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {getUniqueDepartments().length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      No departments found with asset assignments.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Department Report Detail */}
            {activeReportTab === 'department' && selectedDepartment && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setActiveReportTab('departments')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    ← Back to Department List
                  </button>
                </div>

                {departmentLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading department report...
                    </span>
                  </div>
                ) : (
                  <div>
                    {/* Department Info */}
                    <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Department Report: {selectedDepartment}
                      </h3>

                      {/* Department Summary */}
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded border bg-white/20 p-3 text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {getDepartmentAssets().length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Assignments
                          </div>
                        </div>
                        <div className="rounded border bg-white/20 p-3 text-center">
                          <div className="text-xl font-bold text-green-600">
                            {
                              getDepartmentAssets().filter(
                                (a) => a.status === 'Active'
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Currently Active
                          </div>
                        </div>
                        <div className="rounded border bg-white/20 p-3 text-center">
                          <div className="text-xl font-bold text-gray-600">
                            {
                              getDepartmentAssets().filter(
                                (a) => a.status === 'Returned'
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Returned Assets
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Button */}
                    {getDepartmentAssets().length > 0 && (
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() =>
                            exportToCSV(
                              getDepartmentAssets(),
                              `${selectedDepartment}-department-report-${new Date().toISOString().split('T')[0]}.csv`
                            )
                          }
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Export Department Assets to CSV
                        </button>
                      </div>
                    )}

                    {/* Department Assets Table */}
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        Department Asset Assignments
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Asset
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Employee
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Issue Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Return Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {getDepartmentAssets().map((assignment) => (
                              <tr
                                key={assignment.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.asset.assetId}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {assignment.asset.name} -{' '}
                                      {assignment.asset.model}
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                    {assignment.asset.category.name}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.user?.name ||
                                        assignment.user?.email ||
                                        'N/A'}
                                    </div>
                                    {assignment.user?.email &&
                                      assignment.user?.name && (
                                        <div className="text-sm text-gray-500">
                                          {assignment.user.email}
                                        </div>
                                      )}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {formatDate(assignment.issueDate)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {assignment.returnDate
                                    ? formatDate(assignment.returnDate)
                                    : '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                      assignment.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : assignment.status === 'Returned'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {assignment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {getDepartmentAssets().length === 0 && (
                        <div className="py-8 text-center">
                          <p className="text-gray-500">
                            No assets found for this department.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AssetReports
