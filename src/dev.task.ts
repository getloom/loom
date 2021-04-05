import type {Task} from '@feltcoop/gro/dist/task/task.js';
import {spawnProcess} from '@feltcoop/gro/dist/utils/process.js';

// CLI args are forwarded to `svelte-kit`

export const task: Task = {
	description: 'start dev server',
	run: async ({invokeTask}) => {
		await Promise.all([
			// Start SvelteKit and Vite, which own the entire frontend build.
			spawnProcess('npx', ['svelte-kit', 'dev', ...process.argv.slice(3)]),
			// Run the default builtin Gro dev task.
			// Running `invokeTask('dev')` without the `gro/` prefix
			// would call this task we're in right now in an infinite loop.
			// This builtin dev task defaults to
			// building the project's server and Node stuff like this task,
			// but Gro currently does nothing with the frontend by default:
			// https://github.com/feltcoop/gro/issues/106
			invokeTask('gro/dev'),
		]);
	},
};
