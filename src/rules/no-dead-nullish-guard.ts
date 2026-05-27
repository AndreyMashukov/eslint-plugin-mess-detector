import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import * as ts from "typescript";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "deadNullishGuard";

const STRICT_OPS: ReadonlySet<string> = new Set(["===", "!=="]);

function isNullLiteral(node: TSESTree.Node): boolean {
  return node.type === AST_NODE_TYPES.Literal && node.value === null;
}

function isUndefinedIdentifier(
  node: TSESTree.Node,
  context: ReturnType<typeof createRule.prototype>,
): boolean {
  void context;
  return node.type === AST_NODE_TYPES.Identifier && node.name === "undefined";
}

function typeAdmitsNullish(type: ts.Type): boolean {
  const flags = type.getFlags();
  if (flags & ts.TypeFlags.Null) return true;
  if (flags & ts.TypeFlags.Undefined) return true;
  if (flags & ts.TypeFlags.Void) return true;
  if (flags & ts.TypeFlags.Any) return true;
  if (flags & ts.TypeFlags.Unknown) return true;
  if (type.isUnion()) {
    for (const sub of type.types) {
      if (typeAdmitsNullish(sub)) {
        return true;
      }
    }
  }
  return false;
}

export const noDeadNullishGuard = createRule<[], MessageIds>({
  name: "no-dead-nullish-guard",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid nullish guards on values whose static type admits neither null nor undefined.",
    },
    messages: {
      deadNullishGuard:
        "Dead nullish guard — the type of the checked expression admits neither null nor undefined.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let services: ReturnType<typeof ESLintUtils.getParserServices> | null = null;
    try {
      services = ESLintUtils.getParserServices(context);
    } catch {
      return {};
    }
    const checker = services.program.getTypeChecker();
    function check(node: TSESTree.BinaryExpression): void {
      if (!STRICT_OPS.has(node.operator)) {
        return;
      }
      let target: TSESTree.Expression | null = null;
      const left = node.left;
      const right = node.right;
      if (left.type === AST_NODE_TYPES.PrivateIdentifier) {
        return;
      }
      if (isNullLiteral(left) || isUndefinedIdentifier(left, context)) {
        target = right;
      } else if (isNullLiteral(right) || isUndefinedIdentifier(right, context)) {
        target = left;
      } else {
        return;
      }
      if (target === null) {
        return;
      }
      const tsNode = services!.esTreeNodeToTSNodeMap.get(target);
      if (tsNode === undefined) {
        return;
      }
      const type = checker.getTypeAtLocation(tsNode);
      if (typeAdmitsNullish(type)) {
        return;
      }
      context.report({ node, messageId: "deadNullishGuard" });
    }
    return {
      BinaryExpression: check,
    };
  },
});
