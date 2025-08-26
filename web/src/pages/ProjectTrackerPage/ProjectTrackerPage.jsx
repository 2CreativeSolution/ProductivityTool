import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import Header from 'src/components/Header/Header'
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
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 pt-32 sm:px-6 lg:px-8">
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
