# `no-redundant-optional-chain`

**Type-aware.** Requires `@typescript-eslint/parser` with `parserOptions.project` set.

For every `?.` link in a chain, flags the link when the receiver's static type admits neither `null` nor `undefined`. Covers both `MemberExpression` (`x?.y`, `x?.['y']`) and `CallExpression` (`x?.()`) forms.

## BAD

```ts
function f(user: { id: number }): number {
  return user?.id;
}

function g(items: number[]): number {
  return items?.length;
}
```

## OK

```ts
function f(user: { id: number }): number {
  return user.id;
}

function g(user: { id: number } | null): number | undefined {
  return user?.id;
}
```

## Why

`?.` on a non-nullable value pretends the value might be missing when the type system has already proven it cannot. The reader has to keep track of a possibility that does not exist, the type-narrowing flow gets noisier, and a future change that legitimately makes the value optional will not be flagged because the `?.` already absorbed the new case silently.

Adjacent to `@typescript-eslint/no-unnecessary-condition` — that rule covers a wider surface; this rule is kept narrow to fit the single-hard-gate house style of the plugin.
