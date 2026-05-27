# `no-redundant-bool-return`

Flags the pattern:

```ts
if (cond) {
  return true;
}
return false;
```

and its inverse (`return false` / `return true`). Both the bare `return` form and the block-wrapped form are caught, and so are the explicit `if/else` shape.

## BAD

```ts
function isPositive(x: number): boolean {
  if (x > 0) {
    return true;
  }
  return false;
}
```

## OK

```ts
function isPositive(x: number): boolean {
  return x > 0;
}
```

## Why

A direct giveaway that the author was thinking imperatively about a boolean expression. The shorter form is also faster to read and harder to break with later edits — there is no chance of returning the wrong constant in the wrong branch when there are no constants at all.

Mirrors `noredundantif` from go-lint.
