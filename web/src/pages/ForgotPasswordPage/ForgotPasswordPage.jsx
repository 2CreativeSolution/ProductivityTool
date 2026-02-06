import { useEffect, useRef } from 'react'

import { Form, TextField, Submit, FieldError } from '@redwoodjs/forms'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import AuthFooter from 'src/components/AuthFooter/AuthFooter'
import AuthNav from 'src/components/AuthNav/AuthNav'
import { buttonVariants } from 'src/components/ui/button'
import 'src/styles/brand-nxa.css'

const ForgotPasswordPage = () => {
  const { isAuthenticated, forgotPassword } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const usernameRef = useRef(null)
  useEffect(() => {
    usernameRef?.current?.focus()
  }, [])

  const onSubmit = async (data) => {
    const response = await forgotPassword(data.email)
    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success(
        'A link to reset your password was sent to ' + response.email
      )
      navigate(routes.login())
    }
  }

  return (
    <>
      <Metadata title="Forgot Password" />
      <main className="nxa-page">
        <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
        <AuthNav showSignIn showSignUp />
        <div className="nxa-center">
          <div className="nxa-card nxa-card-split max-w-5xl">
            <section className="nxa-section">
              <h1 className="nxa-title">
                Reset
                <br />
                Your Password
              </h1>
              <p className="nxa-subtitle">
                We’ll send you a reset link to your email
              </p>

              <Form onSubmit={onSubmit} className="nxa-form">
                <TextField
                  name="email"
                  className="nxa-input"
                  ref={usernameRef}
                  placeholder="Email address"
                  validation={{
                    required: {
                      value: true,
                      message: 'Email is required',
                    },
                  }}
                />
                <FieldError name="email" className="nxa-error" />
                <Submit
                  className={buttonVariants({
                    variant: 'primary',
                    className: 'mt-4',
                  })}
                >
                  Send Reset Link
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

export default ForgotPasswordPage
