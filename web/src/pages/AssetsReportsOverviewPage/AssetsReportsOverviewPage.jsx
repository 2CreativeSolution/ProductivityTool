import { useCallback, useState } from 'react'

import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import { buttonVariants } from 'src/components/ui/button'

const AssetsReportsOverviewPage = () => {
  const [exportOverviewCsv, setExportOverviewCsv] = useState(null)

  const handleOverviewExportReady = useCallback((exportHandler) => {
    setExportOverviewCsv(() => exportHandler || null)
  }, [])

  return (
    <AssetsPageLayout
      title="Assets Reports Overview"
      description="Cross-user assignment trends and category rollups"
      actions={
        <button
          type="button"
          onClick={() => exportOverviewCsv?.()}
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
        >
          Export CSV
        </button>
      }
    >
      <AssetReports
        forcedView="overview"
        hideAdminTabs
        hideOverviewInlineExportButton
        onOverviewExportReady={handleOverviewExportReady}
      />
    </AssetsPageLayout>
  )
}

export default AssetsReportsOverviewPage
