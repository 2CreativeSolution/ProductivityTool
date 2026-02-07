import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import UserCell from 'src/components/User/UserCell'

const UserPage = ({ id }) => {
  return (
    <>
      <Metadata title="User" description="User details" />
      <AppSidebar />
      <AppContentShell>
        <PageHeader title="User Details">
          <Link
            to={routes.users()}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Back to Users
          </Link>
        </PageHeader>
        <UserCell id={id} showTitle={false} />
      </AppContentShell>
    </>
  )
}

export default UserPage
