import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "nullishCoalesce" | "nullishAssign" | "falsyCoalesce";

function isLiteralRhs(node: TSESTree.Expression): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
    case AST_NODE_TYPES.ArrayExpression:
    case AST_NODE_TYPES.ObjectExpression:
      return true;
    case AST_NODE_TYPES.TemplateLiteral:
      return node.expressions.length === 0;
    case AST_NODE_TYPES.Identifier:
      return node.name === "undefined";
    case AST_NODE_TYPES.UnaryExpression:
      return node.operator === "void";
    default:
      return false;
  }
}

export const noSilentFallback = createRule<[], MessageIds>({
  name: "no-silent-fallback",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid silent fallbacks for missing values: `??`, `??=`, and `||` with a falsy-literal default. Missing values should crash at the call site or be validated at the boundary — not be papered over with a hidden default.",
    },
    messages: {
      nullishCoalesce:
        "Nullish-coalescing fallback (??) hides a missing value — validate at the boundary or let it crash.",
      nullishAssign:
        "Nullish-coalescing assignment (??=) hides a missing value — assign explicitly after an existence check or let it crash.",
      falsyCoalesce:
        "`||` with a literal default hides a missing value — declare the default explicitly (function/destructuring default) or let it crash.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      "LogicalExpression[operator='??']"(
        node: TSESTree.LogicalExpression,
      ): void {
        context.report({ node, messageId: "nullishCoalesce" });
      },
      "AssignmentExpression[operator='??=']"(
        node: TSESTree.AssignmentExpression,
      ): void {
        context.report({ node, messageId: "nullishAssign" });
      },
      "LogicalExpression[operator='||']"(
        node: TSESTree.LogicalExpression,
      ): void {
        if (isLiteralRhs(node.right)) {
          context.report({ node, messageId: "falsyCoalesce" });
        }
      },
    };
  },
});
