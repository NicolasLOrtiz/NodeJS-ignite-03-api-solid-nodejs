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
  id: z.string().uuid(),
  created_at: z.union([z.string(), z.date()]),
  validated_at: z.union([z.string(), z.date()]).nullable(),
  user_id: z.string().uuid(),
  gym_id: z.string().uuid(),
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
          page: z.coerce.number().min(1).default(1),
        }),
        response: {
          200: z.object({
            checkIns: z.array(checkInSchema),
          }).describe('List of user check-ins'),
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
            checkInsCount: z.number(),
          }).describe('Total number of check-ins'),
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
          gymId: z.string().uuid(),
        }),
        body: z.object({
          latitude: z.number().refine((value) => {
            return Math.abs(value) <= 90
          }),
          longitude: z.number().refine((value) => {
            return Math.abs(value) <= 180
          }),
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
          checkInId: z.string().uuid(),
        }),
        response: {
          204: z.null().describe('Check-in validated successfully'),
        },
      },
    },
    validate,
  )
}
