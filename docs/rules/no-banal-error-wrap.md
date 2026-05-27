# `no-banal-error-wrap`

Flags `throw new Error(msg)` where `msg` is a banal verb-prefix string ( `failed to X`, `error X`, `cannot X`, `could not X`, `unable to X`) — either as a plain string literal, or as a template literal whose only expression is `err.message` (with no other context).

Carve-out: a second argument with a `{ cause: ... }` option is exempt, because the error chain is preserved.

## BAD

```ts
throw new Error("failed to fetch");
throw new Error("cannot parse");
throw new Error(`unable to connect: ${err.message}`);
```

## OK

```ts
throw err;
throw new Error("user 42 not found in shard 3");
throw new Error(`fetch /api/users/${userId} returned 503`, { cause: err });
```

## Why

`throw new Error("failed to read: " + err.message)` is strictly worse than re-throwing `err`. It lengthens the error chain, drops the original stack trace, and the prose adds no information the caller did not already have. If you have nothing concrete to add — which file, which key, which user, which transaction id — do not wrap. If you do, pass it through with `{ cause }` to preserve the chain.

Mirrors `noerrorwrapbanality` from go-lint.
