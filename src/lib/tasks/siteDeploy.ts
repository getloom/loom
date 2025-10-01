import {Logger} from '@ryanatkn/belt/log.js';
import {blue, gray} from '$lib/server/colors.js';

import {spawn, spawn_process} from '@ryanatkn/belt/process.js';
import {unwrap} from '@ryanatkn/belt/result.js';
import {execSync} from 'node:child_process';
import {PUBLIC_SITE_HOST, PUBLIC_SITE_PORT} from '$env/static/public';
import type {Task} from '$lib/vocab/task/task';
import type { RunTaskResponseResult } from '$lib/vocab/action/actionTypes';

const log = new Logger(gray('[') + blue('siteDeploy') + gray(']'));

export class SiteDeployTask implements Task {
	/**
	 * Manages the build & deploy of the home site of a default, production loom instance.
	 * @param sourceRepo
	 * @param dev
	 * @returns
	 */
	async invoke(args: string[], dev: boolean): Promise<RunTaskResponseResult> {
		const TIMESTAMP = Date.now();
		const DEPLOY_DIRNAME = `deploy_site_${TIMESTAMP}`;
		const CURRENT_DEPLOY_DIRNAME = 'current_site_deploy';
		const sourceRepo = args[0];
		//clone latest repo at dir above loom into timestamped site_<> dir?
		log.warn('running new deploy of static site');
		process.chdir('../');
		unwrap(await spawn('mkdir', [`${DEPLOY_DIRNAME}`]));
		unwrap(await spawn('git', ['clone', sourceRepo, DEPLOY_DIRNAME]));
		process.chdir(DEPLOY_DIRNAME);
		unwrap(await spawn('npm', ['ci']));
		unwrap(await spawn('npm', ['run', 'build']));
		//symlink
		//run start command
		if (dev) {
			log.warn('script is in dev mode');
			//TODO do a little more cleanup around preview
			//for now you can always use this command
			//`kill $(lsof -t -i:4173)`
			spawn_process('npm', ['run', 'preview']);
			log.warn('finished starting preview');
			process.chdir('../');
		} else {
			execSync(`pm2 stop site`);
			//since we're running this one without user input, we can get away with a direct exec
			execSync(
				`ORIGIN=https://${PUBLIC_SITE_HOST} PORT=${PUBLIC_SITE_PORT} pm2 start node --name 'site' -- build`,
			);
			process.chdir('../');
			execSync(`ln -sfn ${DEPLOY_DIRNAME}/ ${CURRENT_DEPLOY_DIRNAME}`);
		}
		log.warn('cleaning up previous deploys');
		execSync(`ls -t | grep deploy_site_[0-9] | tail -n +3 | xargs -r rm -r --`);
		return {ok: true, status: 200, value: {message: "site deployed succesfully"}};
	}
}
