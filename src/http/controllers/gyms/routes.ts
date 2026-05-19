import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { create } from './create'
import { nearby } from './nearby'
import { search } from './search'

const gymSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  latitude: z.union([z.string(), z.number()]),
  longitude: z.union([z.string(), z.number()]),
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
          q: z.string().describe('Search query (e.g. gym name)'),
          page: z.coerce.number().min(1).default(1),
        }),
        response: {
          200: z.object({
            gyms: z.array(gymSchema),
          }).describe('Gyms search results'),
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
          }),
          longitude: z.coerce.number().refine((value) => {
            return Math.abs(value) <= 180
          }),
        }),
        response: {
          200: z.object({
            gyms: z.array(gymSchema),
          }).describe('Nearby gyms results'),
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
          title: z.string(),
          description: z.string().nullable(),
          phone: z.string().nullable(),
          latitude: z.number().refine((value) => {
            return Math.abs(value) <= 90
          }),
          longitude: z.number().refine((value) => {
            return Math.abs(value) <= 180
          }),
        }),
        response: {
          201: z.null().describe('Gym created successfully'),
        },
      },
    },
    create,
  )
}
