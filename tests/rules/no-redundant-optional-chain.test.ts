import * as path from "node:path";

import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noRedundantOptionalChain } from "../../src/rules/no-redundant-optional-chain.js";

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

ruleTester.run("no-redundant-optional-chain", noRedundantOptionalChain, {
  valid: [
    {
      code: "function f(x: { id: number } | null) { return x?.id; }",
    },
    {
      code: "function f(x: { id: number } | undefined) { return x?.id; }",
    },
    {
      code: "function f(x: { id?: number }) { return x.id; }",
    },
    {
      code: "function f(x: { fn?: () => number }) { return x.fn?.(); }",
    },
    {
      code: "function f(x: unknown) { return (x as { id: number } | undefined)?.id; }",
    },
    {
      code: "function f(x: { id: number }) { return x.id; }",
    },
    {
      code: "function f(x: { a?: { b: number } }) { return x.a?.b; }",
    },
  ],
  invalid: [
    {
      code: "function f(x: { id: number }) { return x?.id; }",
      errors: [{ messageId: "redundantOptionalChain" }],
    },
    {
      code: "function f(x: { fn: () => number }) { return x.fn?.(); }",
      errors: [{ messageId: "redundantOptionalChain" }],
    },
    {
      code: "function f(x: string) { return x?.length; }",
      errors: [{ messageId: "redundantOptionalChain" }],
    },
    {
      code: "function f(x: { a: { b: number } }) { return x.a?.b; }",
      errors: [{ messageId: "redundantOptionalChain" }],
    },
    {
      code: "function f(xs: number[]) { return xs?.length; }",
      errors: [{ messageId: "redundantOptionalChain" }],
    },
    {
      code: "function f(x: { id: number }) { return x?.['id']; }",
      errors: [{ messageId: "redundantOptionalChain" }],
    },
  ],
});
