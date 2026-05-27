import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noSuppressionComments } from "../../src/rules/no-suppression-comments.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  linterOptions: { reportUnusedDisableDirectives: "off" },
});

ruleTester.run("no-suppression-comments", noSuppressionComments, {
  valid: [
    { code: "const x = 1;" },
    { code: "// a plain prose comment" },
    { code: "/** JSDoc on something */ function f() {}" },
    { code: "// some text mentioning eslint configuration policy" },
    { code: "/* describes how @ts-expect-error works in docs */" },
    { code: "// the eslint binary lives in node_modules/.bin" },
  ],
  invalid: [
    {
      code: "// eslint-disable-next-line semi\nconst x = 1;",
      errors: [{ messageId: "suppression", data: { kind: "eslint-disable" } }],
    },
    {
      code: "// @ts-ignore\nconst x: number = 'a' as any;",
      errors: [{ messageId: "suppression", data: { kind: "@ts-ignore" } }],
    },
    {
      code: "// @ts-expect-error explanation\nconst x: number = 'a' as any;",
      errors: [{ messageId: "suppression", data: { kind: "@ts-expect-error" } }],
    },
    {
      code: "// @ts-nocheck\nconst x = 1;",
      errors: [{ messageId: "suppression", data: { kind: "@ts-nocheck" } }],
    },
    {
      code: "// @ts-check\nconst x = 1;",
      errors: [{ messageId: "suppression", data: { kind: "@ts-check" } }],
    },
    {
      code: "// biome-ignore lint/style/noVar: legacy\nvar x = 1;",
      errors: [{ messageId: "suppression", data: { kind: "biome-ignore" } }],
    },
    {
      code: "// prettier-ignore\nconst x = 1;",
      errors: [{ messageId: "suppression", data: { kind: "prettier-ignore" } }],
    },
  ],
});
