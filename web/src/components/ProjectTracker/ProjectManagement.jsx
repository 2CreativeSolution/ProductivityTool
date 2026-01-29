import React, { useState } from 'react'

import { useMutation, useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import AllocationDialog from '../Dialog/AllocationDialog'
import ProjectDetailsDialog from '../Dialog/ProjectDetailsDialog'
import ProjectDialog from '../Dialog/ProjectDialog'

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const USERS_QUERY = gql`
  query UsersQuery {
    users {
      id
      name
      email
    }
  }
`

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      code
      status
      priority
    }
  }
`

const CREATE_ALLOCATION_MUTATION = gql`
  mutation CreateProjectAllocation($input: CreateProjectAllocationInput!) {
    createProjectAllocation(input: $input) {
      id
      role
      hoursAllocated
      user {
        name
        email
      }
      project {
        name
        code
      }
    }
  }
`

const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: Int!) {
    deleteProject(id: $id) {
      id
      name
    }
  }
`

const ProjectManagement = ({
  projects,
  loading,
  onRefresh,
  getStatusBadgeColor,
  getPriorityBadgeColor,
}) => {
  const [projectDialog, setProjectDialog] = useState({ isOpen: false })
  const [allocationDialog, setAllocationDialog] = useState({
    isOpen: false,
    projectId: null,
  })
  const [detailsDialog, setDetailsDialog] = useState({
    isOpen: false,
    projectId: null,
  })
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    projectId: null,
    projectName: '',
  })

  const { data: usersData } = useQuery(USERS_QUERY)

  const [createProject] = useMutation(CREATE_PROJECT_MUTATION, {
    onCompleted: () => {
      toast.success('Project created successfully')
      setProjectDialog({ isOpen: false })
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error creating project: ${error.message}`)
    },
  })

  const [createAllocation] = useMutation(CREATE_ALLOCATION_MUTATION, {
    onCompleted: (data) => {
      toast.success(
        `${data.createProjectAllocation.user.name} allocated to ${data.createProjectAllocation.project.name}`
      )
      setAllocationDialog({ isOpen: false, project: null })
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error creating allocation: ${error.message}`)
    },
  })

  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Project "${data.deleteProject.name}" deleted successfully`)
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error deleting project: ${error.message}`)
    },
  })

  const handleCreateProject = async (projectData) => {
    try {
      await createProject({
        variables: { input: projectData },
      })
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleCreateAllocation = async (allocationData) => {
    try {
      await createAllocation({
        variables: { input: allocationData },
      })
    } catch (error) {
      console.error('Error creating allocation:', error)
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    setDeleteDialog({ isOpen: true, projectId, projectName })
  }

  const confirmDeleteProject = async () => {
    try {
      await deleteProject({
        variables: { id: deleteDialog.projectId },
      })
      setDeleteDialog({ isOpen: false, projectId: null, projectName: '' })
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const getTotalAllocatedHours = (allocations) => {
    return allocations.reduce((total, allocation) => {
      return total + (allocation.hoursAllocated || 0)
    }, 0)
  }

  const getActiveAllocationsCount = (allocations) => {
    return allocations.filter((allocation) => allocation.isActive).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Action Button */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Project Management
            </h2>
            <p className="text-gray-600">
              Create, manage, and track your team projects and allocations
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">
                  {projects.filter((p) => p.status === 'Active').length} Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">
                  {projects.length} Total Projects
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setProjectDialog({ isOpen: true })}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
          >
            <i className="ri-add-line text-lg transition-transform duration-200 group-hover:rotate-12"></i>
            Create New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group transform rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
          >
            {/* Project Header */}
            <div className="mb-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {project.name}
                  </h3>
                </div>
                <p className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                  {project.code}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${getStatusBadgeColor(project.status)}`}
                >
                  {project.status}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ${getPriorityBadgeColor(project.priority)}`}
                >
                  {project.priority}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="mb-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <i className="ri-calendar-line text-green-600"></i>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">
                    Start Date
                  </span>
                  <span className="font-semibold text-gray-900">
                    {new Date(project.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </span>
                </div>
              </div>

              {project.endDate && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                    <i className="ri-flag-line text-red-600"></i>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      End Date
                    </span>
                    <span className="font-semibold text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </span>
                  </div>
                </div>
              )}

              {project.manager && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <i className="ri-user-star-line text-purple-600"></i>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">
                      Project Manager
                    </span>
                    <span className="font-semibold text-gray-900">
                      {project.manager.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Allocation Stats */}
            <div className="mb-5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500">
                    <i className="ri-team-line text-sm text-white"></i>
                  </div>
                  <span className="font-bold text-gray-900">Team</span>
                </div>
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                  {getActiveAllocationsCount(project.allocations)} active
                </span>
              </div>

              {project.allocations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">
                      Total Hours/Day:
                    </span>
                    <span className="rounded-lg bg-blue-100 px-2 py-1 font-bold text-blue-600">
                      {getTotalAllocatedHours(project.allocations)}h
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.allocations.slice(0, 3).map((allocation) => (
                      <span
                        key={allocation.id}
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                          allocation.isActive
                            ? 'border-green-200 bg-green-100 text-green-800'
                            : 'border-gray-200 bg-gray-100 text-gray-600'
                        }`}
                      >
                        {allocation.user.name}
                      </span>
                    ))}
                    {project.allocations.length > 3 && (
                      <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        +{project.allocations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center">
                  <span className="text-xs italic text-gray-500">
                    No team members allocated
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setAllocationDialog({ isOpen: true, projectId: project.id })
                }
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg"
              >
                <i className="ri-team-line text-sm transition-transform group-hover:scale-110"></i>
                Team
              </button>
              <button
                onClick={() =>
                  setDetailsDialog({ isOpen: true, projectId: project.id })
                }
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg"
              >
                <i className="ri-eye-line text-sm transition-transform group-hover:scale-110"></i>
                Details
              </button>
              <button
                onClick={() => handleDeleteProject(project.id, project.name)}
                className="group flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg"
                title="Delete Project"
              >
                <i className="ri-delete-bin-line text-sm transition-transform group-hover:scale-110"></i>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {projects.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <i className="ri-folder-line text-4xl text-blue-600"></i>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            No Active Projects
          </h3>
          <p className="mx-auto mb-6 max-w-md text-gray-600">
            Create your first project to start tracking allocations and
            progress. Build amazing things with your team!
          </p>
          <button
            onClick={() => setProjectDialog({ isOpen: true })}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
          >
            <i className="ri-add-line transition-transform duration-200 group-hover:rotate-12"></i>
            Create Your First Project
          </button>
        </div>
      )}

      {/* Project Dialog */}
      <ProjectDialog
        isOpen={projectDialog.isOpen}
        onClose={() => setProjectDialog({ isOpen: false })}
        onSubmit={handleCreateProject}
        users={usersData?.users || []}
      />

      {/* Allocation Dialog */}
      <AllocationDialog
        isOpen={allocationDialog.isOpen}
        onClose={() =>setAllocationDialog({ isOpen: false, projectId: null })}
        onSubmit={handleCreateAllocation}
        project={
          projects.find((p) => p.id === allocationDialog.projectId) || null
        }
        users={usersData?.users || []}
      />

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        isOpen={detailsDialog.isOpen}
        key={detailsDialog.projectId || 'no-project'}
        onClose={() => setDetailsDialog({ isOpen: false, projectId: null })}
        project={projects.find((p) => p.id === detailsDialog.projectId) || null}
        onRefresh={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, projectId: null, projectName: '' })
        }
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete the project "${deleteDialog.projectName}"? This action cannot be undone and will remove all associated allocations and data.`}
      />
    </div>
  )
}

export default ProjectManagement
