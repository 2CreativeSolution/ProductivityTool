import { useEffect } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'

const AssetsIndexPage = () => {
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))

  useEffect(() => {
    navigate(isAdmin ? routes.assetsInventory() : routes.assetsAssignments(), {
      replace: true,
    })
  }, [isAdmin])

  return null
}

export default AssetsIndexPage
