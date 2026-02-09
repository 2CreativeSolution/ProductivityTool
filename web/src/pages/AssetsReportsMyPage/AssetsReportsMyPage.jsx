import { useEffect } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui'
import AssetReports from 'src/components/AssetTracker/AssetReports'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'

const AssetsReportsMyPage = () => {
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))

  useEffect(() => {
    if (isAdmin) {
      navigate(routes.assetsReportsOverview(), { replace: true })
    }
  }, [isAdmin])

  if (isAdmin) {
    return null
  }

  return (
    <AssetsPageLayout
      title="My Asset Reports"
      description="Review your asset assignment history and report metrics"
    >
      <AssetReports forcedView="my" hideAdminTabs />
    </AssetsPageLayout>
  )
}

export default AssetsReportsMyPage
