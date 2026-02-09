import AssetManagement from 'src/components/AssetTracker/AssetManagement'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsManagementPage = () => {
  return (
    <AssetsPageLayout
      title="Assets Management"
      description="Create assets, categories, and assignments"
    >
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <AssetManagement />
      </div>
    </AssetsPageLayout>
  )
}

export default AssetsManagementPage
