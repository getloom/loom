# Hub types

> the `type` property of hubs

## `'community'` hubs

Community hubs are the default kind;
you can create them, invite other personas, and all the rest.

Admin hubs are currently implemented as `'community'` hubs,
but they may get their own type in the future.

## `'personal'` hubs

Felt has a special kind of hub called a **personal hub**.
It's a bit of a misnomer; it's more of a personal workspace, a world scoped to a persona,
than a hub, but it inherits most of the qualities of `'community'` hubs,
with some important differences:

- a personal hub is created automatically for every [`'account'` persona](./persona-types.md);
  this is the only way they're created
- a personal hub has the same `name` as its persona
- a personal hub's assignment includes its owning persona,
  and **no other personas may be invited and given assignments**,
  including other personas under the same account
