import { useState } from 'react'

import { Metadata } from '@redwoodjs/web'
import { gql, useQuery } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import DailyAllocation from 'src/components/ProjectTracker/DailyAllocation'

const DAILY_ALLOCATIONS_QUERY = gql`
  query DailyAllocationsQueryForDailyPage($userId: Int!, $date: DateTime!) {
    dailyAllocations(userId: $userId, date: $date) {
      id
      projectId
      role
      hoursAllocated
      project {
        id
        name
        code
        status
        priority
        manager {
          name
          email
        }
        meetings {
          id
          title
          meetingDate
          duration
          meetingType
          location
        }
      }
      dailyUpdates {
        id
        description
        hoursWorked
        blockers
        nextDayPlan
        completionPercentage
        milestoneReached
      }
    }
  }
`

const ProjectTrackerPage = () => {
  const { currentUser } = useAuth()
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const {
    data: allocationsData,
    loading: allocationsLoading,
    refetch: refetchAllocations,
  } = useQuery(DAILY_ALLOCATIONS_QUERY, {
    variables: {
      userId: currentUser?.id,
      date: new Date(selectedDate + 'T12:00:00').toISOString(),
    },
    skip: !currentUser?.id,
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Metadata
        title="Project Tracker"
        description="Resource allocation and daily project tracking"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Projects · Daily Tracker"
          description="Track daily project allocations and submit updates"
        >
          <input
            id="project-tracker-selected-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </PageHeader>

        <DailyAllocation
          allocations={allocationsData?.dailyAllocations || []}
          loading={allocationsLoading}
          selectedDate={selectedDate}
          currentUser={currentUser}
          onRefresh={refetchAllocations}
          formatDate={formatDate}
          getStatusBadgeColor={getStatusBadgeColor}
          getPriorityBadgeColor={getPriorityBadgeColor}
        />
      </AppContentShell>
    </>
  )
}

export default ProjectTrackerPage
