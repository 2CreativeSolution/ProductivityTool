import { useRef } from 'react'

import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import VacationPlanner from 'src/components/VacationPlanner/VacationPlanner'

const MeVacationPage = () => {
  const vacationPlannerRef = useRef(null)

  return (
    <>
      <Metadata title="Vacation" description="Vacation planner" />
      <AppSidebar showQuickAccess={true} />
      <AppContentShell>
        <PageHeader title="Vacation">
          <button
            type="button"
            onClick={() => vacationPlannerRef.current?.openRequestModal()}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Request Time Off
          </button>
        </PageHeader>
        <VacationPlanner ref={vacationPlannerRef} hideHeaderRequestButton />
      </AppContentShell>
    </>
  )
}

export default MeVacationPage
