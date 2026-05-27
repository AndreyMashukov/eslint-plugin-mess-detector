# `no-env-branch`

Flags `==`, `===`, `!=`, `!==` comparisons whose operand is one of the environment strings `"prod"`, `"production"`, `"dev"`, `"development"`, `"test"`, `"testing"`, `"stage"`, `"staging"`, `"local"`, or whose other side is `process.env.NODE_ENV` (or any `process.env.*` access). Also flags those literals as `case` labels in a `switch`.

## BAD

```ts
if (env === "prod") {
  enableMetrics();
}

switch (env) {
  case "dev": return devConfig;
  case "prod": return prodConfig;
}
```

## OK

```ts
if (cfg.metricsEnabled) {
  enableMetrics();
}
```

## Why

Production code must behave identically in every environment. `if (env === "prod")` creates code paths that are exercised only in prod and masked in tests — a recipe for incidents nobody can reproduce. Use feature flags or typed config values instead; the env-vs-prod gating belongs at the DI / config / route-loader layer, not inside production classes.

Mirrors `noenvbranch` from go-lint and `NoEnvironmentCheckInSrcRector` from rector-php-rules.
