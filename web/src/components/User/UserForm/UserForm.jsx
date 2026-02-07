import { useEffect, useState } from 'react'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'

import { useAuth } from 'src/auth'
import { buttonVariants } from 'src/components/ui/button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLE_OPTIONS = ['USER', 'ADMIN', 'MANAGER', 'TEAM_LEAD']

const normalizeRoleList = (roles = []) => [...roles].sort().join(',')

const UserForm = (props) => {
  const isAccountForm =
    props.formVariant === 'account' || props.formVariant === 'accountCreate'
  const { hasRole } = useAuth()
  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))
  const userRoleSignature = normalizeRoleList(props.user?.roles ?? [])
  const [showAccountEditor, setShowAccountEditor] = useState(
    Boolean(props.startInEditMode || props.editorOnly)
  )
  const [accountInitialValues, setAccountInitialValues] = useState({
    name: '',
    email: '',
    roles: [],
  })
  const [accountDraftValues, setAccountDraftValues] = useState({
    name: '',
    email: '',
    roles: [],
  })

  useEffect(() => {
    if (!isAccountForm) {
      return
    }

    const nextValues = {
      name: props.user?.name ?? '',
      email: props.user?.email ?? '',
      roles: props.user?.roles ?? [],
    }
    setAccountInitialValues(nextValues)
    setAccountDraftValues(nextValues)
  }, [
    isAccountForm,
    props.user?.id,
    props.user?.name,
    props.user?.email,
    props.user?.roles,
    userRoleSignature,
  ])

  useEffect(() => {
    if (!isAccountForm) {
      return
    }

    if (props.saveSuccessToken > 0) {
      setShowAccountEditor(false)
    }
  }, [isAccountForm, props.saveSuccessToken])

  useEffect(() => {
    if (!isAccountForm) {
      return
    }

    setShowAccountEditor(Boolean(props.startInEditMode || props.editorOnly))
  }, [isAccountForm, props.startInEditMode, props.editorOnly, props.user?.id])

  const onSubmit = (data) => {
    const normalizedRoles = [
      ...new Set(
        (accountDraftValues.roles || []).filter((role) =>
          ROLE_OPTIONS.includes(role)
        )
      ),
    ]

    const normalizedData = isAccountForm
      ? {
          name: accountDraftValues.name.trim(),
          email: accountDraftValues.email.trim(),
          ...(isAdmin ? { roles: normalizedRoles } : {}),
        }
      : data

    props.onSave(normalizedData, props?.user?.id)
  }

  if (isAccountForm) {
    const accountTitle = props.formTitle || 'Account Settings'
    const showFormTitle = props.showFormTitle ?? true
    const submitLabel = props.submitLabel || 'Save Changes'
    const isEmailVerified = Boolean(props.user?.microsoftId)
    const summaryRolePillValues = props.user?.roles ?? []
    const rolePillValues = accountDraftValues.roles || []
    const hasValidAccountEmail = EMAIL_PATTERN.test(
      accountDraftValues.email.trim()
    )
    const hasRoleChanges =
      normalizeRoleList(accountDraftValues.roles) !==
      normalizeRoleList(accountInitialValues.roles)
    const hasAtLeastOneRoleSelected =
      (accountDraftValues.roles || []).length > 0
    const hasRoleRequirementSatisfied = isAdmin
      ? hasAtLeastOneRoleSelected
      : true
    const hasAccountChanges =
      accountDraftValues.name !== accountInitialValues.name ||
      accountDraftValues.email !== accountInitialValues.email ||
      hasRoleChanges
    const hasRequiredAccountValues =
      accountDraftValues.name.trim().length > 0 &&
      accountDraftValues.email.trim().length > 0 &&
      hasValidAccountEmail &&
      hasRoleRequirementSatisfied

    return (
      <>
        {showFormTitle && (
          <h1 className="mb-6 text-3xl font-bold text-slate-900">
            {accountTitle}
          </h1>
        )}

        {!props.editorOnly && !showAccountEditor ? (
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Full Name
                </h2>
                <p className="text-sm font-medium text-slate-900">
                  {props.user?.name || 'Not set'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                    Email Address
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isEmailVerified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {props.user?.email}
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  Roles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {summaryRolePillValues.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700"
                    >
                      {role.replaceAll('_', ' ')}
                    </span>
                  ))}
                </div>
                {!summaryRolePillValues.length && (
                  <p className="text-xs text-amber-700">Role is missing.</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAccountEditor(true)}
              className={buttonVariants({
                variant: 'primaryOutline',
                size: 'sm',
              })}
            >
              Change
            </button>
          </div>
        ) : (
          <Form onSubmit={onSubmit} error={props.error} className="space-y-5">
            {!props.editorOnly && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAccountEditor(false)}
                  className="text-sm font-medium text-[#322e85] underline underline-offset-4 hover:text-[#2b2773]"
                >
                  Hide
                </button>
              </div>
            )}

            <FormError
              error={props.error}
              wrapperClassName="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              titleClassName="mb-1 text-sm font-semibold"
              listClassName="list-inside list-disc text-sm"
            />

            <>
              <Label
                name="name"
                className="mb-2 block text-sm font-medium text-slate-800"
                errorClassName="mb-2 block text-sm font-medium text-red-700"
              >
                Name
              </Label>
              <TextField
                name="name"
                value={accountDraftValues.name}
                onChange={(event) =>
                  setAccountDraftValues((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="ring-offset-background flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#322e85]/30"
                errorClassName="flex h-11 w-full rounded-md border border-red-400 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                validation={{
                  required: {
                    value: true,
                    message: 'Name is required',
                  },
                  validate: {
                    notBlank: (value) =>
                      value.trim().length > 0 || 'Name is required',
                  },
                }}
              />
              <FieldError name="name" className="mt-1 text-xs text-red-700" />
            </>

            <>
              <Label
                name="email"
                className="mb-2 block text-sm font-medium text-slate-800"
                errorClassName="mb-2 block text-sm font-medium text-red-700"
              >
                Email Address
              </Label>
              <TextField
                name="email"
                value={accountDraftValues.email}
                onChange={(event) =>
                  setAccountDraftValues((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="ring-offset-background flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#322e85]/30"
                errorClassName="flex h-11 w-full rounded-md border border-red-400 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                validation={{
                  required: {
                    value: true,
                    message: 'Email is required',
                  },
                  validate: {
                    notBlank: (value) =>
                      value.trim().length > 0 || 'Email is required',
                    validEmail: (value) =>
                      EMAIL_PATTERN.test(value.trim()) ||
                      'Please enter a valid email address',
                  },
                }}
              />
              <FieldError name="email" className="mt-1 text-xs text-red-700" />
            </>

            <>
              <p className="mb-2 block text-sm font-medium text-slate-800">
                Roles
              </p>
              {isAdmin ? (
                <div className="flex flex-wrap gap-4">
                  {ROLE_OPTIONS.map((role) => (
                    <label
                      key={role}
                      className="inline-flex items-center gap-2 text-sm text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={accountDraftValues.roles.includes(role)}
                        disabled={props.loading}
                        onChange={(event) => {
                          const isChecked = event.target.checked
                          setAccountDraftValues((prev) => {
                            const nextRoles = isChecked
                              ? [...prev.roles, role]
                              : prev.roles.filter((value) => value !== role)

                            return {
                              ...prev,
                              roles: nextRoles,
                            }
                          })
                        }}
                        className="h-4 w-4 accent-[#322e85]"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {rolePillValues.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700"
                    >
                      {role.replaceAll('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              {isAdmin && !hasAtLeastOneRoleSelected && (
                <p className="mt-1 text-xs text-red-700">
                  Select at least one role.
                </p>
              )}
              {!isAdmin && !hasAtLeastOneRoleSelected && (
                <p className="mt-1 text-xs text-amber-700">
                  Role is missing. It will be set to USER when you save.
                </p>
              )}
            </>

            <Submit
              disabled={
                props.loading || !hasAccountChanges || !hasRequiredAccountValues
              }
              className={buttonVariants({ variant: 'primary' })}
            >
              {submitLabel}
            </Submit>
          </Form>
        )}
      </>
    )
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="name"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Name
        </Label>

        <TextField
          name="name"
          defaultValue={props.user?.name}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="name" className="rw-field-error" />

        <Label
          name="email"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Email
        </Label>

        <TextField
          name="email"
          defaultValue={props.user?.email}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{
            required: {
              value: true,
              message: 'Email is required',
            },
            validate: {
              notBlank: (value) =>
                value.trim().length > 0 || 'Email is required',
              validEmail: (value) =>
                EMAIL_PATTERN.test(value.trim()) ||
                'Please enter a valid email address',
            },
          }}
        />

        <FieldError name="email" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default UserForm
