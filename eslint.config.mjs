import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', '.astro/', '.gemini/', '_dev/'],
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
      'react/react-in-jsx-scope': 'off', // Not needed in Astro/modern React
      'react/prop-types': 'off', // We use TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // Astro specific overrides
  {
    files: ["**/*.astro"],
    languageOptions: {
        parserOptions: {
            parser: tseslint.parser,
            extraFileExtensions: [".astro"],
            sourceType: "module"
        }
    }
  }
];
