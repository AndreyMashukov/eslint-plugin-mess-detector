import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule, matchesGlob } from "../utils/create-rule.js";

type Options = readonly [{ allow?: readonly string[] }];
type MessageIds = "processEnv";

const DEFAULT_ALLOW: readonly string[] = [
  "**/config/**",
  "**/env/**",
  "**/*.config.{ts,tsx,js,jsx,mjs,cjs}",
  "**/env.{ts,js,mjs,cjs}",
];

function isProcessIdent(node: TSESTree.Expression | TSESTree.PrivateIdentifier): boolean {
  return node.type === AST_NODE_TYPES.Identifier && node.name === "process";
}

function isEnvProperty(node: TSESTree.MemberExpression): boolean {
  const prop = node.property;
  if (node.computed) {
    return prop.type === AST_NODE_TYPES.Literal && prop.value === "env";
  }
  return prop.type === AST_NODE_TYPES.Identifier && prop.name === "env";
}

export const noProcessEnvOutsideConfig = createRule<Options, MessageIds>({
  name: "no-process-env-outside-config",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid process.env reads outside config-layer files; centralize env access in one typed config module.",
    },
    messages: {
      processEnv:
        "process.env access outside the config layer — centralize env reads in one typed config module.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
      },
    ],
  },
  defaultOptions: [{ allow: DEFAULT_ALLOW }],
  create(context, [opts]) {
    const allow = opts.allow ?? DEFAULT_ALLOW;
    const filename = context.filename;
    if (matchesGlob(filename, allow)) {
      return {};
    }
    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (!isProcessIdent(node.object)) {
          return;
        }
        if (!isEnvProperty(node)) {
          return;
        }
        context.report({ node, messageId: "processEnv" });
      },
    };
  },
});
