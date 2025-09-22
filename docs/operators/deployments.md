# Deploying Loom to a production server

This document describes how to deploy a new instance of Loom to a provisioned server.

To learn more about Loom itself, see [Getting Started](../users/getting_started.md)

For managing a provisioned & deployed production instance, see [Managing Prod](./managing_prod.md)

This document assumes you've already followed the steps for setting up your server in [Setting Up Production](./setup_production.md)

## Deploy
To start, clone the repo locally 
```
git clone https://github.com/getloom/loom
```

Then:

```npx gro infra/deploy```

This builds the project on the local machine (<code>`npx gro build`</code>), packs the output into a
		tar, and attempts to deploys it to the remote instance.	

Every time the deploy script runs, it will check to make sure the `setup` task has also previously been run and if not, will run it automatically.

To redeploy:

```npx gro infra/deploy```

## Admin
Loom has a root level administrator user & hub for managing the system. It is automatically assigned to the first created user account, so make sure to log in and secure your admin access before showing your instance to anyone else.

See [Admin](./admin.md) for more details.