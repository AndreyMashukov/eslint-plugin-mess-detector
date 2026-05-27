import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { createRule, isTestFile } from "../utils/create-rule.js";

type Options = readonly [{ matchers?: readonly string[]; expectIdentifiers?: readonly string[] }];
type MessageIds = "typeOnlyAssertion";

const DEFAULT_MATCHERS: readonly string[] = [
  "toBeNull",
  "toBeUndefined",
  "toBeDefined",
  "toBeTruthy",
  "toBeFalsy",
  "toBeNaN",
  "toBeInstanceOf",
  "toBeTypeOf",
  "toBeObject",
  "toBeArray",
  "toBeString",
  "toBeNumber",
  "toBeBoolean",
  "toBeFunction",
  "toBeEmpty",
  "toExist",
];

const DEFAULT_EXPECT_IDENTIFIERS: readonly string[] = ["expect", "expectTypeOf"];
const CHAIN_PROPS: ReadonlySet<string> = new Set(["not", "resolves", "rejects"]);

function unwrapChain(
  node: TSESTree.Node,
): { root: TSESTree.Node; tail: string | null } {
  let current: TSESTree.Node = node;
  let tail: string | null = null;
  if (current.type === AST_NODE_TYPES.MemberExpression && !current.computed) {
    if (current.property.type === AST_NODE_TYPES.Identifier) {
      tail = current.property.name;
    }
    current = current.object;
  }
  while (
    current.type === AST_NODE_TYPES.MemberExpression &&
    !current.computed &&
    current.property.type === AST_NODE_TYPES.Identifier &&
    CHAIN_PROPS.has(current.property.name)
  ) {
    current = current.object;
  }
  return { root: current, tail };
}

function isExpectCall(node: TSESTree.Node, idents: ReadonlySet<string>): boolean {
  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }
  if (node.callee.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }
  return idents.has(node.callee.name);
}

export const noTypeOnlyAssertion = createRule<Options, MessageIds>({
  name: "no-type-only-assertion",
  meta: {
    type: "problem",
    docs: {
      description:
        "Forbid type-/existence-only test assertions; pin the actual expected value with .toEqual / .toBe.",
    },
    messages: {
      typeOnlyAssertion:
        "Type-only test assertion `{{matcher}}` — pin the actual expected value with .toEqual or .toBe.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          matchers: { type: "array", items: { type: "string" }, uniqueItems: true },
          expectIdentifiers: { type: "array", items: { type: "string" }, uniqueItems: true },
        },
      },
    ],
  },
  defaultOptions: [
    { matchers: DEFAULT_MATCHERS, expectIdentifiers: DEFAULT_EXPECT_IDENTIFIERS },
  ],
  create(context, [opts]) {
    if (!isTestFile(context.filename)) {
      return {};
    }
    const {
      matchers: matcherList = DEFAULT_MATCHERS,
      expectIdentifiers: identList = DEFAULT_EXPECT_IDENTIFIERS,
    } = opts;
    const matchers = new Set(matcherList);
    const idents = new Set(identList);
    return {
      CallExpression(node: TSESTree.CallExpression): void {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }
        if (node.callee.computed) {
          return;
        }
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        const matcher = node.callee.property.name;
        if (!matchers.has(matcher)) {
          return;
        }
        const { root } = unwrapChain(node.callee);
        if (!isExpectCall(root, idents)) {
          return;
        }
        context.report({
          node,
          messageId: "typeOnlyAssertion",
          data: { matcher },
        });
      },
    };
  },
});
