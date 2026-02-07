import {
  extractHashingOptions,
  hashPassword,
  legacyHashPassword,
} from '@redwoodjs/auth-dbauth-api'
import { context, ValidationError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { sendPasswordChangedConfirmationEmail } from 'src/lib/emailService'
import { logger } from 'src/lib/logger'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isPasswordValid = (hashedPassword, salt, plainTextPassword) => {
  const hashOptions = extractHashingOptions(hashedPassword)

  if (Object.keys(hashOptions).length > 0) {
    const [computedHash] = hashPassword(plainTextPassword, {
      salt,
      options: hashOptions,
    })
    return computedHash === hashedPassword
  }

  const [legacyHash] = legacyHashPassword(plainTextPassword, salt)
  return legacyHash === hashedPassword
}

export const users = () => {
  return db.user.findMany({
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
      projectAllocations: {
        include: {
          project: true,
        },
      },
      reportingManagerUser: true,
      // Include related users who report to this user
      directReports: true,
    },
    orderBy: { name: 'asc' },
  })
}

export const user = ({ id }) => {
  return db.user.findUnique({
    where: { id },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
      projectAllocations: {
        include: {
          project: true,
        },
      },
      reportingManagerUser: true,
      directReports: true,
    },
  })
}

export const userByEmail = ({ email }) => {
  return db.user.findUnique({
    where: { email },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const userByMicrosoftId = ({ microsoftId }) => {
  return db.user.findUnique({
    where: { microsoftId },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const createUser = ({ input }) => {
  logger.info('Creating user:', input)
  return db.user.create({
    data: {
      ...input,
      roles: input.roles || ['USER'],
    },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const updateUser = async ({ id, input }) => {
  logger.info('Updating user:', { id, input })

  const normalizedInput = { ...input }
  const isAdmin = context.currentUser?.roles?.includes('ADMIN')

  if (Object.hasOwn(normalizedInput, 'name')) {
    normalizedInput.name =
      normalizedInput.name?.trim?.() ?? normalizedInput.name
    if (!normalizedInput.name) {
      throw new ValidationError('Name is required')
    }
  }

  if (Object.hasOwn(normalizedInput, 'email')) {
    normalizedInput.email =
      normalizedInput.email?.trim?.() ?? normalizedInput.email
    if (!normalizedInput.email) {
      throw new ValidationError('Email is required')
    }
    if (!EMAIL_PATTERN.test(normalizedInput.email)) {
      throw new ValidationError('Please enter a valid email address')
    }
  }

  if (isAdmin && Object.hasOwn(normalizedInput, 'roles')) {
    const normalizedRoles = [...new Set(normalizedInput.roles || [])]
    if (normalizedRoles.length === 0) {
      throw new ValidationError('At least one role is required')
    }
    normalizedInput.roles = normalizedRoles
  } else if (!isAdmin) {
    delete normalizedInput.roles

    const existingUser = await db.user.findUnique({
      where: { id },
      select: { roles: true },
    })

    if (
      existingUser &&
      (!existingUser.roles || existingUser.roles.length === 0)
    ) {
      normalizedInput.roles = ['USER']
    }
  }

  return db.user.update({
    data: normalizedInput,
    where: { id },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const deleteUser = ({ id }) => {
  logger.info('Deleting user:', id)
  return db.user.delete({
    where: { id },
  })
}

export const upsertUser = ({ input }) => {
  console.log('Upserting user with email:', input.email)

  return db.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      microsoftId: input.microsoftId,
      roles: input.roles || ['USER'],
    },
    create: {
      email: input.email,
      name: input.name || input.email,
      microsoftId: input.microsoftId,
      roles: input.roles || ['USER'],
    },
  })
}

export const updateUserRoles = ({ id, roles }) => {
  logger.info('Updating user roles:', { id, roles })
  return db.user.update({
    where: { id },
    data: { roles },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const changePassword = async ({ input }) => {
  const currentUserId = context.currentUser?.id

  if (!currentUserId) {
    throw new ValidationError('You must be logged in to change your password')
  }

  const currentPassword = input?.currentPassword?.toString?.() ?? ''
  const newPassword = input?.newPassword?.toString?.() ?? ''

  if (!currentPassword.trim()) {
    throw new ValidationError('Current password is required')
  }

  if (!newPassword.trim()) {
    throw new ValidationError('New password is required')
  }

  const userWithCredentials = await db.user.findUnique({
    where: { id: currentUserId },
    select: {
      id: true,
      hashedPassword: true,
      salt: true,
    },
  })

  if (!userWithCredentials?.hashedPassword || !userWithCredentials?.salt) {
    throw new ValidationError('Password change is unavailable for this account')
  }

  const currentPasswordIsValid = isPasswordValid(
    userWithCredentials.hashedPassword,
    userWithCredentials.salt,
    currentPassword
  )

  if (!currentPasswordIsValid) {
    throw new ValidationError('Current password is incorrect')
  }

  const hashOptions = extractHashingOptions(userWithCredentials.hashedPassword)
  const [nextHashedPassword, nextSalt] = hashPassword(newPassword, {
    ...(Object.keys(hashOptions).length > 0 ? { options: hashOptions } : {}),
  })

  await db.user.update({
    where: { id: currentUserId },
    data: {
      hashedPassword: nextHashedPassword,
      salt: nextSalt,
    },
  })

  sendPasswordChangedConfirmationEmail({
    email: context.currentUser?.email,
    name: context.currentUser?.name,
  }).catch((error) => {
    logger.error(
      {
        error: error?.message || error,
        userId: currentUserId,
      },
      'Failed to send password changed confirmation email'
    )
  })

  return true
}

export const currentUser = () => {
  const currentUser = context.currentUser
  if (!currentUser?.email) return null

  return db.user.findUnique({
    where: { email: currentUser.email },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
      projectAllocations: {
        include: {
          project: true,
        },
      },
      reportingManagerUser: true,
      directReports: true,
      managedProjects: true,
      assetAssignments: true,
      vacationRequests: true,
    },
  })
}

export const User = {
  bookings: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).bookings()
  },
  selectedMeetingRoom: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).selectedMeetingRoom()
  },
  exceptionRequests: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).exceptionRequests()
  },
  attendances: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).attendances()
  },
  assetAssignments: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).assetAssignments()
  },
  vacationRequests: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).vacationRequests()
  },
  attendancesInRange: (user, { start, end }) => {
    if (!user?.id || !start || !end) return []
    return db.attendance.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    })
  },

  // Employee Management Resolvers
  reportingManagerUser: (_obj, { root }) => {
    return db.user
      .findUnique({ where: { id: root?.id } })
      .reportingManagerUser()
  },
  directReports: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).directReports()
  },

  // Project Allocation Resolvers
  projectAllocations: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).projectAllocations({
      include: {
        project: true,
      },
    })
  },
  managedProjects: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).managedProjects()
  },
}
