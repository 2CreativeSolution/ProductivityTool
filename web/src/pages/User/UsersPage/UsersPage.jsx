import { useState } from 'react'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import { Input } from 'src/components/Forms/Input/Input'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import UsersCell from 'src/components/User/UsersCell'

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <>
      <Metadata title="Users" description="Manage users" />
      <AppSidebar />
      <AppContentShell>
        <PageHeader title="Users" description="Manage users and access roles">
          <Input
            type="text"
            size="sm"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users by name or email"
          />
          <Link
            to={routes.newUser()}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            New User
          </Link>
        </PageHeader>
        <UsersCell searchTerm={searchTerm} />
      </AppContentShell>
    </>
  )
}

export default UsersPage
