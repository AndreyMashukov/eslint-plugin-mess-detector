# `no-tautological-jsdoc`

For exported function declarations, exported `const` arrow / function expressions, exported classes, and default exports with a JSDoc block, flags JSDoc that adds no information beyond the declaration's name.

Heuristic (ported verbatim from go-lint's `norobotgodoc`): the comment is tautological when

1. The first word equals the declaration's name (case-insensitive).
2. After stripping the name, English stop-words, and verb-form variants derived from the CamelCase tokens of the name, the remaining meaningful-word count is ≤ 2.

Stop-words: `a`, `an`, `the`, `of`, `to`, `for`, `with`, `from`, `and`, `or`, `is`, `returns`, `return`, `gets`, `get`, `sets`, `set`, `this`, `function`, `it`, `new`.

Verb-form suffixes: `s`, `es`, `ed`, `d`, `ing`, plus `y → ies` and `e → ing`.

## BAD

```ts
/** Add adds two numbers. */
export function add(a: number, b: number): number {
  return a + b;
}

/** GetUser returns the user. */
export function getUser(id: number): User | null {
  return null;
}
```

## OK

```ts
/** Add returns a + b clipped to int range; overflow wraps silently. */
export function add(a: number, b: number): number {
  return a + b;
}

/** GetUser performs a primary-key lookup and returns null when the row is hidden by row-level security. */
export function getUser(id: number): User | null {
  return null;
}
```

## Why

Tautological JSDoc costs maintenance with no payoff. Either describe real behaviour (preconditions, edge cases, side effects, complexity, return contract) or omit the comment entirely — a generic "must have JSDoc" lint rule is not worth satisfying with empty prose.

Ported verbatim from `norobotgodoc` in go-lint.
