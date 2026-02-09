import { useState } from 'react'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { buttonVariants } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
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
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users by name or email"
            className="h-9 w-64 border-slate-300 bg-white"
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
