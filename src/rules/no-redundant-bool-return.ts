import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "redundantBoolReturn";

function returnedBool(stmt: TSESTree.Statement | undefined): boolean | null {
  if (stmt === undefined) {
    return null;
  }
  if (stmt.type !== AST_NODE_TYPES.ReturnStatement) {
    return null;
  }
  const arg = stmt.argument;
  if (arg === null || arg === undefined) {
    return null;
  }
  if (arg.type !== AST_NODE_TYPES.Literal) {
    return null;
  }
  if (typeof arg.value !== "boolean") {
    return null;
  }
  return arg.value;
}

function firstStatementOfBranch(branch: TSESTree.Statement): TSESTree.Statement {
  if (branch.type === AST_NODE_TYPES.BlockStatement && branch.body.length === 1) {
    return branch.body[0] as TSESTree.Statement;
  }
  return branch;
}

export const noRedundantBoolReturn = createRule<[], MessageIds>({
  name: "no-redundant-bool-return",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Forbid `if (c) return true; return false;` patterns; return the boolean expression directly.",
    },
    messages: {
      redundantBoolReturn:
        "Redundant boolean return — replace with `return (!?)cond` directly.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkIf(node: TSESTree.IfStatement): void {
      const consequent = firstStatementOfBranch(node.consequent);
      const consBool = returnedBool(consequent);
      if (consBool === null) {
        return;
      }
      let altBool: boolean | null = null;
      if (node.alternate !== null && node.alternate !== undefined) {
        const alt = firstStatementOfBranch(node.alternate);
        altBool = returnedBool(alt);
      } else {
        const parent = node.parent;
        if (
          parent.type === AST_NODE_TYPES.BlockStatement ||
          parent.type === AST_NODE_TYPES.Program
        ) {
          const body = parent.body as readonly TSESTree.Statement[];
          const idx = body.indexOf(node);
          if (idx >= 0 && idx < body.length - 1) {
            altBool = returnedBool(body[idx + 1]);
          }
        }
      }
      if (altBool === null) {
        return;
      }
      if (consBool === altBool) {
        return;
      }
      context.report({ node, messageId: "redundantBoolReturn" });
    }
    return { IfStatement: checkIf };
  },
});
