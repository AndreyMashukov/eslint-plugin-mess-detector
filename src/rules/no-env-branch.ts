import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "envBranch";

const ENV_STRINGS: ReadonlySet<string> = new Set([
  "prod",
  "production",
  "dev",
  "development",
  "test",
  "testing",
  "stage",
  "staging",
  "local",
]);

const ENV_OPS: ReadonlySet<string> = new Set(["==", "===", "!=", "!=="]);

function isEnvLiteral(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.Literal) {
    return false;
  }
  return typeof node.value === "string" && ENV_STRINGS.has(node.value);
}

function isNodeEnvAccess(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  const inner = node.object;
  if (inner.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (
    inner.object.type !== AST_NODE_TYPES.Identifier ||
    inner.object.name !== "process"
  ) {
    return false;
  }
  const envProp = inner.property;
  return (
    (envProp.type === AST_NODE_TYPES.Identifier && envProp.name === "env") ||
    (envProp.type === AST_NODE_TYPES.Literal && envProp.value === "env")
  );
}

export const noEnvBranch = createRule<[], MessageIds>({
  name: "no-env-branch",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid runtime branching on environment strings; gate behaviour at the config / DI layer instead.",
    },
    messages: {
      envBranch:
        "Runtime branching on environment string — gate behaviour at the config or DI layer instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkComparison(node: TSESTree.BinaryExpression): void {
      if (!ENV_OPS.has(node.operator)) {
        return;
      }
      const envLiteral =
        isEnvLiteral(node.left) || isEnvLiteral(node.right);
      const envAccess =
        isNodeEnvAccess(node.left) || isNodeEnvAccess(node.right);
      if (envLiteral || envAccess) {
        context.report({ node, messageId: "envBranch" });
      }
    }
    function checkSwitchTest(test: TSESTree.Expression | null): void {
      if (test === null) {
        return;
      }
      if (isEnvLiteral(test)) {
        context.report({ node: test, messageId: "envBranch" });
      }
    }
    return {
      BinaryExpression: checkComparison,
      SwitchCase(node: TSESTree.SwitchCase): void {
        checkSwitchTest(node.test);
      },
    };
  },
});
