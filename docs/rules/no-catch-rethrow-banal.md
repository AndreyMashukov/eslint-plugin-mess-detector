# `no-catch-rethrow-banal`

Flags a `catch (e)` whose body is exactly one `throw new Error(<arg>)` where `<arg>` is `e.message`, or a template literal whose only interpolations are `e.message`. The `{ cause: e }` option carve-out is honoured.

## BAD

```ts
try {
  fetch(url);
} catch (e) {
  throw new Error(e.message);
}

try {
  fetch(url);
} catch (err) {
  throw new Error(`${err.message}`);
}
```

## OK

```ts
try {
  fetch(url);
} catch (e) {
  throw e;
}

try {
  fetch(url);
} catch (e) {
  throw new Error("fetch /api/users returned 503", { cause: e });
}
```

## Why

`throw new Error(e.message)` looks like it preserves the error but does the opposite: the original stack is dropped, the prototype information (`e instanceof FooError`) is lost, and any `cause` chain on `e` is severed. The bare `throw e` keeps everything; a deliberate wrap with `{ cause: e }` chains them. Both are better than a message-only rewrap.

Adjacent to `no-banal-error-wrap` which catches the same intent at the bare `throw new Error("failed to X")` site.
