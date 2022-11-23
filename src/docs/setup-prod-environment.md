# Production server setup for deployments

This document describes how to set up a production environment
for deploying an instance of
[`@feltcoop/felt-server`](https://github.com/feltcoop/felt-server).

To learn more about `@feltcoop/felt-server`,
see [src/docs/getting-started.md](/src/docs/getting-started.md).

To deploy a self-hosted instance to production,
see the instructions at
[`src/docs/deploying-production.md`](/src/docs/deploying-production.md).

To manage a production instance,
see [`src/docs/managing-production.md`](/src/docs/managing-production.md).

## Setting up a server

### Load a VPS with Ubuntu 22.10 x64

- details may vary for other Ubuntu versions and Linux distros
- currently works on 512MB 10GB $4/mo
- where? DigitalOcean, Linode, etc
- initialize the server to your liking, like:
  - https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04
  - disable root login:
    - https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04
    - `sudo nano /etc/ssh/sshd_config`, change `PermitRootLogin` to `no`
  - https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04
  - https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-22-04
- Felt depends on the database [PostgreSQL](https://www.postgresql.org).
  The project's scripts are currently configured to install it on the same VPS as your server.
  See the [database README](/src/lib/db/README.md) for more.

### Set environment variables

Open `.env.production` and set all of the values. See also
[`src/lib/infra/.env.production.default`](/src/lib/infra/.env.production.default):

- `DEPLOY_IP` to the IP address of your server
- `DEPLOY_USER` to your server's user (defaults to `root`)
- `PUBLIC_DEPLOY_SERVER_HOST` is your domain, e.g. `felt.social`
- `CERTBOT_EMAIL_ADDRESS` is the email address to register with LetsEncrypt for an https certificate
- `COOKIE_KEYS` should be randomized (TODO do this during `gro lib/infra/setup`)

### Log into the VPS:

ensure you can log in: `ssh ${DEPLOY_USER}@${DEPLOY_IP}`

## Next steps

To continue deploying a self-hosted instance to production,
see [`src/docs/deploying-production.md`](/src/docs/deploying-production.md).
