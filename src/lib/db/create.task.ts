import type {Task} from '@feltcoop/gro';
import {z} from 'zod';

import {obtainDb} from '$lib/db/obtainDb.js';

const Args = z
	.object({
		seed: z
			.boolean({description: ''})
			.optional() // TODO behavior differs now with zod, because of `default` this does nothing
			.default(true),
		'no-seed': z
			.boolean({description: 'opt out of seeding'})
			.optional() // TODO behavior differs now with zod, because of `default` this does nothing
			.default(false),
		much: z
			.boolean({description: 'seed a lot instead of a little'})
			.optional() // TODO behavior differs now with zod, because of `default` this does nothing
			.default(false),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'create the database from scratch, deleting and seeding data',
	Args,
	run: async ({invokeTask, args}) => {
		const {seed, much} = args;
		const [_, unobtainDb] = obtainDb();
		await invokeTask('lib/db/destroy');
		await invokeTask('lib/db/migrate');
		if (seed) await invokeTask('lib/db/seed', {much});
		unobtainDb();
	},
};
