import type {Task} from '@feltjs/gro';
import {z} from 'zod';

import {obtainDb} from '$lib/db/obtainDb.js';
import {seed} from '$lib/db/seed.js';

const Args = z
	.object({
		much: z
			.boolean({description: 'seed a lot instead of a little'})
			.optional() // TODO behavior differs now with zod, because of `default` this does nothing
			.default(false),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'add initial dataset to the the database',
	Args,
	run: async ({args}) => {
		const {much} = args;
		const [db, unobtainDb] = obtainDb();
		await seed(db, much);
		unobtainDb();
	},
};
