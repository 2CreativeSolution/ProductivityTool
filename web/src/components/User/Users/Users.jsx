import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { DataTable } from 'src/components/ui'
import { QUERY } from 'src/components/User/UsersCell'
import { truncate } from 'src/lib/formatters'

const DELETE_USER_MUTATION = gql`
  mutation DeleteUserMutation($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`

const UsersList = ({ users }) => {
  const actionTextClass =
    'text-sm font-medium text-[#322e85] transition hover:text-[#2b2773]'

  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete user ' + id + '?')) {
      deleteUser({ variables: { id } })
    }
  }

  const renderSortLabel = (column, label) => {
    const sorted = column.getIsSorted()
    const indicator = sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'

    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
        onClick={() => column.toggleSorting(sorted === 'asc')}
      >
        <span>{label}</span>
        <span className="text-xs text-white/70">{indicator}</span>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <DataTable
        className="[&_thead_[data-slot=table-row]:hover]:bg-gray-800 [&_thead_[data-slot=table-row]]:border-b-0 [&_thead_[data-slot=table-row]]:bg-gray-900 [&_thead_th]:font-semibold [&_thead_th]:text-white"
        columns={[
          {
            accessorKey: 'id',
            header: ({ column }) => renderSortLabel(column, 'Id'),
            cell: ({ row }) => truncate(row.original.id),
          },
          {
            accessorKey: 'name',
            header: ({ column }) => renderSortLabel(column, 'Name'),
            cell: ({ row }) => {
              const user = row.original

              return (
                <Link
                  to={routes.user({ id: user.id })}
                  title={'Show user ' + user.id + ' detail'}
                  className={actionTextClass}
                >
                  {truncate(user.name) || 'Not set'}
                </Link>
              )
            },
          },
          {
            accessorKey: 'email',
            header: 'Email',
            enableSorting: false,
            cell: ({ row }) => truncate(row.original.email),
          },
          {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            enableSorting: false,
            cell: ({ row }) => {
              const user = row.original

              return (
                <nav className="flex w-full items-center justify-end gap-3">
                  <Link
                    to={routes.editUser({ id: user.id })}
                    title={'Edit user ' + user.id}
                    className={actionTextClass}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete user ' + user.id}
                    aria-label={'Delete user ' + user.id}
                    className="inline-flex items-center text-red-600 transition hover:text-red-700"
                    onClick={() => onDeleteClick(user.id)}
                  >
                    <i className="ri-delete-bin-line text-base"></i>
                  </button>
                </nav>
              )
            },
          },
        ]}
        data={users}
        pagination
        pageSizeOptions={[10, 20, 50, 100]}
        initialPageSize={10}
      />
    </div>
  )
}

export default UsersList
