import { APP_COPY, APP_LINKS } from 'src/lib/appConfig'

const AuthFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="nxa-legal">
      © 2024 - {currentYear}{' '}
      <a
        className="nxa-link"
        href={APP_LINKS.companySite}
        target="_blank"
        rel="noreferrer"
      >
        {APP_COPY.companyName}
      </a>
    </div>
  )
}

export default AuthFooter
