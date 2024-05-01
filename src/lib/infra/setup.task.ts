import type {Task} from '@ryanatkn/gro';
import {spawn} from '@ryanatkn/belt/process.js';
import {z} from 'zod';

import {green} from '$lib/server/colors.js';
import {render_502_html, render_nginx_config} from '$lib/infra/nginxConfig.js';
import {create_log_sequence} from '$lib/infra/helpers.js';
import {load_envs} from '$lib/server/env.js';

const Args = z
	.object({
		dry: z
			.boolean({description: 'log the generated script instead of executing it'})
			.default(false),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'setup a clean server to prepare for a loom deploy',
	Args,
	run: async ({log, args: {dry}, invoke_task}) => {
		await invoke_task('infra/syncEnvGitHash');

		const {
			PUBLIC_DEPLOY_SERVER_HOST,
			PUBLIC_ADMIN_EMAIL,
			PUBLIC_SERVER_HOSTNAME,
			PUBLIC_SERVER_PORT,
			DEPLOY_IP,
			DEPLOY_USER,
			CERTBOT_EMAIL,
			PGDATABASE,
			PGUSER,
			PGPASSWORD,
		} = await load_envs(false);

		const server_host = PUBLIC_SERVER_PORT
			? PUBLIC_SERVER_HOSTNAME + ':' + PUBLIC_SERVER_PORT
			: PUBLIC_SERVER_HOSTNAME;

		const NODE_VERSION = '20';
		const POSTGRES_VERSION = '15';

		const REMOTE_NGINX_CONFIG_PATH = '/etc/nginx/sites-available/felt.conf';
		const REMOTE_NGINX_SYMLINK_PATH = '/etc/nginx/sites-enabled/felt.conf';
		const REMOTE_NGINX_HTML_DIR = '/var/www/html';

		const nginxConfig = render_nginx_config(
			PUBLIC_DEPLOY_SERVER_HOST,
			server_host,
			REMOTE_NGINX_HTML_DIR,
		);
		const nginxHtmlSource = render_502_html(PUBLIC_ADMIN_EMAIL);

		// This file is used to detect if the setup script has already run.
		const APP_SETUP_STATE_FILE_PATH = '~/felt_state_setup';

		const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

		const logSequence = create_log_sequence();

		//TODO set up initial user accounts & directory system

		//Install initial tools for Node ecosystem
		const steps: string[] = [
			logSequence('Setting up server instance...') +
				//
				//
				// Configure shell behavior:
				// 	-e — exit the script if any command returns a nonzero exit code
				// 	-u — throw an error if nonexistent variables are accessed
				'set -eu;\n\n' +
				// Ensure the setup task has not already run on this instance:
				logSequence(`Checking setup state at ${APP_SETUP_STATE_FILE_PATH}`) +
				`if [ -f ${APP_SETUP_STATE_FILE_PATH} ]; then
					echo '${green('✓ app setup has already run on this instance, exiting without changes')}'
					exit
				fi;
				touch ${APP_SETUP_STATE_FILE_PATH};`,
			//
			//
			// Update and upgrade apt
			logSequence('Updating apt...') +
				`export DEBIAN_FRONTEND=noninteractive;
				apt update;
				apt upgrade -y;`,
			//
			//
			// Install fnm:
			logSequence('Installing fnm...') +
				`apt install -y unzip;
				curl -fsSL https://fnm.vercel.app/install | bash;
				export PATH="/root/.local/share/fnm:$PATH";
				echo 'export PATH='$PATH'
				  eval "\`fnm env\`"
				  '$(cat ~/.bashrc) > ~/.bashrc;
				eval "\`fnm env\`";`,
			//
			//
			// Install Node:
			logSequence('Installing Node...') +
				`fnm install ${NODE_VERSION};
				fnm use ${NODE_VERSION};
				fnm default ${NODE_VERSION};
				npm i -g npm@latest;`,
			//
			//
			// Install Node tools:
			logSequence('Installing pm2 and gro...') +
				`export NODE_ENV=production;
				echo "export NODE_ENV=production" >> ~/.profile;
				echo "export NODE_ENV=production
				  $(cat ~/.bashrc)" > ~/.bashrc;
				npm i -g pm2 @ryanatkn/gro;`,
			//
			//
			// Install nginx:
			logSequence('Installing nginx...') +
				`apt install -y nginx;
				sudo unlink /etc/nginx/sites-enabled/default;
				touch ${REMOTE_NGINX_CONFIG_PATH};
				echo '${nginxConfig}' >> ${REMOTE_NGINX_CONFIG_PATH};
				cat ${REMOTE_NGINX_CONFIG_PATH};
				ln -s ${REMOTE_NGINX_CONFIG_PATH} ${REMOTE_NGINX_SYMLINK_PATH};
				touch ${REMOTE_NGINX_HTML_DIR}/502.html;
				echo '${nginxHtmlSource}' >> ${REMOTE_NGINX_HTML_DIR}/502.html;
				systemctl start nginx;`,
			//
			//
			// Install certbot for HTTPS:
			logSequence('Enabling HTTPS with cerbot and nginx...') +
				`apt install -y certbot python3-certbot-nginx;
				certbot --nginx --non-interactive --agree-tos --email ${CERTBOT_EMAIL} -d ${PUBLIC_DEPLOY_SERVER_HOST};
				systemctl restart nginx.service;`,
			//
			//
			// Install Postgres:
			// More details at src/docs/database.md and https://www.postgresql.org/download/linux/ubuntu/
			logSequence('Installing Postgres...') +
				`sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list;';
				curl -L https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -;
				sudo apt update;
				sudo apt install -y postgresql-${POSTGRES_VERSION};`,
			//
			//
			// Create the Postgres database for Felt:
			logSequence('Creating Postgres database...') +
				`sudo -i -u postgres psql -c "CREATE DATABASE ${PGDATABASE};";` +
				`sudo -i -u postgres psql -c "ALTER USER ${PGUSER} WITH PASSWORD '${PGPASSWORD}';";` +
				// All done!!
				+`echo 'done' >> ${APP_SETUP_STATE_FILE_PATH};` +
				logSequence(`Success! Server is now setup for deployment.`),
		];
		const script = steps.map((s) => s + '\n\n').join('');
		if (dry) {
			log.info(green(`\n\ndry run! here's the script ↓\n\n`), `ssh ${deployLogin} ${script}`);
			log.info(green('\n\ndry run done ↑\n\n'));
			return;
		}
		const result = await spawn('ssh', [deployLogin, script]);
		if (!result.ok) {
			if (result.signal) log.error('spawn failed with signal', result.signal);
			throw Error('Failed setup task');
		}
	},
};
