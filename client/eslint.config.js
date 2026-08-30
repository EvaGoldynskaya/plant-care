import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import prettierPlugin from "eslint-plugin-prettier"
import eslintConfigPrettier from "eslint-config-prettier"

export default [
	{
		ignores: ["dist", "node_modules"],
	},
	{
		files: ["**/*.{ts,tsx}"],
		...js.configs.recommended,
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tseslint.parser,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			prettier: prettierPlugin,
		},
		rules: {
			"no-undef": "off",

			...js.configs.recommended.rules,
			...tseslint.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			"prettier/prettier": ["error", { endOfLine: "auto" }],
			"no-unused-vars": "off",
			...tseslint.configs.recommended.rules,
			"@typescript-eslint/no-empty-object-type": "warn",
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
	eslintConfigPrettier,
]
