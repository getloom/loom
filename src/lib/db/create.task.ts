import type {Task} from '@grogarden/gro';
import {z} from 'zod';

import {obtainDb} from '$lib/db/obtainDb.js';

const Args = z
	.object({
		seed: z.boolean({description: ''}).default(true),
		'no-seed': z.boolean({description: 'opt out of seeding'}).default(false),
		much: z.boolean({description: 'seed a lot instead of a little'}).default(false),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'create the database from scratch, deleting and seeding data',
	Args,
	run: async ({invoke_task, args}) => {
		const {seed, much} = args;
		const [_, unobtainDb] = obtainDb();
		await invoke_task('db/destroy');
		await invoke_task('db/migrate');
		if (seed) await invoke_task('db/seed', {much});
		unobtainDb();
	},
};
