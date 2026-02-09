import React, { useEffect, useId, useMemo, useState } from 'react'

import { AppDialog, AppDialogContent } from 'src/components/ui/app-dialog'
import { Button } from 'src/components/ui/button'
import { DialogClose } from 'src/components/ui/dialog'

function normalizeProjectCode(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/\s+/g, '')
}

const ProjectDialog = ({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  mode = 'create',
  project,
}) => {
  const idPrefix = useId()
  const formId = `${idPrefix}-project-form`
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    managerId: '',
    budget: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const isEditMode = mode === 'edit'

  const dialogTitle = isEditMode ? 'Edit Project' : 'New Project'
  const dialogDescription = isEditMode
    ? 'Update project details.'
    : 'Create a new project and optionally assign a manager and budget.'
  const submitLabel = isEditMode ? 'Save Changes' : 'Create Project'

  useEffect(() => {
    if (!isOpen) return
    if (!isEditMode) return
    if (!project?.id) return

    setFormData({
      name: project.name || '',
      code: project.code || '',
      description: project.description || '',
      status: project.status || 'ACTIVE',
      priority: project.priority || 'MEDIUM',
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split('T')[0]
        : '',
      managerId: project.managerId ? String(project.managerId) : '',
      budget: typeof project.budget === 'number' ? String(project.budget) : '',
    })
    setErrors({})
    setSubmitting(false)
  }, [isEditMode, isOpen, project])

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'code' ? normalizeProjectCode(value) : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    const normalizedCode = normalizeProjectCode(formData.code).trim()

    if (!normalizedCode) {
      newErrors.code = 'Project code is required'
    } else if (!/^[A-Z0-9-]+$/.test(normalizedCode)) {
      newErrors.code =
        'Project code must contain only uppercase letters, numbers, and hyphens'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number'
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

    const normalizedCode = normalizeProjectCode(formData.code).trim()

    const normalizedStartDate = new Date(formData.startDate + 'T00:00:00.000Z')
    const normalizedEndDate = formData.endDate
      ? new Date(formData.endDate + 'T00:00:00.000Z')
      : null

    const submitData = {
      ...formData,
      code: normalizedCode,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      managerId: formData.managerId ? parseInt(formData.managerId) : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    }

    try {
      if (isEditMode) {
        await Promise.resolve(onSubmit(project?.id, submitData))
      } else {
        await Promise.resolve(onSubmit(submitData))
      }
      handleReset()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      managerId: '',
      budget: '',
    })
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const codeHelpText = useMemo(() => {
    if (isEditMode) {
      return 'Project code cannot be changed after creation.'
    }
    return 'Uppercase letters, numbers, and hyphens only.'
  }, [isEditMode])

  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AppDialogContent
        size="lg"
        scrollable
        header
        footer
        title={dialogTitle}
        description={dialogDescription}
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
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : submitLabel}
            </Button>
          </div>
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label
              htmlFor={`${idPrefix}-name`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Project Name *
            </label>
            <input
              id={`${idPrefix}-name`}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Project Code */}
          <div>
            <label
              htmlFor={`${idPrefix}-code`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Project Code *
            </label>
            <input
              id={`${idPrefix}-code`}
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={isEditMode}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., PROJ-2024-001"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="mt-1 text-xs text-gray-500">{codeHelpText}</p>
            {errors.code && (
              <p className="mt-1 text-xs text-red-500">{errors.code}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor={`${idPrefix}-description`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id={`${idPrefix}-description`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project description and objectives"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`${idPrefix}-status`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id={`${idPrefix}-status`}
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={`${idPrefix}-priority`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id={`${idPrefix}-priority`}
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`${idPrefix}-startDate`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Start Date *
              </label>
              <input
                id={`${idPrefix}-startDate`}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {isEditMode ? (
                <p className="mt-1 text-xs text-gray-500">
                  Start date cannot be changed after creation.
                </p>
              ) : null}
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`${idPrefix}-endDate`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                id={`${idPrefix}-endDate`}
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Manager and Budget */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`${idPrefix}-managerId`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Project Manager
              </label>
              <select
                id={`${idPrefix}-managerId`}
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a manager</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`${idPrefix}-budget`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Budget ($)
              </label>
              <input
                id={`${idPrefix}-budget`}
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="mt-1 text-xs text-red-500">{errors.budget}</p>
              )}
            </div>
          </div>
        </form>
      </AppDialogContent>
    </AppDialog>
  )
}

export default ProjectDialog
