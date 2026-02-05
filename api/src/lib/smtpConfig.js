// Centralized SMTP config parsing to avoid drift across email senders.

export const getSmtpConfig = ({ requireBaseUrl = false } = {}) => {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFromEmail = process.env.FROM_EMAIL || process.env.SMTP_FROM
  const smtpFromName = process.env.FROM_NAME || '2Creative Productivity Tool'
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const baseUrl = process.env.WEB_APP_URL
    ? process.env.WEB_APP_URL.replace(/\/$/, '')
    : undefined

  if (!smtpUser || !smtpPass || !smtpFromEmail || !smtpHost || !smtpPort) {
    throw new Error(
      'SMTP_USER, SMTP_PASS, FROM_EMAIL (or SMTP_FROM), SMTP_HOST, and SMTP_PORT environment variables are required'
    )
  }

  if (Number.isNaN(smtpPort)) {
    throw new Error('SMTP_PORT must be a number')
  }

  if (requireBaseUrl && !baseUrl) {
    throw new Error('WEB_APP_URL is required for this email flow')
  }

  return {
    smtpUser,
    smtpPass,
    smtpFromEmail,
    smtpFromName,
    smtpHost,
    smtpPort,
    baseUrl,
  }
}
