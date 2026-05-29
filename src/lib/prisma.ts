import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Log the DATABASE_URL being used (without password)
const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('⚠️  DATABASE_URL is not set!')
} else {
  console.log('📊 Using DATABASE_URL:', dbUrl.replace(/:[^:@]+@/, ':****@'))
}

const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
