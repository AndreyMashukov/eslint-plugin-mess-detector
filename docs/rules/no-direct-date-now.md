# `no-direct-date-now`

Flags `Date.now()`, `new Date()` (with zero arguments), and `performance.now()` outside the configured clock-layer and test globs.

## BAD

```ts
// src/lib/cache.ts
function isExpired(ts: number): boolean {
  return Date.now() - ts > 60_000;
}
```

## OK

```ts
// src/lib/cache.ts
function isExpired(clock: Clock, ts: number): boolean {
  return clock.now() - ts > 60_000;
}
```

## Options

```ts
"mess-detector/no-direct-date-now": ["error", {
  "allow": ["**/clock/**", "**/clock.{ts,js}", "**/*.setup.{ts,js}"],
  "ignorePerformanceNow": false
}]
```

- `allow` — list of file globs exempt from the rule. Defaults to `**/clock/**`, `**/clock.{ts,tsx,js,jsx,mjs,cjs}`, `**/*.setup.{ts,js,mjs,cjs}`, and the standard test-file globs.
- `ignorePerformanceNow` — if `true`, do not flag `performance.now()`. Defaults to `false`.

## Why

Anything that calls `Date.now()` directly is untestable for time-dependent behaviour — TTLs, rate limits, retries, expirations, schedule windows. Inject a `Clock` interface and substitute a fake in tests; do not freeze global time as a workaround.

`new Date(...)` with arguments (a specific point in time, an ISO parse, a clone) is left alone — only the zero-argument form, which reads the wall clock, is flagged.

Mirrors `notimenow` from go-lint and `RequirePsrClockInterfaceRector` from rector-php-rules.
