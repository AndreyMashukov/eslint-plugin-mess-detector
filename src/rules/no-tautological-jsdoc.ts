import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from "@typescript-eslint/utils";

import { createRule } from "../utils/create-rule.js";

type MessageIds = "tautologicalJSDoc";

const STOP_WORDS: ReadonlySet<string> = new Set([
  "a", "an", "the", "of", "to",
  "for", "with", "from", "and", "or",
  "is", "returns", "return", "gets", "get",
  "sets", "set", "this", "function", "it",
  "new",
]);

function splitWords(s: string): string[] {
  const words: string[] = [];
  for (const line of s.split("\n")) {
    let cur = "";
    for (const ch of line) {
      const isWord = /[A-Za-z0-9]/.test(ch);
      if (isWord) {
        cur += ch;
      } else if (cur !== "") {
        words.push(cur);
        cur = "";
      }
    }
    if (cur !== "") {
      words.push(cur);
    }
  }
  return words;
}

function splitCamel(name: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (let i = 0; i < name.length; i++) {
    const ch = name.charAt(i);
    const isUpper = ch >= "A" && ch <= "Z";
    if (i > 0 && isUpper && current.length > 0) {
      parts.push(current.toLowerCase());
      current = "";
    }
    current += ch;
  }
  if (current.length > 0) {
    parts.push(current.toLowerCase());
  }
  return parts;
}

function containsToken(tokens: readonly string[], w: string): boolean {
  return tokens.includes(w);
}

function isVerbForm(tokens: readonly string[], w: string): boolean {
  for (const t of tokens) {
    if (t + "s" === w) return true;
    if (t + "es" === w) return true;
    if (t + "ed" === w) return true;
    if (t + "d" === w) return true;
    if (t + "ing" === w) return true;
    if (t.length > 1 && t.endsWith("e") && t.slice(0, -1) + "ing" === w) {
      return true;
    }
    if (t.length > 1 && t.endsWith("y") && t.slice(0, -1) + "ies" === w) {
      return true;
    }
  }
  return false;
}

function stripJSDocProse(value: string): string {
  const lines: string[] = [];
  for (const raw of value.split("\n")) {
    const line = raw.replace(/^\s*\*+\s?/, "");
    const trimmed = line.trim();
    if (trimmed.startsWith("@")) {
      break;
    }
    lines.push(line);
  }
  return lines.join("\n").trim();
}

function isTautological(name: string, docText: string): boolean {
  const text = docText.trim();
  if (text === "") {
    return false;
  }
  const words = splitWords(text);
  if (words.length === 0) {
    return false;
  }
  const first = words[0];
  if (first === undefined) {
    return false;
  }
  if (first.toLowerCase() !== name.toLowerCase()) {
    return false;
  }
  const rest = words.slice(1);
  const nameTokens = splitCamel(name);
  const meaningful: string[] = [];
  for (const w of rest) {
    const lw = w.toLowerCase();
    if (STOP_WORDS.has(lw)) {
      continue;
    }
    if (containsToken(nameTokens, lw)) {
      continue;
    }
    if (isVerbForm(nameTokens, lw)) {
      continue;
    }
    meaningful.push(lw);
  }
  return meaningful.length <= 2;
}

function exportedName(node: TSESTree.Node): string | null {
  if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    const decl = node.declaration;
    if (decl === null) {
      return null;
    }
    if (decl.type === AST_NODE_TYPES.FunctionDeclaration) {
      return decl.id?.name ?? null;
    }
    if (decl.type === AST_NODE_TYPES.VariableDeclaration) {
      const first = decl.declarations.at(0);
      if (first !== undefined && first.id.type === AST_NODE_TYPES.Identifier) {
        return first.id.name;
      }
    }
    if (decl.type === AST_NODE_TYPES.ClassDeclaration) {
      return decl.id?.name ?? null;
    }
  }
  if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
    const d = node.declaration;
    if (d.type === AST_NODE_TYPES.FunctionDeclaration) {
      return d.id?.name ?? "default";
    }
    if (d.type === AST_NODE_TYPES.ClassDeclaration) {
      return d.id?.name ?? "default";
    }
    if (d.type === AST_NODE_TYPES.Identifier) {
      return d.name;
    }
    return "default";
  }
  return null;
}

export const noTautologicalJSDoc = createRule<[], MessageIds>({
  name: "no-tautological-jsdoc",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Forbid JSDoc that tautologically restates the function or constant name; describe behaviour or omit.",
    },
    messages: {
      tautologicalJSDoc:
        "JSDoc tautologically restates the name `{{name}}` — describe behaviour or omit the comment.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function leadingBlockComment(
      node: TSESTree.Node,
    ): TSESTree.BlockComment | null {
      const before = context.sourceCode.getCommentsBefore(node);
      for (let i = before.length - 1; i >= 0; i--) {
        const c = before[i];
        if (c === undefined) {
          continue;
        }
        if (c.type !== AST_TOKEN_TYPES.Block) {
          continue;
        }
        if (!c.value.startsWith("*")) {
          continue;
        }
        return c;
      }
      return null;
    }

    function check(node: TSESTree.Node): void {
      const name = exportedName(node);
      if (name === null) {
        return;
      }
      const jsdoc = leadingBlockComment(node);
      if (jsdoc === null) {
        return;
      }
      const prose = stripJSDocProse(jsdoc.value);
      if (isTautological(name, prose)) {
        context.report({
          loc: jsdoc.loc,
          messageId: "tautologicalJSDoc",
          data: { name },
        });
      }
    }
    return {
      ExportNamedDeclaration: check,
      ExportDefaultDeclaration: check,
    };
  },
});
