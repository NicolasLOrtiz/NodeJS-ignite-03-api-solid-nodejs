import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { verifyJwt } from '@/http/middlewares/verify-jwt'

import { authenticate } from './authenticate'
import { profile } from './profile'
import { refresh } from './refresh'
import { register } from './register'

export async function usersRoutes(app: FastifyInstance) {
  const appTyped = app.withTypeProvider<ZodTypeProvider>()

  appTyped.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Register a new user',
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.null().describe('User created successfully'),
          409: z.object({
            message: z.string(),
          }).describe('Email already registered'),
        },
      },
    },
    register,
  )

  appTyped.post(
    '/sessions',
    {
      schema: {
        tags: ['Users'],
        summary: 'Authenticate a user (Login)',
        body: z.object({
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }).describe('Authentication successful'),
          400: z.object({
            message: z.string(),
          }).describe('Invalid credentials'),
        },
      },
    },
    authenticate,
  )

  appTyped.patch(
    '/token/refresh',
    {
      schema: {
        tags: ['Users'],
        summary: 'Refresh authentication token',
        response: {
          200: z.object({
            token: z.string(),
          }).describe('Token refreshed successfully'),
        },
      },
    },
    refresh,
  )

  /** Authenticated */
  appTyped.get(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            user: z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.email(),
              role: z.enum(['ADMIN', 'MEMBER']),
              created_at: z.union([z.string(), z.date()]),
            }),
          }).describe('Profile retrieved successfully'),
        },
      },
    },
    profile,
  )
}
