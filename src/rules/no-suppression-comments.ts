import type { TSESTree } from "@typescript-eslint/utils";
import { AST_TOKEN_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "suppression";

const PATTERNS: ReadonlyArray<{ re: RegExp; label: string }> = [
  { re: /^\s*eslint-disable(?:-next-line|-line)?\b/i, label: "eslint-disable" },
  { re: /^\s*eslint-enable\b/i, label: "eslint-enable" },
  { re: /^\s*@ts-ignore\b/, label: "@ts-ignore" },
  { re: /^\s*@ts-expect-error\b/, label: "@ts-expect-error" },
  { re: /^\s*@ts-nocheck\b/, label: "@ts-nocheck" },
  { re: /^\s*@ts-check\b/, label: "@ts-check" },
  { re: /^\s*biome-ignore\b/i, label: "biome-ignore" },
  { re: /^\s*prettier-ignore\b/i, label: "prettier-ignore" },
];

function matchSuppression(value: string): string | null {
  for (const { re, label } of PATTERNS) {
    if (re.test(value)) {
      return label;
    }
  }
  return null;
}

export const noSuppressionComments = createRule<[], MessageIds>({
  name: "no-suppression-comments",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid linter and type-checker suppression comments; fix the underlying issue or remove the rule project-wide.",
    },
    messages: {
      suppression:
        "{{kind}} suppression is forbidden — fix the underlying issue or drop the rule project-wide.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      "Program:exit"(): void {
        const comments = context.sourceCode.getAllComments();
        for (const comment of comments) {
          if (
            comment.type !== AST_TOKEN_TYPES.Line &&
            comment.type !== AST_TOKEN_TYPES.Block
          ) {
            continue;
          }
          const kind = matchSuppression(comment.value);
          if (kind !== null) {
            context.report({
              loc: (comment as TSESTree.Comment).loc,
              messageId: "suppression",
              data: { kind },
            });
          }
        }
      },
    };
  },
});
