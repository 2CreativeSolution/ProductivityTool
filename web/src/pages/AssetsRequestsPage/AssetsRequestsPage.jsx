import { useState } from 'react'

import { useAuth } from 'src/auth'
import AssetsPageLayout from 'src/components/AssetTracker/AssetsPageLayout/AssetsPageLayout'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'
import { buttonVariants } from 'src/components/ui/button'

const AssetsRequestsPage = () => {
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)

  return (
    <AssetsPageLayout
      title="Assets Requests"
      description="Create, track, approve, and reject asset requests"
      actions={
        !isAdmin && (
          <button
            type="button"
            onClick={() => setRequestDialogOpen(true)}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Request Asset
          </button>
        )
      }
    >
      <AssetTracker
        forcedTab="requests"
        hideHeader
        hideTabNavigation
        showRequestsInlineButton={false}
        externalRequestDialogOpen={requestDialogOpen}
        onExternalRequestDialogChange={setRequestDialogOpen}
      />
    </AssetsPageLayout>
  )
}

export default AssetsRequestsPage
