import type { TSESLint } from "@typescript-eslint/utils";

import { noInlineNarration } from "./rules/no-inline-narration.js";
import { noProcessEnvOutsideConfig } from "./rules/no-process-env-outside-config.js";
import { noSuppressionComments } from "./rules/no-suppression-comments.js";
import { noTodo } from "./rules/no-todo.js";

const PLUGIN_NAME = "mess-detector";
const PLUGIN_VERSION = "0.1.0";

const rules = {
  "no-inline-narration": noInlineNarration,
  "no-process-env-outside-config": noProcessEnvOutsideConfig,
  "no-suppression-comments": noSuppressionComments,
  "no-todo": noTodo,
} as const satisfies Record<string, TSESLint.RuleModule<string, readonly unknown[]>>;

const RECOMMENDED_RULE_NAMES: readonly string[] = [
  "no-inline-narration",
  "no-process-env-outside-config",
  "no-suppression-comments",
  "no-todo",
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
