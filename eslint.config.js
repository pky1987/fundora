import { defineConfig } from "eslint/config";

export default defineConfig([
  // ── Global ignores ───────────────────────────────────────────────────────
  // A config object with ONLY "ignores" is treated as a global ignore in
  // ESLint v9 flat config – files matched here are never processed at all,
  // including their own eslint.config.* files (fixes the eslint-config-next
  // ERR_MODULE_NOT_FOUND error that occurred when "frontend/**" was mixed
  // into a config object that also had other properties).
  {
    ignores: [
      "node_modules/**",
      "frontend/**",
      "artifacts/**",
      "cache/**",
      ".git/**",
      "*.d.ts",
    ],
  },

  // ── JavaScript files ─────────────────────────────────────────────────────
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
]);
