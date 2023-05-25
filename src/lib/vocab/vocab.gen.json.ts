import type {Gen} from '@feltjs/gro';

import {schemas} from '$lib/vocab/schemas';
import {bundleSchemas} from '$lib/util/schema';

/**
 * Outputs a bunedled schema for the entire vocabulary.
 * More: https://json-schema.org/draft/2020-12/json-schema-core.html#name-bundling
 * @returns
 */
export const gen: Gen = async () => {
	const schema = bundleSchemas(schemas);
	return {
		filename: '../../static/schemas/vocab.json',
		content: JSON.stringify(schema),
	};
};
