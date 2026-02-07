import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import EditUserCell from 'src/components/User/EditUserCell'

const EditUserPage = ({ id }) => {
  const { currentUser } = useAuth()
  const resolvedId = id ?? currentUser?.id
  const isAccountSettings = !id

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
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
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
          startInEditMode={!isAccountSettings}
          showFormTitle={false}
        />
      </AppContentShell>
    </>
  )
}

export default EditUserPage
