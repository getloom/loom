# Managing a production deployment

This document describes how to manage a deployed instance of Felt.

To deploy a self-hosted instance to production,
see the instructions at [`src/infra/README.md`](/src/infra/README.md).

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
