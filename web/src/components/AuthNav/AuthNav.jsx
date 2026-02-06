import { Link, routes } from '@redwoodjs/router'

const AuthNav = ({ showSignIn, showSignUp }) => {
  return (
    <div className="nxa-auth-nav">
      <Link to={routes.login()} className="nxa-auth-logo">
        <img src="/logo.jpg" alt="2Creative Logo" loading="lazy" />
      </Link>
      <div className="nxa-auth-actions">
        {showSignIn && (
          <Link
            to={routes.login()}
            className="nxa-button nxa-button--sm nxa-button--inline"
          >
            Sign In
          </Link>
        )}
        {showSignUp && (
          <Link
            to={routes.signup()}
            className="nxa-button nxa-button--sm nxa-button--inline"
          >
            Sign Up
          </Link>
        )}
      </div>
    </div>
  )
}

export default AuthNav
