import type { TSESLint } from "@typescript-eslint/utils";

import { noBanalErrorWrap } from "./rules/no-banal-error-wrap.js";
import { noCatchRethrowBanal } from "./rules/no-catch-rethrow-banal.js";
import { noDirectDateNow } from "./rules/no-direct-date-now.js";
import { noEnvBranch } from "./rules/no-env-branch.js";
import { noInlineNarration } from "./rules/no-inline-narration.js";
import { noProcessEnvOutsideConfig } from "./rules/no-process-env-outside-config.js";
import { noRedundantBoolReturn } from "./rules/no-redundant-bool-return.js";
import { noSuppressionComments } from "./rules/no-suppression-comments.js";
import { noTautologicalJSDoc } from "./rules/no-tautological-jsdoc.js";
import { noTodo } from "./rules/no-todo.js";
import { noTypeOnlyAssertion } from "./rules/no-type-only-assertion.js";

const PLUGIN_NAME = "mess-detector";
const PLUGIN_VERSION = "0.1.0";

const rules = {
  "no-banal-error-wrap": noBanalErrorWrap,
  "no-catch-rethrow-banal": noCatchRethrowBanal,
  "no-direct-date-now": noDirectDateNow,
  "no-env-branch": noEnvBranch,
  "no-inline-narration": noInlineNarration,
  "no-process-env-outside-config": noProcessEnvOutsideConfig,
  "no-redundant-bool-return": noRedundantBoolReturn,
  "no-suppression-comments": noSuppressionComments,
  "no-tautological-jsdoc": noTautologicalJSDoc,
  "no-todo": noTodo,
  "no-type-only-assertion": noTypeOnlyAssertion,
} as const satisfies Record<string, TSESLint.RuleModule<string, readonly unknown[]>>;

const RECOMMENDED_RULE_NAMES: readonly string[] = [
  "no-banal-error-wrap",
  "no-catch-rethrow-banal",
  "no-direct-date-now",
  "no-env-branch",
  "no-inline-narration",
  "no-process-env-outside-config",
  "no-redundant-bool-return",
  "no-suppression-comments",
  "no-tautological-jsdoc",
  "no-todo",
  "no-type-only-assertion",
];
const TYPED_ONLY_RULE_NAMES: readonly string[] = [];

function toRuleMap(names: readonly string[]): Record<string, TSESLint.Linter.RuleEntry> {
  const out: Record<string, TSESLint.Linter.RuleEntry> = {};
  for (const n of names) {
    out[`${PLUGIN_NAME}/${n}`] = "error";
  }
  return out;
}

const meta = {
  name: "eslint-plugin-mess-detector",
  version: PLUGIN_VERSION,
} as const;

const plugin = {
  meta,
  rules,
  configs: {} as {
    recommended: TSESLint.FlatConfig.Config;
    "recommended-typed": TSESLint.FlatConfig.Config;
  },
};

plugin.configs.recommended = {
  name: `${PLUGIN_NAME}/recommended`,
  plugins: { [PLUGIN_NAME]: plugin },
  rules: toRuleMap(RECOMMENDED_RULE_NAMES),
};

plugin.configs["recommended-typed"] = {
  name: `${PLUGIN_NAME}/recommended-typed`,
  plugins: { [PLUGIN_NAME]: plugin },
  rules: toRuleMap([...RECOMMENDED_RULE_NAMES, ...TYPED_ONLY_RULE_NAMES]),
};

export { rules };
export const configs = plugin.configs;
export default plugin;
