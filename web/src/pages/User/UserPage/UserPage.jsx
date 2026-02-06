import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import UserCell from 'src/components/User/UserCell'

const UserPage = ({ id }) => {
  return (
    <>
      <Metadata title="User" description="User details" />
      <AppSidebar />
      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <div className="mb-6">
          <Link
            to={routes.users()}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Back to Users
          </Link>
        </div>
        <UserCell id={id} />
      </main>
    </>
  )
}

export default UserPage
