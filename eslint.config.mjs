import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import json from '@eslint/json';
import prettierConfig from 'eslint-config-prettier/flat';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  {
    extends: ['js/recommended'],
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ignores: [],
    languageOptions: {
      parserOptions: {},
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
    },
    plugins: {
      js,
      vitest,
    },
    rules: {},
    settings: {},
  },
  {
    extends: ['json/recommended'],
    files: ['**/*.json'],
    ignores: ['package-lock.json'],
    language: 'json/json',
    plugins: {
      json,
    },
  },
  // Prettier configuration
  prettierConfig,
]);
