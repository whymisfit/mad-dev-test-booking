import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { eslintBoundariesConfig } from './eslint.boundaries.mjs';
import { cwd } from 'process';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierConfig from './prettier.config.js';

const project = './tsconfig.json';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project,
                tsconfigRootDir: cwd(),
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            indent: 'off',
            semi: ['error', 'always'],
            curly: 'error',
            'no-console': 'error',
            'no-useless-rename': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react/jsx-props-no-spreading': 0,
            'react/react-in-jsx-scope': 0,
            'react/prop-types': 'off',
            'react/jsx-curly-brace-presence': 'error',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@next/next/no-duplicate-head': 'off',
            // '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-empty-object-type': [
                'error',
                {
                    allowInterfaces: 'always',
                },
            ],
            'prettier/prettier': ['error', prettierConfig],
        },
    },
    {
        ignores: ['node_modules', 'apps/admin/.next', 'apps/client/.next'],
    },

    eslintBoundariesConfig,
]);

export default eslintConfig;
