import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
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
      <main className="app-content-shell mb-8 mr-8 mt-20 lg:my-8 lg:ml-[calc(var(--app-sidebar-width)+1.25rem)]">
        {!isAccountSettings && (
          <div className="mb-6">
            <Link
              to={routes.users()}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Back to Users
            </Link>
          </div>
        )}
        <EditUserCell
          id={resolvedId}
          successRoute={
            isAccountSettings ? routes.accountSettings() : routes.users()
          }
          formVariant={isAccountSettings ? 'account' : 'default'}
        />
      </main>
    </>
  )
}

export default EditUserPage
