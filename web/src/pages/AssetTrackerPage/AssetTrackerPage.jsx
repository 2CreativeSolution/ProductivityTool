import { useState } from 'react'

import {
  ArchiveBoxIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

import { Metadata } from '@redwoodjs/web'
import { useQuery } from '@redwoodjs/web'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import AssetManagement from 'src/components/AssetTracker/AssetManagement'
import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { SummaryMetricCard } from 'src/components/ui'

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
  const availabilityRate = totalAssets
    ? Math.round((availableAssets / totalAssets) * 100)
    : 0
  const assignedRate = totalAssets
    ? Math.round((assignedAssets / totalAssets) * 100)
    : 0
  const warrantyRiskRate = totalAssets
    ? Math.round((warrantyExpiringSoon / totalAssets) * 100)
    : 0

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

      <AppContentShell>
        <PageHeader
          title="Asset Tracker"
          description="Track company-owned assets and their assignments to employees"
        />

        {/* Quick Stats Section - Now Dynamic */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetricCard
            size="sm"
            title="Total Assets"
            value={
              statsLoading ? '...' : Number(totalAssets).toLocaleString('en-US')
            }
            subtitle="In inventory"
            icon={<ArchiveBoxIcon />}
            trend={{ direction: 'neutral', label: '100%' }}
          />

          <SummaryMetricCard
            size="sm"
            title="Available"
            value={
              statsLoading
                ? '...'
                : Number(availableAssets).toLocaleString('en-US')
            }
            subtitle="Ready to assign"
            icon={<CheckCircleIcon />}
            trend={{ direction: 'positive', label: `${availabilityRate}%` }}
          />

          <SummaryMetricCard
            size="sm"
            title="Assigned"
            value={
              statsLoading
                ? '...'
                : Number(assignedAssets).toLocaleString('en-US')
            }
            subtitle="In active use"
            icon={<BriefcaseIcon />}
            trend={{ direction: 'neutral', label: `${assignedRate}%` }}
          />

          <SummaryMetricCard
            size="sm"
            title="Warranty Risk"
            value={
              statsLoading
                ? '...'
                : Number(warrantyExpiringSoon).toLocaleString('en-US')
            }
            subtitle="Expiring within 3 months"
            icon={<ExclamationTriangleIcon />}
            trend={{
              direction: warrantyExpiringSoon > 0 ? 'negative' : 'positive',
              label: `${warrantyRiskRate}%`,
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 mt-8 border-b border-gray-200">
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
                  Create new assets, categories, and assign assets to employees
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
      </AppContentShell>
    </>
  )
}

export default AssetTrackerPage
