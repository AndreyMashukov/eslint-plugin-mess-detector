import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noRedundantBoolReturn } from "../../src/rules/no-redundant-bool-return.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-redundant-bool-return", noRedundantBoolReturn, {
  valid: [
    { code: "function f(x: number) { return x > 0; }" },
    { code: "function f(x: number) { if (x > 0) { return 1; } return 0; }" },
    { code: "function f(x: number) { if (x > 0) { return true; } return true; }" },
    { code: "function f(x: number) { if (x > 0) { doStuff(); return false; } return true; }" },
    { code: "function f(x: number) { if (x > 0) { return true; } else { doStuff(); return false; } }" },
    { code: "function f(x: number) { if (x > 0) { return true; } }" },
  ],
  invalid: [
    {
      code: "function f(x: number) { if (x > 0) { return true; } return false; }",
      errors: [{ messageId: "redundantBoolReturn" }],
    },
    {
      code: "function f(x: number) { if (x > 0) { return false; } return true; }",
      errors: [{ messageId: "redundantBoolReturn" }],
    },
    {
      code: "function f(x: number) { if (x > 0) return true; return false; }",
      errors: [{ messageId: "redundantBoolReturn" }],
    },
    {
      code: "function f(x: number) { if (x > 0) { return true; } else { return false; } }",
      errors: [{ messageId: "redundantBoolReturn" }],
    },
    {
      code: "function f(x: number) { if (x > 0) return true; else return false; }",
      errors: [{ messageId: "redundantBoolReturn" }],
    },
    {
      code: "const f = (x: number): boolean => { if (x > 0) { return true; } return false; };",
      errors: [{ messageId: "redundantBoolReturn" }],
    },
  ],
});
