import { useState } from 'react'

import { Metadata } from '@redwoodjs/web'

import AdminVacationRequests from 'src/components/AdminVacationRequests/AdminVacationRequests'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { Input } from 'src/components/ui/input'

const AdminVacationRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <>
      <Metadata
        title="Admin Vacation Requests"
        description="Review and approve vacation requests"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Vacation Requests"
          description="Review and approve employee vacation requests"
        >
          <Input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by employee or reason"
            aria-label="Search vacation requests by employee or reason"
            className="h-9 w-72 border-slate-300 bg-white"
          />
        </PageHeader>
        <AdminVacationRequests searchTerm={searchTerm} />
      </AppContentShell>
    </>
  )
}

export default AdminVacationRequestsPage
