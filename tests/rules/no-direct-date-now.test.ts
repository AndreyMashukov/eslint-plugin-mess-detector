import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noDirectDateNow } from "../../src/rules/no-direct-date-now.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-direct-date-now", noDirectDateNow, {
  valid: [
    { code: "const t = clock.now();", filename: "src/lib/foo.ts" },
    { code: "const t = Date.now();", filename: "src/clock/system.ts" },
    { code: "const t = Date.now();", filename: "src/clock.ts" },
    { code: "const t = new Date();", filename: "tests/setup.ts" },
    { code: "const t = Date.now();", filename: "src/foo.test.ts" },
    {
      code: "const t = performance.now();",
      filename: "src/lib/util.ts",
      options: [{ ignorePerformanceNow: true }],
    },
    {
      code: "const t = new Date('2024-01-01');",
      filename: "src/lib/util.ts",
    },
  ],
  invalid: [
    {
      code: "const t = Date.now();",
      filename: "src/lib/util.ts",
      errors: [{ messageId: "directClock", data: { form: "Date.now()" } }],
    },
    {
      code: "function f() { return Date.now(); }",
      filename: "src/handler.ts",
      errors: [{ messageId: "directClock", data: { form: "Date.now()" } }],
    },
    {
      code: "const t = new Date();",
      filename: "src/handler.ts",
      errors: [{ messageId: "directClock", data: { form: "new Date()" } }],
    },
    {
      code: "const t = performance.now();",
      filename: "src/lib/util.ts",
      errors: [{ messageId: "directClock", data: { form: "performance.now()" } }],
    },
    {
      code: "if (Date.now() > 0) { foo(); }",
      filename: "src/lib/util.ts",
      errors: [{ messageId: "directClock", data: { form: "Date.now()" } }],
    },
    {
      code: "const x = { ts: Date.now() };",
      filename: "src/lib/util.ts",
      errors: [{ messageId: "directClock", data: { form: "Date.now()" } }],
    },
  ],
});
