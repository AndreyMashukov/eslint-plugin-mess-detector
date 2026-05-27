import { ESLintUtils } from "@typescript-eslint/utils";
import { minimatch } from "minimatch";

export interface RuleDocMeta {
  description: string;
}

export const createRule = ESLintUtils.RuleCreator<RuleDocMeta>(
  (name) =>
    `https://github.com/AndreyMashukov/eslint-plugin-mess-detector/blob/main/docs/rules/${name}.md`,
);

export function matchesGlob(filename: string, patterns: readonly string[]): boolean {
  const normalized = filename.replace(/\\/g, "/");
  for (const pattern of patterns) {
    if (minimatch(normalized, pattern, { matchBase: true, dot: true })) {
      return true;
    }
  }
  return false;
}

const TEST_GLOBS: readonly string[] = [
  "**/*.test.{ts,tsx,js,jsx,mjs,cjs}",
  "**/*.spec.{ts,tsx,js,jsx,mjs,cjs}",
  "**/tests/**",
  "**/__tests__/**",
];

export function isTestFile(filename: string): boolean {
  return matchesGlob(filename, TEST_GLOBS);
}
