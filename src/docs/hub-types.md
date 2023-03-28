# Hub types

> the `type` property of hubs

## `'community'` hubs

Community hubs are the default kind;
you can create them, invite other actors, and all the rest.

Admin hubs are currently implemented as `'community'` hubs,
but they may get their own type in the future.

## `'personal'` hubs

Felt has a special kind of hub called a **personal hub**.
It's a private world scoped to one actor,
similar to `'community'` hubs with some important differences:

- a personal hub is created automatically for every [`'account'` actor](./actor-types.md);
  this is the only way they're created
- a personal hub has the same `name` as its actor
- a personal hub's assignment includes its owning actor,
  and **no other actors may be invited and given assignments**,
  including other actors under the same account
