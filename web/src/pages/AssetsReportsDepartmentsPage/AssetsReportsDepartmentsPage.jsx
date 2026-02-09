import { navigate, routes } from '@redwoodjs/router'

import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsReportsDepartmentsPage = () => {
  return (
    <AssetsPageLayout
      title="Department Asset Reports"
      description="Browse departments and drill into assignment distributions"
    >
      <AssetReports
        forcedView="departments"
        hideAdminTabs
        onDepartmentSelect={(departmentName) =>
          navigate(
            routes.assetsReportsDepartment({ department: departmentName })
          )
        }
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsDepartmentsPage
