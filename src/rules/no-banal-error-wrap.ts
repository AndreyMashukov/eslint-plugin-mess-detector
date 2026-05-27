import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "banalErrorWrap";

const BANAL_RE = /^\s*(failed to|error|cannot|could not|unable to)\s+\w+:?\s*$/i;

function isErrorIdent(node: TSESTree.Node): boolean {
  return node.type === AST_NODE_TYPES.Identifier && node.name === "Error";
}

function hasCauseOption(args: TSESTree.CallExpressionArgument[]): boolean {
  if (args.length < 2) {
    return false;
  }
  const opts = args[1];
  if (opts === undefined || opts.type !== AST_NODE_TYPES.ObjectExpression) {
    return false;
  }
  for (const p of opts.properties) {
    if (p.type !== AST_NODE_TYPES.Property) {
      continue;
    }
    if (
      (p.key.type === AST_NODE_TYPES.Identifier && p.key.name === "cause") ||
      (p.key.type === AST_NODE_TYPES.Literal && p.key.value === "cause")
    ) {
      return true;
    }
  }
  return false;
}

function isBanalStringLiteral(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.Literal) {
    return false;
  }
  if (typeof node.value !== "string") {
    return false;
  }
  return BANAL_RE.test(node.value);
}

function isBanalTemplate(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.TemplateLiteral) {
    return false;
  }
  if (node.expressions.length === 0) {
    if (node.quasis.length === 1) {
      const q = node.quasis[0];
      if (q !== undefined && q.value.cooked !== null) {
        return BANAL_RE.test(q.value.cooked);
      }
    }
    return false;
  }
  if (node.expressions.length !== 1) {
    return false;
  }
  const first = node.quasis[0];
  const second = node.quasis[1];
  if (first === undefined || second === undefined) {
    return false;
  }
  if (first.value.cooked === null || second.value.cooked === null) {
    return false;
  }
  if (!BANAL_RE.test(first.value.cooked)) {
    return false;
  }
  const trailing = second.value.cooked.trim();
  if (trailing !== "" && trailing !== ".") {
    return false;
  }
  const expr = node.expressions[0];
  if (expr === undefined) {
    return false;
  }
  if (expr.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (expr.computed) {
    return false;
  }
  return (
    expr.property.type === AST_NODE_TYPES.Identifier &&
    expr.property.name === "message"
  );
}

export const noBanalErrorWrap = createRule<[], MessageIds>({
  name: "no-banal-error-wrap",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid throw new Error('failed to X' [+ err.message]) wrappers that add no context.",
    },
    messages: {
      banalErrorWrap:
        "Banal Error wrapper without added context — re-throw the original error or add concrete context.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      "ThrowStatement > NewExpression"(node: TSESTree.NewExpression): void {
        if (!isErrorIdent(node.callee)) {
          return;
        }
        if (node.arguments.length === 0) {
          return;
        }
        const first = node.arguments[0];
        if (first === undefined) {
          return;
        }
        if (hasCauseOption(node.arguments)) {
          return;
        }
        if (isBanalStringLiteral(first) || isBanalTemplate(first)) {
          context.report({ node, messageId: "banalErrorWrap" });
        }
      },
    };
  },
});
