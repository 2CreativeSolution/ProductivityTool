import { ForbiddenError } from '@redwoodjs/graphql-server'

import { requireAuth } from 'src/lib/auth'
import { db } from 'src/lib/db'

const resolveCurrentUserId = async (context) => {
  const rawUserId = context?.currentUser?.id
  const numericUserId = Number(rawUserId)

  if (Number.isInteger(numericUserId)) {
    return numericUserId
  }

  const currentUserEmail = context?.currentUser?.email
  if (!currentUserEmail) {
    throw new Error('Unable to resolve current user id')
  }

  const user = await db.user.findUnique({
    where: { email: currentUserEmail },
    select: { id: true },
  })

  if (!user?.id) {
    throw new Error('Unable to resolve current user id')
  }

  return user.id
}

const isAdminUser = (context) =>
  context?.currentUser?.roles?.includes('ADMIN') ?? false

export const assets = (_args, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)

  return db.asset.findMany({
    include: {
      category: true,
      assignments: {
        where: {
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { assetId: 'asc' }],
  })
}

export const asset = ({ id }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)

  return db.asset.findUnique({
    where: { id },
    include: {
      category: true,
      assignments: {
        include: {
          user: true,
        },
        orderBy: {
          issueDate: 'desc',
        },
      },
    },
  })
}

export const assetByAssetId = ({ assetId }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)

  return db.asset.findUnique({
    where: { assetId },
    include: {
      category: true,
      assignments: {
        where: {
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
  })
}

export const availableAssets = (_args, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)

  return db.asset.findMany({
    where: {
      status: 'Available',
    },
    include: {
      category: true,
    },
    orderBy: {
      assetId: 'asc',
    },
  })
}

export const assetsByCategory = ({ categoryId }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)

  return db.asset.findMany({
    where: {
      categoryId,
    },
    include: {
      category: true,
      assignments: {
        where: {
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      assetId: 'asc',
    },
  })
}

export const assetsByUser = async ({ userId }, { context }) => {
  requireAuth({}, context)

  const currentUserId = await resolveCurrentUserId(context)
  const admin = isAdminUser(context)
  const requestedUserId = Number(userId)

  if (!admin && requestedUserId !== currentUserId) {
    throw new ForbiddenError("You don't have permission to access these assets")
  }

  return db.asset.findMany({
    where: {
      assignments: {
        some: {
          userId: requestedUserId,
          status: 'Active',
        },
      },
    },
    include: {
      category: true,
      assignments: {
        where: {
          userId: requestedUserId,
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      assetId: 'asc',
    },
  })
}

export const createAsset = ({ input }) => {
  return db.asset.create({
    data: {
      ...input,
      status: input.status || 'Available',
      condition: input.condition || 'Good',
    },
    include: {
      category: true,
      assignments: true,
    },
  })
}

export const updateAsset = ({ id, input }) => {
  return db.asset.update({
    data: input,
    where: { id },
    include: {
      category: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
  })
}

export const deleteAsset = ({ id }) => {
  return db.asset.delete({
    where: { id },
    include: {
      category: true,
      assignments: true,
    },
  })
}

export const Asset = {
  category: (_obj, { root }) => {
    return db.asset.findUnique({ where: { id: root?.id } }).category()
  },
  assignments: (_obj, { root }) => {
    return db.asset.findUnique({ where: { id: root?.id } }).assignments()
  },
}
