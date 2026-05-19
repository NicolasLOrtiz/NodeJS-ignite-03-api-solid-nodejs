import { faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

import { PrismaClient } from '../src/generated/prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧹 Cleaning database...')
  // Delete in reverse order of relationships to prevent foreign key constraint issues
  await prisma.checkIn.deleteMany()
  await prisma.gym.deleteMany()
  await prisma.user.deleteMany()

  console.log('🔐 Hashing default passwords...')
  const passwordHash = await hash('123456', 6)

  console.log('👤 Creating default users...')
  // Create default Admin User
  await prisma.user.create({
    data: {
      name: 'Admin GymPass',
      email: 'admin@gympass.com',
      password_hash: passwordHash,
      role: 'ADMIN',
    },
  })

  // Create default Member User
  const member = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'member@gympass.com',
      password_hash: passwordHash,
      role: 'MEMBER',
    },
  })

  console.log('👥 Generating fake users...')
  const users = []
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password_hash: passwordHash,
        role: faker.helpers.arrayElement(['MEMBER', 'MEMBER', 'MEMBER', 'ADMIN']), // mostly members
      },
    })
    users.push(user)
  }

  console.log('🏋️ Creating gyms...')
  // Coordinates close to Avenida Paulista, São Paulo (reference center: -23.5615, -46.6620)
  const centralLatitude = -23.5615
  const centralLongitude = -46.6620

  const gymsData = [
    {
      title: 'Paulista Iron Gym',
      description: 'A melhor e mais equipada academia na Avenida Paulista.',
      phone: faker.phone.number(),
      latitude: centralLatitude, // 0m away
      longitude: centralLongitude,
    },
    {
      title: 'Consolação Fitness',
      description: 'Treine com foco e qualidade pertinho do metrô.',
      phone: faker.phone.number(),
      latitude: centralLatitude + 0.005, // ~500m away
      longitude: centralLongitude - 0.003,
    },
    {
      title: 'Jardins Club',
      description: 'Ambiente premium e acompanhamento personalizado de alta qualidade.',
      phone: faker.phone.number(),
      latitude: centralLatitude - 0.008, // ~1km away
      longitude: centralLongitude + 0.006,
    },
    {
      title: 'Far Away Gym East',
      description: 'Academia na zona leste, ideal para testes de longa distância.',
      phone: faker.phone.number(),
      latitude: centralLatitude + 0.250, // ~28km away
      longitude: centralLongitude + 0.250,
    },
    {
      title: 'Far Away Gym North',
      description: 'Academia na zona norte, mais de 30km de distância.',
      phone: faker.phone.number(),
      latitude: centralLatitude - 0.300, // ~33km away
      longitude: centralLongitude - 0.300,
    },
  ]

  const gyms = []
  for (const gymData of gymsData) {
    const gym = await prisma.gym.create({
      data: {
        title: gymData.title,
        description: gymData.description,
        phone: gymData.phone,
        latitude: gymData.latitude,
        longitude: gymData.longitude,
      },
    })
    gyms.push(gym)
  }

  console.log('📅 Generating check-ins...')
  // Create some check-ins for our main default member in nearby gyms
  for (let i = 0; i < 3; i++) {
    await prisma.checkIn.create({
      data: {
        user_id: member.id,
        gym_id: gyms[i % 3].id,
        created_at: faker.date.recent({ days: 7 }),
        validated_at: i % 2 === 0 ? faker.date.recent({ days: 7 }) : null,
      },
    })
  }

  // Create random check-ins for the fake users
  for (const user of users) {
    const checkInsCount = faker.number.int({ min: 0, max: 4 })
    for (let i = 0; i < checkInsCount; i++) {
      const gym = faker.helpers.arrayElement(gyms)
      await prisma.checkIn.create({
        data: {
          user_id: user.id,
          gym_id: gym.id,
          created_at: faker.date.recent({ days: 15 }),
          validated_at: faker.helpers.arrayElement([faker.date.recent({ days: 15 }), null]),
        },
      })
    }
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
