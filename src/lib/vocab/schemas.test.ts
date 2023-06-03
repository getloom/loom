import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {parseSchemaName} from '@feltjs/gro/dist/utils/schema.js';

import {schemas} from '$lib/vocab/schemas';

/* test__schemas */
const test__schemas = suite('schemas');

for (const schema of schemas) {
	test__schemas('validate entity schema: ' + schema.$id, () => {
		try {
			assert.ok(typeof schema !== 'boolean'); // compared to using `t.type`, this makes TypeScript understand
			assert.ok(schema.$id);
			assert.ok(parseSchemaName(schema.$id));
		} catch (err) {
			throw Error('failed schema test for ' + schema.$id + ': ' + err);
		}
	});
}

test__schemas.run();
/* test__schemas */