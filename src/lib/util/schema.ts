import type {VocabSchema} from '@feltjs/gro';
import {traverse} from '@feltjs/util/object.js';

// see also $lib/util/ajv.ts

// TODO upstream to gro? schema lib?
export const bundleSchemas = (schemas: VocabSchema[]): VocabSchema => {
	const schema: VocabSchema = {
		$id: 'https://app.felt.dev/schemas/vocab.json',
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: '@feltjs/felt-server vocab',
		$defs: structuredClone(schemas)
			.sort((a, b) => parseSchemaName(a.$id)!.localeCompare(parseSchemaName(b.$id)!))
			.reduce(($defs, schema) => {
				const {name, $anchor, ...rest} = schema; // re-order properties for readability
				$defs[schema.name] = {name, $anchor, ...rest};
				return $defs;
			}, {} as Record<string, VocabSchema>),
	};
	// TODO HACK we're not supposed to mutate schema $ref, upstream this change to our schema defs,
	// moving from `/schemas/A` to `#A`
	traverse(schema, (key, value, obj) => {
		if (key === '$id' || key === 'name') {
			delete obj[key];
		} else if (key === '$ref') {
			obj[key] = '#' + parseSchemaName(value);
		}
	});
	return schema;
};

// TODO export from gro
export const parseSchemaName = ($id: string): string | null =>
	$id.startsWith('/schemas/') && $id.endsWith('.json') ? $id.substring(9, $id.length - 5) : null;
