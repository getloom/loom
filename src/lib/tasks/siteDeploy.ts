import {Logger} from '@ryanatkn/belt/log.js';
import {blue, gray} from '$lib/server/colors.js';

import {spawn} from '@ryanatkn/belt/process.js';
import {unwrap} from '@ryanatkn/belt/result.js';
import {execSync} from 'node:child_process';
import {PUBLIC_SITE_HOST, PUBLIC_SITE_PORT} from '$env/static/public';

const log = new Logger(gray('[') + blue('siteDeploy') + gray(']'));
/**
 * Manages the build & deploy of the home site of a default, production loom instance.
 * @param sourceRepo
 * @param dev
 * @returns
 */
export const invoke = async (sourceRepo: string, dev: boolean): Promise<{ok: boolean}> => {
	//TODO BLOCK clean old build dirs
	const TIMESTAMP = Date.now();
	const DEPLOY_DIRNAME = `deploy_site_${TIMESTAMP}`;
	const CURRENT_DEPLOY_DIRNAME = 'current_site_deploy';
	//clone latest repo at dir above loom into timestamped site_<> dir?

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
		//TODO see if there's a way to make this it's own process
		unwrap(await spawn('npm', ['run', 'preview']));
		//TODO BLOCK refactor return type
		return {ok: true};
	} else {
		execSync(`pm2 stop site`);
		//since we're running this one without user input, we can get away with a direct exec
		execSync(
			`ORIGIN=https://${PUBLIC_SITE_HOST} PORT=${PUBLIC_SITE_PORT} pm2 start node --name 'site' -- build`,
		);
		process.chdir('../');
		execSync(`ln -sfn ${DEPLOY_DIRNAME}/ ${CURRENT_DEPLOY_DIRNAME}`);
		return {ok: true};
	}
};
