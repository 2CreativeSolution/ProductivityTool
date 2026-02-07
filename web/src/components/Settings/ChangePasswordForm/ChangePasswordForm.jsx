import { useMemo, useState } from 'react'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { buttonVariants } from 'src/components/ui/button'

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePasswordMutation($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`

const PASSWORD_STRENGTH_RULES = [
  {
    key: 'length',
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    key: 'caseMix',
    label: 'Upper and lower case letters',
    test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    key: 'number',
    label: 'At least one number',
    test: (value) => /\d/.test(value),
  },
  {
    key: 'symbol',
    label: 'At least one symbol',
    test: (value) => /[^A-Za-z\d]/.test(value),
  },
]

const STRENGTH_SCALE = {
  0: {
    label: 'Weak',
    barClassName: 'bg-red-500',
    textClassName: 'text-red-700',
  },
  1: {
    label: 'Weak',
    barClassName: 'bg-red-500',
    textClassName: 'text-red-700',
  },
  2: {
    label: 'Fair',
    barClassName: 'bg-amber-500',
    textClassName: 'text-amber-700',
  },
  3: {
    label: 'Good',
    barClassName: 'bg-sky-500',
    textClassName: 'text-sky-700',
  },
  4: {
    label: 'Strong',
    barClassName: 'bg-emerald-500',
    textClassName: 'text-emerald-700',
  },
}

const FIELD_CLASS_NAME =
  'ring-offset-background flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#322e85]/30'

const FIELD_ERROR_CLASS_NAME = 'mt-1 text-xs text-red-700'

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION, {
    onCompleted: () => {
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setHasAttemptedSubmit(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const strengthChecks = useMemo(
    () =>
      PASSWORD_STRENGTH_RULES.map((rule) => ({
        key: rule.key,
        label: rule.label,
        passed: rule.test(newPassword),
      })),
    [newPassword]
  )

  const strengthScore = strengthChecks.reduce(
    (score, rule) => score + (rule.passed ? 1 : 0),
    0
  )
  const strength = STRENGTH_SCALE[strengthScore]
  const strengthPercent = (strengthScore / PASSWORD_STRENGTH_RULES.length) * 100

  const hasCurrentPassword = currentPassword.trim().length > 0
  const hasNewPassword = newPassword.trim().length > 0
  const hasConfirmPassword = confirmPassword.trim().length > 0
  const confirmFieldTouched = confirmPassword.length > 0
  const passwordsMatch = hasConfirmPassword && confirmPassword === newPassword
  const showCurrentPasswordError = hasAttemptedSubmit && !hasCurrentPassword
  const showNewPasswordError = hasAttemptedSubmit && !hasNewPassword
  const showConfirmPasswordError = hasAttemptedSubmit && !hasConfirmPassword
  const showPasswordMismatchError =
    (hasAttemptedSubmit || confirmFieldTouched) &&
    hasConfirmPassword &&
    !passwordsMatch
  const canSubmit =
    hasCurrentPassword &&
    hasNewPassword &&
    hasConfirmPassword &&
    newPassword === confirmPassword

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)

    if (!canSubmit) {
      toast.error(
        'Please complete all password fields and match both new passwords'
      )
      return
    }

    await changePassword({
      variables: {
        input: {
          currentPassword,
          newPassword,
        },
      },
    })
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white px-6 py-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Update Password
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your current password and choose a new one.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className={FIELD_CLASS_NAME}
              placeholder="Enter your current password"
            />
            {showCurrentPasswordError && (
              <p className={FIELD_ERROR_CLASS_NAME}>
                Current password is required
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className={FIELD_CLASS_NAME}
              placeholder="Enter a new password"
            />
            {showNewPasswordError && (
              <p className={FIELD_ERROR_CLASS_NAME}>New password is required</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-new-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className={FIELD_CLASS_NAME}
              placeholder="Re-enter your new password"
            />
            {showPasswordMismatchError && (
              <p className={FIELD_ERROR_CLASS_NAME}>
                New passwords do not match
              </p>
            )}
            {showConfirmPasswordError && (
              <p className={FIELD_ERROR_CLASS_NAME}>
                Confirming your new password is required
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={buttonVariants({ variant: 'primary' })}
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </form>

      <aside className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Password Strength
        </h3>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all duration-200 ${strength.barClassName}`}
            style={{ width: `${strengthPercent}%` }}
          ></div>
        </div>
        <p className={`mt-2 text-sm font-medium ${strength.textClassName}`}>
          {strength.label}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Strength is informational only. You can still save with a weak
          password.
        </p>

        <ul className="mt-4 space-y-2">
          {strengthChecks.map((rule) => (
            <li key={rule.key} className="flex items-center gap-2 text-xs">
              <i
                className={`text-sm ${
                  rule.passed
                    ? 'ri-checkbox-circle-fill text-emerald-600'
                    : 'ri-close-circle-line text-slate-400'
                }`}
                aria-hidden="true"
              ></i>
              <span
                className={rule.passed ? 'text-slate-800' : 'text-slate-500'}
              >
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}

export default ChangePasswordForm
