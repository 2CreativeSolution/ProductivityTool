import React, { useId, useState } from 'react'

import { AppDialog, AppDialogContent } from 'src/components/ui/app-dialog'
import { Button } from 'src/components/ui/button'
import { DialogClose } from 'src/components/ui/dialog'

const AllocationDialog = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  users = [],
}) => {
  const idPrefix = useId()
  const formId = `${idPrefix}-allocation-form`
  const [formData, setFormData] = useState({
    userId: '',
    role: '',
    hoursAllocated: '',
    isActive: true,
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const roles = [
    'Project Manager',
    'Lead Developer',
    'Senior Developer',
    'Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Designer',
    'Business Analyst',
    'Architect',
    'Consultant',
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.userId) {
      newErrors.userId = 'Please select a team member'
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required'
    }

    if (!formData.hoursAllocated) {
      newErrors.hoursAllocated = 'Hours per day is required'
    } else if (
      isNaN(parseFloat(formData.hoursAllocated)) ||
      parseFloat(formData.hoursAllocated) <= 0
    ) {
      newErrors.hoursAllocated = 'Hours must be a positive number'
    } else if (parseFloat(formData.hoursAllocated) > 24) {
      newErrors.hoursAllocated = 'Hours cannot exceed 24 per day'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    const submitData = {
      projectId: project.id,
      userId: parseInt(formData.userId),
      role: formData.role.trim(),
      hoursAllocated: parseFloat(formData.hoursAllocated),
      isActive: formData.isActive,
    }

    try {
      await Promise.resolve(onSubmit(submitData))
      handleReset()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      userId: '',
      role: '',
      hoursAllocated: '',
      isActive: true,
    })
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Filter out users who are already allocated to this project
  const availableUsers = users.filter(
    (user) =>
      !project?.allocations?.some(
        (allocation) => allocation.user.id === user.id && allocation.isActive
      )
  )

  if (!project) return null

  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AppDialogContent
        size="md"
        scrollable
        header
        footer
        title="Allocate Team Member"
        description={`${project.name} (${project.code})`}
        footerContent={
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="primary"
              form={formId}
              disabled={submitting || availableUsers.length === 0}
            >
              {submitting ? 'Allocating...' : 'Allocate Member'}
            </Button>
          </div>
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          {/* Team Member Selection */}
          <div>
            <label
              htmlFor={`${idPrefix}-userId`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Team Member *
            </label>
            <select
              id={`${idPrefix}-userId`}
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a team member</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="mt-1 text-xs text-red-500">{errors.userId}</p>
            )}
            {availableUsers.length === 0 && (
              <p className="mt-1 text-xs text-yellow-600">
                All users are already allocated to this project
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor={`${idPrefix}-role`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Role *
            </label>
            <select
              id={`${idPrefix}-role`}
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Hours Allocated */}
          <div>
            <label
              htmlFor={`${idPrefix}-hoursAllocated`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Hours per Day *
            </label>
            <input
              id={`${idPrefix}-hoursAllocated`}
              type="number"
              name="hoursAllocated"
              value={formData.hoursAllocated}
              onChange={handleChange}
              min="0.5"
              max="24"
              step="0.5"
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hoursAllocated ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 8"
            />
            {errors.hoursAllocated && (
              <p className="mt-1 text-xs text-red-500">
                {errors.hoursAllocated}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Number of hours per day allocated to this project
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              id={`${idPrefix}-isActive`}
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={`${idPrefix}-isActive`}
              className="ml-2 text-sm text-gray-700"
            >
              Active allocation (team member can log time immediately)
            </label>
          </div>

          {/* Current Allocations Info */}
          {project.allocations && project.allocations.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="mb-2 text-sm font-medium text-gray-900">
                Current Team:
              </h4>
              <div className="space-y-1">
                {project.allocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-700">
                      {allocation.user.name} - {allocation.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 ${
                        allocation.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {allocation.hoursAllocated}h/day
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </AppDialogContent>
    </AppDialog>
  )
}

export default AllocationDialog
