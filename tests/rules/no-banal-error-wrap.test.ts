import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noBanalErrorWrap } from "../../src/rules/no-banal-error-wrap.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-banal-error-wrap", noBanalErrorWrap, {
  valid: [
    { code: "function f() { throw new Error('user 42 not found in shard 3'); }" },
    {
      code: "function f(err: Error) { throw new Error('rate limit exceeded', { cause: err }); }",
    },
    {
      code: "function f(err: Error) { throw new Error(`request failed at ${url} for user ${userId}: ${err.message}`); }",
    },
    {
      code: "function f() { return new Error('failed to'); }",
    },
    {
      code: "function f() { console.error('failed to fetch'); }",
    },
    {
      code: "function f(err: Error) { throw err; }",
    },
  ],
  invalid: [
    {
      code: "function f() { throw new Error('failed to fetch'); }",
      errors: [{ messageId: "banalErrorWrap" }],
    },
    {
      code: "function f() { throw new Error('cannot parse'); }",
      errors: [{ messageId: "banalErrorWrap" }],
    },
    {
      code: "function f() { throw new Error('unable to connect'); }",
      errors: [{ messageId: "banalErrorWrap" }],
    },
    {
      code: "function f(err: Error) { throw new Error(`failed to fetch: ${err.message}`); }",
      errors: [{ messageId: "banalErrorWrap" }],
    },
    {
      code: "function f(err: Error) { throw new Error(`could not parse: ${err.message}.`); }",
      errors: [{ messageId: "banalErrorWrap" }],
    },
    {
      code: "function f() { throw new Error('error reading'); }",
      errors: [{ messageId: "banalErrorWrap" }],
    },
  ],
});
