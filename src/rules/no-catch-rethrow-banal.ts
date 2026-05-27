import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "catchRethrow";

function caughtBindingName(node: TSESTree.CatchClause): string | null {
  const param = node.param;
  if (param === null) {
    return null;
  }
  if (param.type !== AST_NODE_TYPES.Identifier) {
    return null;
  }
  return param.name;
}

function isMessageOf(node: TSESTree.Node, bindingName: string): boolean {
  if (node.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (node.computed) {
    return false;
  }
  if (
    node.object.type !== AST_NODE_TYPES.Identifier ||
    node.object.name !== bindingName
  ) {
    return false;
  }
  return (
    node.property.type === AST_NODE_TYPES.Identifier &&
    node.property.name === "message"
  );
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

function templateUsesOnlyMessageOf(
  node: TSESTree.TemplateLiteral,
  bindingName: string,
): boolean {
  if (node.expressions.length === 0) {
    return false;
  }
  for (const expr of node.expressions) {
    if (!isMessageOf(expr, bindingName)) {
      return false;
    }
  }
  return true;
}

export const noCatchRethrowBanal = createRule<[], MessageIds>({
  name: "no-catch-rethrow-banal",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid catch (e) { throw new Error(e.message) } — re-throw the original error.",
    },
    messages: {
      catchRethrow:
        "Catch + re-throw of new Error(e.message) — re-throw the original error or wrap with { cause: e }.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CatchClause(node: TSESTree.CatchClause): void {
        const binding = caughtBindingName(node);
        if (binding === null) {
          return;
        }
        const body = node.body.body;
        if (body.length !== 1) {
          return;
        }
        const stmt = body[0];
        if (stmt === undefined) {
          return;
        }
        if (stmt.type !== AST_NODE_TYPES.ThrowStatement) {
          return;
        }
        const thrown = stmt.argument;
        if (thrown.type !== AST_NODE_TYPES.NewExpression) {
          return;
        }
        if (
          thrown.callee.type !== AST_NODE_TYPES.Identifier ||
          thrown.callee.name !== "Error"
        ) {
          return;
        }
        if (hasCauseOption(thrown.arguments)) {
          return;
        }
        if (thrown.arguments.length === 0) {
          return;
        }
        const first = thrown.arguments[0];
        if (first === undefined) {
          return;
        }
        const banal =
          isMessageOf(first, binding) ||
          (first.type === AST_NODE_TYPES.TemplateLiteral &&
            templateUsesOnlyMessageOf(first, binding));
        if (banal) {
          context.report({ node: thrown, messageId: "catchRethrow" });
        }
      },
    };
  },
});
