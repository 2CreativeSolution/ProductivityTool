import { useState } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import { Button } from 'src/components/ui'

const AssetsReportsEmployeeDetailPage = ({ userId }) => {
  const parsedUserId = Number(userId)
  const [exportEmployeeReport, setExportEmployeeReport] = useState(null)

  const handleEmployeeReportExportReady = (exportHandler) => {
    setExportEmployeeReport(() => exportHandler)
  }

  return (
    <AssetsPageLayout
      title="Employee Asset Detail"
      description="Detailed assignment history for a selected employee"
      actions={
        exportEmployeeReport ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={exportEmployeeReport}
          >
            Export CSV
          </Button>
        ) : null
      }
    >
      <AssetReports
        forcedView="employee"
        selectedUserId={Number.isNaN(parsedUserId) ? null : parsedUserId}
        hideAdminTabs
        onBackToEmployees={() => navigate(routes.assetsReportsEmployees())}
        onEmployeeReportExportReady={handleEmployeeReportExportReady}
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsEmployeeDetailPage
