import { useEffect } from 'react'

import { navigate, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'

const AuthRedirectPage = () => {
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate(routes.home())
      } else {
        navigate(routes.login())
      }
    }
  }, [loading, isAuthenticated])

  return null
}

export default AuthRedirectPage
