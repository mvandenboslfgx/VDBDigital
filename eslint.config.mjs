import js from "@eslint/js";
import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import securityPlugin from "eslint-plugin-security";
import sonarjsPlugin from "eslint-plugin-sonarjs";

const sonarjsRecommendedWarn = {
  ...sonarjsPlugin.configs.recommended,
  rules: Object.fromEntries(
    Object.entries(sonarjsPlugin.configs.recommended.rules ?? {}).map(([k, v]) => [
      k,
      v === "error" || v === 2 ? "warn" : v,
    ])
  ),
};

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "out/**",
      "coverage/**",
      "tsconfig.tsbuildinfo",
      "prisma/migrations/**",
    ],
  },
  js.configs.recommended,
  securityPlugin.configs.recommended,
  // SonarJS: downgrade errors → warnings until triaged (CI still runs eslint; -max-warnings optional).
  sonarjsRecommendedWarn,
  // Build scripts walk the repo tree — non-literal fs paths are expected.
  {
    files: ["scripts/**/*.js"],
    rules: {
      "security/detect-non-literal-fs-filename": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...(nextPlugin.configs.recommended?.rules ?? {}),
      ...(reactHooksPlugin.configs.recommended?.rules ?? {}),
      // This repo relies on TypeScript for unused/undef checks and uses the
      // modern JSX transform (no need for `import React`).
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // Avoid noisy/over-strict React purity rules in app/router code.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];

