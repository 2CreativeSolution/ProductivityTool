import { useRef, useState } from 'react'

import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import VacationPlanner from 'src/components/VacationPlanner/VacationPlanner'

const MeVacationPage = () => {
  const vacationPlannerRef = useRef(null)
  const [vacationViewMode, setVacationViewMode] = useState('list')

  return (
    <>
      <Metadata title="Vacation" description="Vacation planner" />
      <AppSidebar showQuickAccess={true} />
      <AppContentShell>
        <PageHeader title="Vacation">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setVacationViewMode('list')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                vacationViewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setVacationViewMode('calendar')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                vacationViewMode === 'calendar'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            type="button"
            onClick={() => vacationPlannerRef.current?.exportVacationCSV?.()}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => vacationPlannerRef.current?.openRequestModal()}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Request Time Off
          </button>
        </PageHeader>
        <VacationPlanner
          ref={vacationPlannerRef}
          hideHeaderRequestButton
          hideHeaderViewToggle
          viewMode={vacationViewMode}
          onViewModeChange={setVacationViewMode}
        />
      </AppContentShell>
    </>
  )
}

export default MeVacationPage
