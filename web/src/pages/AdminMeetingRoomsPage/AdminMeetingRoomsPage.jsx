import { useMemo, useState } from 'react'

import { gql, useMutation, useQuery } from '@redwoodjs/web'
import { Metadata } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import PageHeader from 'src/components/PageHeader/PageHeader'
import {
  AdminDataTable,
  AppDialog,
  AppDialogContent,
  Button,
  Input,
  Label,
} from 'src/components/ui'
import { DialogClose } from 'src/components/ui/dialog'

const MEETING_ROOMS_QUERY = gql`
  query MeetingRoomsForAdminPage {
    meetingRooms {
      id
      name
      description
    }
  }
`

const CREATE_MEETING_ROOM_MUTATION = gql`
  mutation CreateMeetingRoomForAdminPage($input: CreateMeetingRoomInput!) {
    createMeetingRoom(input: $input) {
      id
      name
      description
    }
  }
`

const UPDATE_MEETING_ROOM_MUTATION = gql`
  mutation UpdateMeetingRoomForAdminPage(
    $id: Int!
    $input: UpdateMeetingRoomInput!
  ) {
    updateMeetingRoom(id: $id, input: $input) {
      id
      name
      description
    }
  }
`

const DELETE_MEETING_ROOM_MUTATION = gql`
  mutation DeleteMeetingRoomForAdminPage($id: Int!) {
    deleteMeetingRoom(id: $id) {
      id
      name
    }
  }
`

const createEmptyForm = () => ({ name: '', description: '' })

const AdminMeetingRoomsPage = () => {
  const {
    data: meetingRoomsData,
    loading: meetingRoomsLoading,
    error: meetingRoomsError,
    refetch: refetchMeetingRooms,
  } = useQuery(MEETING_ROOMS_QUERY, { fetchPolicy: 'network-only' })

  const meetingRooms = useMemo(
    () => meetingRoomsData?.meetingRooms || [],
    [meetingRoomsData]
  )

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    mode: 'create',
    roomId: null,
  })
  const [formState, setFormState] = useState(createEmptyForm())
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    roomId: null,
    roomName: '',
  })

  const [createMeetingRoom, { loading: createLoading }] = useMutation(
    CREATE_MEETING_ROOM_MUTATION,
    {
      onCompleted: () => {
        toast.success('Meeting room created successfully.')
        setDialogState({ isOpen: false, mode: 'create', roomId: null })
        setFormState(createEmptyForm())
        refetchMeetingRooms()
        window.dispatchEvent(new Event('meetingRoomsUpdated'))
        window.localStorage.setItem('meetingRoomsUpdated', Date.now())
      },
      onError: (error) => {
        toast.error(`Error creating meeting room: ${error.message}`)
      },
    }
  )

  const [updateMeetingRoom, { loading: updateLoading }] = useMutation(
    UPDATE_MEETING_ROOM_MUTATION,
    {
      onCompleted: () => {
        toast.success('Meeting room updated successfully.')
        setDialogState({ isOpen: false, mode: 'edit', roomId: null })
        setFormState(createEmptyForm())
        refetchMeetingRooms()
        window.dispatchEvent(new Event('meetingRoomsUpdated'))
        window.localStorage.setItem('meetingRoomsUpdated', Date.now())
      },
      onError: (error) => {
        toast.error(`Error updating meeting room: ${error.message}`)
      },
    }
  )

  const [deleteMeetingRoom, { loading: deleteLoading }] = useMutation(
    DELETE_MEETING_ROOM_MUTATION,
    {
      onCompleted: (data) => {
        toast.success(`Meeting room "${data.deleteMeetingRoom.name}" deleted.`)
        setDeleteDialog({ isOpen: false, roomId: null, roomName: '' })
        refetchMeetingRooms()
        window.dispatchEvent(new Event('meetingRoomsUpdated'))
        window.localStorage.setItem('meetingRoomsUpdated', Date.now())
      },
      onError: (error) => {
        toast.error(`Error deleting meeting room: ${error.message}`)
      },
    }
  )

  const openCreateDialog = () => {
    setFormState(createEmptyForm())
    setDialogState({ isOpen: true, mode: 'create', roomId: null })
  }

  const openEditDialog = (room) => {
    setFormState({
      name: room.name || '',
      description: room.description || '',
    })
    setDialogState({ isOpen: true, mode: 'edit', roomId: room.id })
  }

  const closeDialog = () => {
    setDialogState({ isOpen: false, mode: 'create', roomId: null })
    setFormState(createEmptyForm())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formState.name.trim()) {
      toast.error('Meeting room name is required.')
      return
    }

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim() || null,
    }

    if (dialogState.mode === 'edit' && dialogState.roomId) {
      await updateMeetingRoom({
        variables: { id: dialogState.roomId, input: payload },
      })
      return
    }

    await createMeetingRoom({ variables: { input: payload } })
  }

  const openDeleteDialog = (room) => {
    setDeleteDialog({ isOpen: true, roomId: room.id, roomName: room.name })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.roomId) return
    await deleteMeetingRoom({ variables: { id: deleteDialog.roomId } })
  }

  return (
    <>
      <Metadata
        title="Manage Meeting Rooms"
        description="Admin meeting rooms"
      />
      <AppSidebar />
      <AppContentShell>
        <PageHeader
          title="Manage Meeting Rooms"
          description="Create, edit, and remove meeting rooms for bookings"
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openCreateDialog}
          >
            New Meeting Room
          </Button>
        </PageHeader>

        {meetingRoomsLoading ? (
          <div className="text-gray-500">Loading meeting rooms...</div>
        ) : meetingRoomsError ? (
          <div className="text-red-500">Error: {meetingRoomsError.message}</div>
        ) : (
          <div className="overflow-hidden rounded-md border bg-white shadow-lg">
            <AdminDataTable
              columns={[
                {
                  accessorKey: 'name',
                  header: 'Name',
                  cell: ({ row }) => (
                    <div className="font-semibold text-slate-900">
                      {row.original.name}
                    </div>
                  ),
                },
                {
                  accessorKey: 'description',
                  header: 'Description',
                  enableSorting: false,
                  cell: ({ row }) => row.original.description || '—',
                },
                {
                  id: 'actions',
                  header: () => <div className="text-right">Actions</div>,
                  enableSorting: false,
                  cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="text-[11px] font-semibold uppercase tracking-wide text-[#322e85] transition hover:text-[#2b2773]"
                        onClick={() => openEditDialog(row.original)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete meeting room ${row.original.name}`}
                        title={`Delete meeting room ${row.original.name}`}
                        className="inline-flex items-center text-red-600 transition hover:text-red-700"
                        onClick={() => openDeleteDialog(row.original)}
                      >
                        <i className="ri-delete-bin-line text-base" />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={meetingRooms}
              emptyMessage="No meeting rooms yet. Create one to get started."
              pagination
              pageSizeOptions={[10, 20, 50]}
              initialPageSize={10}
            />
          </div>
        )}
      </AppContentShell>

      <AppDialog
        open={dialogState.isOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <AppDialogContent
          size="sm"
          header
          footer
          title={
            dialogState.mode === 'edit'
              ? 'Edit Meeting Room'
              : 'New Meeting Room'
          }
          description="Add the name and optional description for the meeting room."
          footerContent={
            <div className="flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="meeting-room-form"
                variant="primary"
                disabled={createLoading || updateLoading}
              >
                {dialogState.mode === 'edit' ? 'Save Changes' : 'Create Room'}
              </Button>
            </div>
          }
        >
          <form
            id="meeting-room-form"
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Conference A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Input
                id="room-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional details or capacity"
              />
            </div>
          </form>
        </AppDialogContent>
      </AppDialog>

      <AppDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setDeleteDialog({ isOpen: false, roomId: null, roomName: '' })
        }
      >
        <AppDialogContent
          size="sm"
          header
          footer
          title="Delete Meeting Room"
          description={`Are you sure you want to delete "${deleteDialog.roomName}"? This action cannot be undone.`}
          footerContent={
            <div className="flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                Delete
              </Button>
            </div>
          }
        />
      </AppDialog>
    </>
  )
}

export default AdminMeetingRoomsPage
