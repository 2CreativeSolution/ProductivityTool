import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'

const AssetsAssignmentsPage = () => {
  return (
    <AssetsPageLayout
      title="Assets Assignments"
      description="View currently assigned assets and return workflows"
    >
      <AssetTracker forcedTab="assignments" hideHeader hideTabNavigation />
    </AssetsPageLayout>
  )
}

export default AssetsAssignmentsPage
