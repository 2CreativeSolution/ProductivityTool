import { useRef } from 'react'

import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import Attendance from 'src/components/Attendance/Attendance'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'

const MeAttendancePage = () => {
  const { currentUser } = useAuth()
  const attendanceRef = useRef(null)

  if (!currentUser?.id) return null

  return (
    <>
      <Metadata title="Attendance" description="Attendance details" />
      <AppSidebar showQuickAccess={true} />
      <AppContentShell>
        <PageHeader
          title={
            currentUser.name
              ? `Attendance — ${currentUser.name}`
              : 'Attendance'
          }
          description="View attendance history, exceptions, and exports."
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem
                onSelect={() => attendanceRef.current?.exportAttendance('csv')}
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => attendanceRef.current?.exportAttendance('pdf')}
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PageHeader>
        <Attendance ref={attendanceRef} userId={currentUser.id} />
      </AppContentShell>
    </>
  )
}

export default MeAttendancePage
