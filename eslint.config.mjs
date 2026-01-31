import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import securityPlugin from 'eslint-plugin-security'

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '.gemini/',
      '_dev/',
      'coverage/',
      'quality-core/dashboard/dist/',
      'quality-core/dashboard/src/',
      'quality-core/dashboard/*.config.ts',
      'quality-core/dashboard/*.config.js',
      'quality-core/dashboard/vite.config.*',
      'quality-core/dashboard/vitest.config.*',
      'quality-core/dashboard/tailwind.config.*',
      'quality-core/dashboard/postcss.config.*',
      'quality-core/dashboard/eslint.config.*',
      '**/*.min.js',
      '**/*-minified.*',
    ],
  },

  // TypeScript configuration
  ...tseslint.configs.recommended,

  // Astro configuration
  ...eslintPluginAstro.configs.recommended,

  // React configuration
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      security: securityPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Define browser globals manually since we aren't using 'env' in flat config
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in Astro/modern React
      'react/prop-types': 'off', // We use TypeScript
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external', 'internal'],
            ['parent', 'sibling', 'index'],
          ],
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },

  // Astro specific overrides
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
      },
    },
  },

  // CommonJS files override - allow require()
  {
    files: ['**/*.cjs', 'quality-core/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',
      // Allow non-literal filenames in internal quality-core tools
      // where we have intentional dynamic path behavior
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
]
