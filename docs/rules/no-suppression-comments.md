# `no-suppression-comments`

Forbids every linter or type-checker suppression directive: `// eslint-disable*`, `// eslint-enable*`, `// @ts-ignore`, `// @ts-expect-error`, `// @ts-nocheck`, `// @ts-check`, `// biome-ignore`, `// prettier-ignore`.

## BAD

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const x: any = whatever();

// @ts-expect-error narrowing is hard here
const y: User = raw;
```

## OK

```ts
const x = parseUnknown(raw);

if (isUser(raw)) {
  const y: User = raw;
}
```

## Why

Suppression directives mask the very debt the linter and type checker exist to make visible. Fix the underlying issue, or drop the rule project-wide if it is genuinely wrong for your codebase. Per-line waivers turn into silent debt: the next reader cannot tell whether a suppression hides a known false positive or a real bug, and it survives long after the actual issue is fixed.

Mirrors `nolintdirective` from go-lint and `NoPhpstanIgnoreRector` from rector-php-rules.
