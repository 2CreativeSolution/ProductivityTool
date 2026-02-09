import React, { useEffect, useId, useMemo, useState } from 'react'

import { AppDialog, AppDialogContent } from 'src/components/ui/app-dialog'
import { Button } from 'src/components/ui/button'
import { DialogClose } from 'src/components/ui/dialog'

const DailyUpdateDialog = ({
  isOpen,
  onClose,
  onSubmit,
  allocation,
  existingUpdate,
  selectedDate,
}) => {
  const idPrefix = useId()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    hoursWorked: '',
    blockers: '',
    nextDayPlan: '',
    completionPercentage: '',
    milestoneReached: '',
  })

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return ''

    return new Date(selectedDate).toLocaleDateString('en-US', {
      timeZone: 'UTC',
    })
  }, [selectedDate])

  useEffect(() => {
    if (existingUpdate) {
      setFormData({
        description: existingUpdate.description || '',
        hoursWorked: existingUpdate.hoursWorked || '',
        blockers: existingUpdate.blockers || '',
        nextDayPlan: existingUpdate.nextDayPlan || '',
        completionPercentage: existingUpdate.completionPercentage || '',
        milestoneReached: existingUpdate.milestoneReached || '',
      })
    } else {
      setFormData({
        description: '',
        hoursWorked: '',
        blockers: '',
        nextDayPlan: '',
        completionPercentage: '',
        milestoneReached: '',
      })
    }
  }, [existingUpdate, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      alert('Please provide a status update')
      return
    }

    setSubmitting(true)

    const updateData = {
      description: formData.description.trim(),
      hoursWorked: formData.hoursWorked
        ? parseFloat(formData.hoursWorked)
        : null,
      blockers: formData.blockers.trim() || null,
      nextDayPlan: formData.nextDayPlan.trim() || null,
      completionPercentage: formData.completionPercentage
        ? parseFloat(formData.completionPercentage)
        : null,
      milestoneReached: formData.milestoneReached.trim() || null,
    }

    try {
      await Promise.resolve(onSubmit(updateData))
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!allocation) return null

  const formId = 'daily-status-form'
  const descriptionId = `${idPrefix}-description`
  const hoursWorkedId = `${idPrefix}-hours-worked`
  const completionPercentageId = `${idPrefix}-completion-percentage`
  const blockersId = `${idPrefix}-blockers`
  const nextDayPlanId = `${idPrefix}-next-day-plan`
  const milestoneReachedId = `${idPrefix}-milestone-reached`

  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AppDialogContent
        size="lg"
        scrollable
        header
        title={`${existingUpdate ? 'Update' : 'Submit'} Daily Status`}
        description={`${allocation.project.name} (${allocation.project.code})${formattedSelectedDate ? ` - ${formattedSelectedDate}` : ''}`}
        footer
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
                ? existingUpdate
                  ? 'Updating...'
                  : 'Submitting...'
                : existingUpdate
                  ? 'Update Status'
                  : 'Submit Update'}
            </Button>
          </div>
        }
      >
        <div className="mb-4 rounded-md bg-blue-50 p-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              <strong>Role:</strong> {allocation.role}
            </span>
            <span className="text-blue-700">
              <strong>Allocated Hours:</strong> {allocation.hoursAllocated}
              h/day
            </span>
          </div>
          {existingUpdate && (
            <div className="mt-1 text-xs text-blue-600">
              Previously logged: {existingUpdate.hoursWorked || 0}h
            </div>
          )}
        </div>

        <form id={formId} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor={descriptionId}
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              What did you accomplish today? *
            </label>
            <textarea
              id={descriptionId}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what you worked on, completed, or progressed on this project today..."
              className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={hoursWorkedId}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Hours Worked Today *
              </label>
              <input
                id={hoursWorkedId}
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.hoursWorked}
                onChange={(e) => handleChange('hoursWorked', e.target.value)}
                placeholder={`Allocated: ${allocation.hoursAllocated}h`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Actual hours worked on this project today
              </p>
              {formData.hoursWorked && allocation.hoursAllocated && (
                <div
                  className={`mt-1 text-xs ${
                    parseFloat(formData.hoursWorked) > allocation.hoursAllocated
                      ? 'text-orange-600'
                      : parseFloat(formData.hoursWorked) ===
                          allocation.hoursAllocated
                        ? 'text-green-600'
                        : 'text-blue-600'
                  }`}
                >
                  {parseFloat(formData.hoursWorked) >
                    allocation.hoursAllocated &&
                    `+${(parseFloat(formData.hoursWorked) - allocation.hoursAllocated).toFixed(1)}h over allocated`}
                  {parseFloat(formData.hoursWorked) ===
                    allocation.hoursAllocated && 'Matches allocated hours ✓'}
                  {parseFloat(formData.hoursWorked) <
                    allocation.hoursAllocated &&
                    `${(allocation.hoursAllocated - parseFloat(formData.hoursWorked)).toFixed(1)}h under allocated`}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor={completionPercentageId}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Completion %
              </label>
              <input
                id={completionPercentageId}
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={(e) =>
                  handleChange('completionPercentage', e.target.value)
                }
                placeholder="e.g., 75"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={blockersId}
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Blockers or Issues
            </label>
            <textarea
              id={blockersId}
              value={formData.blockers}
              onChange={(e) => handleChange('blockers', e.target.value)}
              placeholder="Any obstacles, dependencies, or issues that are blocking your progress..."
              className="min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor={nextDayPlanId}
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Plan for Next Day
            </label>
            <textarea
              id={nextDayPlanId}
              value={formData.nextDayPlan}
              onChange={(e) => handleChange('nextDayPlan', e.target.value)}
              placeholder="What do you plan to work on next for this project..."
              className="min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor={milestoneReachedId}
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Milestone or Achievement
            </label>
            <input
              id={milestoneReachedId}
              type="text"
              value={formData.milestoneReached}
              onChange={(e) => handleChange('milestoneReached', e.target.value)}
              placeholder="Any significant milestone, deliverable, or achievement today..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </form>
      </AppDialogContent>
    </AppDialog>
  )
}

export default DailyUpdateDialog
