import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                React: 'readonly',
                JSX: 'readonly',
                console: 'readonly',
                process: 'readonly',
                fetch: 'readonly',
                FormData: 'readonly',
                Headers: 'readonly',
                Request: 'readonly',
                Response: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                document: 'readonly',
                window: 'readonly',
                HTMLElement: 'readonly',
                MouseEvent: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
            prettier: prettier,
            react: react,
            'react-hooks': reactHooks,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...typescript.configs.recommended.rules,
            ...prettierConfig.rules,
            ...reactHooks.configs.recommended.rules,
            'prettier/prettier': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
    {
        ignores: [
            'node_modules/',
            '.pnpm-store/',
            '.next/',
            'out/',
            'build/',
            'coverage/',
            '*.min.js',
            '*.min.css',
            'pnpm-lock.yaml',
            'next-env.d.ts',
        ],
    },
]
