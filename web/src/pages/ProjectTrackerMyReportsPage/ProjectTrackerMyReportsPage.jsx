import { useMemo, useState } from 'react'

import { Metadata, gql, useQuery } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import { Input } from 'src/components/Forms/Input/Input'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { AdminDataTable, Pill } from 'src/components/ui'

const MY_PROJECT_UPDATES_QUERY = gql`
  query MyProjectUpdatesQuery($userId: Int!) {
    updatesByUser(userId: $userId) {
      id
      date
      status
      hoursWorked
      description
      blockers
      nextDayPlan
      completionPercentage
      milestoneReached
      project {
        id
        name
        code
      }
    }
  }
`

function normalizeDayStartUTC(dateString) {
  const date = new Date(dateString)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

function normalizeDayEndUTC(dateString) {
  const date = new Date(dateString)
  date.setUTCHours(23, 59, 59, 999)
  return date
}

function formatDateUTC(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  })
}

function getStatusPillVariant(status) {
  switch (status) {
    case 'ON_TRACK':
      return 'success'
    case 'DELAYED':
      return 'danger'
    case 'BLOCKED':
      return 'warning'
    default:
      return 'default'
  }
}

const ProjectTrackerMyReportsPage = () => {
  const { currentUser } = useAuth()
  const [dateRange, setDateRange] = useState(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  }))

  const { data, loading, error } = useQuery(MY_PROJECT_UPDATES_QUERY, {
    variables: { userId: currentUser?.id },
    skip: !currentUser?.id,
  })

  const filteredUpdates = useMemo(() => {
    const updates = data?.updatesByUser ?? []
    if (!dateRange.start || !dateRange.end) return updates

    const start = normalizeDayStartUTC(`${dateRange.start}T00:00:00.000Z`)
    const end = normalizeDayEndUTC(`${dateRange.end}T00:00:00.000Z`)

    return updates.filter((update) => {
      const updateDate = new Date(update.date)
      return updateDate >= start && updateDate <= end
    })
  }, [data, dateRange.end, dateRange.start])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-slate-900">
            {formatDateUTC(row.original.date)}
          </span>
        ),
      },
      {
        id: 'project',
        header: 'Project',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900">
              {row.original.project?.name ?? 'Unknown project'}
            </div>
            {row.original.project?.code ? (
              <div className="truncate text-xs text-slate-500">
                {row.original.project.code}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Pill size="sm" variant={getStatusPillVariant(row.original.status)}>
            {row.original.status || 'UNKNOWN'}
          </Pill>
        ),
      },
      {
        accessorKey: 'hoursWorked',
        header: <div className="text-right">Hours</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm text-slate-900">
            {row.original.hoursWorked ?? '-'}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Update',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="line-clamp-2 text-sm text-slate-900">
              {row.original.description}
            </div>
            {row.original.blockers ? (
              <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                Blockers: {row.original.blockers}
              </div>
            ) : null}
          </div>
        ),
      },
    ],
    []
  )

  return (
    <>
      <Metadata
        title="My Project Reports"
        description="View your submitted daily status updates"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Projects · My Reports"
          description="Your submitted daily status updates"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="project-my-reports-start"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Start
              </label>
              <Input
                id="project-my-reports-start"
                type="date"
                size="sm"
                value={dateRange.start}
                onChange={(event) =>
                  setDateRange((prev) => ({
                    ...prev,
                    start: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="project-my-reports-end"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                End
              </label>
              <Input
                id="project-my-reports-end"
                type="date"
                size="sm"
                value={dateRange.end}
                onChange={(event) =>
                  setDateRange((prev) => ({ ...prev, end: event.target.value }))
                }
              />
            </div>
          </div>
        </PageHeader>

        {loading ? (
          <p className="text-sm text-slate-600">Loading your updates...</p>
        ) : error ? (
          <p className="text-sm font-medium text-red-700">
            Error loading updates: {error.message}
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border bg-white">
            <AdminDataTable
              columns={columns}
              data={filteredUpdates}
              emptyMessage="No submitted updates found for this period."
              pagination
              pageSizeOptions={[10, 20, 50, 100]}
              initialPageSize={10}
            />
          </div>
        )}
      </AppContentShell>
    </>
  )
}

export default ProjectTrackerMyReportsPage
