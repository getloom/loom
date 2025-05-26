# Hub types

the `type` property of hubs has two defined types

## `community` hubs

Community hubs are the default kind; you can create them, invite other actors, and all the rest.

The Admin hub is currently implemented as `community` hubs, but they may get their own type in the future.	

## `personal` hubs

Loom has a special kind of hub called a **personal hub**. It's a private world scoped to one actor. They are similar to `community` hubs with some important differences:

1) a personal hub is created automatically for every <a href="actor_types.md">`account` actor </a>, and this is the only way they're created.
		
1) a personal hub has the same <code>name</code> as its actor
1) a personal hub's assignment includes its owning actor, and **no other actors may be invited and given assignments**, including other actors under the same account, in order to guarentee privacy.