# Authorization & Authentication
Loom has a number of systems in place for managing it's various Authorization & Authentication schemes.

## Authorization
Authorization is handled by a standardard username/password scheme. This information is stored in the `Account` object. When a user logs in, they are granted an encrypted cookie that tracks their account_id & serves as proof that they have logged in.

This is handled by the `cookieSessionMiddlware`

## Authentication
Authentication is a little more tricky.

In general, there are two levels of Authentication.

When someone first creates an account with Loom, they are granted access to the special, one of a kind, Admin hub. Any `Actor` with membership in this `Hub` is said to have `Admin` privlidges within the system. These behaviors are hardcoded at the system/service level.

The other kind of Authentication system is based on a Role & Privacy system managed at the `Hub` boundary. If an `Actor` is a member of a `Hub` they defacto have at least one `Role` within the `Hub`. This `Role` then has a series of `Policies` that allow the `Actor` to perform specific actions within the `Hub`.

These assessments are handled by the `authorize()` function with the `httpServiceMiddleware` & `websocketServiceMiddleware`.