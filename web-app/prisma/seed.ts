import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Clean up existing data to prevent duplicates
    await prisma.portfolio.deleteMany()
    await prisma.strategy.deleteMany()
    await prisma.advisorProfile.deleteMany()
    await prisma.investorProfile.deleteMany()
    await prisma.traineeProfile.deleteMany()
    await prisma.message.deleteMany()
    await prisma.user.deleteMany()

    console.log('Seeding Database...')

    const defaultPassword = await bcrypt.hash('password123', 10)

    // 1. Create Admin
    const admin = await prisma.user.create({
        data: {
            name: 'Ecosystem Admin',
            email: 'admin@quantelite.com',
            passwordHash: defaultPassword,
            role: 'ADMIN',
            kycStatus: 'VERIFIED',
        },
    })

    // 2. Create Top Advisor
    const advisorUser = await prisma.user.create({
        data: {
            name: 'Dr. Arvinder Singh',
            email: 'arvinder@quantelite.com',
            passwordHash: defaultPassword,
            role: 'ADVISOR',
            kycStatus: 'VERIFIED',
            advisorProfile: {
                create: {
                    sebiRegNo: 'INA100000123',
                    tier: 'Elite',
                    aumManaged: 154000000, // 154 Cr AUM
                    alphaGenerated: 14.2,
                    rating: 4.9,
                    isVerified: true
                }
            }
        },
        include: {
            advisorProfile: true
        }
    })

    // 3. Create Advisor's Strategy
    const strategy = await prisma.strategy.create({
        data: {
            advisorId: advisorUser.advisorProfile!.id,
            name: 'Alpha Quant Factor',
            type: 'Algorithmic',
            riskLevel: 'High',
            cagr: 24.5,
            minInvestment: 500000,
            description: 'Multi-factor quantitative model targeting high growth through mid-cap momentum anomalies.',
            tags: ['High Alpha', 'Equities', 'Momentum'],
            isActive: true,
        }
    })

    // 4. Create Investor
    const investorUser = await prisma.user.create({
        data: {
            name: 'Rishabh Investor',
            email: 'investor@gmail.com',
            passwordHash: defaultPassword,
            role: 'INVESTOR',
            kycStatus: 'VERIFIED',
            investorProfile: {
                create: {
                    riskTolerance: 'High',
                    totalInvested: 2500000,
                    currentValue: 3100000,
                }
            }
        },
        include: {
            investorProfile: true
        }
    })

    // 5. Create Portfolio linking Investor to Strategy
    await prisma.portfolio.create({
        data: {
            investorId: investorUser.investorProfile!.id,
            strategyId: strategy.id,
            investedAmount: 2500000,
            currentValue: 3100000
        }
    })

    console.log('Seed Payload Inject Complete! ✨')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
