# Actor types

the `type` property of actors

## `account` actors	
Account actors are created by users and have an `account_id` and a `hub_id` that points to their <a href="hub-types.md"><code>'personal'</code> hub</a>. They can be created and deleted as desired. They act as a privacy and security shield to protect account identity; when you join a hub, you join as one of your actors, and your account information is never visible to other users.	
	
## <code>'community'</code> actors

One community actor is created for every <a href="hub-types.md"><code>'community'</code> hub</a> and has a <code>hub_id</code> that points to it. They cannot be deleted directly, and instead they are deleted automatically with their hub. Unlike account actors, they have no <code>account_id</code>. They currently have no behavior in Loom, but the plan is to allow them to act as normal actors under the control of the entire hub, and otherwise have most of the same behavior as account actors.
	
## <code>'ghost'</code> actors
Each instance has a single ghost actor. The ghost is used to anonymize the actor of entities and other objects, like when an account actor is deleted. Unlike other actor types, it's a global placeholder object, so features should not hang off it. For example, it cannot be used as an action's actor and it cannot be assigned roles. Unlike account and hub actors, it has no <code>hub_id</code>. Like hub actors, and unlike account actors, it has no <code>account_id</code>.