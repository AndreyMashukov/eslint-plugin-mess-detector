# `no-todo`

Forbids every comment that opens with `TODO`, `FIXME`, `XXX`, or `HACK` — an owner (`@alice`) or a ticket (`PROJ-123`) does **not** redeem it.

## BAD

```ts
// TODO fix later
// TODO(@alice): switch to pooled client once PROJ-123 lands
// FIXME: rate-limit handling is wrong
```

## OK

```ts
// see the migration backlog in PROJ-123 for the pooled-client switch
```

A mid-sentence mention of the word is left alone (documentation about markers): `// docs about TODOs` is fine. The rule fires only when the marker is the first token of the comment.

## Why

A deferred marker is work you decided not to do but left in the tree. Implement it now, or track it in an issue and link that from real documentation — do not leave the stub. "I'll get to it" rots in place; an owner or a ticket only makes the rot look organized.

Mirrors `notodo` from go-lint and `NoTodoCommentRector` from rector-php-rules.
