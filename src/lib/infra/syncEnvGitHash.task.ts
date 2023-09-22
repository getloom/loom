import type {Task} from '@feltjs/gro';
import {spawnProcess} from '@grogarden/util/process.js';
import {ENV_FILE_DEV, ENV_FILE_PROD, syncEnvGitHash, initEnv, reloadEnv} from '$lib/server/env';

export const task: Task = {
	summary: 'write git hash to the appropriate environment variables file',
	run: async ({fs, log, dev}) => {
		initEnv();

		const envFile = dev ? ENV_FILE_DEV : ENV_FILE_PROD;
		const branch = (await fs.readFile('.git/HEAD', 'utf8')).trim().substring(5);

		let gitHashContents = '';
		const buildResult = spawnProcess('git', ['show-ref', '-s', branch], {stdio: 'pipe'});
		buildResult.child.stdout?.on('data', (data: Buffer) => {
			gitHashContents += data.toString().trim();
		});
		await buildResult.closed;

		if (gitHashContents === '') log.error('failed to load latest githash');
		const currentEnvContents = await fs.readFile(envFile, 'utf8');
		const gitHash = gitHashContents.trim().substring(0, 7);
		const updatedEnvContents = syncEnvGitHash(currentEnvContents, 'PUBLIC_GIT_HASH', gitHash);
		if (currentEnvContents !== updatedEnvContents) {
			log.info(`writing updated git hash ${gitHash} to ${envFile}`);
			await fs.writeFile(envFile, updatedEnvContents, 'utf8');
		} else {
			log.info(`git hash already updated to ${gitHash} in ${envFile}`);
		}

		reloadEnv();
	},
};
