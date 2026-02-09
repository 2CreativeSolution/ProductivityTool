import { Metadata } from '@redwoodjs/web'
import { gql, useQuery } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import ProjectManagement from 'src/components/ProjectTracker/ProjectManagement'

const PROJECTS_OVERVIEW_QUERY = gql`
  query ProjectsOverviewQueryForManagementPage {
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

const ProjectTrackerManagementPage = () => {
  const {
    data: projectsData,
    loading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery(PROJECTS_OVERVIEW_QUERY)

  return (
    <>
      <Metadata
        title="Project Management"
        description="Create and manage projects and team allocations"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Projects · Management"
          description="Create projects, allocate team members, and manage scope"
        />
        <ProjectManagement
          projects={projectsData?.activeProjects || []}
          loading={projectsLoading}
          onRefresh={refetchProjects}
          getStatusBadgeColor={getStatusBadgeColor}
          getPriorityBadgeColor={getPriorityBadgeColor}
        />
      </AppContentShell>
    </>
  )
}

export default ProjectTrackerManagementPage
