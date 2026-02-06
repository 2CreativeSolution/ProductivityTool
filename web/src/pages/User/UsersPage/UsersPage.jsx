import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import UsersCell from 'src/components/User/UsersCell'

const UsersPage = () => {
  return (
    <>
      <Metadata title="Users" description="Manage users" />
      <AppSidebar />
      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage users and access roles
            </p>
          </div>
          <Link
            to={routes.newUser()}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            New User
          </Link>
        </div>
        <UsersCell />
      </main>
    </>
  )
}

export default UsersPage
