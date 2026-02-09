import React, { useCallback, useEffect, useState } from 'react'

import {
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

import { useQuery, gql } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import { Input } from 'src/components/Forms/Input/Input'
import { AdminDataTable, Button, SummaryMetricCard } from 'src/components/ui'

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

const AssetReports = ({
  forcedView = null,
  selectedUserId = null,
  selectedDepartmentName = '',
  onUserSelect,
  onDepartmentSelect,
  onBackToEmployees,
  onBackToDepartments,
  hideAdminTabs = false,
  hideMyInlineExportButton = false,
  onMyReportExportReady,
  hideOverviewInlineExportButton = false,
  onOverviewExportReady,
  onEmployeeReportExportReady,
}) => {
  const { currentUser } = useAuth()
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [activeReportTabState, setActiveReportTabState] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedDepartmentState, setSelectedDepartmentState] = useState('')

  const isAdmin = currentUser?.roles?.includes('ADMIN')

  const activeReportTab = forcedView || activeReportTabState
  const resolvedSelectedUser =
    selectedUser || (selectedUserId ? { id: Number(selectedUserId) } : null)
  const resolvedSelectedDepartment =
    selectedDepartmentName || selectedDepartmentState

  const shouldLoadOverviewReportData =
    !isAdmin ||
    ['overview', 'departments', 'department'].includes(activeReportTab)

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
      variables: { userId: Number(resolvedSelectedUser?.id) },
      skip: !isAdmin || !resolvedSelectedUser?.id,
    }
  )

  const { data: departmentData, loading: departmentLoading } = useQuery(
    DEPARTMENT_ASSETS_QUERY,
    {
      variables: { department: resolvedSelectedDepartment },
      skip: !isAdmin || !resolvedSelectedDepartment,
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
    skip: !shouldLoadOverviewReportData,
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
    if (typeof onUserSelect === 'function') {
      onUserSelect(user)
      return
    }

    setSelectedUser(user)
    setActiveReportTabState('employee')
  }

  const handleDepartmentSelect = (department) => {
    if (typeof onDepartmentSelect === 'function') {
      onDepartmentSelect(department)
      return
    }

    setSelectedDepartmentState(department)
    setActiveReportTabState('department')
  }

  const renderAssignmentSummaryCards = (summaryReport) => {
    if (!summaryReport) return null

    const totalAssignments = summaryReport.totalAssignments || 0
    const activeRate = totalAssignments
      ? Math.round((summaryReport.activeAssignments / totalAssignments) * 100)
      : 0
    const returnedRate = totalAssignments
      ? Math.round((summaryReport.returnedAssignments / totalAssignments) * 100)
      : 0
    const overdueRate = totalAssignments
      ? Math.round((summaryReport.overdueAssignments / totalAssignments) * 100)
      : 0

    return (
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCard
          size="sm"
          title="Total Assignments"
          value={totalAssignments.toLocaleString('en-US')}
          subtitle="All assignment records"
          icon={<DocumentTextIcon />}
          trend={{ direction: 'neutral', label: 'all' }}
        />
        <SummaryMetricCard
          size="sm"
          title="Currently Active"
          value={(summaryReport.activeAssignments || 0).toLocaleString('en-US')}
          subtitle="Assets currently assigned"
          icon={<CheckCircleIcon />}
          trend={{ direction: 'positive', label: `${activeRate}%` }}
        />
        <SummaryMetricCard
          size="sm"
          title="Returned Assets"
          value={(summaryReport.returnedAssignments || 0).toLocaleString(
            'en-US'
          )}
          subtitle="Assignments completed"
          icon={<ArrowPathIcon />}
          trend={{ direction: 'neutral', label: `${returnedRate}%` }}
        />
        <SummaryMetricCard
          size="sm"
          title="Overdue Returns"
          value={(summaryReport.overdueAssignments || 0).toLocaleString(
            'en-US'
          )}
          subtitle="Past expected return date"
          icon={<ExclamationTriangleIcon />}
          trend={{ direction: 'negative', label: `${overdueRate}%` }}
        />
      </div>
    )
  }

  const myAssignmentHistoryColumns = [
    {
      accessorKey: 'asset.assetId',
      header: 'Asset',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.asset.assetId}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.asset.name} - {row.original.asset.model}
          </div>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.asset.category.name,
      id: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
          {row.original.asset.category.name}
        </span>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.original.issueDate)}
        </span>
      ),
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.returnDate ? formatDate(row.original.returnDate) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : row.original.status === 'Returned'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ]

  const overviewCategoryColumns = [
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.categoryName}
        </span>
      ),
    },
    {
      accessorKey: 'count',
      header: 'Total',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.count}</span>
      ),
    },
    {
      accessorKey: 'activeCount',
      header: 'Active',
      cell: ({ row }) => (
        <span className="text-sm text-green-600">
          {row.original.activeCount}
        </span>
      ),
    },
    {
      accessorKey: 'returnedCount',
      header: 'Returned',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.returnedCount}
        </span>
      ),
    },
  ]

  const overviewAssignmentColumns = [
    {
      id: 'asset',
      header: 'Asset',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.asset.assetId}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.asset.name} - {row.original.asset.model}
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
          {row.original.asset.category.name}
        </span>
      ),
    },
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.user?.name || row.original.user?.email || 'N/A'}
          </div>
          {row.original.user?.email && row.original.user?.name && (
            <div className="text-sm text-gray-500">
              {row.original.user.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) =>
        row.original.department ? (
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
            {row.original.department}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Not specified</span>
        ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.original.issueDate)}
        </span>
      ),
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.returnDate ? formatDate(row.original.returnDate) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : row.original.status === 'Returned'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ]

  const employeesWithAssetHistory = (allUsersData?.users || []).filter(
    (user) => (user.assetAssignments?.length || 0) > 0
  )

  const employeeListColumns = [
    {
      id: 'employee',
      accessorFn: (row) => row.name || row.email || '',
      header: 'Employee',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.name || row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.email}</span>
      ),
    },
    {
      id: 'activeAssets',
      accessorFn: (row) =>
        row.assetAssignments?.filter(
          (assignment) => assignment.status === 'Active'
        ).length || 0,
      header: 'Active Assets',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-blue-600">
          {row.original.assetAssignments?.filter(
            (assignment) => assignment.status === 'Active'
          ).length || 0}
        </span>
      ),
    },
    {
      id: 'totalAssignments',
      accessorFn: (row) => row.assetAssignments?.length || 0,
      header: 'Total Assignments',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.assetAssignments?.length || 0}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleUserSelect(row.original)}
          >
            View Report
          </Button>
        </div>
      ),
    },
  ]

  const employeeAssignmentHistoryColumns = [
    {
      id: 'asset',
      header: 'Asset',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.original.asset.assetId}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.asset.name} - {row.original.asset.model}
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
          {row.original.asset.category.name}
        </span>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.original.issueDate)}
        </span>
      ),
    },
    {
      id: 'returnDate',
      header: 'Return Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.returnDate
            ? formatDate(row.original.returnDate)
            : row.original.expectedReturnDate
              ? `Expected: ${formatDate(row.original.expectedReturnDate)}`
              : 'Not set'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : row.original.status === 'Returned'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: 'value',
      header: 'Value',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatCurrency(row.original.asset.purchasePrice)}
        </span>
      ),
    },
  ]

  const getDepartmentAssets = () => {
    if (!departmentData?.assetAssignments || !resolvedSelectedDepartment) {
      return []
    }

    return departmentData.assetAssignments.filter(
      (assignment) => assignment.department === resolvedSelectedDepartment
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

  const exportToCSV = useCallback(
    (data, filename) => {
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
    },
    [isAdmin]
  )

  const exportMyReportCSV = useCallback(() => {
    if (!report?.assignments?.length) return

    exportToCSV(
      report.assignments.map((assignment) => ({
        ...assignment,
        user: currentUser,
      })),
      `my-asset-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`
    )
  }, [
    currentUser,
    exportToCSV,
    report?.assignments,
    reportDateRange.endDate,
    reportDateRange.startDate,
  ])

  useEffect(() => {
    if (typeof onMyReportExportReady !== 'function') return
    onMyReportExportReady(exportMyReportCSV)
    return () => onMyReportExportReady(null)
  }, [exportMyReportCSV, onMyReportExportReady])

  const exportOverviewReportCSV = useCallback(() => {
    if (!report?.assignments?.length) return

    exportToCSV(
      report.assignments,
      `all-users-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`
    )
  }, [
    exportToCSV,
    report?.assignments,
    reportDateRange.endDate,
    reportDateRange.startDate,
  ])

  useEffect(() => {
    if (typeof onOverviewExportReady !== 'function') return
    onOverviewExportReady(exportOverviewReportCSV)
    return () => onOverviewExportReady(null)
  }, [exportOverviewReportCSV, onOverviewExportReady])

  const exportEmployeeReportCSV = useCallback(() => {
    if (!selectedUserData?.user?.assetAssignments?.length) return

    exportToCSV(
      selectedUserData.user.assetAssignments.map((assignment) => ({
        ...assignment,
        user: selectedUserData.user,
      })),
      `${selectedUserData.user.name || 'user'}-asset-report-${new Date().toISOString().split('T')[0]}.csv`
    )
  }, [exportToCSV, selectedUserData?.user])

  useEffect(() => {
    if (typeof onEmployeeReportExportReady !== 'function') return

    if (!selectedUserData?.user?.assetAssignments?.length) {
      onEmployeeReportExportReady(null)
      return () => onEmployeeReportExportReady(null)
    }

    onEmployeeReportExportReady(exportEmployeeReportCSV)
    return () => onEmployeeReportExportReady(null)
  }, [
    exportEmployeeReportCSV,
    onEmployeeReportExportReady,
    selectedUserData?.user?.assetAssignments?.length,
  ])

  if (reportLoading || (isAdmin && usersLoading)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading report...</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Admin Tab Navigation */}
      {isAdmin && !forcedView && !hideAdminTabs && (
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
          <div className="mb-6 flex space-x-6 border-b border-white/20 pb-4">
            <button
              type="button"
              onClick={() => setActiveReportTabState('overview')}
              className={`border-b-2 pb-2 font-medium transition-colors duration-200 ${
                activeReportTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              All Users Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTabState('employees')}
              className={`border-b-2 pb-2 font-medium transition-colors duration-200 ${
                activeReportTab === 'employees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              Employee List
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTabState('departments')}
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
          {/* User Report Content */}
          {report && (
            <>
              {/* Summary Statistics */}
              {forcedView !== 'my'
                ? renderAssignmentSummaryCards(report)
                : null}

              {/* Assignment History */}
              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    My Assignment History
                  </h4>
                  <div className="flex flex-wrap items-end justify-end gap-3">
                    <div className="w-48">
                      <label
                        htmlFor="asset-report-start-date"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Start Date
                      </label>
                      <Input
                        framework="native"
                        size="sm"
                        id="asset-report-start-date"
                        type="date"
                        value={reportDateRange.startDate}
                        onChange={(e) =>
                          handleReportDateChange('startDate', e.target.value)
                        }
                      />
                    </div>
                    <div className="w-48">
                      <label
                        htmlFor="asset-report-end-date"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        End Date
                      </label>
                      <Input
                        framework="native"
                        size="sm"
                        id="asset-report-end-date"
                        type="date"
                        value={reportDateRange.endDate}
                        onChange={(e) =>
                          handleReportDateChange('endDate', e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleGenerateReport}
                        variant="primary"
                        size="sm"
                      >
                        Update Table
                      </Button>
                      {report?.assignments?.length > 0 &&
                        !hideMyInlineExportButton && (
                          <Button
                            onClick={exportMyReportCSV}
                            variant="primaryOutline"
                            size="sm"
                          >
                            Export CSV
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
                <AdminDataTable
                  className="overflow-hidden rounded-md border bg-white"
                  columns={myAssignmentHistoryColumns}
                  data={report.assignments || []}
                  emptyMessage="No assignment history found."
                />
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
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Report Filters
                </h3>
                <div className="flex flex-wrap items-end justify-end gap-3">
                  <div className="w-48">
                    <label
                      htmlFor="asset-admin-report-start-date"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Start Date
                    </label>
                    <Input
                      framework="native"
                      size="sm"
                      id="asset-admin-report-start-date"
                      type="date"
                      value={reportDateRange.startDate}
                      onChange={(e) =>
                        handleReportDateChange('startDate', e.target.value)
                      }
                    />
                  </div>
                  <div className="w-48">
                    <label
                      htmlFor="asset-admin-report-end-date"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      End Date
                    </label>
                    <Input
                      framework="native"
                      size="sm"
                      id="asset-admin-report-end-date"
                      type="date"
                      value={reportDateRange.endDate}
                      onChange={(e) =>
                        handleReportDateChange('endDate', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleGenerateReport}
                      variant="primary"
                      size="sm"
                    >
                      Update Table
                    </Button>
                    {report?.assignments?.length > 0 &&
                      !hideOverviewInlineExportButton && (
                        <Button
                          onClick={exportOverviewReportCSV}
                          variant="primaryOutline"
                          size="sm"
                        >
                          Export CSV
                        </Button>
                      )}
                  </div>
                </div>
              </div>

              {report && (
                <>
                  {/* Summary Statistics */}
                  {renderAssignmentSummaryCards(report)}

                  {/* Assets by Category */}
                  {report.assetsByCategory.length > 0 && (
                    <div className="mb-8">
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        Assets by Category
                      </h4>
                      <div className="overflow-hidden rounded-md border bg-white">
                        <AdminDataTable
                          columns={overviewCategoryColumns}
                          data={report.assetsByCategory}
                          emptyMessage="No category summary data found."
                        />
                      </div>
                    </div>
                  )}

                  {/* Assignment History */}
                  <div className="mb-8">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">
                      All User Assignment History
                    </h4>
                    <div className="overflow-hidden rounded-md border bg-white">
                      <AdminDataTable
                        columns={overviewAssignmentColumns}
                        data={report.assignments}
                        emptyMessage="No assignment history found."
                        pagination
                        pageSizeOptions={[10, 20, 50]}
                        initialPageSize={10}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Employee List Tab */}
          {activeReportTab === 'employees' && (
            <div className="mb-8">
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                Employee List
              </h4>
              <div className="overflow-hidden rounded-md border bg-white">
                <AdminDataTable
                  columns={employeeListColumns}
                  data={employeesWithAssetHistory}
                  emptyMessage="No employees with asset assignments found."
                  pagination
                  pageSizeOptions={[10, 20, 50]}
                  initialPageSize={10}
                />
              </div>
            </div>
          )}

          {/* Individual Employee Report */}
          {activeReportTab === 'employee' && resolvedSelectedUser?.id && (
            <div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onBackToEmployees === 'function') {
                      onBackToEmployees()
                      return
                    }
                    setActiveReportTabState('employees')
                  }}
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

                  {/* Assets Table */}
                  <div className="mb-8">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">
                      Asset Assignment History
                    </h4>
                    <div className="overflow-hidden rounded-md border bg-white">
                      <AdminDataTable
                        columns={employeeAssignmentHistoryColumns}
                        data={selectedUserData.user.assetAssignments || []}
                        emptyMessage="This employee has no asset assignments."
                        pagination
                        pageSizeOptions={[10, 20, 50]}
                        initialPageSize={10}
                      />
                    </div>
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
                  <button
                    type="button"
                    key={department}
                    onClick={() => handleDepartmentSelect(department)}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md"
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
                  </button>
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
          {activeReportTab === 'department' && resolvedSelectedDepartment && (
            <div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onBackToDepartments === 'function') {
                      onBackToDepartments()
                      return
                    }
                    setActiveReportTabState('departments')
                  }}
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
                      Department Report: {resolvedSelectedDepartment}
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
                            `${resolvedSelectedDepartment}-department-report-${new Date().toISOString().split('T')[0]}.csv`
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
  )
}

export default AssetReports
