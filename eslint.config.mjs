import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,

  stylistic: {
    quotes: 'single',
    semi: false,
  },

  ignores: [
    'build',
    'node_modules',
    'prisma/generated',
    'src/generated',
    'prisma/migrations',
  ],

  rules: {
    'no-useless-constructor': 'off',
    'ts/no-useless-constructor': 'off',
    'node/prefer-global/process': 'off',
    'no-console': 'off',
    'unused-imports/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'antfu/if-newline': 'off',
    'ts/consistent-type-imports': 'off',
  },
})
