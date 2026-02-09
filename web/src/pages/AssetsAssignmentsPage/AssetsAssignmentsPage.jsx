import { useState } from 'react'

import { useAuth } from 'src/auth'
import AssetManagement from 'src/components/AssetTracker/AssetManagement'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'

const AssetsAssignmentsPage = () => {
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAssignmentsUpdated = () => {
    setRefreshKey((previousKey) => previousKey + 1)
  }

  return (
    <AssetsPageLayout
      title="Assets Assignments"
      description="View currently assigned assets and return workflows"
      actions={
        isAdmin ? (
          <AssetManagement
            onAssetCreated={handleAssignmentsUpdated}
            visibleActions={['assign']}
            useHeaderActionStyles
          />
        ) : null
      }
    >
      <AssetTracker
        key={refreshKey}
        forcedTab="assignments"
        hideHeader
        hideTabNavigation
      />
    </AssetsPageLayout>
  )
}

export default AssetsAssignmentsPage
