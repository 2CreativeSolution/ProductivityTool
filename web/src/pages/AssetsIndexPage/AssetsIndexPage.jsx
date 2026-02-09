import { useEffect } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'

const AssetsIndexPage = () => {
  const { loading, isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      navigate(routes.login(), { replace: true })
      return
    }

    const isAdmin = Boolean(hasRole && hasRole('ADMIN'))
    navigate(isAdmin ? routes.assetsInventory() : routes.assetsAssignments(), {
      replace: true,
    })
  }, [hasRole, isAuthenticated, loading])

  return null
}

export default AssetsIndexPage
