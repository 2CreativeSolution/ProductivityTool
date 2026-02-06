import { Link, routes } from '@redwoodjs/router'

import { Button } from 'src/components/ui/button'

const AuthNav = ({ showSignIn, showSignUp }) => {
  return (
    <div className="nxa-auth-nav">
      <Link to={routes.login()} className="nxa-auth-logo">
        <img src="/logo.jpg" alt="2Creative Logo" loading="lazy" />
      </Link>
      <div className="nxa-auth-actions">
        {showSignIn && (
          <Button asChild size="sm" variant="primary">
            <Link to={routes.login()}>Sign In</Link>
          </Button>
        )}
        {showSignUp && (
          <Button asChild size="sm" variant="primary">
            <Link to={routes.signup()}>Sign Up</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default AuthNav
