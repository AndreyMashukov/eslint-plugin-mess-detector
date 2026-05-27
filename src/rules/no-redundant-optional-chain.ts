import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import * as ts from "typescript";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "redundantOptionalChain";

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

export const noRedundantOptionalChain = createRule<[], MessageIds>({
  name: "no-redundant-optional-chain",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid optional chaining (?.) on a value whose type admits neither null nor undefined.",
    },
    messages: {
      redundantOptionalChain:
        "Redundant optional chain — the receiver's type admits neither null nor undefined.",
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
    function checkOptionalLink(
      receiver: TSESTree.Node,
      reportNode: TSESTree.Node,
    ): void {
      const tsNode = services!.esTreeNodeToTSNodeMap.get(receiver);
      const type = checker.getTypeAtLocation(tsNode);
      if (typeAdmitsNullish(type)) {
        return;
      }
      context.report({ node: reportNode, messageId: "redundantOptionalChain" });
    }
    return {
      "MemberExpression[optional=true]"(node: TSESTree.MemberExpression): void {
        checkOptionalLink(node.object, node);
      },
      "CallExpression[optional=true]"(node: TSESTree.CallExpression): void {
        checkOptionalLink(node.callee, node);
      },
    };
  },
});
