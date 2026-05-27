import * as path from "node:path";

import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noDeadNullishGuard } from "../../src/rules/no-dead-nullish-guard.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const FIXTURES = path.resolve(__dirname, "..", "fixtures");

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.test.json",
      tsconfigRootDir: FIXTURES,
    },
  },
});

ruleTester.run("no-dead-nullish-guard", noDeadNullishGuard, {
  valid: [
    {
      code: "function f(x: string | null) { if (x === null) { return; } }",
    },
    {
      code: "function f(x: string | undefined) { if (x === undefined) { return; } }",
    },
    {
      code: "function f(x: string | null | undefined) { if (x === null) { return; } }",
    },
    {
      code: "function f(x: unknown) { if (x === null) { return; } }",
    },
    {
      code: "function f(x: any) { if (x === undefined) { return; } }",
    },
    {
      code: "function f(x: string | null) { if (x == null) { return; } }",
    },
  ],
  invalid: [
    {
      code: "function f(x: number) { if (x === null) { return; } }",
      errors: [{ messageId: "deadNullishGuard" }],
    },
    {
      code: "function f(x: string) { if (x === undefined) { return; } }",
      errors: [{ messageId: "deadNullishGuard" }],
    },
    {
      code: "function f(x: boolean) { if (null === x) { return; } }",
      errors: [{ messageId: "deadNullishGuard" }],
    },
    {
      code: "function f(x: number) { return x !== null; }",
      errors: [{ messageId: "deadNullishGuard" }],
    },
    {
      code: "function f(x: { id: number }) { if (x.id === undefined) { return; } }",
      errors: [{ messageId: "deadNullishGuard" }],
    },
    {
      code: "function f(x: number[]) { for (const item of x) { if (item === null) { return; } } }",
      errors: [{ messageId: "deadNullishGuard" }],
    },
  ],
});
