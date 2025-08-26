import React, { useState, useEffect } from 'react'

const DailyUpdateDialog = ({
  isOpen,
  onClose,
  onSubmit,
  allocation,
  existingUpdate,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    hoursWorked: '',
    blockers: '',
    nextDayPlan: '',
    completionPercentage: '',
    milestoneReached: '',
  })

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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      alert('Please provide a status update')
      return
    }

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

    onSubmit(updateData)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen || !allocation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {existingUpdate ? 'Update' : 'Submit'} Daily Status
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {allocation.project.name} ({allocation.project.code}) -{' '}
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                })}
              </p>
              {/* Hours Allocation Info */}
              <div className="mt-2 rounded-md bg-blue-50 p-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">
                    <strong>Role:</strong> {allocation.role}
                  </span>
                  <span className="text-blue-700">
                    <strong>Allocated Hours:</strong>{' '}
                    {allocation.hoursAllocated}h/day
                  </span>
                </div>
                {existingUpdate && (
                  <div className="mt-1 text-xs text-blue-600">
                    Previously logged: {existingUpdate.hoursWorked || 0}h
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Status Update */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              What did you accomplish today? *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what you worked on, completed, or progressed on this project today..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Hours Worked */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hours Worked Today *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.hoursWorked}
                onChange={(e) => handleChange('hoursWorked', e.target.value)}
                placeholder={`Allocated: ${allocation.hoursAllocated}h`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Completion %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={(e) =>
                  handleChange('completionPercentage', e.target.value)
                }
                placeholder="e.g., 75"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Blockers */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Blockers or Issues
            </label>
            <textarea
              value={formData.blockers}
              onChange={(e) => handleChange('blockers', e.target.value)}
              placeholder="Any obstacles, dependencies, or issues that are blocking your progress..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Next Day Plan */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Plan for Next Day
            </label>
            <textarea
              value={formData.nextDayPlan}
              onChange={(e) => handleChange('nextDayPlan', e.target.value)}
              placeholder="What do you plan to work on next for this project..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Milestone Reached */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Milestone or Achievement
            </label>
            <input
              type="text"
              value={formData.milestoneReached}
              onChange={(e) => handleChange('milestoneReached', e.target.value)}
              placeholder="Any significant milestone, deliverable, or achievement today..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {existingUpdate ? 'Update Status' : 'Submit Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DailyUpdateDialog
