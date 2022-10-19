# Admin

When a Felt server instance is first created,
it has no communities, no accounts, and no personas.
When the first persona is created, which happens when the first account signs up,
the server creates a special community, the "admin" community, located at `$HOSTNAME/admin`,
and adds that first persona to its assignments.
This community inherits all of the same functionality as normal communities,
but all of its members are granted superpowers: they are instance admins.

The admin system is orthogonal to the roles systems.
Admins are not implemented as roles; roles are community-specific,
and admins wield instance-wide powers.
If a persona has an assignment to the admin community, they're an admin.

Admins are superusers, which means they have full control over the instance.
(it's possible we'll develop features to restrict admin powers, but that's speculative)
Admins access their powers through the same web frontend as the rest of the app.

For efficiency and ergonomics, the admin community and admin persona are both hardcoded
to have id `1` and name `"admin"`:

```ts
const adminCommunity = {
	community_id: 1,
	type: 'standard',
	name: 'admin',
};
const adminPersona = {
	persona_id: 1,
	type: 'community',
	name: 'admin',
	community_id: 1,
};
```

> learn more about [community types](./community-types.md) and [persona types](./persona-types.md)
