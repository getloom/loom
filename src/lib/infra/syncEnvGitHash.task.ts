import type {Task} from '@grogarden/gro';
import {git_current_commit_hash} from '@grogarden/gro/git.js';

import {ENV_FILE_DEV, ENV_FILE_PROD, update_env_git_hash} from '$lib/server/env.js';

export const task: Task = {
	summary: 'write git hash to the appropriate environment variables file',
	run: async ({log}) => {
		const raw_git_hash = await git_current_commit_hash();
		if (!raw_git_hash) log.error('failed to load latest githash');
		const git_hash = raw_git_hash ?? 'main';

		const update_file = async (path: string) => {
			const updated = await update_env_git_hash(path, git_hash);
			if (updated) {
				log.info(`updated git hash at ${path} - ${git_hash}`);
			} else {
				log.info(`git hash already updated at ${path} - ${git_hash}`);
			}
		};

		await update_file(ENV_FILE_DEV);
		await update_file(ENV_FILE_PROD);
	},
};
