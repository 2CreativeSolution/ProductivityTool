import { useState } from 'react'

import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import UserForm from 'src/components/User/UserForm'

export const QUERY = gql`
  query EditUserById($id: Int!) {
    user: user(id: $id) {
      id
      name
      email
      microsoftId
      roles
    }
  }
`

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      roles
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  user,
  successRoute = routes.users(),
  formVariant = 'default',
  startInEditMode = false,
  showFormTitle = true,
}) => {
  const [saveSuccessToken, setSaveSuccessToken] = useState(0)

  const [updateUser, { loading, error }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User updated')
      setSaveSuccessToken((value) => value + 1)
      navigate(successRoute)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input, id) => {
    updateUser({ variables: { id, input } })
  }

  if (formVariant === 'account') {
    return (
      <UserForm
        user={user}
        onSave={onSave}
        error={error}
        loading={loading}
        formVariant="account"
        saveSuccessToken={saveSuccessToken}
        startInEditMode={startInEditMode}
        showFormTitle={showFormTitle}
      />
    )
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit User</h2>
      </header>
      <div className="rw-segment-main">
        <UserForm user={user} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}
