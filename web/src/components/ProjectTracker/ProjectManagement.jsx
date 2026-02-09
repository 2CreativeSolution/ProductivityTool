import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { useMutation, useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { Button, Pill } from 'src/components/ui'
import { AppDialog, AppDialogContent } from 'src/components/ui/app-dialog'
import { DialogClose } from 'src/components/ui/dialog'

import AllocationDialog from '../Dialog/AllocationDialog'
import ProjectDetailsDialog from '../Dialog/ProjectDetailsDialog'
import ProjectDialog from '../Dialog/ProjectDialog'

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
              Delete
            </Button>
          </div>
        }
      />
    </AppDialog>
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

const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: Int!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
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

const ProjectManagement = forwardRef(
  (
    {
      projects,
      loading,
      onRefresh,
      getStatusBadgeColor: _getStatusBadgeColor,
      getPriorityBadgeColor: _getPriorityBadgeColor,
    },
    ref
  ) => {
    const [projectDialog, setProjectDialog] = useState({ isOpen: false })
    const [editProjectDialog, setEditProjectDialog] = useState({
      isOpen: false,
      projectId: null,
    })

    const openNewProjectDialog = () => setProjectDialog({ isOpen: true })
    const openEditProjectDialog = (projectId) =>
      setEditProjectDialog({ isOpen: true, projectId })

    useImperativeHandle(
      ref,
      () => ({ openNewProject: openNewProjectDialog }),
      []
    )
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

    const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION, {
      onCompleted: () => {
        toast.success('Project updated successfully')
        setEditProjectDialog({ isOpen: false, projectId: null })
        onRefresh()
      },
      onError: (error) => {
        toast.error(`Error updating project: ${error.message}`)
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
        toast.success(
          `Project "${data.deleteProject.name}" deleted successfully`
        )
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

    const handleUpdateProject = async (id, projectData) => {
      try {
        await updateProject({
          variables: { id, input: projectData },
        })
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
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

    const getStatusPillVariant = (status) => {
      switch (status) {
        case 'Active':
          return 'success'
        case 'On Hold':
          return 'warning'
        case 'Cancelled':
          return 'danger'
        case 'Completed':
        default:
          return 'default'
      }
    }

    const getPriorityPillVariant = (priority) => {
      switch (priority) {
        case 'Critical':
        case 'High':
          return 'danger'
        case 'Medium':
          return 'warning'
        case 'Low':
          return 'success'
        default:
          return 'default'
      }
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
        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-sm"
            >
              {/* Project Header */}
              <div className="mb-5 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {project.code}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Pill variant={getStatusPillVariant(project.status)}>
                    {project.status}
                  </Pill>
                  <Pill variant={getPriorityPillVariant(project.priority)}>
                    {project.priority}
                  </Pill>
                </div>
              </div>

              {/* Project Details */}
              <div className="mb-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-gray-500">
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

                {project.endDate && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-gray-500">
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
                )}

                {project.manager && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-gray-500">
                      Manager
                    </span>
                    <span className="font-semibold text-gray-900">
                      {project.manager.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Allocation Stats */}
              <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-bold text-gray-900">Team</span>
                  <Pill variant="brand">
                    {getActiveAllocationsCount(project.allocations)} active
                  </Pill>
                </div>

                {project.allocations.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">
                        Total Hours/Day:
                      </span>
                      <Pill variant="info">
                        {getTotalAllocatedHours(project.allocations)}h
                      </Pill>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.allocations.slice(0, 3).map((allocation) => (
                        <Pill
                          key={allocation.id}
                          variant={allocation.isActive ? 'success' : 'default'}
                        >
                          {allocation.user.name}
                        </Pill>
                      ))}
                      {project.allocations.length > 3 && (
                        <Pill variant="info">
                          +{project.allocations.length - 3} more
                        </Pill>
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
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="primaryOutline"
                  title="Edit project"
                  aria-label="Edit project"
                  onClick={() => openEditProjectDialog(project.id)}
                >
                  <i className="ri-pencil-line text-base" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="primary"
                  title="Manage team"
                  aria-label="Manage team"
                  onClick={() =>
                    setAllocationDialog({ isOpen: true, projectId: project.id })
                  }
                >
                  <i className="ri-team-line text-base" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="primaryOutline"
                  title="View details"
                  aria-label="View details"
                  onClick={() =>
                    setDetailsDialog({ isOpen: true, projectId: project.id })
                  }
                >
                  <i className="ri-eye-line text-base" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  title="Delete project"
                  aria-label="Delete project"
                  onClick={() => handleDeleteProject(project.id, project.name)}
                >
                  <i
                    className="ri-delete-bin-line text-base"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {projects.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              No Active Projects
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              Create your first project to start tracking allocations and
              progress. Build amazing things with your team!
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={openNewProjectDialog}
            >
              New Project
            </Button>
          </div>
        )}

        {/* Project Dialog */}
        <ProjectDialog
          isOpen={projectDialog.isOpen}
          onClose={() => setProjectDialog({ isOpen: false })}
          onSubmit={handleCreateProject}
          users={usersData?.users || []}
        />

        <ProjectDialog
          mode="edit"
          isOpen={editProjectDialog.isOpen}
          onClose={() =>
            setEditProjectDialog({ isOpen: false, projectId: null })
          }
          onSubmit={handleUpdateProject}
          project={
            projects.find((p) => p.id === editProjectDialog.projectId) || null
          }
          users={usersData?.users || []}
        />

        {/* Allocation Dialog */}
        <AllocationDialog
          isOpen={allocationDialog.isOpen}
          onClose={() =>
            setAllocationDialog({ isOpen: false, projectId: null })
          }
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
          project={
            projects.find((p) => p.id === detailsDialog.projectId) || null
          }
          onRefresh={onRefresh}
          onEdit={() => {
            const projectId = detailsDialog.projectId
            setDetailsDialog({ isOpen: false, projectId: null })
            if (projectId) openEditProjectDialog(projectId)
          }}
          onDelete={() => {
            const projectId = detailsDialog.projectId
            const project = projects.find((p) => p.id === projectId)
            setDetailsDialog({ isOpen: false, projectId: null })
            if (project) handleDeleteProject(project.id, project.name)
          }}
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
)

ProjectManagement.displayName = 'ProjectManagement'

export default ProjectManagement
