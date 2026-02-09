import { useState } from 'react'

import AssetManagement from 'src/components/AssetTracker/AssetManagement'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'

const AssetsInventoryPage = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleInventoryUpdated = () => {
    setRefreshKey((previousKey) => previousKey + 1)
  }

  return (
    <AssetsPageLayout
      title="Assets Inventory"
      description="Track company-owned assets and current availability"
      actions={
        <AssetManagement
          onAssetCreated={handleInventoryUpdated}
          visibleActions={['asset', 'category', 'assign']}
          actionLabels={{
            asset: 'Add Asset',
            category: 'Add Category',
            assign: 'Assign Asset',
          }}
          useHeaderActionStyles
        />
      }
    >
      <AssetTracker
        key={refreshKey}
        forcedTab="inventory"
        hideHeader
        hideTabNavigation
      />
    </AssetsPageLayout>
  )
}

export default AssetsInventoryPage
