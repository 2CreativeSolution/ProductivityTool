import { useEffect } from 'react'

import { navigate, routes } from '@redwoodjs/router'

const AssetTrackerLegacyPage = () => {
  useEffect(() => {
    // Legacy route kept for old bookmarks; canonical entrypoint is `/assets`.
    navigate(routes.assets(), { replace: true })
  }, [])

  return null
}

export default AssetTrackerLegacyPage
