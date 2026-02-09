import { navigate, routes } from '@redwoodjs/router'

import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsReportsEmployeeDetailPage = ({ userId }) => {
  const parsedUserId = Number(userId)

  return (
    <AssetsPageLayout
      title="Employee Asset Detail"
      description="Detailed assignment history for a selected employee"
    >
      <AssetReports
        forcedView="employee"
        selectedUserId={Number.isNaN(parsedUserId) ? null : parsedUserId}
        hideAdminTabs
        onBackToEmployees={() => navigate(routes.assetsReportsEmployees())}
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsEmployeeDetailPage
