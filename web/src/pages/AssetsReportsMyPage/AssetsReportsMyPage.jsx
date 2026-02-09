import { useCallback, useEffect, useState } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'
import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import { buttonVariants } from 'src/components/ui/button'

const AssetsReportsMyPage = () => {
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))
  const [exportMyReportCsv, setExportMyReportCsv] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      navigate(routes.assetsReportsOverview(), { replace: true })
    }
  }, [isAdmin])

  const handleMyExportReady = useCallback((exportHandler) => {
    setExportMyReportCsv(() => exportHandler || null)
  }, [])

  if (isAdmin) {
    return null
  }

  return (
    <AssetsPageLayout
      title="My Asset Reports"
      description="Review your asset assignment history and report metrics"
      actions={
        <button
          type="button"
          onClick={() => exportMyReportCsv?.()}
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
        >
          Export CSV
        </button>
      }
    >
      <AssetReports
        forcedView="my"
        hideAdminTabs
        hideMyInlineExportButton
        onMyReportExportReady={handleMyExportReady}
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsMyPage
