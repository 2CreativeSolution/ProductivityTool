import { useEffect, useRef, useState } from 'react'

import {
  Form,
  TextField,
  PasswordField,
  FieldError,
  Submit,
} from '@redwoodjs/forms'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import { STORAGE_KEYS } from 'src/lib/storageKeys'
import 'src/styles/brand-nxa.css'

const LoginPage = () => {
  const { isAuthenticated, logIn } = useAuth()
  const [rememberEmail, setRememberEmail] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const usernameRef = useRef(null)
  useEffect(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEYS.authEmail)
    if (storedEmail) {
      setUsername(storedEmail)
      setRememberEmail(true)
    }
    usernameRef.current?.focus()
  }, [])

  const onSubmit = async (data) => {
    if (rememberEmail) {
      localStorage.setItem(STORAGE_KEYS.authEmail, data.username || username)
    } else {
      localStorage.removeItem(STORAGE_KEYS.authEmail)
    }
    const response = await logIn({
      username: data.username,
      password: data.password,
    })

    if (response.message) {
      toast(response.message)
    } else if (response.error) {
      toast.error(response.error)
    } else {
      toast.success('Welcome back!')
    }
  }

  return (
    <>
      <Metadata title="Login" />

      <main className="nxa-page">
        <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
        <div className="nxa-card nxa-card-split max-w-5xl">
          <section className="nxa-section">
            <div className="nxa-brand">
              <img src="/logo.jpg" alt="2Creative Logo" loading="lazy" />
              <div>
                <div className="nxa-brand-title">Productivity Tool</div>
                <div className="text-xs text-gray-500">2Creative Solutions</div>
              </div>
            </div>

            <h1 className="nxa-title">Welcome Back</h1>
            <p className="nxa-subtitle">
              Hey, welcome back to your special place
            </p>

            <Form onSubmit={onSubmit} className="nxa-form">
              <TextField
                name="username"
                className="nxa-input"
                ref={usernameRef}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Email address"
                validation={{
                  required: {
                    value: true,
                    message: 'Email is required',
                  },
                }}
              />
              <FieldError name="username" className="nxa-error" />

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

              <div className="nxa-row">
                <label className="nxa-checkbox">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={rememberEmail}
                    onChange={(event) => setRememberEmail(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to={routes.forgotPassword()} className="nxa-link">
                  Forgot Password?
                </Link>
              </div>

              <Submit className="nxa-button">Sign In</Submit>
            </Form>

            <div className="nxa-footer">
              Don&apos;t have an account?{' '}
              <Link to={routes.signup()} className="nxa-link">
                Sign Up
              </Link>
            </div>
          </section>

          <section className="auth-illustration">
            <img
              src="/auth-banner.webp"
              alt="Login illustration"
              loading="lazy"
            />
          </section>
        </div>
      </main>
    </>
  )
}

export default LoginPage
