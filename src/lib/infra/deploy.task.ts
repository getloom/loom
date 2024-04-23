import type {Task} from '@grogarden/gro';
import {spawn} from '@ryanatkn/belt/process.js';
import {SVELTEKIT_BUILD_DIRNAME, SERVER_DIST_PATH} from '@grogarden/gro/paths.js';
import {unwrap} from '@ryanatkn/belt/result.js';
import {exists} from '@grogarden/gro/fs.js';
import {mkdir} from 'node:fs/promises';

import {ENV_FILE_BASE, ENV_FILE_PROD, load_envs} from '$lib/server/env.js';

const ARTIFACT_PREFIX = 'app';
const ARTIFACTS_DIR = 'dist_app/';
const DEPLOY_DIRNAME_PREFIX = 'deploy';
const CURRENT_DEPLOY_DIRNAME = 'current_app_deploy';

export const task: Task = {
	summary: 'deploy or redeploy to production, after setup',
	run: async ({log, invoke_task}) => {
		// this is a no-op if it's already set up
		await invoke_task('infra/setup');

		//build and tar the deployment artifact
		await invoke_task('build');

		const {DEPLOY_IP, DEPLOY_USER} = await load_envs(false);

		const deploy_login = `${DEPLOY_USER}@${DEPLOY_IP}`;

		//TODO get upstream dependencies fixed and remove the tarballss
		const files: string[] = [
			SERVER_DIST_PATH,
			SVELTEKIT_BUILD_DIRNAME,
			'package.json',
			'package-lock.json',
			'svelte-gettable-stores-0.2.0.tgz',
			'util-0.18.1.tgz',
		];

		// TODO ensure_dir helper? or omit the `exists` check?
		if (!(await exists(ARTIFACTS_DIR))) {
			await mkdir(ARTIFACTS_DIR, {recursive: true});
		}

		const timestamp = Date.now();
		const artifact_name = `${ARTIFACT_PREFIX}_${timestamp}`;
		const artifact_filename = artifact_name + '.tar';
		const artifact_local_path = ARTIFACTS_DIR + artifact_filename;
		log.debug(`creating artifact ${artifact_local_path}`);
		unwrap(await spawn('tar', ['-cf', artifact_local_path, ...files]));
		//clean up any previous deploy directories (except the current one)
		log.debug('cleaning up previous deployments on server');
		await spawn('ssh', [
			deploy_login,
			`ls -t | grep ${DEPLOY_DIRNAME_PREFIX}_${ARTIFACT_PREFIX}_[0-9] | tail -n +2 | xargs -r rm -r --`,
		]);

		log.debug('copying the tar');
		await spawn('scp', [artifact_local_path, `${deploy_login}:${artifact_filename}`]);
		//unpack & start server
		log.debug('setting up the server deployment');
		const deploy_dirname = `${DEPLOY_DIRNAME_PREFIX}_${artifact_name}`;
		await spawn('ssh', [
			deploy_login,
			// TODO try to refactor to run `pm2 stop default` after this right before `pm2 start` below, was causing `npm ci` to fail
			`
				mkdir ${deploy_dirname};
				mv ${artifact_filename} ${deploy_dirname}/;
				cd ${deploy_dirname};
				tar -xf ${artifact_filename};
				echo 'stopping old deploy';
				pm2 stop default;
				echo 'npm ci';
				npm ci;
				cd ~;
				ln -sfn ${deploy_dirname}/ ${CURRENT_DEPLOY_DIRNAME};
			`,
		]);

		log.debug('copying secrets');
		await spawn('scp', [
			ENV_FILE_BASE,
			`${deploy_login}:${CURRENT_DEPLOY_DIRNAME}/${ENV_FILE_BASE}`,
		]);
		await spawn('scp', [
			ENV_FILE_PROD,
			`${deploy_login}:${CURRENT_DEPLOY_DIRNAME}/${ENV_FILE_PROD}`,
		]);

		log.debug('running after_deploy script');
		await spawn('ssh', [
			deploy_login,
			`
				cd ${deploy_dirname};
				npm run after_deploy;
				pm2 start npm -- run start --prefix ~/${CURRENT_DEPLOY_DIRNAME};
			`,
		]);
	},
};
