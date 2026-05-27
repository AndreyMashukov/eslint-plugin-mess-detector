# `no-dead-nullish-guard`

**Type-aware.** Requires `@typescript-eslint/parser` with `parserOptions.project` set.

Flags strict equality comparisons (`===`, `!==`) against `null` or the `undefined` identifier whose other operand's static type admits **neither** `null` nor `undefined`.

Loose-equality forms (`x == null`, `x != null`) are intentionally **not** flagged: the idiomatic nullish-check pattern stays available. `typeof x === "undefined"` is similarly out of scope. `any` and `unknown` are treated as admitting nullish (no finding) — the type system literally cannot say otherwise.

## BAD

```ts
function handle(id: number): void {
  if (id === null) {
    return;
  }
  // ...
}

function check(user: { id: number; name: string }): void {
  if (user.id === undefined) {
    return;
  }
  // ...
}
```

## OK

```ts
function handle(id: number | null): void {
  if (id === null) {
    return;
  }
}

function handle(id: number): void {
  if (id <= 0) {
    return;
  }
}
```

## Why

Defensive nullish-checks on non-nullable types are dead code that betrays a misunderstanding of the type system: the compiler proves the branch can never run. Real value validation — range, length, format — is a different concern and belongs in a dedicated validator.

Mirrors `nodeadguard` from go-lint.
