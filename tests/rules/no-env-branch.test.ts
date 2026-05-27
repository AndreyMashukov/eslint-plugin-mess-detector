import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noEnvBranch } from "../../src/rules/no-env-branch.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-env-branch", noEnvBranch, {
  valid: [
    { code: "if (cfg.metricsEnabled) { enable(); }" },
    { code: "const x = 'prod';" },
    { code: "if (mode === 1) { foo(); }" },
    { code: "switch (status) { case 'ready': break; default: break; }" },
    { code: "if (env.length > 0) { foo(); }" },
    { code: "if (env === 'custom') { foo(); }" },
  ],
  invalid: [
    {
      code: "if (env === 'prod') { foo(); }",
      errors: [{ messageId: "envBranch" }],
    },
    {
      code: "if (env !== 'production') { foo(); }",
      errors: [{ messageId: "envBranch" }],
    },
    {
      code: "const isProd = env == 'prod';",
      errors: [{ messageId: "envBranch" }],
    },
    {
      code: "if (process.env.NODE_ENV === 'test') { foo(); }",
      errors: [{ messageId: "envBranch" }],
    },
    {
      code: "switch (env) { case 'dev': break; case 'staging': break; default: break; }",
      errors: [
        { messageId: "envBranch" },
        { messageId: "envBranch" },
      ],
    },
    {
      code: "if ('local' === env) { foo(); }",
      errors: [{ messageId: "envBranch" }],
    },
  ],
});
