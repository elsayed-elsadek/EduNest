import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules', 'node_modules_broken']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Application code must log through `src/utils/logger.ts`, which is the
      // single module allowed to touch `console.*` (see the override below).
      // `logger` is a no-op in production builds.
      'no-console': 'error',
      // jsx-a11y is enabled project-wide, but these seven rules are reported as
      // warnings until the markup remediation tracked in FE-022 lands. They fire
      // on ~248 existing elements; fixing them is accessibility remediation, not
      // code cleanup. Promote each rule to 'error' as FE-022 closes it out.
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    },
  },
  {
    // The logger is the single permitted console sink; everything else must
    // route through it so production builds stay silent and values are
    // sanitised before they reach DevTools.
    files: ['src/utils/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
])
