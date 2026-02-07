import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import ProjectTracker from 'src/components/ProjectTracker/ProjectTracker'

const ProjectTrackerPage = () => {
  const { currentUser } = useAuth()

  return (
    <>
      <Metadata
        title="Project Tracker"
        description="Resource allocation and daily project tracking"
      />

      <div className="min-h-screen bg-gray-50">
        <AppSidebar />
        <AppContentShell>
          <PageHeader
            title="Project Tracker"
            description="Manage resource allocation and track daily project progress"
          />

          <ProjectTracker currentUser={currentUser} />
        </AppContentShell>
      </div>
    </>
  )
}

export default ProjectTrackerPage
