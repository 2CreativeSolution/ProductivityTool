import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import NewUser from 'src/components/User/NewUser'

const NewUserPage = () => {
  return (
    <>
      <Metadata title="New User" description="Create user" />
      <AppSidebar />
      <AppContentShell>
        <PageHeader title="New User">
          <Link
            to={routes.users()}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Back to Users
          </Link>
        </PageHeader>
        <NewUser hideFormTitle />
      </AppContentShell>
    </>
  )
}

export default NewUserPage
