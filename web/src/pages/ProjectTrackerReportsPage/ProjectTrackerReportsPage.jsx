import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import ProjectReports from 'src/components/ProjectTracker/ProjectReports'

const ProjectTrackerReportsPage = () => {
  return (
    <>
      <Metadata
        title="Project Reports"
        description="Project status, allocations, and team performance reports"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Projects · Reports"
          description="Analyze project progress and team update metrics"
        />
        <ProjectReports />
      </AppContentShell>
    </>
  )
}

export default ProjectTrackerReportsPage
