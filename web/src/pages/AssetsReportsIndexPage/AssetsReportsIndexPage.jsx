import { useEffect } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'

const AssetsReportsIndexPage = () => {
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))

  useEffect(() => {
    navigate(
      isAdmin ? routes.assetsReportsOverview() : routes.assetsReportsMy(),
      {
        replace: true,
      }
    )
  }, [isAdmin])

  return null
}

export default AssetsReportsIndexPage
