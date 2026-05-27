import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noTypeOnlyAssertion } from "../../src/rules/no-type-only-assertion.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-type-only-assertion", noTypeOnlyAssertion, {
  valid: [
    {
      code: "expect(x).toEqual({ id: 7, name: 'Alice' });",
      filename: "tests/foo.test.ts",
    },
    {
      code: "expect(x).toBe(42);",
      filename: "src/foo.test.ts",
    },
    {
      code: "expect(x).toBeDefined();",
      filename: "src/foo.ts",
    },
    {
      code: "expect(x).toBeInstanceOf(Date);",
      filename: "src/handler.ts",
    },
    {
      code: "expect(x).toHaveLength(3);",
      filename: "tests/foo.test.ts",
    },
    {
      code: "obj.toBeNull();",
      filename: "tests/foo.test.ts",
    },
  ],
  invalid: [
    {
      code: "expect(x).toBeDefined();",
      filename: "tests/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeDefined" } },
      ],
    },
    {
      code: "expect(x).toBeNull();",
      filename: "src/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeNull" } },
      ],
    },
    {
      code: "expect(x).toBeTruthy();",
      filename: "tests/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeTruthy" } },
      ],
    },
    {
      code: "expect(x).toBeInstanceOf(Date);",
      filename: "tests/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeInstanceOf" } },
      ],
    },
    {
      code: "expect(x).not.toBeNull();",
      filename: "tests/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeNull" } },
      ],
    },
    {
      code: "await expect(p).resolves.toBeDefined();",
      filename: "tests/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeDefined" } },
      ],
    },
    {
      code: "expect(x).toBeUndefined();",
      filename: "tests/foo.test.ts",
      errors: [
        { messageId: "typeOnlyAssertion", data: { matcher: "toBeUndefined" } },
      ],
    },
  ],
});
