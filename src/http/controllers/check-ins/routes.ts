import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { create } from './create'
import { history } from './history'
import { metrics } from './metrics'
import { validate } from './validate'

const checkInSchema = z.object({
  id: z.string().uuid().meta({ example: '42013f9c-76e9-4e7a-9a67-c25e4c6c06bf' }),
  created_at: z.union([z.string(), z.date()]).meta({ example: '2026-05-19T09:44:38.000Z' }),
  validated_at: z.union([z.string(), z.date()]).nullable().meta({ example: null }),
  user_id: z.string().uuid().meta({ example: 'd3b07384-d113-4956-a5db-e179e8df1c3d' }),
  gym_id: z.string().uuid().meta({ example: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4' }),
}).meta({
  example: {
    id: '42013f9c-76e9-4e7a-9a67-c25e4c6c06bf',
    created_at: '2026-05-19T09:44:38.000Z',
    validated_at: null,
    user_id: 'd3b07384-d113-4956-a5db-e179e8df1c3d',
    gym_id: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4',
  },
})

export async function checkInsRoutes(app: FastifyInstance) {
  const appTyped = app.withTypeProvider<ZodTypeProvider>()

  appTyped.addHook('onRequest', verifyJwt)

  appTyped.get(
    '/check-ins/history',
    {
      schema: {
        tags: ['Check-Ins'],
        summary: 'Get check-in history for current user',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          page: z.coerce.number().min(1).default(1).meta({ example: 1 }),
        }).meta({
          example: {
            page: 1,
          },
        }),
        response: {
          200: z.object({
            checkIns: z.array(checkInSchema),
          }).describe('List of user check-ins').meta({
            example: {
              checkIns: [
                {
                  id: '42013f9c-76e9-4e7a-9a67-c25e4c6c06bf',
                  created_at: '2026-05-19T09:44:38.000Z',
                  validated_at: null,
                  user_id: 'd3b07384-d113-4956-a5db-e179e8df1c3d',
                  gym_id: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4',
                },
              ],
            },
          }),
        },
      },
    },
    history,
  )

  appTyped.get(
    '/check-ins/metrics',
    {
      schema: {
        tags: ['Check-Ins'],
        summary: 'Get check-in metrics (total count) for current user',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            checkInsCount: z.number().meta({ example: 15 }),
          }).describe('Total number of check-ins').meta({
            example: {
              checkInsCount: 15,
            },
          }),
        },
      },
    },
    metrics,
  )

  appTyped.post(
    '/gyms/:gymId/check-ins',
    {
      schema: {
        tags: ['Check-Ins'],
        summary: 'Create a new check-in at a gym',
        security: [{ bearerAuth: [] }],
        params: z.object({
          gymId: z.string().uuid().meta({ example: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4' }),
        }).meta({
          example: {
            gymId: 'c41f6920-56b0-4dbb-b271-8608e6db9fb4',
          },
        }),
        body: z.object({
          latitude: z.number().refine((value) => {
            return Math.abs(value) <= 90
          }).meta({ example: -27.2092052 }),
          longitude: z.number().refine((value) => {
            return Math.abs(value) <= 180
          }).meta({ example: -49.6401091 }),
        }).meta({
          example: {
            latitude: -27.2092052,
            longitude: -49.6401091,
          },
        }),
        response: {
          201: z.null().describe('Check-in created successfully'),
        },
      },
    },
    create,
  )

  appTyped.patch(
    '/check-ins/:checkInId/validate',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Check-Ins'],
        summary: 'Validate a user check-in (Admin only)',
        security: [{ bearerAuth: [] }],
        params: z.object({
          checkInId: z.string().uuid().meta({ example: '42013f9c-76e9-4e7a-9a67-c25e4c6c06bf' }),
        }).meta({
          example: {
            checkInId: '42013f9c-76e9-4e7a-9a67-c25e4c6c06bf',
          },
        }),
        response: {
          204: z.null().describe('Check-in validated successfully'),
        },
      },
    },
    validate,
  )
}
