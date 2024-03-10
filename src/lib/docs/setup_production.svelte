<script lang="ts">
	import {base} from '$app/paths';

	import {getDocsSettings} from '$lib/docs/docs.js';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div class="prose">
	<h2>Production server setup for deployments</h2>

	<p>
		This document describes how to set up a production environment for deploying an instance of <a
			href="https://github.com/getloom/loom"><code>@getloom/loom</code></a
		>.
	</p>
	<p>
		To learn more about <code>@getloom/loom</code>, see
		<a href="{base}{path}/guide/admin/getting-started">guide/admin/getting-started</a>.
	</p>
	<p>
		To deploy a self-hosted instance to production, see the instructions at
		<a href="{base}{path}/guide/admin/deploying-production"
			><code>guide/admin/deploying-production</code></a
		>.
	</p>
	<p>
		To manage a production instance, see <a href="{base}{path}/guide/admin/managing-production"
			><code>guide/admin/managing-production</code></a
		>.
	</p>
	<h3>Setting up a server</h3>

	<h4>Load a VPS with Ubuntu 22.10 x64</h4>

	<ul>
		<li>details may vary for other Ubuntu versions and Linux distros</li>
		<li>currently works on 512MB 10GB $4/mo</li>
		<li>where? DigitalOcean, Linode, etc</li>
		<li>
			initialize the server to your liking, like:
			<ul>
				<li>
					<a
						href="https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04"
						>digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04</a
					>
				</li>
				<li>
					disable root login:
					<ul>
						<li>
							<a
								href="https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04"
							>
								digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04
							</a>
						</li>
						<li>
							<code>sudo nano /etc/ssh/sshd_config</code>, change <code>PermitRootLogin</code> to
							<code>no</code>
						</li>
					</ul>
				</li>
				<li>
					<a
						href="https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04"
					>
						digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04
					</a>
				</li>
				<li>
					<a
						href="https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-22-04"
					>
						digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-22-04
					</a>
				</li>
			</ul>
		</li>
		<li>
			Loom depends on the database <a href="https://www.postgresql.org/">PostgreSQL</a>. The
			project's scripts are currently configured to install it on the same VPS as your server. See
			<a href="{base}{path}/guide/admin/database">the database docs</a> for more.
		</li>
	</ul>

	<h4>Set environment variables</h4>
	<p>
		Open <code>.env.production</code> and set all of the values. See also
		<a href="https://github.com/getloom/loom/tree/main/src/lib/infra/.env.production.default"
			>src/lib/infra/.env.production.default</a
		>:
	</p>

	<ul>
		<li><code>DEPLOY_IP</code> to the IP address of your server</li>
		<li><code>DEPLOY_USER</code> to your server's user (defaults to <code>root</code>)</li>
		<li><code>PUBLIC_DEPLOY_SERVER_HOST</code> is your domain, e.g. <code>getloom.org</code></li>
		<li>
			<code>CERTBOT_EMAIL</code> is the email address to register with LetsEncrypt for an https certificate
		</li>
		<li>
			<code>COOKIE_KEYS</code> should be randomized (TODO do this during
			<code>gro infra/setup</code>)
		</li>
	</ul>

	<h4>Log into the VPS:</h4>

	<p>
		ensure you can log in: <code>ssh ${'{'}DEPLOY_USER}@${'{'}DEPLOY_IP}</code>
	</p>

	<h3>Next steps</h3>

	<p>
		To continue deploying a self-hosted instance to production, see
		<a href="{base}{path}/guide/admin/deploying-production">guide/admin/deploying-production</a>
	</p>
</div>
