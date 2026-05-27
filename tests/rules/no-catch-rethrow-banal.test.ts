import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noCatchRethrowBanal } from "../../src/rules/no-catch-rethrow-banal.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-catch-rethrow-banal", noCatchRethrowBanal, {
  valid: [
    {
      code: "function f() { try { g(); } catch (e) { throw e; } }",
    },
    {
      code: "function f() { try { g(); } catch (e) { throw new Error('rate limit hit', { cause: e }); } }",
    },
    {
      code: "function f() { try { g(); } catch (e) { log(e); throw e; } }",
    },
    {
      code: "function f() { try { g(); } catch (e) { throw new Error('user 42 not found in shard 3'); } }",
    },
    {
      code: "function f() { try { g(); } catch (e) { return null; } }",
    },
    {
      code: "function f() { try { g(); } catch (e) { throw new Error(`request to ${url}: ${e.message}`, { cause: e }); } }",
    },
  ],
  invalid: [
    {
      code: "function f() { try { g(); } catch (e) { throw new Error(e.message); } }",
      errors: [{ messageId: "catchRethrow" }],
    },
    {
      code: "function f() { try { g(); } catch (err) { throw new Error(err.message); } }",
      errors: [{ messageId: "catchRethrow" }],
    },
    {
      code: "function f() { try { g(); } catch (e) { throw new Error(`${e.message}`); } }",
      errors: [{ messageId: "catchRethrow" }],
    },
    {
      code: "async function f() { try { await g(); } catch (e) { throw new Error(e.message); } }",
      errors: [{ messageId: "catchRethrow" }],
    },
    {
      code: "function f() { try { g(); } catch (caught) { throw new Error(caught.message); } }",
      errors: [{ messageId: "catchRethrow" }],
    },
    {
      code: "function f() { try { g(); } catch (e) { throw new Error(`${e.message} - ${e.message}`); } }",
      errors: [{ messageId: "catchRethrow" }],
    },
  ],
});
