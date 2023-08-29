import type {Task} from '@feltjs/gro';
import {z} from 'zod';

import {obtainDb} from '$lib/db/obtainDb';
import {seed} from '$lib/db/seed';

const Args = z
	.object({
		much: z.boolean({description: 'seed a lot instead of a little'}).default(false),
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
