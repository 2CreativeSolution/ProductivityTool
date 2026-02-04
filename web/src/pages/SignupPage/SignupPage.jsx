import { useEffect, useRef, useState } from 'react'

import { Form, TextField, PasswordField, FieldError, Submit } from '@redwoodjs/forms'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import 'src/styles/brand-nxa.css'

const SignupPage = () => {
  const { isAuthenticated, signUp } = useAuth()
  const [name, setName] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  // focus on username box on page load
  const usernameRef = useRef(null)
  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const onSubmit = async (data) => {
    const response = await signUp({
      username: data.username,
      password: data.password,
      name: data.name, // <-- add this line
    })

    if (response.message) {
      toast(response.message)
    } else if (response.error) {
      toast.error(response.error)
    } else {
      // user is signed in automatically
      toast.success('Welcome!')
    }
  }

  return (
    <>
      <Metadata title="Signup" />

      <main className="nxa-page">
        <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
        <div className="nxa-card nxa-card-split max-w-5xl">
          <section className="nxa-section">
            <div className="nxa-brand">
              <img src="/logo.jpg" alt="2Creative Logo" loading="lazy" />
              <div>
                <div className="nxa-brand-title">Productivity Tool</div>
                <div className="text-xs text-gray-500">
                  2Creative Solutions
                </div>
              </div>
            </div>

            <h1 className="nxa-title">
              Create
              <br />
              Your Account
            </h1>
            <p className="nxa-subtitle">
              Join your team workspace in a few steps
            </p>

            <Form onSubmit={onSubmit} className="nxa-form">
              <TextField
                name="username"
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

              <FieldError name="username" className="nxa-error" />

              <TextField
                name="name"
                className="nxa-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                validation={{
                  required: {
                    value: true,
                    message: 'Full name is required',
                  },
                }}
              />

              <FieldError name="name" className="nxa-error" />

              <PasswordField
                name="password"
                className="nxa-input"
                placeholder="Password"
                autoComplete="current-password"
                validation={{
                  required: {
                    value: true,
                    message: 'Password is required',
                  },
                }}
              />

              <FieldError name="password" className="nxa-error" />

              <Submit className="nxa-button">Sign Up</Submit>
            </Form>

            <div className="nxa-footer">
              Already have an account?{' '}
              <Link to={routes.login()} className="nxa-link">
                Log in
              </Link>
            </div>
          </section>

          <section className="auth-illustration">
            <img
              src="/auth-banner.webp"
              alt="Signup illustration"
              loading="lazy"
            />
          </section>
        </div>
      </main>
    </>
  )
}

export default SignupPage
