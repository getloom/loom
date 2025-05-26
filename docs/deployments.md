# Deploying Loom to production

This document describes how to deploy a new instance of <a
			href="https://github.com/getloom/loom"><code>@getloom/loom</code></a
		> to the internet.
	</p>
	<p>
		To learn more about <code>@getloom/loom</code>, see
		<a href="{base}{path}/guide/admin/getting-started">guide/admin/getting-started</a>.
	</p>
	<p>
		To manage a production instance, see <a href="{base}{path}/guide/admin/managing-production"
			>guide/admin/managing-production</a
		>.
	</p>
	<p>
		To deploy an instance of <code>@getloom/loom</code>, these docs assume a
		<a href="https://en.wikipedia.org/wiki/Virtual_private_server">VPS</a>, which you can obtain
		through a cloud provider. They can also be adapted for local use and alternative deployments,
		but some details will differ.
	</p>
	<p>
		To start, clone the repo locally and make sure <a href="https://github.com/grogarden/gro">Gro</a
		> is installed globally:
	</p>
```
git clone https://github.com/getloom/loom
npm i -g @ryanatkn/gro
```

## Deploy
To self-host on a VPS, first <a href="{base}{path}/guide/admin/setup-production"
			>set up a production environment</a
		>.

Then:

```gro infra/deploy```

This builds the project on the local machine (<code>`gro build`</code>), packs the output into a
		tar, and attempts to deploys it to the remote instance.
	</p>

To redeploy:</p>

```gro infra/deploy```

## Test production locally

To test production locally, first update the environment variables in <code
			>.env.production</code
		> to your local machine's values:
	</p>

```
PUBLIC_DEPLOY_SERVER_HOST=localhost
PUBLIC_SERVER_PORT=3000
# notice this is ws://, not wss://, and the same port as above
PUBLIC_WEBSOCKET_URL=ws://localhost:3000/ws
PGDATABASE=loom
PGUSER=postgres
PGPASSWORD=password
```

> The production build listens on http, not https, because we deploy to servers with Nginx in
		front of the Node server. This makes it easy to test production locally without dealing with
		certificates.

Then build and run the server:
```
gro build
node dist_server/server/server.js
```
Then browse to <code>${PUBLIC_DEPLOY_SERVER_HOST}:${PUBLIC_SERVER_PORT}</code>, like
		<code>localhost:3000</code> with the above settings. The server also logs where it's listening to
		the console.	
	
## Manually upgrading cloud instances

If upgrading your underlying cloud OS, we recommend spinning up a new server instance and
		restoring a DB backup to it. This helps keeps cruft from forming on your servers, helps you make
		sure you running on the latest hardware from your cloud provider, and tests your DB restoration
		process all in one.

1) Spin up a new server with the new OS
1) Point your DNS record to the new IP
1) Run `gro infra/setup` on the new server
1) Set up your DB password
1) Use <a href="https://www.postgresql.org/docs/current/backup-dump.html"><code>pg_dump</code></a
			> to get a copy of the DB from your lid server instance		
1) Copy that dump from lid to new server & restore it
1) Deploy the latest <code>@getloom/loom</code> code to your new server
1) Restart

## Managing production
To manage a production instance, see [managing prod](.managing_prod.md)