/**
 * Seed script — creates demo users via BetterAuth (correct password hashing)
 * then seeds inventory items, price history, daily sales, expenses, payments, and budgets.
 *
 * Run: npx prisma db seed
 */
import 'dotenv/config'
import { auth } from '../src/lib/auth'
import prisma from '../src/lib/prisma'

async function createUser(email: string, name: string, password: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`  ↳ ${email} already exists, skipping`)
    return existing
  }

  const result = await auth.api.signUpEmail({
    body: { email, name, password },
  })

  if (result.user) {
    await prisma.user.update({
      where: { id: result.user.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { role: role as any },
    })
    console.log(`  ✓ Created ${role}: ${email}`)
    return result.user
  }

  throw new Error(`Failed to create user ${email}`)
}

async function main() {
  console.log('🌱 Seeding users…')
  const superAdmin = await createUser('superadmin@damot.com', 'Super Admin', 'password123', 'SUPER_ADMIN')
  const admin = await createUser('admin@damot.com', 'Admin User', 'password123', 'ADMIN')
  const financeManager = await createUser('finance@damot.com', 'Finance Manager', 'password123', 'FINANCE_MANAGER')
  await createUser('facility@damot.com', 'Facility Manager', 'password123', 'FACILITY_MANAGER')

  console.log('\n🌱 Seeding inventory items…')

  const now = new Date()
  const daysAgo = (n: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return d
  }

  // INGREDIENT items
  const coffeeBeans = await prisma.inventoryItem.upsert({
    where: { id: 'seed-coffee-beans' },
    update: {},
    create: {
      id: 'seed-coffee-beans',
      category: 'INGREDIENT',
      date: daysAgo(30),
      name: 'Coffee Bean',
      units: 'kg',
      quantity: 50,
      unitCost: 120,
      totalCost: 6000,
      supplier: 'Yirgacheffe Farms',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Coffee Bean')

  const water = await prisma.inventoryItem.upsert({
    where: { id: 'seed-water' },
    update: {},
    create: {
      id: 'seed-water',
      category: 'INGREDIENT',
      date: daysAgo(25),
      name: 'Water',
      units: 'liters',
      quantity: 200,
      unitCost: 2,
      totalCost: 400,
      supplier: 'Local Supplier',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Water')

  const zinjible = await prisma.inventoryItem.upsert({
    where: { id: 'seed-zinjible' },
    update: {},
    create: {
      id: 'seed-zinjible',
      category: 'INGREDIENT',
      date: daysAgo(20),
      name: 'Zinjible',
      units: 'kg',
      quantity: 10,
      unitCost: 80,
      totalCost: 800,
      supplier: 'Spice Market',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Zinjible')

  const siquar = await prisma.inventoryItem.upsert({
    where: { id: 'seed-siquar' },
    update: {},
    create: {
      id: 'seed-siquar',
      category: 'INGREDIENT',
      date: daysAgo(15),
      name: 'Siquar',
      units: 'kg',
      quantity: 15,
      unitCost: 60,
      totalCost: 900,
      supplier: 'Spice Market',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Siquar')

  // FINISHED_GOOD items
  const espresso = await prisma.inventoryItem.upsert({
    where: { id: 'seed-espresso' },
    update: {},
    create: {
      id: 'seed-espresso',
      category: 'FINISHED_GOOD',
      date: daysAgo(10),
      name: 'Espresso',
      units: 'cup',
      quantity: 100,
      unitCost: 15,
      totalCost: 1500,
      supplier: 'In-house',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Espresso')

  const softDrink = await prisma.inventoryItem.upsert({
    where: { id: 'seed-soft-drink' },
    update: {},
    create: {
      id: 'seed-soft-drink',
      category: 'FINISHED_GOOD',
      date: daysAgo(10),
      name: 'Soft Drink',
      units: 'bottle',
      quantity: 60,
      unitCost: 25,
      totalCost: 1500,
      supplier: 'Beverage Distributor',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Soft Drink')

  const spicedCoffee = await prisma.inventoryItem.upsert({
    where: { id: 'seed-spiced-coffee' },
    update: {},
    create: {
      id: 'seed-spiced-coffee',
      category: 'FINISHED_GOOD',
      date: daysAgo(8),
      name: 'Spiced Coffee',
      units: 'cup',
      quantity: 80,
      unitCost: 20,
      totalCost: 1600,
      supplier: 'In-house',
      createdById: superAdmin.id,
    },
  })
  console.log('  ✓ Spiced Coffee')

  // Suppress unused variable warnings
  void water
  void zinjible
  void siquar

  console.log('\n🌱 Seeding price history…')

  const espressoPrice1 = await prisma.priceHistory.upsert({
    where: { id: 'seed-espresso-price-1' },
    update: {},
    create: {
      id: 'seed-espresso-price-1',
      itemName: 'Espresso',
      inventoryItemId: espresso.id,
      price: 35,
      effectiveDate: daysAgo(30),
      createdById: financeManager.id,
    },
  })
  console.log('  ✓ Espresso price: 35 ETB')

  const espressoPrice2 = await prisma.priceHistory.upsert({
    where: { id: 'seed-espresso-price-2' },
    update: {},
    create: {
      id: 'seed-espresso-price-2',
      itemName: 'Espresso',
      inventoryItemId: espresso.id,
      price: 40,
      effectiveDate: daysAgo(7),
      createdById: financeManager.id,
    },
  })
  console.log('  ✓ Espresso price: 40 ETB (updated)')

  const softDrinkPrice = await prisma.priceHistory.upsert({
    where: { id: 'seed-soft-drink-price-1' },
    update: {},
    create: {
      id: 'seed-soft-drink-price-1',
      itemName: 'Soft Drink',
      inventoryItemId: softDrink.id,
      price: 50,
      effectiveDate: daysAgo(30),
      createdById: financeManager.id,
    },
  })
  console.log('  ✓ Soft Drink price: 50 ETB')

  const spicedCoffeePrice = await prisma.priceHistory.upsert({
    where: { id: 'seed-spiced-coffee-price-1' },
    update: {},
    create: {
      id: 'seed-spiced-coffee-price-1',
      itemName: 'Spiced Coffee',
      inventoryItemId: spicedCoffee.id,
      price: 45,
      effectiveDate: daysAgo(30),
      createdById: financeManager.id,
    },
  })
  console.log('  ✓ Spiced Coffee price: 45 ETB')

  console.log('\n🌱 Seeding daily sales (last 5 days)…')

  for (let i = 4; i >= 0; i--) {
    const saleDate = daysAgo(i)
    // Use the correct price for the date
    const espressoActivePrice = i >= 7 ? espressoPrice1 : espressoPrice2

    await prisma.dailySale.create({
      data: {
        date: saleDate,
        itemName: 'Espresso',
        unitPrice: Number(espressoActivePrice.price),
        inventoryItemId: espresso.id,
        priceHistoryId: espressoActivePrice.id,
        quantitySold: 10 + i,
        saleTotal: (10 + i) * Number(espressoActivePrice.price),
        createdById: admin.id,
      },
    })

    await prisma.dailySale.create({
      data: {
        date: saleDate,
        itemName: 'Soft Drink',
        unitPrice: Number(softDrinkPrice.price),
        inventoryItemId: softDrink.id,
        priceHistoryId: softDrinkPrice.id,
        quantitySold: 5 + i,
        saleTotal: (5 + i) * Number(softDrinkPrice.price),
        createdById: admin.id,
      },
    })

    await prisma.dailySale.create({
      data: {
        date: saleDate,
        itemName: 'Spiced Coffee',
        unitPrice: Number(spicedCoffeePrice.price),
        inventoryItemId: spicedCoffee.id,
        priceHistoryId: spicedCoffeePrice.id,
        quantitySold: 8,
        saleTotal: 8 * Number(spicedCoffeePrice.price),
        createdById: admin.id,
      },
    })
  }
  console.log('  ✓ 15 daily sale records (3 items × 5 days)')

  console.log('\n🌱 Seeding daily expenses…')

  const expenseItems = [
    { itemName: 'Electricity Bill', quantity: 1, unitPrice: 800 },
    { itemName: 'Cleaning Supplies', quantity: 3, unitPrice: 150 },
    { itemName: 'Staff Meal', quantity: 5, unitPrice: 60 },
    { itemName: 'Water Refill', quantity: 10, unitPrice: 20 },
    { itemName: 'Packaging Materials', quantity: 50, unitPrice: 5 },
  ]

  for (let i = 4; i >= 0; i--) {
    const expDate = daysAgo(i)
    for (const item of expenseItems.slice(0, 3)) {
      await prisma.dailyExpense.create({
        data: {
          date: expDate,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          createdById: admin.id,
        },
      })
    }
  }
  console.log('  ✓ 15 daily expense records (3 items × 5 days)')

  console.log('\n🌱 Seeding payments…')

  await prisma.payment.createMany({
    data: [
      {
        date: daysAgo(10),
        payee: 'Yirgacheffe Farms',
        description: 'Coffee bean supply payment',
        amount: 6000,
        paymentMethod: 'Bank Transfer',
        executedAt: daysAgo(9),
        executedById: financeManager.id,
        createdById: financeManager.id,
      },
      {
        date: daysAgo(5),
        payee: 'Beverage Distributor',
        description: 'Soft drink stock payment',
        amount: 1500,
        paymentMethod: 'Cash',
        executedAt: daysAgo(5),
        executedById: financeManager.id,
        createdById: financeManager.id,
      },
      {
        date: daysAgo(2),
        payee: 'Spice Market',
        description: 'Zinjible and Siquar purchase',
        amount: 1700,
        paymentMethod: 'Bank Transfer',
        executedAt: null,
        createdById: financeManager.id,
      },
      {
        date: daysAgo(1),
        payee: 'Utility Company',
        description: 'Monthly electricity bill',
        amount: 3200,
        paymentMethod: 'Bank Transfer',
        executedAt: null,
        createdById: financeManager.id,
      },
    ],
  })
  console.log('  ✓ 4 payment records (2 executed, 2 pending)')

  console.log('\n🌱 Seeding budgets…')

  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  await prisma.budget.createMany({
    skipDuplicates: true,
    data: [
      {
        periodMonth: currentMonth,
        periodYear: currentYear,
        category: 'Ingredients',
        allocatedAmount: 15000,
        createdById: financeManager.id,
      },
      {
        periodMonth: currentMonth,
        periodYear: currentYear,
        category: 'Supplies',
        allocatedAmount: 5000,
        createdById: financeManager.id,
      },
      {
        periodMonth: currentMonth,
        periodYear: currentYear,
        category: 'Utilities',
        allocatedAmount: 4000,
        createdById: financeManager.id,
      },
      {
        periodMonth: currentMonth,
        periodYear: currentYear,
        category: 'Staff',
        allocatedAmount: 20000,
        createdById: financeManager.id,
      },
    ],
  })
  console.log('  ✓ 4 budget records for current month')

  console.log('\n✅ Seed complete!')
  console.log('   Login: superadmin@damot.com / password123  (SUPER_ADMIN)')
  console.log('   Login: admin@damot.com / password123       (ADMIN)')
  console.log('   Login: finance@damot.com / password123     (FINANCE_MANAGER)')
  console.log('   Login: facility@damot.com / password123    (FACILITY_MANAGER)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
