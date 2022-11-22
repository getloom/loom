# Managing a production deployment

This document describes how to manage a deployed instance of
[`@feltcoop/felt-server`](https://github.com/feltcoop/felt-server).

To deploy a self-hosted instance to production,
see the instructions at
[`src/docs/deploying-production.md`](/src/docs/deploying-production.md).

## Log into the instance

```bash
ssh ${DEPLOY_USER}@${DEPLOY_IP}
```

> `DEPLOY_USER` and `DEPLOY_IP` are defined in `.env.production` in the project directory root

## Managing the process with pm2

```bash
pm2 ls
pm2 restart 0 # or whatever id
```

## Logs

```bash
pm2 logs # tails last 15 lines of each log
vi /${DEPLOY_USER}/.pm2/logs/npm-out.log # open the app log
```

## Postgres

```bash
sudo -i -u postgres psql
\l # list databases
\c felt # connect to `felt`
\dt # list tables
SELECT count(*) FROM accounts; # any SQL
```

## Nginx

See this tutorial:
<https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04>

```bash
sudo ln -s /etc/nginx/sites-available/${PUBLIC_DEPLOY_SERVER} /etc/nginx/sites-enabled/
sudo systemctl stop nginx
sudo systemctl start nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo service nginx status # this is an alternative to systemctl for restart, etc
```

## Letsencrypt

Backup your https credentials:

```bash
# on server:
tar zcvf /tmp/letsencrypt_backup_$(date +'%Y-%m-%d_%H%M').tar.gz /etc/letsencrypt
# then local:
scp ${DEPLOY_USER}@${DEPLOY_IP}:/tmp/letsencrypt_backup_2022-11-14_0444.tar.gz letsencrypt_backup.tar.gz
```
