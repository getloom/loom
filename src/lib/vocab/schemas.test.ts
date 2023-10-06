import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {parse_schema_name} from '@grogarden/gro/schema.js';

import {schemas} from '$lib/vocab/schemas.js';

/* test__schemas */
const test__schemas = suite('schemas');

for (const schema of schemas) {
	test__schemas('validate entity schema: ' + schema.$id, () => {
		try {
			assert.ok(typeof schema !== 'boolean'); // compared to using `t.type`, this makes TypeScript understand
			assert.ok(schema.$id);
			assert.ok(parse_schema_name(schema.$id));
		} catch (err) {
			throw Error('failed schema test for ' + schema.$id + ': ' + err);
		}
	});
}

test__schemas.run();
/* test__schemas */
