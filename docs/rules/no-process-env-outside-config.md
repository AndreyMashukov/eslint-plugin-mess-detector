# `no-process-env-outside-config`

Flags every `process.env.X` or `process["env"]` access whose containing file is **not** under the configured config-layer globs.

## BAD

```ts
// src/lib/db.ts
const url = process.env.DATABASE_URL;
```

## OK

```ts
// src/config/db.ts
const url = process.env.DATABASE_URL;

// src/lib/db.ts
export function makeDb(cfg: Config): Db {
  return new Db(cfg.databaseUrl);
}
```

## Options

```ts
"mess-detector/no-process-env-outside-config": ["error", { "allow": ["**/config/**", "**/*.config.{ts,js}"] }]
```

- `allow` — list of glob patterns matched against the absolute filename. A file matching any of them is exempt. Defaults to `**/config/**`, `**/env/**`, `**/*.config.{ts,tsx,js,jsx,mjs,cjs}`, `**/env.{ts,js,mjs,cjs}`.

## Why

Scattered `process.env` reads make tests and sandboxing impossible: the test has to mutate process-wide state and remember to restore it, and there is no single place to document which env vars the program consumes. Centralize env reading in one config module and pass a typed config object into every consumer.

Mirrors `nogetenv` from go-lint and `NoSuperglobalAccessRector` from rector-php-rules.
