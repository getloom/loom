## Test production locally

To test the production build locally, first update the environment variables in <code
			>.env.production</code
		> to your local machine's values:	

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