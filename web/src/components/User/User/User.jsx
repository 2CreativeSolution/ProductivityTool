import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import 'src/lib/formatters'
import { buttonVariants } from 'src/components/ui/button'

const DELETE_USER_MUTATION = gql`
  mutation DeleteUserMutation($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`

const User = ({ user }) => {
  const allRoleOptions = ['USER', 'ADMIN', 'MANAGER', 'TEAM_LEAD']
  const roleOptions = Array.from(
    new Set([...allRoleOptions, ...(user.roles || [])])
  )
  const isEmailVerified = Boolean(user.microsoftId)

  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User deleted')
      navigate(routes.users())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete user ' + id + '?')) {
      deleteUser({ variables: { id } })
    }
  }

  return (
    <>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Account Settings
          </h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Full Name
            </h2>
            <p className="text-sm font-medium text-slate-900">
              {user.name || 'Not set'}
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
            <p className="text-sm font-medium text-slate-900">{user.email}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Roles
            </h2>
            <div className="flex flex-wrap gap-4">
              {roleOptions.map((role) => (
                <label
                  key={role}
                  className="inline-flex items-center gap-2 text-sm text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={(user.roles || []).includes(role)}
                    readOnly
                    disabled
                    className="h-4 w-4 accent-[#322e85]"
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-8 flex items-center gap-3">
        <Link
          to={routes.editUser({ id: user.id })}
          className={buttonVariants({ variant: 'primary', size: 'sm' })}
        >
          Edit
        </Link>
        <button
          type="button"
          className={buttonVariants({ variant: 'destructive', size: 'sm' })}
          onClick={() => onDeleteClick(user.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default User
