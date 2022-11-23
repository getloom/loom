# Deploying `@feltcoop/felt-server` to production

This document describes how to deploy a new instance of
[`@feltcoop/felt-server`](https://github.com/feltcoop/felt-server) to the internet.

To learn more about `@feltcoop/felt-server`,
see [src/docs/getting-started.md](/src/docs/getting-started.md).

To manage a production instance,
see [`src/docs/managing-production.md`](/src/docs/managing-production.md).

To deploy an instance of `@feltcoop/felt-server`,
these docs assume a <a href="https://en.wikipedia.org/wiki/Virtual_private_server">VPS</a>,
which you can obtain through a cloud provider.
They can also be adapted for local use and alternative deployments, but some details will differ.

To start, clone the repo locally and make sure
[Gro](https://github.com/feltcoop/gro) is installed globally:

```bash
git clone https://github.com/feltcoop/felt-server
npm i -g @feltcoop/gro
```

## Deploy

To self-host on a VPS, first
[set up a production environment](/src/docs/setup-prod-environment.md).

Then:

```bash
gro deploy
# TODO automate all of this
# manually run `pm2 start npm -- run start --prefix ~/current_felt_server_deploy`
```

This builds the project on the local machine (`gro build`),
packs the output into a tar, and attempts to deploys it to the remote instance.

> TODO automate both initial migration and subsequent migrations and `npm i`

To redeploy:

```bash
gro deploy
```

## Manually upgrading cloud instances

If upgrading your underlying cloud OS,
we recommend spinning up a new server instance and restoring a DB backup to it.
This helps keeps cruft from forming on your servers,
helps you make sure you running on the latest hardware from your cloud provider,
and tests your DB restoration process all in one.

1. Spin up a new server with the new OS
1. Point your DNS record to the new IP
1. Run `gro lib/infra/setup` on the new server
1. Set up your DB password
1. Use [`pg_dump`](https://www.postgresql.org/docs/current/backup-dump.html)
   to get a copy of the DB from your old server instance
1. Copy that dump from old to new server & restore it
1. Deploy the latest `@feltcoop/felt-server` code to your new server
1. Restart

## Managing production

To manage a production instance,
see [`src/docs/managing-production.md`](/src/docs/managing-production.md).
