import React, { useState, useRef, useEffect } from 'react'

import { useQuery, gql } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

import DailyAllocation from './DailyAllocation'
import EmployeeManagement from './EmployeeManagement'
import ProjectManagement from './ProjectManagement'
import ProjectReports from './ProjectReports'

const DAILY_ALLOCATIONS_QUERY = gql`
  query DailyAllocationsQuery($userId: Int!, $date: DateTime!) {
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

const PROJECTS_OVERVIEW_QUERY = gql`
  query ProjectsOverviewQuery {
    activeProjects {
      id
      name
      code
      status
      priority
      startDate
      endDate
      manager {
        name
        email
      }
      allocations {
        id
        user {
          name
          email
        }
        role
        hoursAllocated
        isActive
      }
    }
  }
`

const ProjectTracker = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const tabsRef = useRef({})

  const isAdmin = currentUser?.roles?.includes('ADMIN')

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

  const {
    data: projectsData,
    loading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery(PROJECTS_OVERVIEW_QUERY, {
    skip: !isAdmin,
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

  const tabs = [
    { id: 'daily', name: 'Daily Tracker', icon: '📅' },
    ...(isAdmin
      ? [
          { id: 'management', name: 'Project Management', icon: '⚙️' },
          { id: 'employees', name: 'Employee Management', icon: '👥' },
        ]
      : []),
    { id: 'reports', name: 'Reports', icon: '📊' },
  ]

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabsRef.current[activeTab]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      })
    }
  }, [activeTab, isAdmin])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-32 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-lg md:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                Project Management
              </h1>
              <p className="mt-2 text-sm text-gray-600 md:text-base">
                Track daily allocations, project progress, and meeting schedules
              </p>
            </div>

            {/* Date Selector for Daily View */}
            {activeTab === 'daily' && (
              <div className="flex w-full flex-col gap-2 rounded-xl border border-white/20 bg-white/50 px-4 py-3 backdrop-blur-sm sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                <label className="text-sm font-semibold text-gray-700">
                  Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                />
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="relative">
            <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto border-b border-white/20 pb-4 sm:gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabsRef.current[tab.id] = el)}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 whitespace-nowrap px-2 pb-2 text-sm font-medium transition-colors duration-200 sm:px-0 md:text-base ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="text-base md:text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="text-xs sm:hidden">
                    {tab.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
            {/* Animated sliding indicator */}
            <div
              className="absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-sm transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'daily' && (
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
          )}

          {activeTab === 'management' && isAdmin && (
            <ProjectManagement
              projects={projectsData?.activeProjects || []}
              loading={projectsLoading}
              onRefresh={refetchProjects}
              getStatusBadgeColor={getStatusBadgeColor}
              getPriorityBadgeColor={getPriorityBadgeColor}
            />
          )}

          {activeTab === 'employees' && isAdmin && <EmployeeManagement />}

          {activeTab === 'reports' && (
            <ProjectReports currentUser={currentUser} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectTracker
