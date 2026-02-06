import { Metadata } from '@redwoodjs/web'

import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import CategoryManager from 'src/components/OfficeSupply/CategoryManager/CategoryManager'

const SupplyCategoriesPage = () => {
  return (
    <>
      <Metadata
        title="Supply Categories"
        description="Manage supply categories"
      />
      <AppSidebar />
      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <CategoryManager />
      </main>
    </>
  )
}

export default SupplyCategoriesPage
