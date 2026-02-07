import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import AdminSupplyRequestManager from 'src/components/OfficeSupply/AdminSupplyRequestManager/AdminSupplyRequestManager'
import PageHeader from 'src/components/PageHeader/PageHeader'

const AdminSupplyRequestsPage = () => {
  return (
    <>
      <Metadata
        title="Admin Supply Requests"
        description="Manage supply requests"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Supply Request Management"
          description="Review and approve employee supply requests"
        />
        <AdminSupplyRequestManager />
      </AppContentShell>
    </>
  )
}

export default AdminSupplyRequestsPage
