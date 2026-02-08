import { Link, routes, useLocation } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import EditUserCell from 'src/components/User/EditUserCell'

const EditUserPage = ({ id }) => {
  const { pathname } = useLocation()
  const { currentUser } = useAuth()
  const resolvedId = id ?? currentUser?.id
  const isAccountSettings = !id
  const isExplicitEditRoute = pathname.endsWith('/edit')

  if (!resolvedId) return null

  return (
    <>
      <Metadata
        title={isAccountSettings ? 'Account Settings' : 'Edit User'}
        description="Edit user"
      />
      <AppSidebar />
      <AppContentShell>
        {isAccountSettings ? (
          <PageHeader title="Account Settings" />
        ) : (
          <PageHeader title="Edit User">
            <Link
              to={routes.users()}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Back to Users
            </Link>
          </PageHeader>
        )}
        <EditUserCell
          id={resolvedId}
          successRoute={
            isAccountSettings ? routes.accountSettings() : routes.users()
          }
          formVariant="account"
          startInEditMode={isExplicitEditRoute}
          showFormTitle={false}
        />
      </AppContentShell>
    </>
  )
}

export default EditUserPage
