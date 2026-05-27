import type { TSESTree } from "@typescript-eslint/utils";
import { AST_TOKEN_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "todoMarker";

const MARKERS = ["TODO", "FIXME", "XXX", "HACK"] as const;

function openingMarker(commentValue: string): string | null {
  let text = commentValue;
  text = text.replace(/^[!/*\s]+/, "");
  text = text.trimStart();
  for (const marker of MARKERS) {
    if (text.length < marker.length) {
      continue;
    }
    const head = text.slice(0, marker.length);
    if (head.toUpperCase() !== marker) {
      continue;
    }
    const next = text.charAt(marker.length);
    if (next === "" || !/[A-Za-z0-9]/.test(next)) {
      return marker;
    }
  }
  return null;
}

export const noTodo = createRule<[], MessageIds>({
  name: "no-todo",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid TODO/FIXME/XXX/HACK markers outright; implement the work now or track it in an issue.",
    },
    messages: {
      todoMarker:
        "{{marker}} marker is forbidden — implement it now or track it in an issue; do not leave a stub.",
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
          const marker = openingMarker(comment.value);
          if (marker !== null) {
            context.report({
              loc: (comment as TSESTree.Comment).loc,
              messageId: "todoMarker",
              data: { marker },
            });
          }
        }
      },
    };
  },
});
