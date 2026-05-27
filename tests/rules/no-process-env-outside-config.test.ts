import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noProcessEnvOutsideConfig } from "../../src/rules/no-process-env-outside-config.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-process-env-outside-config", noProcessEnvOutsideConfig, {
  valid: [
    { code: "const x = 1;", filename: "src/lib/util.ts" },
    {
      code: "const url = process.env.DATABASE_URL;",
      filename: "src/config/db.ts",
    },
    {
      code: "const url = process.env.DATABASE_URL;",
      filename: "src/app.config.ts",
    },
    {
      code: "const url = process.env['DATABASE_URL'];",
      filename: "config/db.ts",
    },
    {
      code: "const x = someOther.env.FOO;",
      filename: "src/lib/util.ts",
    },
    {
      code: "const fn = (process) => process.env;",
      filename: "src/config/util.ts",
    },
  ],
  invalid: [
    {
      code: "const url = process.env.DATABASE_URL;",
      filename: "src/lib/db.ts",
      errors: [{ messageId: "processEnv" }],
    },
    {
      code: "function f() { return process.env.NODE_ENV; }",
      filename: "src/handler.ts",
      errors: [{ messageId: "processEnv" }],
    },
    {
      code: "const url = process.env['DATABASE_URL'];",
      filename: "src/handler.ts",
      errors: [{ messageId: "processEnv" }],
    },
    {
      code: "if (process.env.DEBUG) { console.log('on'); }",
      filename: "src/index.ts",
      errors: [{ messageId: "processEnv" }],
    },
    {
      code: "export const cfg = { url: process.env.URL };",
      filename: "src/lib/cfg.ts",
      errors: [{ messageId: "processEnv" }],
    },
    {
      code: "const v = process['env'].FOO;",
      filename: "src/lib/util.ts",
      errors: [{ messageId: "processEnv" }],
    },
  ],
});
