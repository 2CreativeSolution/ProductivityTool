import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
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
        <div className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Project Tracker
            </h1>
            <p className="mt-2 text-gray-600">
              Manage resource allocation and track daily project progress
            </p>
          </div>

          <ProjectTracker currentUser={currentUser} />
        </div>
      </div>
    </>
  )
}

export default ProjectTrackerPage
