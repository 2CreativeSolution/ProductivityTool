import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import ChangePasswordForm from 'src/components/Settings/ChangePasswordForm/ChangePasswordForm'

const ChangePasswordPage = () => {
  return (
    <>
      <Metadata
        title="Change Password"
        description="Change your account password"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Change Password"
          description="Update your account password from your settings"
        />
        <ChangePasswordForm />
      </AppContentShell>
    </>
  )
}

export default ChangePasswordPage
