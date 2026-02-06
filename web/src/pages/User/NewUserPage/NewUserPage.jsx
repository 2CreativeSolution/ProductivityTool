import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import NewUser from 'src/components/User/NewUser'

const NewUserPage = () => {
  return (
    <>
      <Metadata title="New User" description="Create user" />
      <AppSidebar />
      <main className="app-content-shell mb-8 mr-8 mt-20 lg:my-8 lg:ml-[calc(var(--app-sidebar-width)+1.25rem)]">
        <div className="mb-6">
          <Link
            to={routes.users()}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
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
