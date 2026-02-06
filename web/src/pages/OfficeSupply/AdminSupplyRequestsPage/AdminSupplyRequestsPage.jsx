import { Metadata } from '@redwoodjs/web'

import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import AdminSupplyRequestManager from 'src/components/OfficeSupply/AdminSupplyRequestManager/AdminSupplyRequestManager'

const AdminSupplyRequestsPage = () => {
  return (
    <>
      <Metadata
        title="Admin Supply Requests"
        description="Manage supply requests"
      />
      <AppSidebar />
      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <AdminSupplyRequestManager />
      </main>
    </>
  )
}

export default AdminSupplyRequestsPage
