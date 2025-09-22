# Getting Started

Welcome to your first account on an instance of Loom, the free & open-source programmable social platform!

(If you're the one actually running the instance, you might be looking for [these getting started docs instead](../operators/getting_started.md))

## Create An Account
Creating and managing an `Account` on Loom is pretty much just like any other account on the internet. You'll need to sign-up with a unique email and password. Some instances allow for open sign-ups, others will require a specific link with an invite code to register.

## Create An Actor
Loom has a unique `Actor` system that allows you to partition the persona you use in your digital community from the personal details attached to your `Account`.

Your `Actor` names will be visible publically to other users on the instance, your `Account` details will not.

`Hubs` (see below) also have a specific type of actor called `community actors` which are not tied to a specific `Account` but instead are part of the `Hub`. There are currently no features based around this, but we anticipate users or scripts in the future being able to "don" `community actors` to take actions within the `Hub`. For details see [actor types](./actor_types.md).

## Orienting Yourself
### Hubs
Once you've created your `Actor` you'll find yourself in the default view of Loom. On the left hand of the screen you have the NavBar. This contains the `Hubs` you belong to & the `Spaces` within your currently selected `Hub`.

You can think of a `Hub` like you might a server in Discord or a workspace in Slack and they are the highest order container within a Loom system (aside from the particular instance of Loom you're on.) `Hubs` have their own rules, `Role` & `Permissions` configurations, & a unique membership composition.

Currently, anyone with membership in a given `Hub` has read access to everything within that `Hub`.

You may have also noticed a particular `Hub` with your `Actors'` name on it. That's your `personal` hub, which only you in the form of your `Actor` have access to. Think of it as a little personal workspace. Other `Hubs` are referred to as `community` hubs. For more on the difference see [hub types](./hub_types.md)

For now at least, all `Hubs` are invite only, except for the "default" `Hubs` which are configured by the instance admins.

### Spaces
Inside each `Hub` you will find a list of `Spaces`. While organized a lot like chat channels, Loom's dynamic front end allows for a variety of tools to configured for use. These tools are referred to as `Views`. Most default `Spaces` simply have a single type of `View` associated with them, like Chat (a simple chatroom), Todo (an opinionated todo list), or Forum (a lightweight topic/thread tool).

Currently the `Views` available for `Spaces` to use are hardcoded into Loom, but a more dynamic plugin system is planned for the future.

### Roles & Permissions
As mentioned, each `Hub` has its own set of `Roles` & `Permissions` configured. `Permissions` are currently a fixed set of actions that can be taken within the system, and each `Role` has a number of `Permissions` granted to them. `Roles` are then assigned to users as they join and engage with the community within any given `Hub`. The assignment of `Roles` is itself, a `Permission` usually held by whoever creates the `Hub` originally.

### Entities
This is ultimately what Loom all boils down to, is the ability to create, read, update, and delete `entities`. This is all doen through the tooling provided by `Views` within a `Space`. Your message in Chat? An `entity`. That item on your todo list you checked off? An `entity`.

For a diagram of how all these concepts relate to each other, see this [data model diagram](./data_model.md)

## The Context Menu
Loom has implemented a custom context menu that overrides the browser's right click action (although you can access the browser's context menu by shift+right clicking).

Here you can do things like create new `Actors`, `Hubs`, or `Spaces`, interact with existing ones & access your `Account` settings.