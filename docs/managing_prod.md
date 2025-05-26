# Managing a production deployment
This document describes how to manage a deployed instance of <a
			href="https://github.com/getloom/loom"><code>@getloom/loom</code></a
		>.
	</p>
	<p>
		To deploy a self-hosted instance to production, see the instructions at
		<a href="{base}{path}/guide/admin/deploying-production"
			><code>guide/admin/deploying-production</code></a
		>.
	</p>

## Log into the instance

`ssh ${DEPLOY_USER}@${DEPLOY_IP}`

> <code>DEPLOY_USER</code> and <code>DEPLOY_IP</code> are defined in `.env.production` in the project directory root

## Managing the process with pm2

```
pm2 ls
pm2 restart 0 # or whatever id
```

## Logs

```
pm2 log # tails last 15 lines of each log
vi /$${'{'}DEPLOY_USER}/.pm2/logs/npm-out.log # open the app log
```

## Postgres
```sudo -i -u postgres psql
\\l # list databases
\\c loom # connect to <code>loom</code>
\\dt # list tables
SELECT count(*) FROM accounts; # any SQL
```

### dumping and restoring the loom database

The following command makes a backup dump of the default <code>loom</code> table</p>

`sudo -i -u postgres pg_dump loom > backup.sql`

And these commands can restore that dump to the default loom table. Note: you may have to drop and recreate the <code>loom</code> table first
	</p>
`sudo -i -u postgres psql -d loom {'<'} backup.sql`

## Nginx
See <a
			href="https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04"
			>this tutorial</a
		>.
```
sudo ln -s /etc/nginx/sites-available/${PUBLIC_DEPLOY_SERVER} /etc/nginx/sites-enabled/
sudo systemctl stop nginx
sudo systemctl start nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo service nginx status # this is an alternative to systemctl for restart, etc
```


## Letsencrypt

Backup your https credentials:</p>

```
# on server:
tar zcvf /tmp/letsencrypt_backup_$(date +'%Y-%m-%d_%H%M').tar.gz /etc/letsencrypt
# then local:
scp ${DEPLOY_USER}@${DEPLOY_IP}:/tmp/letsencrypt_backup_2022-11-14_0444.tar.gz letsencrypt_backup.tar.gz```