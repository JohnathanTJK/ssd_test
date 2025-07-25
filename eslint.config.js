import js from "@eslint/js";
import globals from "globals";
import security from "eslint-plugin-security";
import securityNode from "eslint-plugin-security-node";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
      },
    },
    plugins: {
      js,
      security,
      "security-node": securityNode,
      "no-unsanitized": noUnsanitized,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...security.configs.recommended.rules,
      ...securityNode.configs.recommended.rules,
      ...noUnsanitized.configs.recommended.rules, 
      // Manually enable rules from no-unsanitized plugin
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },
]);
