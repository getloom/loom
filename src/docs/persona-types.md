# Persona types

> the `type` property of personas

## `'account'` personas

Account personas are created by users and have an `account_id`
and a `community_id` that points to their [`'personal'` community](./community-types.md).
They can be created and deleted as desired.
They act as a privacy and security shield to protect account identity;
when you join a community, you join as one of your personas,
and your account information is never visible to other users.

## `'community'` personas

Community personas are created for every [`'standard'` community](./community-types.md)
and have a `community_id` that points to it.
They cannot be deleted directly, and instead they are deleted automatically with their community.
Unlike account personas, they have no `account_id`.
They currently have no behavior in Felt,
but the plan is to allow them to act as normal personas
under the control of the entire community,
and otherwise have most of the same behavior as account personas.
