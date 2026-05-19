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
          name: z.string().meta({ example: 'John Doe' }),
          email: z.email().meta({ example: 'johndoe@example.com' }),
          password: z.string().min(6).meta({ example: 'password123' }),
        }).meta({
          example: {
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'password123',
          },
        }),
        response: {
          201: z.null().describe('User created successfully'),
          409: z.object({
            message: z.string().meta({ example: 'Email already registered' }),
          }).describe('Email already registered').meta({
            example: {
              message: 'Email already registered',
            },
          }),
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
          email: z.email().meta({ example: 'johndoe@example.com' }),
          password: z.string().min(6).meta({ example: 'password123' }),
        }).meta({
          example: {
            email: 'johndoe@example.com',
            password: 'password123',
          },
        }),
        response: {
          200: z.object({
            token: z.string().meta({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2IwNzM4NC1kMTEzLTQ5NTYtYTVkYi1lMTc5ZThkZjFjM2QiLCJpYXQiOjE3MTU5NzAwMDAsImV4cCI6MTcxNTk3MDYwMH0.signature' }),
          }).describe('Authentication successful').meta({
            example: {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2IwNzM4NC1kMTEzLTQ5NTYtYTVkYi1lMTc5ZThkZjFjM2QiLCJpYXQiOjE3MTU5NzAwMDAsImV4cCI6MTcxNTk3MDYwMH0.signature',
            },
          }),
          400: z.object({
            message: z.string().meta({ example: 'Invalid credentials.' }),
          }).describe('Invalid credentials').meta({
            example: {
              message: 'Invalid credentials.',
            },
          }),
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
            token: z.string().meta({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2IwNzM4NC1kMTEzLTQ5NTYtYTVkYi1lMTc5ZThkZjFjM2QiLCJpYXQiOjE3MTU5NzAwMDAsImV4cCI6MTcxNTk3MDYwMH0.signature' }),
          }).describe('Token refreshed successfully').meta({
            example: {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2IwNzM4NC1kMTEzLTQ5NTYtYTVkYi1lMTc5ZThkZjFjM2QiLCJpYXQiOjE3MTU5NzAwMDAsImV4cCI6MTcxNTk3MDYwMH0.signature',
            },
          }),
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
              id: z.string().uuid().meta({ example: 'd3b07384-d113-4956-a5db-e179e8df1c3d' }),
              name: z.string().meta({ example: 'John Doe' }),
              email: z.email().meta({ example: 'johndoe@example.com' }),
              role: z.enum(['ADMIN', 'MEMBER']).meta({ example: 'MEMBER' }),
              created_at: z.union([z.string(), z.date()]).meta({ example: '2026-05-19T09:44:38.000Z' }),
            }),
          }).describe('Profile retrieved successfully').meta({
            example: {
              user: {
                id: 'd3b07384-d113-4956-a5db-e179e8df1c3d',
                name: 'John Doe',
                email: 'johndoe@example.com',
                role: 'MEMBER',
                created_at: '2026-05-19T09:44:38.000Z',
              },
            },
          }),
        },
      },
    },
    profile,
  )
}
