import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import prettierPlugin from "eslint-plugin-prettier"
import eslintConfigPrettier from "eslint-config-prettier"

export default [
	{
		ignores: ["dist", "node_modules"],
	},
	{
		files: ["**/*.{ts}"],
		...js.configs.recommended,
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tseslint.parser,
			globals: globals.node,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			prettier: prettierPlugin,
		},
		rules: {
			"no-undef": "off",
			"no-unused-vars": "off",

			...js.configs.recommended.rules,
			...tseslint.configs.recommended.rules,

			"prettier/prettier": ["error", { endOfLine: "auto" }],

			"@typescript-eslint/no-empty-object-type": "warn",
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
			"@typescript-eslint/no-empty-object-type": "warn",

			"no-console": ["warn", { allow: ["warn", "error", "info"] }],
			"no-process-exit": "warn",
			"no-sync": "warn",
		},
	},
	eslintConfigPrettier,
]
