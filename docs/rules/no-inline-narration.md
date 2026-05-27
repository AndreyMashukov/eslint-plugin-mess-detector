# `no-inline-narration`

Flags every `//` and `/* */` comment that appears inside a function body.

Carve-outs:

- TS / ESLint / Biome / Prettier suppression directives (handled by `no-suppression-comments`).
- `TODO` / `FIXME` / `XXX` / `HACK` markers (handled by `no-todo`).
- A JSDoc `/** */` block immediately preceding a nested function / variable / class declaration (default-on via the `allowJSDocOnInnerDeclarations` option).

## BAD

```ts
function process(x: number): number {
  // double x
  const y = x * 2;
  // and add one
  return y + 1;
}
```

## OK

```ts
function process(x: number): number {
  return doubleAndIncrement(x);
}
```

## Options

```ts
"mess-detector/no-inline-narration": ["error", { "allowJSDocOnInnerDeclarations": true }]
```

- `allowJSDocOnInnerDeclarations` (default `true`) — allow a JSDoc block immediately before a nested function / variable / class declaration. Set to `false` to forbid every comment inside a function body without exception.

## Why

Inline narration is the strongest sign of autopilot code. If a step needs prose to explain it, it needs a function name that explains it. Comments rot; renamed functions do not. The few legitimate uses — directive comments and `TODO` markers — already have dedicated rules, so the rest of the comment surface inside a function body has no reason to exist.

Mirrors `noinlinecomment` from go-lint.
