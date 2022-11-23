import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';
import {unwrap} from '@feltcoop/util';

import {ENV_FILE_BASE, ENV_FILE_PROD, fromEnv} from '$lib/server/env';
import {DEPLOYED_SCRIPT_PATH} from '$lib/infra/helpers';

export const task: Task = {
	summary: 'deploy felt-server to production',
	production: true,
	run: async ({invokeTask, log}) => {
		await invokeTask('lib/infra/updateEnv');

		//build the actual tar deployment artifact,
		//using `spawn` instead of `invokeTask` to ensure the environment modified above is updated
		const buildResult = await spawn('npx', ['gro', 'build']);
		if (!buildResult.ok) throw Error('gro build failed');

		const DEPLOY_IP = fromEnv('DEPLOY_IP');
		const DEPLOY_USER = fromEnv('DEPLOY_USER');
		const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

		const timestamp = Date.now();
		const artifactName = `felt_server_${timestamp}`;
		const artifactFilename = artifactName + '.tar';
		const currentDeploy = `current_felt_server_deploy`;
		log.trace(`Working with artifact: ${artifactName}`);
		unwrap(
			await spawn('tar', [
				'-cvf',
				`${artifactFilename}`,
				DIST_DIRNAME,
				'package.json',
				'package-lock.json',
			]),
		);
		log.trace('tar finished');
		//clean up any previous deploy directories (except the current one)
		log.trace('cleaning up previous deployments on server');
		await spawn('ssh', [
			deployLogin,
			`ls -t | grep deploy_felt_server_[0-9] | tail -n +2 | xargs rm -r --`,
		]);

		log.trace('copying the tar');
		await spawn('scp', [`${artifactFilename}`, `${deployLogin}:${artifactFilename}`]);
		//unpack & start server
		log.trace('setting up the server deployment');
		const deployDirname = `deploy_${artifactName}`;
		await spawn('ssh', [
			deployLogin,
			`mkdir ${deployDirname};
			mv ${artifactFilename} ${deployDirname}/;
			cd ${deployDirname};
			tar -xvf ${artifactFilename};
			echo 'moving node_modules';
			mv ~/${currentDeploy}/node_modules ./ && echo 'reusing node_modules' || echo 'no node_modules to reuse';
			echo 'npm i';
			npm i;
			cd ~;
			ln -sfn ${deployDirname}/ ${currentDeploy};`,
		]);

		log.trace('copying secrets');
		await spawn('scp', [ENV_FILE_BASE, `${deployLogin}:${currentDeploy}/${ENV_FILE_BASE}`]);
		await spawn('scp', [ENV_FILE_PROD, `${deployLogin}:${currentDeploy}/${ENV_FILE_PROD}`]);

		log.trace('running post-deploy script');
		await spawn('ssh', [
			deployLogin,
			`cd ${deployDirname};
			node dist/server/${DEPLOYED_SCRIPT_PATH}.js;`,
		]);

		/*

		TODO start the server:

		```bash
		git clone https://github.com/feltcoop/felt-server
		cd felt-server
		NODE_ENV=development npm i
		gro lib/db/migrate
		cd -
		pm2 start npm -- run start --prefix ${currentDeploy}
		# pm2 start npm -- run start --prefix current_felt_server_deploy
		
		```
		*/
	},
};
