import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noTodo } from "../../src/rules/no-todo.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-todo", noTodo, {
  valid: [
    { code: "const x = 1;" },
    { code: "// see the migration backlog for the pooled-client switch" },
    { code: "// the word TODO appears mid-sentence and should be fine" },
    { code: "/* documentation about FIXME markers in a longer comment */" },
    { code: "// TODOIST is not the marker; alnum continuation is allowed" },
    { code: "// hackneyed prose with the word hack inside" },
  ],
  invalid: [
    {
      code: "// TODO fix later",
      errors: [{ messageId: "todoMarker", data: { marker: "TODO" } }],
    },
    {
      code: "// FIXME: broken",
      errors: [{ messageId: "todoMarker", data: { marker: "FIXME" } }],
    },
    {
      code: "//XXX hack",
      errors: [{ messageId: "todoMarker", data: { marker: "XXX" } }],
    },
    {
      code: "/* HACK reason */",
      errors: [{ messageId: "todoMarker", data: { marker: "HACK" } }],
    },
    {
      code: "// todo lowercase still counts",
      errors: [{ messageId: "todoMarker", data: { marker: "TODO" } }],
    },
    {
      code: "// TODO(@alice): switch to pooled client once PROJ-123 lands",
      errors: [{ messageId: "todoMarker", data: { marker: "TODO" } }],
    },
    {
      code: "/**\n * TODO: revisit\n */\nfunction f() {}",
      errors: [{ messageId: "todoMarker", data: { marker: "TODO" } }],
    },
  ],
});
