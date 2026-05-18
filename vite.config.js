import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    projects: [
      {
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: 'unit',
          include: ['src/use-cases/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: 'e2e',
          include: ['src/http/controllers/**/*.spec.ts'],
          environment: './prisma/vitest-environment-prisma/prisma-test-environment.ts',
        },
      },
    ],
  },
})
