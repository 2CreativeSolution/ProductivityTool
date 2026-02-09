import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsReportsOverviewPage = () => {
  return (
    <AssetsPageLayout
      title="Assets Reports Overview"
      description="Cross-user assignment trends and category rollups"
    >
      <AssetReports forcedView="overview" hideAdminTabs />
    </AssetsPageLayout>
  )
}

export default AssetsReportsOverviewPage
