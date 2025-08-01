# Setting up Production
> To actually deploy a self-hosted instance to production, see
		<a href="{base}{path}/guide/admin/deploying-production">guide/admin/deploying-production</a>

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
## Setting up a server

### Load a VPS with Ubuntu 22.10 x64

* details may vary for other Ubuntu versions and Linux distros
* currently works on 512MB 10GB $4/mo
* where? DigitalOcean, Linode, etc		
* initialize the server to your liking, like:
    * <a href="https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04"
						>digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04</a
					>				
    * disable root login:
        * <a href="https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04"
							>
								digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04
							</a>
        * <code>sudo nano /etc/ssh/sshd_config</code>, change `PermitRootLogin` to `no`
    * <a
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
* Loom depends on the database <a href="https://www.postgresql.org/">PostgreSQL</a>. The
			project's scripts are currently configured to install it on the same VPS as your server. See
			<a href="{base}{path}/guide/admin/database">the database docs</a> for more.
		</li>
	</ul>

### Set environment variables
Open <code>.env.production</code> and set all of the values. See also <a href="https://github.com/getloom/loom/tree/main/src/lib/infra/.env.production.default"
			>src/lib/infra/.env.production.default</a
		>:

* <code>DEPLOY_IP</code> to the IP address of your server
* <code>DEPLOY_USER</code> to your server's user (defaults to <code>root</code>)
* <code>PUBLIC_DEPLOY_SERVER_HOST</code> is your domain, e.g. <code>getloom.org</code>
* <code>CERTBOT_EMAIL</code> is the email address to register with LetsEncrypt for an https certificate
* <code>COOKIE_KEYS</code> should be randomized (TODO do this during <code>gro infra/setup</code>)

### Log into the VPS:
ensure you can log in: `ssh ${DEPLOY_USER}@${DEPLOY_IP}`

## Login/signup challenges a.k.a. CAPTCHAS
One of the most pernacious issues on the public facing internet is keeping your submission forms safe from bots.

Loom has you covered though, with a mechanism for enabling Cloudflare turnstiles. The project is open to other forms of CAPTCHA and bot mitigation work on the login/signup flow though.

Enabling the Cloudflare Turnstile, at the moment, is the domain of instance Operators. By default the turnstile will not be available.

### Enabling Cloudflare Turnstile
1) To start, either create or log in to your Cloudflare account : https://www.cloudflare.com/application-services/products/turnstile/
1) Once you're set up and logged in, go to the Turnstile section of your account and click `Add Widget`.
1) Enter the relevent information about your website (don't forget a subdomain if you're using one). Pick the managed widget while you're at it.
1) You should now get a site key and secret key. Keep track of those, you'll need them for the next step.
1) In your `.env.production` file, add your site key and secret key as PUBLIC_CF_SITEKEY=<site_key> & CF_SECRETKEY=<secret_key>
    1) If those attributes are in the file, Loom will attempt to utilize the Cloudflare turnstile with the provided data. Remove the values from those attributes to disable the turnstile.

That's it! Once you've got everything configured properly, kick of a new deploy of the instance and you should now be protected from rogue bots.
