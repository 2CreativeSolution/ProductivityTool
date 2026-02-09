import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import EmployeeManagement from 'src/components/ProjectTracker/EmployeeManagement'

const ProjectTrackerEmployeesPage = () => {
  return (
    <>
      <Metadata
        title="Project Employees"
        description="Review employee project allocations and details"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Projects · Employees"
          description="View employee allocation details and maintain profile data"
        />
        <EmployeeManagement />
      </AppContentShell>
    </>
  )
}

export default ProjectTrackerEmployeesPage
