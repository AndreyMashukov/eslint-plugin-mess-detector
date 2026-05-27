import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule, matchesGlob } from "../utils/create-rule.js";

type Options = readonly [
  { allow?: readonly string[]; ignorePerformanceNow?: boolean },
];
type MessageIds = "directClock";

const DEFAULT_ALLOW: readonly string[] = [
  "**/clock/**",
  "**/clock.{ts,tsx,js,jsx,mjs,cjs}",
  "**/*.setup.{ts,js,mjs,cjs}",
  "**/*.test.{ts,tsx,js,jsx,mjs,cjs}",
  "**/*.spec.{ts,tsx,js,jsx,mjs,cjs}",
  "**/tests/**",
  "**/__tests__/**",
];

function isCall(node: TSESTree.CallExpression, objectName: string, methodName: string): boolean {
  const callee = node.callee;
  if (callee.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (callee.computed) {
    return false;
  }
  if (
    callee.object.type !== AST_NODE_TYPES.Identifier ||
    callee.object.name !== objectName
  ) {
    return false;
  }
  if (
    callee.property.type !== AST_NODE_TYPES.Identifier ||
    callee.property.name !== methodName
  ) {
    return false;
  }
  return true;
}

function isNewDate(node: TSESTree.NewExpression): boolean {
  if (node.callee.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }
  if (node.callee.name !== "Date") {
    return false;
  }
  return node.arguments.length === 0;
}

export const noDirectDateNow = createRule<Options, MessageIds>({
  name: "no-direct-date-now",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid direct Date.now / new Date / performance.now in production code; inject a Clock interface instead.",
    },
    messages: {
      directClock:
        "Direct {{form}} in production code — inject a Clock interface and substitute a fake in tests.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          allow: { type: "array", items: { type: "string" }, uniqueItems: true },
          ignorePerformanceNow: { type: "boolean" },
        },
      },
    ],
  },
  defaultOptions: [{ allow: DEFAULT_ALLOW, ignorePerformanceNow: false }],
  create(context, [opts]) {
    const allow = opts.allow ?? DEFAULT_ALLOW;
    if (matchesGlob(context.filename, allow)) {
      return {};
    }
    const skipPerf = opts.ignorePerformanceNow === true;
    return {
      CallExpression(node: TSESTree.CallExpression): void {
        if (isCall(node, "Date", "now")) {
          context.report({ node, messageId: "directClock", data: { form: "Date.now()" } });
          return;
        }
        if (!skipPerf && isCall(node, "performance", "now")) {
          context.report({
            node,
            messageId: "directClock",
            data: { form: "performance.now()" },
          });
        }
      },
      NewExpression(node: TSESTree.NewExpression): void {
        if (isNewDate(node)) {
          context.report({
            node,
            messageId: "directClock",
            data: { form: "new Date()" },
          });
        }
      },
    };
  },
});
