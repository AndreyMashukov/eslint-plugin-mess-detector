import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noSilentFallback } from "../../src/rules/no-silent-fallback.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-silent-fallback", noSilentFallback, {
  valid: [
    { code: "const env = process.env.NODE_ENV;" },
    {
      code: "function load(env: string | undefined) { if (env === undefined) throw new Error('NODE_ENV is required'); return env; }",
    },
    { code: "const x = a && b;" },
    { code: "if (a || b) { run(); }" },
    { code: "const z = cond ? a : b;" },
    { code: "function f({ port = 8080 }: { port?: number }) { return port; }" },
    { code: "function f(env = 'dev') { return env; }" },
    { code: "const choice = primary || secondary;" },
    { code: "return user.isActive || user.isPending;" },
  ],
  invalid: [
    {
      code: "const env = process.env.NODE_ENV ?? 'dev';",
      errors: [{ messageId: "nullishCoalesce" }],
    },
    {
      code: "const port = config.port ?? 8080;",
      errors: [{ messageId: "nullishCoalesce" }],
    },
    {
      code: "return user?.name ?? 'anonymous';",
      errors: [{ messageId: "nullishCoalesce" }],
    },
    {
      code: "const items = data.items ?? [];",
      errors: [{ messageId: "nullishCoalesce" }],
    },
    {
      code: "const cfg = options ?? {};",
      errors: [{ messageId: "nullishCoalesce" }],
    },
    {
      code: "value ??= 'default';",
      errors: [{ messageId: "nullishAssign" }],
    },
    {
      code: "obj.field ??= computeDefault();",
      errors: [{ messageId: "nullishAssign" }],
    },
    {
      code: "const env = process.env.NODE_ENV || '';",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const name = user.name || 'anonymous';",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const port = config.port || 0;",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const items = data.items || [];",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const cfg = options || {};",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const flag = config.enabled || false;",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const value = obj.field || null;",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const value = obj.field || undefined;",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const value = obj.field || void 0;",
      errors: [{ messageId: "falsyCoalesce" }],
    },
    {
      code: "const value = obj.field || ``;",
      errors: [{ messageId: "falsyCoalesce" }],
    },
  ],
});
