<script lang="ts">
	import {base} from '$app/paths';

	import CodeExample from '$lib/ui/CodeExample.svelte';
</script>

<div class="prose">
	<h2>Managing a production deployment</h2>
	<p>
		This document describes how to manage a deployed instance of <a
			href="https://github.com/feltjs/felt-server"><code>@feltjs/felt-server</code></a
		>.
	</p>
	<p>
		To deploy a self-hosted instance to production, see the instructions at
		<a href="{base}/deploying-production"><code>src/docs/deploying-production.md</code></a>.
	</p>

	<h3>Log into the instance</h3>

	<CodeExample code={`ssh $${'{'}DEPLOY_USER}@$${'{'}DEPLOY_IP}`} />

	<blockquote>
		<code>DEPLOY_USER</code> and <code>DEPLOY_IP</code> are defined in `.env.production` in the project
		directory root
	</blockquote>

	<h3>Managing the process with pm2</h3>

	<CodeExample
		code={`pm2 ls
pm2 restart 0 # or whatever id`}
	/>

	<h3>Logs</h3>

	<CodeExample
		code={`pm2 logs # tails last 15 lines of each log
vi /$${'{'}DEPLOY_USER}/.pm2/logs/npm-out.log # open the app log`}
	/>

	<h3>Postgres</h3>

	<CodeExample
		code={`sudo -i -u postgres psql
\\l # list databases
\\c felt # connect to <code>felt</code>
\\dt # list tables
SELECT count(*) FROM accounts; # any SQL`}
	/>

	<h4>dumping and restoring the felt database</h4>

	<p>The following command makes a backup dump of the default <code>felt</code> table</p>

	<CodeExample code={`sudo -i -u postgres pg_dump felt > backup.sql`} />

	<p>
		And these commands can restore that dump to the default felt table. Note: you may have to drop
		and recreate the <code>felt</code> table first
	</p>
	<CodeExample code={`sudo -i -u postgres psql -d felt {'<'} backup.sql`} />

	<h3>Nginx</h3>

	<p>
		See <a
			href="https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04"
			>this tutorial</a
		>.
	</p>
	<CodeExample
		code={`sudo ln -s /etc/nginx/sites-available/$${'{'}PUBLIC_DEPLOY_SERVER} /etc/nginx/sites-enabled/
sudo systemctl stop nginx
sudo systemctl start nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo service nginx status # this is an alternative to systemctl for restart, etc`}
	/>

	<h3>Letsencrypt</h3>

	<p>Backup your https credentials:</p>

	<CodeExample
		code={`# on server:
tar zcvf /tmp/letsencrypt_backup_$(date +'%Y-%m-%d_%H%M').tar.gz /etc/letsencrypt
# then local:
scp $${'{'}DEPLOY_USER}@$${'{'}DEPLOY_IP}:/tmp/letsencrypt_backup_2022-11-14_0444.tar.gz letsencrypt_backup.tar.gz`}
	/>
</div>
