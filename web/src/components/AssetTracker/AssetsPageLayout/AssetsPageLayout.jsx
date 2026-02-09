import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'

const AssetsPageLayout = ({ title, description, actions, children }) => {
  return (
    <>
      <Metadata title={title} description={description} />
      <AppSidebar />
      <AppContentShell>
        <PageHeader title={title} description={description}>
          {actions}
        </PageHeader>

        {children}
      </AppContentShell>
    </>
  )
}

export default AssetsPageLayout
