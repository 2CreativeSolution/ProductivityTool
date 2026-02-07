import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import UsersCell from 'src/components/User/UsersCell'

const UsersPage = () => {
  return (
    <>
      <Metadata title="Users" description="Manage users" />
      <AppSidebar />
      <AppContentShell>
        <PageHeader title="Users" description="Manage users and access roles">
          <Link
            to={routes.newUser()}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            New User
          </Link>
        </PageHeader>
        <UsersCell />
      </AppContentShell>
    </>
  )
}

export default UsersPage
