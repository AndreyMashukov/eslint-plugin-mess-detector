# `no-silent-fallback`

Forbids three shapes of silent default for missing values:

1. **`??`** — nullish coalescing.
2. **`??=`** — nullish-coalescing assignment.
3. **`||` with a literal default** — the JS fallback idiom from before `??` existed. Flags every `expr || <literal-like>` where the right-hand side is a `Literal`, an empty template literal, `undefined`, `void <expr>`, an `ArrayExpression`, or an `ObjectExpression`. Boolean `||` between two computed expressions (`a || b`, `x.foo || x.bar`) is left alone.

## BAD

```ts
const env = process.env.NODE_ENV ?? 'dev';
const port = config.port ?? 8080;
const items = data.items ?? [];
const name = user?.profile?.name ?? 'anonymous';
cache ??= new Map();

const envOr = process.env.NODE_ENV || '';
const portOr = config.port || 8080;
const nameOr = user.name || 'anonymous';
const itemsOr = data.items || [];
const cfgOr = options || {};
const flagOr = config.enabled || false;
```

## OK

```ts
function load(env: string | undefined): string {
  if (env === undefined) {
    throw new Error('NODE_ENV is required');
  }
  return env;
}

// Or via destructuring defaults at the call boundary:
function start({ port = 8080 }: { port?: number }) { /* ... */ }

// Or function-parameter defaults:
function f(env = 'dev') { return env; }

// Or an explicit branch when the missing case is meaningful:
const items = data.items === undefined ? loadFromCache() : data.items;

// Boolean `||` is fine — RHS is not a literal:
if (a || b) { run(); }
return user.isActive || user.isPending;
```

## Why

`x ?? y`, `x ??= y`, and `x || <literal>` translate a missing or falsy value into a silent default. Every silent default is a place where:

- a misconfigured environment fails to crash on boot and limps along producing wrong output;
- a stale response payload from an upstream service is papered over with `''` / `[]` / `{}`, hiding the schema break;
- an AI-generated patch sneaks in a "safe" fallback that nobody asked for and nobody reviews.

The rule's policy mirrors `no-todo` / `no-suppression-comments` and `NoNullCoalesceNewFallbackRector` in the sibling projects: no good `??` uses in production code, no good `||` fallbacks with hard-coded defaults — so don't write any. If a value can legitimately be `null` or `undefined`, narrow the type at the boundary (parser, deserializer, config loader) or branch explicitly. If it cannot, let the call site read it directly and let TypeScript / runtime surface the error.

Use destructuring defaults (`function f({ x = 5 })`) and function parameter defaults (`function f(x = 5)`) for *declared* defaults — those are explicit declarations the caller can see, not inline fallbacks that smother a missing input.

## Tension with `@typescript-eslint/prefer-nullish-coalescing`

The `@typescript-eslint/prefer-nullish-coalescing` rule pushes users *toward* `??` because `||` coalesces on `0`, `''`, `false`. This rule treats `??` itself as the smell — both `||` and `??` are the problem when used as silent defaults. Adopting `no-silent-fallback` means turning off `@typescript-eslint/prefer-nullish-coalescing` in your config.

## Risks the rule deliberately accepts

- **`process.env.X ?? 'production'`** is the de facto Node config pattern. The rule fires on it anyway. Resolution: lift the default into a `requiredEnv(name)` / `optionalEnv(name, default)` helper in `config/` (already exempt from `no-process-env-outside-config`). The rule says "no fallback at the call site," not "no defaults in the codebase."
- **`?? []` before iteration** is often safer than crashing. The rule fires anyway. Resolution: if the API truly may return no `items` key, narrow the type at the parser/deserializer. The fallback at the iteration site lies about the schema.
- **Tests legitimately fixture defaults.** Test-file carve-out is *not* shipped — apply it in your own flat config if you want it:

```js
// eslint.config.js
{ files: ['**/*.test.{ts,js}', '**/tests/**'], rules: { 'mess-detector/no-silent-fallback': 'off' } }
```

Mirrors `NoNullCoalesceNewFallbackRector` from rector-php-rules (PHP `??`/`??=`/isset-ternary), the planned `nosilentfallback` analyzer in go-lint (Go `cmp.Or` with literal and post-read string/numeric fallback), and the planned `no_silent_fallback` analyzer in rust-lint (Rust `.unwrap_or` / `.unwrap_or_else` / `.unwrap_or_default` / `.ok_or` / `.map_or`).
