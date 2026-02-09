import { navigate, routes } from '@redwoodjs/router'

import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsReportsEmployeesPage = () => {
  return (
    <AssetsPageLayout
      title="Employee Asset Reports"
      description="Browse employees and drill into individual assignment history"
    >
      <AssetReports
        forcedView="employees"
        hideAdminTabs
        onUserSelect={(user) =>
          navigate(routes.assetsReportsEmployee({ userId: user.id }))
        }
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsEmployeesPage
