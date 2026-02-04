import fs from 'fs'
import path from 'path'

import { db } from 'api/src/lib/db'

import { hashPassword } from '@redwoodjs/auth-dbauth-api'

import seedOfficeSupplies from './seedOfficeSupplies.js'

// Manually apply seeds via the `yarn rw prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn rw prisma migrate dev`
// command and every time you run the `yarn rw prisma migrate reset` command.
//
// See https://redwoodjs.com/docs/database-seeds for more info

const dataPath = path.join(process.cwd(), 'scripts', 'seed_data_2creative.json')
const defaultUserPassword = process.env.SEED_USER_PASSWORD || 'ChangeMe123!'

const safeDate = (value) => (value ? new Date(value) : null)
const normalizeManager = (value) => (value && value > 0 ? value : null)
const buildProjectCode = (project) =>
  project.code || `PROJ-${String(project.id ?? '').padStart(3, '0')}`

const WORK_HOURS_DEFAULT = 8
const WORKDAY_START_HOUR = 9
const WORKDAY_END_HOUR = 18

const WORKDAYS = [1, 2, 3, 4, 5] // Mon-Fri
const VACATION_REASON = 'Annual leave'
const EXCEPTION_TYPES = ['Late Arrival', 'Early Departure', 'WFH']

async function loadSeedData() {
  if (!fs.existsSync(dataPath)) {
    console.info(
      `Seed data file not found at ${dataPath}; skipping JSON import.`
    )
    return null
  }

  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.error('❌ Failed to read/parse JSON seed data:', error)
    return null
  }
}

async function seedUsers(users = []) {
  if (!users.length) return
  const [hashedPassword, salt] = hashPassword(defaultUserPassword)

  console.info(`Seeding ${users.length} users from JSON...`)
  for (const user of users) {
    const existingById = await db.user.findUnique({ where: { id: user.id } })

    if (existingById) {
      await db.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          name: user.name,
          department: user.department,
          designation: user.designation,
          employeeId: user.employeeId,
          dateOfJoining: safeDate(user.dateOfJoining),
          roles: user.roles,
          lastLogin: safeDate(user.lastLogin) ?? undefined,
          hashedPassword,
          salt,
        },
      })
    } else {
      await db.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          department: user.department,
          designation: user.designation,
          employeeId: user.employeeId,
          dateOfJoining: safeDate(user.dateOfJoining),
          roles: user.roles,
          lastLogin: safeDate(user.lastLogin) ?? undefined,
          hashedPassword,
          salt,
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          designation: user.designation,
          employeeId: user.employeeId,
          dateOfJoining: safeDate(user.dateOfJoining),
          roles: user.roles,
          hashedPassword,
          salt,
          lastLogin: safeDate(user.lastLogin) ?? undefined,
        },
      })
    }
  }

  // Second pass to link reporting managers after all users exist
  for (const user of users) {
    const managerId = normalizeManager(user.reportingManager)
    if (!managerId) continue

    await db.user.update({
      where: { email: user.email },
      data: { reportingManager: managerId },
    })
  }
}

async function seedProjects(projects = []) {
  if (!projects.length) return new Map()
  console.info(`Seeding ${projects.length} projects and allocations...`)

  const allocationIdMap = new Map()
  let allocationOrdinal = 1

  for (const project of projects) {
    const startDate = safeDate(project.startDate) ?? new Date()
    const createdProject = await db.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate,
        endDate: safeDate(project.endDate),
        managerId: normalizeManager(project.managerId),
        code: buildProjectCode(project),
      },
      create: {
        id: project.id,
        code: buildProjectCode(project),
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate,
        endDate: safeDate(project.endDate),
        managerId: normalizeManager(project.managerId),
      },
    })

    for (const allocation of project.allocations || []) {
      const allocationId = allocationOrdinal
      const allocatedDate = startDate
      const record = await db.projectAllocation.upsert({
        where: { id: allocationId },
        update: {
          projectId: createdProject.id,
          userId: allocation.userId,
          role: allocation.role,
          allocatedDate,
          isActive: true,
          hoursAllocated: allocation.hoursAllocated ?? 8,
        },
        create: {
          id: allocationId,
          projectId: createdProject.id,
          userId: allocation.userId,
          role: allocation.role,
          allocatedDate,
          isActive: true,
          hoursAllocated: allocation.hoursAllocated ?? 8,
        },
      })

      allocationIdMap.set(allocationOrdinal, record.id)
      allocationOrdinal += 1
    }
  }

  return allocationIdMap
}

async function seedMeetings(meetings = []) {
  if (!meetings.length) return
  console.info(`Seeding ${meetings.length} project meetings...`)

  for (const meeting of meetings) {
    await db.projectMeeting.upsert({
      where: { id: meeting.id },
      update: {
        title: meeting.title,
        description: meeting.description,
        meetingDate: safeDate(meeting.meetingDate) ?? new Date(),
        duration: meeting.duration,
        status: meeting.status,
        meetingType: meeting.meetingType,
        projectId: meeting.projectId,
        organizerId: normalizeManager(meeting.organizerId),
        attendeeIds: meeting.attendeeIds ?? [],
      },
      create: {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        meetingDate: safeDate(meeting.meetingDate) ?? new Date(),
        duration: meeting.duration,
        status: meeting.status,
        meetingType: meeting.meetingType,
        projectId: meeting.projectId,
        organizerId: normalizeManager(meeting.organizerId),
        attendeeIds: meeting.attendeeIds ?? [],
      },
    })
  }
}

async function seedDailyUpdates(dailies = [], allocationIdMap) {
  if (!dailies.length) return
  console.info(`Seeding ${dailies.length} daily project updates...`)

  for (const daily of dailies) {
    const allocationId = allocationIdMap.get(daily.allocationId)
    if (!allocationId) {
      console.warn(
        `Skipping daily update ${daily.id} because allocation ${daily.allocationId} was not seeded`
      )
      continue
    }

    await db.dailyProjectUpdate.upsert({
      where: { id: daily.id },
      update: {
        allocationId,
        projectId: daily.projectId,
        date: safeDate(daily.date) ?? new Date(),
        status: daily.status,
        description: daily.description,
        hoursWorked: daily.hoursWorked,
        blockers: daily.blockers,
        nextDayPlan: daily.nextDayPlan,
        completionPercentage: daily.completionPercentage,
        milestoneReached: daily.milestoneReached,
        meetingsAttended: daily.meetingsAttended ?? [],
      },
      create: {
        id: daily.id,
        allocationId,
        projectId: daily.projectId,
        date: safeDate(daily.date) ?? new Date(),
        status: daily.status,
        description: daily.description,
        hoursWorked: daily.hoursWorked,
        blockers: daily.blockers,
        nextDayPlan: daily.nextDayPlan,
        completionPercentage: daily.completionPercentage,
        milestoneReached: daily.milestoneReached,
        meetingsAttended: daily.meetingsAttended ?? [],
      },
    })
  }
}

function* workingDaysWithinPastYear() {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)
  for (
    let d = new Date(start);
    d <= end;
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    if (WORKDAYS.includes(d.getDay())) {
      yield new Date(d)
    }
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function makeWorkdayWindow(day) {
  const clockIn = new Date(day)
  clockIn.setHours(WORKDAY_START_HOUR, Math.floor(randomBetween(0, 20)), 0, 0)
  const clockOut = new Date(day)
  clockOut.setHours(
    WORKDAY_END_HOUR,
    Math.floor(randomBetween(0, 20)),
    0,
    0
  )
  // occasional late start / early leave variance
  const offsetMinutes = Math.floor(randomBetween(-20, 40))
  clockIn.setMinutes(clockIn.getMinutes() + offsetMinutes)
  const dayDurationMinutes = 8 * 60 - offsetMinutes + Math.floor(randomBetween(-30, 60))
  clockOut.setMinutes(clockIn.getMinutes() + dayDurationMinutes)
  return { clockIn, clockOut }
}

async function seedAttendanceHistory(users = []) {
  if (!users.length) return
  console.info('Seeding attendance history for past year...')

  const attendanceData = []
  for (const user of users) {
    for (const day of workingDaysWithinPastYear()) {
      // skip some days to look realistic
      if (Math.random() < 0.05) continue // absent
      const { clockIn, clockOut } = makeWorkdayWindow(day)
      const durationMinutes = Math.max(
        0,
        Math.round((clockOut - clockIn) / (1000 * 60))
      )
      attendanceData.push({
        userId: user.id,
        date: day,
        clockIn,
        clockOut,
        duration: `${durationMinutes} minutes`,
        status: 'PRESENT',
        location: 'Office',
      })
    }
  }

  // bulk insert in chunks
  const chunkSize = 500
  for (let i = 0; i < attendanceData.length; i += chunkSize) {
    const chunk = attendanceData.slice(i, i + chunkSize)
    await db.attendance.createMany({ data: chunk, skipDuplicates: true })
  }
  console.info(`Seeded ${attendanceData.length} attendance records`)
}

async function seedVacationHistory(users = []) {
  if (!users.length) return
  console.info('Seeding vacation requests (historical)...')
  const vacationData = []
  for (const user of users) {
    // 2 vacations per user over past year
    for (let i = 0; i < 2; i++) {
      const start = new Date()
      start.setMonth(start.getMonth() - Math.floor(randomBetween(1, 10)))
      start.setDate(start.getDate() - Math.floor(randomBetween(0, 20)))
      const end = new Date(start)
      end.setDate(end.getDate() + Math.floor(randomBetween(2, 6)))
      vacationData.push({
        userId: user.id,
        startDate: start,
        endDate: end,
        reason: VACATION_REASON,
        status: 'Approved',
        createdAt: start,
        updatedAt: end,
      })
    }
  }
  if (vacationData.length) {
    await db.vacationRequest.createMany({ data: vacationData, skipDuplicates: true })
    console.info(`Seeded ${vacationData.length} vacation requests`)
  }
}

async function seedExceptionRequests(users = []) {
  if (!users.length) return
  console.info('Seeding exception requests...')
  const exceptions = []
  for (const user of users) {
    // 3 exceptions per user
    for (let i = 0; i < 3; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - Math.floor(randomBetween(0, 6)))
      date.setDate(date.getDate() - Math.floor(randomBetween(0, 20)))
      exceptions.push({
        userId: user.id,
        type: EXCEPTION_TYPES[i % EXCEPTION_TYPES.length],
        reason: 'Schedule adjustment',
        date,
        status: 'Approved',
        createdAt: date,
      })
    }
  }
  if (exceptions.length) {
    await db.exceptionRequest.createMany({ data: exceptions, skipDuplicates: true })
    console.info(`Seeded ${exceptions.length} exception requests`)
  }
}

async function resetSequences() {
  const tables = [
    'User',
    'Project',
    'ProjectAllocation',
    'ProjectMeeting',
    'DailyProjectUpdate',
  ]

  for (const table of tables) {
    await db.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1));`
    )
  }
}

async function seedAssetsAndSupplies() {
  // Seed Asset Categories
  console.info('')

  const categories = [
    { name: 'Laptop', description: 'Portable computers for employees' },
    { name: 'Monitor', description: 'External displays and monitors' },
    { name: 'Phone', description: 'Mobile phones and smartphones' },
    { name: 'Tablet', description: 'Tablets and iPads' },
    { name: 'Accessories', description: 'Keyboards, mice, chargers, etc.' },
    {
      name: 'Network Equipment',
      description: 'Routers, switches, access points',
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const existing = await db.assetCategory.findUnique({
      where: { name: category.name },
    })

    if (!existing) {
      const created = await db.assetCategory.create({ data: category })
      createdCategories.push(created)
    } else {
      createdCategories.push(existing)
    }
  }

  // Seed Sample Assets
  console.info('')

  const laptopCategory = createdCategories.find((c) => c.name === 'Laptop')
  const monitorCategory = createdCategories.find((c) => c.name === 'Monitor')
  const phoneCategory = createdCategories.find((c) => c.name === 'Phone')

  const assets = [
    // Laptops
    {
      assetId: 'LP001',
      name: 'MacBook Pro 16-inch',
      model: 'A2338',
      serialNumber: 'C02Z91234567',
      purchaseDate: new Date('2024-01-15'),
      warrantyExpiry: new Date('2027-01-15'),
      purchasePrice: 2499.0,
      vendor: 'Apple Inc.',
      categoryId: laptopCategory.id,
      location: 'IT Storage Room',
    },
    {
      assetId: 'LP002',
      name: 'Dell XPS 15',
      model: '9520',
      serialNumber: 'DL789123456',
      purchaseDate: new Date('2024-02-20'),
      warrantyExpiry: new Date('2027-02-20'),
      purchasePrice: 1899.0,
      vendor: 'Dell Technologies',
      categoryId: laptopCategory.id,
      location: 'IT Storage Room',
    },
    {
      assetId: 'LP003',
      name: 'ThinkPad X1 Carbon',
      model: 'Gen 11',
      serialNumber: 'LN456789123',
      purchaseDate: new Date('2024-03-10'),
      warrantyExpiry: new Date('2027-03-10'),
      purchasePrice: 1699.0,
      vendor: 'Lenovo',
      categoryId: laptopCategory.id,
      location: 'IT Storage Room',
    },
    // Monitors
    {
      assetId: 'MON001',
      name: 'Dell UltraSharp 27"',
      model: 'U2723QE',
      serialNumber: 'DM123456789',
      purchaseDate: new Date('2024-01-20'),
      warrantyExpiry: new Date('2027-01-20'),
      purchasePrice: 599.0,
      vendor: 'Dell Technologies',
      categoryId: monitorCategory.id,
      location: 'IT Storage Room',
    },
    {
      assetId: 'MON002',
      name: 'LG 4K UltraWide',
      model: '34WP65C-B',
      serialNumber: 'LG987654321',
      purchaseDate: new Date('2024-02-15'),
      warrantyExpiry: new Date('2027-02-15'),
      purchasePrice: 449.0,
      vendor: 'LG Electronics',
      categoryId: monitorCategory.id,
      location: 'IT Storage Room',
    },
    // Phones
    {
      assetId: 'PH001',
      name: 'iPhone 15 Pro',
      model: 'A3108',
      serialNumber: 'IP123456789',
      purchaseDate: new Date('2024-04-01'),
      warrantyExpiry: new Date('2025-04-01'),
      purchasePrice: 999.0,
      vendor: 'Apple Inc.',
      categoryId: phoneCategory.id,
      location: 'IT Storage Room',
    },
    {
      assetId: 'PH002',
      name: 'Samsung Galaxy S24',
      model: 'SM-S921B',
      serialNumber: 'SG987654321',
      purchaseDate: new Date('2024-04-15'),
      warrantyExpiry: new Date('2025-04-15'),
      purchasePrice: 849.0,
      vendor: 'Samsung',
      categoryId: phoneCategory.id,
      location: 'IT Storage Room',
    },
  ]

  for (const asset of assets) {
    const existing = await db.asset.findUnique({
      where: { assetId: asset.assetId },
    })

    if (!existing) {
      await db.asset.create({ data: asset })
    } else {
      console.info(
        `Asset already exists: ${existing.assetId} - ${existing.name}`
      )
    }
  }

  // Also seed office supplies (destructive: clears existing supply data)
  console.info('')
  await seedOfficeSupplies()
}

async function seedDefaultAdmin() {
  const seedAdminEnabled = !['0', 'false'].includes(
    (process.env.SEED_ADMIN_ENABLED || 'true').toLowerCase()
  )
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'test_password'

  if (!seedAdminEnabled) {
    console.info('SEED_ADMIN_ENABLED=false; skipping default admin seed.')
    return
  }

  const existingUser = await db.user.findUnique({
    where: { email: seedAdminEmail },
  })

  if (existingUser) {
    console.info(`Admin user ${seedAdminEmail} already exists; skipping.`)
    return
  }

  const [hashedPassword, salt] = hashPassword(seedAdminPassword)
  await db.user.create({
    data: {
      email: seedAdminEmail,
      name: seedAdminEmail,
      hashedPassword,
      salt,
      roles: ['ADMIN'],
    },
  })
  const adminMessage = `🔑🔑 Seeded default admin user: ${seedAdminEmail} (roles: ADMIN)`
  const adminDivider = '='.repeat(adminMessage.length)
  console.log('')
  console.info(
    `\x1b[40m\x1b[97m${adminDivider}\n${adminMessage}\n${adminDivider}\x1b[0m`
  )
}

export default async () => {
  try {
    console.info('')

    const seedData = await loadSeedData()
    const allocationIdMap = new Map()

    if (seedData) {
      await seedUsers(seedData.users)
      const allocations = await seedProjects(seedData.projects)
      allocations?.forEach((value, key) => allocationIdMap.set(key, value))
      await seedMeetings(seedData.meetings)
      await seedDailyUpdates(seedData.dailyProjectUpdates, allocationIdMap)
      await seedAttendanceHistory(seedData.users)
      await seedVacationHistory(seedData.users)
      await seedExceptionRequests(seedData.users)
      await resetSequences()
    }

    await seedAssetsAndSupplies()
    await seedDefaultAdmin()
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  }
}
