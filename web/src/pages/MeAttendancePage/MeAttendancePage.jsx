import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import Attendance from 'src/components/Attendance/Attendance'
import PageHeader from 'src/components/PageHeader/PageHeader'

const MeAttendancePage = () => {
  const { currentUser } = useAuth()

  if (!currentUser?.id) return null

  return (
    <>
      <Metadata title="Attendance" description="Attendance details" />
      <AppSidebar showQuickAccess={true} />
      <AppContentShell>
        <PageHeader
          title="Attendance"
          description="View attendance history, exceptions, and exports."
        />
        <Attendance userId={currentUser.id} />
      </AppContentShell>
    </>
  )
}

export default MeAttendancePage
