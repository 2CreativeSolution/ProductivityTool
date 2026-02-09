import { navigate, routes } from '@redwoodjs/router'

import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsReportsDepartmentDetailPage = ({ department }) => {
  let decodedDepartment = department || ''
  try {
    decodedDepartment = decodeURIComponent(department || '')
  } catch (_error) {
    decodedDepartment = department || ''
  }

  return (
    <AssetsPageLayout
      title="Department Asset Detail"
      description="Detailed assignment history for a selected department"
    >
      <AssetReports
        forcedView="department"
        selectedDepartmentName={decodedDepartment}
        hideAdminTabs
        onBackToDepartments={() => navigate(routes.assetsReportsDepartments())}
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsDepartmentDetailPage
