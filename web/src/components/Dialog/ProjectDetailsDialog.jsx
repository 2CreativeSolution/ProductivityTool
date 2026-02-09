import React, { useState } from 'react'

import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { AppDialog, AppDialogContent } from 'src/components/ui/app-dialog'
import { Button } from 'src/components/ui/button'
import { DialogClose } from 'src/components/ui/dialog'
import { Pill } from 'src/components/ui/pill'

const DELETE_ALLOCATION_MUTATION = gql`
  mutation DeleteProjectAllocation($id: Int!) {
    deleteProjectAllocation(id: $id) {
      id
      user {
        name
      }
      project {
        name
      }
    }
  }
`

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AppDialogContent
        size="sm"
        header
        footer
        title={title}
        description={message}
        footerContent={
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              Remove
            </Button>
          </div>
        }
      />
    </AppDialog>
  )
}

const ProjectDetailsDialog = ({
  isOpen,
  onClose,
  project,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [removeDialog, setRemoveDialog] = useState({
    isOpen: false,
    allocationId: null,
    userName: '',
  })

  const [deleteAllocation] = useMutation(DELETE_ALLOCATION_MUTATION, {
    onCompleted: (data) => {
      toast.success(
        `${data.deleteProjectAllocation.user.name} removed from ${data.deleteProjectAllocation.project.name}`
      )
      if (onRefresh) onRefresh()
      setRemoveDialog({ isOpen: false, allocationId: null, userName: '' })
    },
    onError: (error) => {
      toast.error(`Error removing team member: ${error.message}`)
    },
  })
  const handleRemoveAllocation = (allocationId, userName) => {
    setRemoveDialog({ isOpen: true, allocationId, userName })
  }

  const confirmRemoveAllocation = async () => {
    try {
      await deleteAllocation({
        variables: { id: removeDialog.allocationId },
      })
    } catch (error) {
      console.error('Error removing allocation:', error)
    }
  }

  if (!project) return null

  const getStatusBadgeColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getTotalAllocatedHours = () => {
    return (
      project.allocations?.reduce(
        (total, allocation) => total + (allocation.hoursAllocated || 0),
        0
      ) || 0
    )
  }

  const getActiveAllocationsCount = () => {
    return (
      project.allocations?.filter((allocation) => allocation.isActive).length ||
      0
    )
  }

  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AppDialogContent
        size="xl"
        scrollable
        header
        footer
        title={project.name}
        description={`Project Code: ${project.code}`}
        footerContent={
          <div className="flex w-full flex-nowrap items-center justify-between gap-3">
            <div className="flex shrink-0 flex-nowrap items-center gap-2">
              {onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="px-3 sm:px-6"
                >
                  Delete
                </Button>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2">
              {onEdit ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={onEdit}
                  className="px-3 sm:px-6"
                >
                  Edit
                </Button>
              ) : null}
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 sm:px-6"
                >
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        }
      >
        {/* Project Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Project Information
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Status:
                </span>
                <Pill size="sm" className={getStatusBadgeColor(project.status)}>
                  {project.status}
                </Pill>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Priority:
                </span>
                <Pill
                  size="sm"
                  className={getPriorityBadgeColor(project.priority)}
                >
                  {project.priority}
                </Pill>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Start Date:
                </span>
                <span className="text-sm text-gray-900">
                  {new Date(project.startDate).toLocaleDateString('en-GB', {
                    timeZone: 'UTC',
                  })}
                </span>
              </div>

              {project.endDate && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    End Date:
                  </span>
                  <span className="text-sm text-gray-900">
                    {new Date(project.endDate).toLocaleDateString('en-GB', {
                      timeZone: 'UTC',
                    })}
                  </span>
                </div>
              )}

              {project.manager && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Manager:
                  </span>
                  <span className="text-sm text-gray-900">
                    {project.manager.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Allocation Summary
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Active Team Members:
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {getActiveAllocationsCount()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Total Hours/Day:
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {getTotalAllocatedHours()}h
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Total Allocations:
                </span>
                <span className="text-sm text-gray-900">
                  {project.allocations?.length || 0}
                </span>
              </div>

              {project.budget && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Budget:
                  </span>
                  <span className="text-sm text-gray-900">
                    ${project.budget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Description */}
        {project.description && (
          <div className="mb-8">
            <h4 className="mb-3 text-lg font-medium text-gray-900">
              Description
            </h4>
            <p className="text-sm leading-relaxed text-gray-600">
              {project.description}
            </p>
          </div>
        )}

        {/* Team Allocations */}
        <div className="mb-8">
          <h4 className="mb-4 text-lg font-medium text-gray-900">
            Team Allocations
          </h4>

          {project.allocations && project.allocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Hours/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Allocated Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {project.allocations.map((allocation) => (
                    <tr key={allocation.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                            {allocation.user.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {allocation.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {allocation.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {allocation.role || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {allocation.hoursAllocated || 0}h
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {allocation.allocatedDate
                          ? new Date(
                              allocation.allocatedDate
                            ).toLocaleDateString('en-GB', { timeZone: 'UTC' })
                          : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Pill
                          size="sm"
                          variant={allocation.isActive ? 'success' : 'default'}
                        >
                          {allocation.isActive ? 'Active' : 'Inactive'}
                        </Pill>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Button
                          type="button"
                          size="sm"
                          variant="primaryOutline"
                          onClick={() =>
                            handleRemoveAllocation(
                              allocation.id,
                              allocation.user.name
                            )
                          }
                          title="Remove from project"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-2 text-4xl text-gray-400">👥</div>
              <p className="text-gray-500">
                No team members allocated to this project yet.
              </p>
            </div>
          )}
        </div>

        {/* Recent Updates Summary */}
        {project.dailyUpdates && project.dailyUpdates.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-4 text-lg font-medium text-gray-900">
              Recent Updates
            </h4>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Total daily updates: {project.dailyUpdates.length}
              </p>
              <p className="text-sm text-gray-600">
                Last update:{' '}
                {new Date(
                  project.dailyUpdates[0]?.updateDate
                ).toLocaleDateString('en-US', { timeZone: 'UTC' })}
              </p>
            </div>
          </div>
        )}
      </AppDialogContent>

      <ConfirmationDialog
        isOpen={removeDialog.isOpen}
        onClose={() =>
          setRemoveDialog({ isOpen: false, allocationId: null, userName: '' })
        }
        onConfirm={confirmRemoveAllocation}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${removeDialog.userName} from this project? This action cannot be undone.`}
      />
    </AppDialog>
  )
}

export default ProjectDetailsDialog
