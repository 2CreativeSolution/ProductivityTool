import { db } from 'api/src/lib/db'

import { hashPassword } from '@redwoodjs/auth-dbauth-api'

import seedOfficeSupplies from './seedOfficeSupplies.js'

// Manually apply seeds via the `yarn rw prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn rw prisma migrate dev`
// command and every time you run the `yarn rw prisma migrate reset` command.
//
// See https://redwoodjs.com/docs/database-seeds for more info

export default async () => {
  try {
    console.info('')
    const seedAdminEnabled = !['0', 'false'].includes(
      (process.env.SEED_ADMIN_ENABLED || 'true').toLowerCase()
    )
    const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'test_password'

    if (seedAdminEnabled) {
      const existingUser = await db.user.findFirst()
      if (!existingUser) {
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
      } else {
        console.log('')
        console.info('Users already exist; skipping default admin seed.')
      }
    } else {
      console.info('SEED_ADMIN_ENABLED=false; skipping default admin seed.')
    }

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
  } catch (error) {
    console.error('❌ Error seeding asset data:', error)
  }
}
