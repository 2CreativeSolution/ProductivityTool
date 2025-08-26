import { useState } from 'react'

import { useAuth } from 'src/auth'
import { testAuthToken } from 'src/auth'

const AuthDebug = () => {
  const { isAuthenticated, currentUser, client, loading } = useAuth()
  const [testResult, setTestResult] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const runTests = async () => {
    // Test 1: Check localStorage
    const storedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('supabase-auth-token')
        : null

    // Test 2: Check cookies
    const tokenCookie =
      typeof document !== 'undefined'
        ? document.cookie
            .split('; ')
            .find((row) => row.startsWith('supabase-auth-token='))
        : null

    // Test 3: Check current session
    const { data: sessionData } = await client.auth.getSession()

    // Test 4: Check user
    const { data: userData } = await client.auth.getUser()

    // Test 5: Test API token handling
    const apiTest = await testAuthToken()

    setTestResult({
      hasStoredToken: !!storedToken,
      tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : null,
      hasCookieToken: !!tokenCookie,
      hasSession: !!sessionData?.session,
      sessionExpiry: sessionData?.session?.expires_at
        ? new Date(sessionData.session.expires_at * 1000).toLocaleString()
        : 'N/A',
      hasUser: !!userData?.user,
      userEmail: userData?.user?.email || 'None',
      apiTestResult: apiTest,
    })
  }

  return (
    <div className="rounded bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold">Authentication Debugger</h2>

      <div className="mb-4">
        <p>
          <strong>Auth Status:</strong>{' '}
          {loading
            ? 'Loading...'
            : isAuthenticated
              ? 'Authenticated'
              : 'Not Authenticated'}
        </p>
        {isAuthenticated && currentUser && (
          <p>
            <strong>Current User:</strong> {currentUser.email}
          </p>
        )}
      </div>

      <button
        onClick={runTests}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Run Auth Tests
      </button>

      {testResult && (
        <div className="mt-4 rounded border p-3">
          <h3 className="font-semibold">Test Results:</h3>
          <ul className="ml-5 mt-2 list-disc">
            <li>
              Token in localStorage: {testResult.hasStoredToken ? '✅' : '❌'}
            </li>
            <li>Token in cookies: {testResult.hasCookieToken ? '✅' : '❌'}</li>
            <li>Active session: {testResult.hasSession ? '✅' : '❌'}</li>
            <li>Session expires: {testResult.sessionExpiry}</li>
            <li>User info available: {testResult.hasUser ? '✅' : '❌'}</li>
            <li>User email: {testResult.userEmail}</li>
            <li>API test: {testResult.apiTestResult?.success ? '✅' : '❌'}</li>
          </ul>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-blue-500 underline"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {showDetails && (
            <pre className="mt-2 overflow-auto bg-gray-100 p-2 text-xs">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

export default AuthDebug
