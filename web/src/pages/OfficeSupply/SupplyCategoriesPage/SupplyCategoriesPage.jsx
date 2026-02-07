import { useState } from 'react'

import { useLocation } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import CategoryManager from 'src/components/OfficeSupply/CategoryManager/CategoryManager'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'

const SupplyCategoriesPage = () => {
  const { pathname } = useLocation()
  const { hasRole } = useAuth()
  const [openCreateTrigger, setOpenCreateTrigger] = useState(0)
  const isAdminCategoriesPage = pathname.startsWith('/admin/')
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))
  const pageDescription = isAdminCategoriesPage
    ? 'Organize and manage office supply categories with full admin privileges'
    : 'View office supply categories and organization'

  return (
    <>
      <Metadata
        title="Supply Categories"
        description="Manage supply categories"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader title="Supply Categories" description={pageDescription}>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setOpenCreateTrigger((prev) => prev + 1)}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Add Category
            </button>
          )}
        </PageHeader>
        <CategoryManager openCreateTrigger={openCreateTrigger} />
      </AppContentShell>
    </>
  )
}

export default SupplyCategoriesPage
