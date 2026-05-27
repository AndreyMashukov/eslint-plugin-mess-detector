import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type Options = readonly [{ allowJSDocOnInnerDeclarations?: boolean }];
type MessageIds = "inlineNarration";

interface BodyRange {
  start: number;
  end: number;
}

function isSuppressionLike(value: string): boolean {
  const trimmed = value.replace(/^[!/*\s]+/, "");
  return (
    /^eslint-(disable|enable)\b/i.test(trimmed) ||
    /^@ts-(ignore|expect-error|nocheck|check)\b/.test(trimmed) ||
    /^biome-ignore\b/i.test(trimmed) ||
    /^prettier-ignore\b/i.test(trimmed) ||
    /^(TODO|FIXME|XXX|HACK)\b/i.test(trimmed)
  );
}

function isInnerDeclaration(node: TSESTree.Node | undefined): boolean {
  if (node === undefined) {
    return false;
  }
  return (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.VariableDeclaration ||
    node.type === AST_NODE_TYPES.ClassDeclaration
  );
}

export const noInlineNarration = createRule<Options, MessageIds>({
  name: "no-inline-narration",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Forbid comments inside function bodies; explain via clear naming, not prose.",
    },
    messages: {
      inlineNarration:
        "Inline comment inside function body — explain via clear naming, not prose.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          allowJSDocOnInnerDeclarations: { type: "boolean" },
        },
      },
    ],
  },
  defaultOptions: [{ allowJSDocOnInnerDeclarations: true }],
  create(context, [opts]) {
    const allowJSDoc = opts.allowJSDocOnInnerDeclarations !== false;
    const ranges: BodyRange[] = [];

    function recordBody(body: TSESTree.Node | null | undefined): void {
      if (body === null || body === undefined) {
        return;
      }
      if (body.type !== AST_NODE_TYPES.BlockStatement) {
        return;
      }
      ranges.push({ start: body.range[0], end: body.range[1] });
    }

    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
        recordBody(node.body);
      },
      FunctionExpression(node: TSESTree.FunctionExpression): void {
        recordBody(node.body);
      },
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void {
        if (node.body.type === AST_NODE_TYPES.BlockStatement) {
          recordBody(node.body);
        }
      },
      "Program:exit"(): void {
        if (ranges.length === 0) {
          return;
        }
        const comments = context.sourceCode.getAllComments();
        for (const comment of comments) {
          const inside = ranges.some(
            (r) => comment.range[0] > r.start && comment.range[1] < r.end,
          );
          if (!inside) {
            continue;
          }
          if (isSuppressionLike(comment.value)) {
            continue;
          }
          if (
            allowJSDoc &&
            comment.type === AST_TOKEN_TYPES.Block &&
            comment.value.startsWith("*")
          ) {
            const token = context.sourceCode.getTokenAfter(comment);
            if (token !== null) {
              let node = context.sourceCode.getNodeByRangeIndex(token.range[0]);
              while (node !== null && node.range[0] !== token.range[0]) {
                node = node.parent ?? null;
              }
              if (isInnerDeclaration(node ?? undefined)) {
                continue;
              }
            }
          }
          context.report({
            loc: (comment as TSESTree.Comment).loc,
            messageId: "inlineNarration",
          });
        }
      },
    };
  },
});
