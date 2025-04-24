import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    plugins: {
      '@typescript-eslint': typescript,
    },
    files: ['packages/ui/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        document: true,
        window: true,
        navigator: true,
        localStorage: true,
        fetch: true,
        speechSynthesis: true,
        console: true,
        JSX: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
    },
  },
  {
    files: ['packages/ui/vite.config.js'],
    languageOptions: {
      globals: {
        __dirname: true,
      },
    },
  },
  {
    plugins: {
      '@typescript-eslint': typescript,
    },
    files: ['packages/server/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        process: true,
        console: true,
        __dirname: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
    },
  }, {
    plugins: {
      '@typescript-eslint': typescript,
    },
    files: ['shared/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        console: true,
        fetch: true,
        localStorage: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
    },
  },
  prettier,
]