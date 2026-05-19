import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { create } from './create'
import { nearby } from './nearby'
import { search } from './search'

const gymSchema = z.object({
  id: z.string().uuid().meta({ example: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4' }),
  title: z.string().meta({ example: 'JavaScript Gym' }),
  description: z.string().nullable().meta({ example: 'Learn coding and lift weights' }),
  phone: z.string().nullable().meta({ example: '123456789' }),
  latitude: z.union([z.string(), z.number()]).meta({ example: -27.2092052 }),
  longitude: z.union([z.string(), z.number()]).meta({ example: -49.6401091 }),
}).meta({
  example: {
    id: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4',
    title: 'JavaScript Gym',
    description: 'Learn coding and lift weights',
    phone: '123456789',
    latitude: -27.2092052,
    longitude: -49.6401091,
  },
})

export async function gymsRoutes(app: FastifyInstance) {
  const appTyped = app.withTypeProvider<ZodTypeProvider>()

  appTyped.addHook('onRequest', verifyJwt)

  appTyped.get(
    '/gyms/search',
    {
      schema: {
        tags: ['Gyms'],
        summary: 'Search gyms by title',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          q: z.string().describe('Search query (e.g. gym name)').meta({ example: 'JavaScript' }),
          page: z.coerce.number().min(1).default(1).meta({ example: 1 }),
        }).meta({
          example: {
            q: 'JavaScript',
            page: 1,
          },
        }),
        response: {
          200: z.object({
            gyms: z.array(gymSchema),
          }).describe('Gyms search results').meta({
            example: {
              gyms: [
                {
                  id: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4',
                  title: 'JavaScript Gym',
                  description: 'Learn coding and lift weights',
                  phone: '123456789',
                  latitude: -27.2092052,
                  longitude: -49.6401091,
                },
              ],
            },
          }),
        },
      },
    },
    search,
  )

  appTyped.get(
    '/gyms/nearby',
    {
      schema: {
        tags: ['Gyms'],
        summary: 'Fetch gyms nearby (within 10km)',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          latitude: z.coerce.number().refine((value) => {
            return Math.abs(value) <= 90
          }).meta({ example: -27.2092052 }),
          longitude: z.coerce.number().refine((value) => {
            return Math.abs(value) <= 180
          }).meta({ example: -49.6401091 }),
        }).meta({
          example: {
            latitude: -27.2092052,
            longitude: -49.6401091,
          },
        }),
        response: {
          200: z.object({
            gyms: z.array(gymSchema),
          }).describe('Nearby gyms results').meta({
            example: {
              gyms: [
                {
                  id: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4',
                  title: 'JavaScript Gym',
                  description: 'Learn coding and lift weights',
                  phone: '123456789',
                  latitude: -27.2092052,
                  longitude: -49.6401091,
                },
              ],
            },
          }),
        },
      },
    },
    nearby,
  )

  appTyped.post(
    '/gyms',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Gyms'],
        summary: 'Create a new gym (Admin only)',
        security: [{ bearerAuth: [] }],
        body: z.object({
          title: z.string().meta({ example: 'TypeScript Gym' }),
          description: z.string().nullable().meta({ example: 'The best gym for typed code' }),
          phone: z.string().nullable().meta({ example: '987654321' }),
          latitude: z.number().refine((value) => {
            return Math.abs(value) <= 90
          }).meta({ example: -27.2092052 }),
          longitude: z.number().refine((value) => {
            return Math.abs(value) <= 180
          }).meta({ example: -49.6401091 }),
        }).meta({
          example: {
            title: 'TypeScript Gym',
            description: 'The best gym for typed code',
            phone: '987654321',
            latitude: -27.2092052,
            longitude: -49.6401091,
          },
        }),
        response: {
          201: z.null().describe('Gym created successfully'),
        },
      },
    },
    create,
  )
}
