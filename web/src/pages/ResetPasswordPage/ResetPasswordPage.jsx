import { useEffect, useRef, useState } from 'react'

import { Form, PasswordField, Submit, FieldError } from '@redwoodjs/forms'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import AuthFooter from 'src/components/AuthFooter/AuthFooter'
import 'src/styles/brand-nxa.css'

const ResetPasswordPage = ({ resetToken }) => {
  const { isAuthenticated, reauthenticate, validateResetToken, resetPassword } =
    useAuth()
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  useEffect(() => {
    const validateToken = async () => {
      const response = await validateResetToken(resetToken)
      if (response.error) {
        setEnabled(false)
        toast.error(response.error)
      } else {
        setEnabled(true)
      }
    }
    validateToken()
  }, [resetToken, validateResetToken])

  const passwordRef = useRef(null)
  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  const onSubmit = async (data) => {
    const response = await resetPassword({
      resetToken,
      password: data.password,
    })

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success('Password changed!')
      await reauthenticate()
      navigate(routes.login())
    }
  }

  return (
    <>
      <Metadata title="Reset Password" />

      <main className="nxa-page">
        <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
        <div className="nxa-center">
          <div className="nxa-card nxa-card-split max-w-5xl">
            <section className="nxa-section">
              <div className="nxa-brand">
                <img src="/logo.jpg" alt="2Creative Logo" loading="lazy" />
                <div>
                  <div className="nxa-brand-title">Productivity Tool</div>
                  <div className="text-xs text-gray-500">2Creative Solutions</div>
                </div>
              </div>

              <h1 className="nxa-title">
                Set
                <br />
                New Password
              </h1>
              <p className="nxa-subtitle">
                Enter a new password to finish the reset process
              </p>

              <Form onSubmit={onSubmit} className="nxa-form">
                <PasswordField
                  name="password"
                  autoComplete="new-password"
                  className="nxa-input"
                  disabled={!enabled}
                  ref={passwordRef}
                  placeholder="New password"
                  validation={{
                    required: {
                      value: true,
                      message: 'New Password is required',
                    },
                  }}
                />

                <FieldError name="password" className="nxa-error" />

                <Submit className="nxa-button" disabled={!enabled}>
                  Update Password
                </Submit>
              </Form>

              <div className="nxa-footer">
                Remembered your password?{' '}
                <Link to={routes.login()} className="nxa-link">
                  Log in
                </Link>
              </div>
            </section>

            <section className="auth-illustration">
              <img
                src="/auth-banner.webp"
                alt="Reset password illustration"
                loading="lazy"
              />
            </section>
          </div>
        </div>
        <AuthFooter />
      </main>
    </>
  )
}

export default ResetPasswordPage
