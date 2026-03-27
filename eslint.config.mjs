import { defineConfig } from "eslint/config";

export default defineConfig({
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
});
