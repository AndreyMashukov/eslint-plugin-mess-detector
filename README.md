# @amashukov/eslint-plugin-mess-detector

[![CI](https://img.shields.io/github/actions/workflow/status/AndreyMashukov/eslint-plugin-mess-detector/ci.yml?branch=main&label=CI)](https://github.com/AndreyMashukov/eslint-plugin-mess-detector/actions)
[![npm](https://img.shields.io/npm/v/@amashukov/eslint-plugin-mess-detector)](https://www.npmjs.com/package/@amashukov/eslint-plugin-mess-detector)
[![License](https://img.shields.io/npm/l/@amashukov/eslint-plugin-mess-detector)](LICENSE)
[![Node](https://img.shields.io/node/v/@amashukov/eslint-plugin-mess-detector)](package.json)

ESLint plugin that **fails the build** on the low-signal patterns that bloat a TypeScript / JavaScript codebase: inline narration, suppression directives, defensive nullish guards, tautological JSDoc, banal `throw new Error(...)` wrappers, runtime environment branching, scattered `process.env` reads, direct `Date.now()`, type-only test assertions, and `TODO` / `FIXME` markers.

Counterpart of [`go-lint`](https://github.com/AndreyMashukov/go-lint) for Go and [`rector-php-rules`](https://github.com/AndreyMashukov/rector-php-rules) for PHP. Same philosophy, different syntax tree.

---

## Why

Low-effort code tends to drift in the same direction every time:

- Each line gets an inline `//` comment that paraphrases the line itself.
- Every exported function gets a JSDoc that restates its signature in English (`/** Add adds two numbers */`).
- `x == null` checks appear on values that, by their TypeScript type, can never be `null` or `undefined`.
- Tests assert `toBeDefined()`, `toBeTruthy()`, or `toBeInstanceOf(...)` — checks the type system already does — instead of pinning the actual value.
- Errors get wrapped in `throw new Error("failed to read: " + err.message)` — strictly worse than re-throwing the original because it lengthens the chain and drops the stack.
- `if (process.env.NODE_ENV === "production")` branches sneak into production code, creating divergent test- and prod-only paths.
- `// eslint-disable-next-line` appears next to anything the linter complained about.

This plugin is a single hard gate that flags every one of these in one pass. It does not autofix. The point is to make the human re-think the code, not regex it.

---

## Install

```bash
npm install --save-dev @amashukov/eslint-plugin-mess-detector
```

Requires ESLint v9+ and Node 22+. For the type-aware rules (`no-dead-nullish-guard`, `no-redundant-optional-chain`) you also need `@typescript-eslint/parser` with `parserOptions.project` set.

---

## Usage (flat config, ESLint v9)

### Plain (no type information)

```js
// eslint.config.js
import mess from "@amashukov/eslint-plugin-mess-detector";

export default [
  mess.configs.recommended,
];
```

This enables the 11 non-type-aware rules.

### With type information

```js
// eslint.config.js
import mess from "@amashukov/eslint-plugin-mess-detector";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  mess.configs["recommended-typed"],
];
```

This adds the two type-aware rules on top.

---

## Rules

| # | Rule | Type-aware | Catches |
|---|---|---|---|
| 1 | [`no-todo`](docs/rules/no-todo.md) | no | `TODO` / `FIXME` / `XXX` / `HACK` markers (owned or not) |
| 2 | [`no-suppression-comments`](docs/rules/no-suppression-comments.md) | no | `// eslint-disable*`, `// @ts-ignore`, `// @ts-expect-error`, `// @ts-nocheck` |
| 3 | [`no-inline-narration`](docs/rules/no-inline-narration.md) | no | comments inside function bodies |
| 4 | [`no-process-env-outside-config`](docs/rules/no-process-env-outside-config.md) | no | `process.env.X` outside `config/` and `*.config.*` files |
| 5 | [`no-env-branch`](docs/rules/no-env-branch.md) | no | runtime branching on `"prod"` / `"dev"` / `"test"` strings |
| 6 | [`no-direct-date-now`](docs/rules/no-direct-date-now.md) | no | `Date.now()`, `new Date()`, `performance.now()` outside `clock/` |
| 7 | [`no-redundant-bool-return`](docs/rules/no-redundant-bool-return.md) | no | `if (c) return true; return false;` |
| 8 | [`no-banal-error-wrap`](docs/rules/no-banal-error-wrap.md) | no | `throw new Error("failed to X: " + err.message)` |
| 9 | [`no-catch-rethrow-banal`](docs/rules/no-catch-rethrow-banal.md) | no | `catch (e) { throw new Error(e.message); }` |
| 10 | [`no-type-only-assertion`](docs/rules/no-type-only-assertion.md) | no | `expect(x).toBeDefined()` / `toBeInstanceOf(...)` etc. |
| 11 | [`no-tautological-jsdoc`](docs/rules/no-tautological-jsdoc.md) | no | JSDoc that restates the function name |
| 12 | [`no-dead-nullish-guard`](docs/rules/no-dead-nullish-guard.md) | **yes** | `x === null` on a type that admits neither `null` nor `undefined` |
| 13 | [`no-redundant-optional-chain`](docs/rules/no-redundant-optional-chain.md) | **yes** | `?.` on a type that admits neither `null` nor `undefined` |

---

## Configs

Two flat-config presets:

- `mess.configs.recommended` — rules 1–11. Works on plain ESLint without `parserOptions.project`.
- `mess.configs["recommended-typed"]` — `recommended` plus the two type-aware rules. Requires `@typescript-eslint/parser` with `parserOptions.project`.

---

## Overlap with widely-used plugins

Several of these patterns are partly covered elsewhere. This plugin keeps all 13 anyway because the value is "single hard gate, no plugin sprawl":

| Concern | Overlapping plugin / rule | This plugin |
|---|---|---|
| `TODO` / `FIXME` markers | core ESLint `no-warning-comments` (off by default, configurable) | `no-todo` (strict, no carve-outs) |
| `// eslint-disable*` directives | `eslint-plugin-eslint-comments/no-use` | `no-suppression-comments` (strict, also `@ts-*`) |
| Inline comments | core `no-inline-comments` (only same-line) | `no-inline-narration` (whole function body) |
| `process.env` | core `no-process-env` | `no-process-env-outside-config` (glob carve-out) |
| `if (cond) return true` | `eslint-plugin-sonarjs/prefer-single-boolean-return` | `no-redundant-bool-return` |
| `new Error(...)` content | `eslint-plugin-unicorn/error-message` | `no-banal-error-wrap` (banal-verb regex) |
| `// @ts-ignore` | `@typescript-eslint/ban-ts-comment` | rolled into `no-suppression-comments` |
| `?.` on non-nullable | `@typescript-eslint/no-unnecessary-condition` | `no-redundant-optional-chain` |
| `catch { throw ... }` | `@typescript-eslint/no-useless-catch` | `no-catch-rethrow-banal` (also flags message-only wrap) |

---

## Comparison with sibling repos

| Concern | [go-lint](https://github.com/AndreyMashukov/go-lint) | [rector-php-rules](https://github.com/AndreyMashukov/rector-php-rules) | eslint-plugin-mess-detector |
|---|---|---|---|
| Inline narration | `noinlinecomment` | `NoCommentsOutsideInterfaceMethodDocBlockRector` | `no-inline-narration` |
| Tautological doc | `norobotgodoc` | — | `no-tautological-jsdoc` |
| Suppression directives | `nolintdirective` | `NoPhpstanIgnoreRector` | `no-suppression-comments` |
| Env access outside config | `nogetenv` | `NoSuperglobalAccessRector` | `no-process-env-outside-config` |
| Env branching in src | `noenvbranch` | `NoEnvironmentCheckInSrcRector` | `no-env-branch` |
| Real-clock injection | `notimenow` | `RequirePsrClockInterfaceRector` | `no-direct-date-now` |
| Type-only test assertions | `notypeonlyassert` | `NoTypeOnlyAssertionsInTestsRector` | `no-type-only-assertion` |
| Banal error wrapping | `noerrorwrapbanality` | — | `no-banal-error-wrap` + `no-catch-rethrow-banal` |
| `TODO` / `FIXME` markers | `notodo` | `NoTodoCommentRector` | `no-todo` |
| `if cond return true` | `noredundantif` | — | `no-redundant-bool-return` |
| Nullish guard on non-nullable | `nodeadguard` | — | `no-dead-nullish-guard` |
| Redundant optional chain | — | — | `no-redundant-optional-chain` |

---

## Design notes

- **No configuration file beyond ESLint's own.** Each rule is either on or off via the flat-config block. Policy lives in `eslint.config.js`, not a side-car YAML.
- **No autofixers.** Most findings need restructuring, not a regex. The point is to make the human re-think the code.
- **No per-line waiver.** If a rule is wrong for your project, drop it from the config. Per-line `// eslint-disable` waivers turn into silent debt — and `no-suppression-comments` flags them anyway.
- **Self-hosted.** The plugin's own source is linted by its own `recommended-typed` config with zero findings.

---

## Development

```bash
make install   # docker-driven npm install
make build     # tsup → dist/index.{js,cjs,d.ts}
make test      # vitest
make lint      # self-host gate (eslint on src/)
make typecheck # tsc --noEmit
```

All targets run inside `node:22-alpine` via docker — no host Node required.

---

## License

MIT — see [LICENSE](LICENSE).
