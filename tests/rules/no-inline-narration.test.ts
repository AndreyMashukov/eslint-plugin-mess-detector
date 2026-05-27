import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noInlineNarration } from "../../src/rules/no-inline-narration.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  linterOptions: { reportUnusedDisableDirectives: "off" },
});

ruleTester.run("no-inline-narration", noInlineNarration, {
  valid: [
    { code: "// top-level comment is fine\nfunction f() { return 1; }" },
    { code: "/** JSDoc above the function */\nfunction f() { return 1; }" },
    { code: "function f() { return 1; }" },
    {
      code: "function f() {\n  // TODO leftover marker handled by no-todo\n  return 1;\n}",
    },
    {
      code: "function f() {\n  // @ts-expect-error narrowing\n  return 1;\n}",
    },
    {
      code: "function f() {\n  // eslint-disable-next-line semi\n  return 1;\n}",
    },
    {
      code: "function outer() {\n  /** inner doc */\n  function inner() { return 1; }\n  return inner();\n}",
    },
  ],
  invalid: [
    {
      code: "function f() {\n  // step one\n  return 1;\n}",
      errors: [{ messageId: "inlineNarration" }],
    },
    {
      code: "function f() {\n  /* describe what we do */\n  return 1;\n}",
      errors: [{ messageId: "inlineNarration" }],
    },
    {
      code: "const f = () => {\n  // narration in arrow body\n  return 1;\n};",
      errors: [{ messageId: "inlineNarration" }],
    },
    {
      code: "class C { m() {\n  // narration in method body\n  return 1;\n} }",
      errors: [{ messageId: "inlineNarration" }],
    },
    {
      code: "function f() {\n  let x = 1;\n  // narrate the math\n  return x + 1;\n}",
      errors: [{ messageId: "inlineNarration" }],
    },
    {
      code: "function f() {\n  /** prose docblock floating in body */\n  return 1;\n}",
      options: [{ allowJSDocOnInnerDeclarations: true }],
      errors: [{ messageId: "inlineNarration" }],
    },
    {
      code: "function outer() {\n  /** docblock then unrelated expression */\n  foo();\n  function inner() { return 1; }\n  return inner();\n}",
      errors: [{ messageId: "inlineNarration" }],
    },
  ],
});
