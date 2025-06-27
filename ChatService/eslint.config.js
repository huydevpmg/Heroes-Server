// eslint.config.js
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2022,      
      sourceType: 'module',
    },
    rules: {
      curly: ['error', 'all'],
      'no-console': 'on',
    },
  },
]);
