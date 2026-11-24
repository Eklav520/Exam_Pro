import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const restrict = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'public/mockServiceWorker.js'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  // Layering: app -> features -> shared. Imports may only point "down".
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: restrict({
      group: ['@/app/*', '@/features/*', '@/mocks/*'],
      message: 'shared/ must not depend on app, features or mocks.',
    }),
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}'],
    rules: restrict(
      {
        group: ['@/app/*', '!@/app/hooks', '@/mocks/*'],
        message: 'Features may only import typed hooks/types from @/app/hooks.',
      },
      {
        group: ['@/features/*/*'],
        message: 'Import other features through their index.ts, e.g. @/features/auth.',
      },
    ),
  },
  {
    files: ['src/app/router/**', 'src/test/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  prettier,
);
