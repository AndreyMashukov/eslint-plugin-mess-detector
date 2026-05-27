# `no-type-only-assertion`

Inside test files, flags `expect(x).<matcher>()` for matchers that only check the type / shape / nullishness of `x` without pinning a concrete expected value: `toBeNull`, `toBeUndefined`, `toBeDefined`, `toBeTruthy`, `toBeFalsy`, `toBeNaN`, `toBeInstanceOf`, `toBeTypeOf`, `toBeObject`, `toBeArray`, `toBeString`, `toBeNumber`, `toBeBoolean`, `toBeFunction`, `toBeEmpty`, `toExist`. Walks through `.not`, `.resolves`, `.rejects` chain links.

The rule activates only on test files: `**/*.test.{ts,tsx,js,jsx,mjs,cjs}`, `**/*.spec.*`, `**/tests/**`, `**/__tests__/**`.

## BAD

```ts
// tests/user.test.ts
expect(user).toBeDefined();
expect(user.createdAt).toBeInstanceOf(Date);
expect(result).not.toBeNull();
```

## OK

```ts
// tests/user.test.ts
expect(user).toEqual({ id: 7, name: "Alice" });
expect(user.createdAt.toISOString()).toBe("2026-01-15T12:00:00.000Z");
expect(result).toEqual([{ id: 1 }, { id: 2 }]);
```

## Options

```ts
"mess-detector/no-type-only-assertion": ["error", {
  "matchers": ["toBeNull", "toBeDefined", "toBeInstanceOf"],
  "expectIdentifiers": ["expect", "expectTypeOf"]
}]
```

- `matchers` — list of banned matcher names. Overrides the default list above.
- `expectIdentifiers` — callee names that count as `expect(...)`. Defaults to `expect`, `expectTypeOf`.

## Why

Type-only and existence-only assertions check what the type system already proves; they never pin the value that matters. `expect(user).toBeDefined()` passes for any non-undefined value — including a half-built object with the wrong id, wrong name, wrong timestamps. Pin the actual expected value; the existence / type check is then implicit in the equality comparison.

Mirrors `notypeonlyassert` from go-lint and `NoTypeOnlyAssertionsInTestsRector` / `NoExistenceOnlyAssertionsInTestsRector` from rector-php-rules.
