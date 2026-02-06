import { useState } from 'react'

import { Metadata } from '@redwoodjs/web'
import { useQuery } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import AssetManagement from 'src/components/AssetTracker/AssetManagement'
import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'

const ASSET_STATS_QUERY = gql`
  query AssetStatsQuery {
    assets {
      id
      status
      warrantyExpiry
      category {
        id
        name
      }
    }
    assetCategories {
      id
      name
      description
      assets {
        id
        status
      }
    }
    activeAssetAssignments {
      id
    }
  }
`

const AssetTrackerPage = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('tracker')

  const isAdmin = currentUser?.roles?.includes('ADMIN')

  // Fetch asset statistics
  const { data: statsData, loading: statsLoading } = useQuery(ASSET_STATS_QUERY)

  const handleAssetUpdated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Calculate dynamic stats
  const totalAssets = statsData?.assets?.length || 0
  const availableAssets =
    statsData?.assets?.filter((asset) => asset.status === 'Available').length ||
    0
  const assignedAssets = statsData?.activeAssetAssignments?.length || 0
  const warrantyExpiringSoon =
    statsData?.assets?.filter((asset) => {
      if (!asset.warrantyExpiry) return false
      const expiryDate = new Date(asset.warrantyExpiry)
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
      return expiryDate <= threeMonthsFromNow && expiryDate >= new Date()
    }).length || 0

  // Category icon mapping
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      Laptop: '💻',
      Monitor: '🖥️',
      Phone: '📱',
      Tablet: '📱',
      Accessories: '⌨️',
      'Network Equipment': '🌐',
      Printer: '🖨️',
      Camera: '📷',
      Speaker: '🔊',
      Headset: '🎧',
    }
    return iconMap[categoryName] || '📦'
  }

  // Category color mapping
  const getCategoryColor = (index) => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-purple-50 border-purple-200',
      'bg-yellow-50 border-yellow-200',
      'bg-red-50 border-red-200',
      'bg-indigo-50 border-indigo-200',
      'bg-pink-50 border-pink-200',
      'bg-orange-50 border-orange-200',
    ]
    return colors[index % colors.length] || 'bg-gray-50 border-gray-200'
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Please log in
          </h1>
          <p className="text-gray-600">
            You need to be logged in to access the Asset Tracker.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Metadata
        title="Asset Tracker"
        description="Track and manage company assets and assignments"
      />

      <AppSidebar />

      <main className="app-content-shell mx-4 mt-20 md:mx-8 lg:ml-[var(--app-sidebar-width)] lg:mr-10 lg:mt-4">
        <div className="mx-auto max-w-7xl py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Asset Tracker</h1>
            <p className="mt-2 text-gray-600">
              Track company-owned assets and their assignments to employees
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'tracker'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Asset Inventory
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('management')}
                  className={`border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === 'management'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Asset Management
                </button>
              )}
              <button
                onClick={() => setActiveTab('reports')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Reports
              </button>
            </nav>
          </div>

          <div className="space-y-8">
            {/* Asset Tracker Tab */}
            {activeTab === 'tracker' && (
              <div key={refreshKey}>
                <AssetTracker />
              </div>
            )}

            {/* Admin Management Tab */}
            {activeTab === 'management' && isAdmin && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Asset Management
                  </h2>
                  <p className="text-gray-600">
                    Create new assets, categories, and assign assets to
                    employees
                  </p>
                </div>
                <AssetManagement onAssetCreated={handleAssetUpdated} />
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div key={refreshKey}>
                <AssetReports />
              </div>
            )}
          </div>

          {/* Quick Stats Section - Now Dynamic */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '...' : totalAssets}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  Total Assets
                </div>
                <div className="text-xs text-gray-500">In inventory</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : availableAssets}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  Available
                </div>
                <div className="text-xs text-gray-500">Ready to assign</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? '...' : assignedAssets}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  Assigned
                </div>
                <div className="text-xs text-gray-500">To employees</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statsLoading ? '...' : warrantyExpiringSoon}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  Warranty
                </div>
                <div className="text-xs text-gray-500">Expiring soon</div>
              </div>
            </div>
          </div>

          {/* Asset Categories Overview - Now Dynamic */}
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Asset Categories
            </h3>
            {statsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading categories...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {statsData?.assetCategories?.map((category, index) => {
                  const assetCount = category.assets?.length || 0
                  const availableCount =
                    category.assets?.filter(
                      (asset) => asset.status === 'Available'
                    ).length || 0
                  const assignedCount =
                    category.assets?.filter(
                      (asset) => asset.status === 'Assigned'
                    ).length || 0

                  return (
                    <div
                      key={category.id}
                      className={`rounded-lg border p-3 text-center ${getCategoryColor(index)} cursor-pointer transition-shadow hover:shadow-md`}
                      title={`${category.description || category.name} - ${assetCount} total assets`}
                    >
                      <div className="mb-2 text-2xl">
                        {getCategoryIcon(category.name)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {assetCount} total
                      </div>
                      <div className="mt-1 flex justify-center gap-2 text-xs text-gray-400">
                        <span className="text-green-600">
                          {availableCount} free
                        </span>
                        <span className="text-blue-600">
                          {assignedCount} used
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!statsLoading &&
              (!statsData?.assetCategories ||
                statsData.assetCategories.length === 0) && (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    No asset categories found. Create some categories to get
                    started!
                  </p>
                </div>
              )}
          </div>
        </div>
      </main>
    </>
  )
}

export default AssetTrackerPage
