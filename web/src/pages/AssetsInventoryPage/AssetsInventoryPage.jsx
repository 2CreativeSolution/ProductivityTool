import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'

const AssetsInventoryPage = () => {
  return (
    <AssetsPageLayout
      title="Assets Inventory"
      description="Track company-owned assets and current availability"
    >
      <AssetTracker forcedTab="inventory" hideHeader hideTabNavigation />
    </AssetsPageLayout>
  )
}

export default AssetsInventoryPage
