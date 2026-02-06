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
      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <div className="mb-6">
          <Link
            to={isAccountSettings ? routes.home() : routes.users()}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {isAccountSettings ? 'Back to Home' : 'Back to Users'}
          </Link>
        </div>
        <EditUserCell
          id={resolvedId}
          successRoute={
            isAccountSettings ? routes.accountSettings() : routes.users()
          }
        />
      </main>
    </>
  )
}

export default EditUserPage
