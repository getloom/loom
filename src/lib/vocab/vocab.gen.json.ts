import type {Gen} from '@feltjs/gro';
import {bundleSchemas} from '@feltjs/gro/dist/utils/schema.js';

import {schemas} from '$lib/vocab/schemas';

/**
 * Outputs a bunedled schema for the entire vocabulary.
 * More: https://json-schema.org/draft/2020-12/json-schema-core.html#name-bundling
 * @returns
 */
export const gen: Gen = async () => {
	// TODO make these options configurable
	const schema = bundleSchemas(
		schemas,
		'https://hub.felt.dev/schemas/vocab.json',
		'@feltjs/felt vocab',
	);
	return {
		filename: '../../static/schemas/vocab.json',
		content: JSON.stringify(schema),
	};
};
