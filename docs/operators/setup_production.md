# Setting up a Production Server
This document describes how to set up a production environment server for deploying an instance of Loom	

For deploying a self-hosted instance to production, see our [Deployments](./deployments.md) documentation

For managing a provisioned & deployed production instance, see [Managing Prod](./managing_prod.md)

To learn more about Loom itself, see [Getting Started](../users/getting_started.md)
## Setting up a server

### Spin up a VPS with Ubuntu 22.10 x64

* details may vary for other Ubuntu versions and Linux distros
* currently works on 512MB 10GB $4/mo
* where? DigitalOcean, Linode, etc		
* initialize the server to your liking, like:
    * <a href="https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04">database
		digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04
	  </a>
    * disable root login:
	  * <a href="https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04">
			digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-22-04
		</a>
	  * <code>sudo nano /etc/ssh/sshd_config</code>, change `PermitRootLogin` to `no`
    * <a href="https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04">digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04</a>
	* <a href="https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-22-04">
		digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-22-04
	</a>
* Loom depends on the database [Postgres](https://www.postgresql.org/). The project's scripts are currently configured to install it on the same VPS as your server. See the developer [database](../developers/database.md) docs for more details.

### Set environment variables
> **TODO**: Update this list of environment variables to prod parity

Open <code>.env.production</code> on your local machine and set all of the values. See also <a href="https://github.com/getloom/loom/blob/main/src/lib/infra/.env.production.example"
			>src/lib/infra/.env.production.example</a
		>:

* <code>DEPLOY_IP</code> to the IP address of your server
* <code>DEPLOY_USER</code> to your server's user (defaults to <code>root</code>)
* <code>PUBLIC_DEPLOY_SERVER_HOST</code> is your domain, e.g. <code>getloom.org</code>
* <code>CERTBOT_EMAIL</code> is the email address to register with LetsEncrypt for an https certificate
* <code>COOKIE_KEYS</code> should be randomized (TODO do this during <code>gro infra/setup</code>)

>ensure you can log in to your instance with your configured details: `ssh ${DEPLOY_USER}@${DEPLOY_IP}`

Once you've configured your environment variables and have confirmed you can ssh in properly, follow the steps outlined in [Deployments](./deployments.md) to finish setting up your instance.

## Domain names
Loom is designed with the assumption that it will be accessible at a subdomain like `hub.yoururl.com`, leaving the home page of the domain available for a standard web site.

You will need to be comfortable setting your own DNS records if you wish to use a domain name.

Loom does have a feature for deploying a custom web site on the same VPS it is running on, see [deploying a custom home site](./admin.md#deploying-a-custom-home-site)

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
