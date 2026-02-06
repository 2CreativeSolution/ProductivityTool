import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import NewUser from 'src/components/User/NewUser'

const NewUserPage = () => {
  return (
    <>
      <Metadata title="New User" description="Create user" />
      <AppSidebar />
      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New User</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new user account
            </p>
          </div>
          <Link
            to={routes.users()}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to Users
          </Link>
        </div>
        <NewUser />
      </main>
    </>
  )
}

export default NewUserPage
