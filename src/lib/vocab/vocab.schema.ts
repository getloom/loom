import type {Json_Schema} from '@grogarden/gro/schema.js';

import {schemaNames, vocabNames} from '$lib/vocab/metadata.js';

// TODO we may want this to be added to `schemas`, but it currently would cause cicularity
export const SchemaNameSchema = {
	$id: '/schemas/SchemaName',
	enum: schemaNames,
} satisfies Json_Schema;

export const VocabNameSchema = {
	$id: '/schemas/VocabName',
	enum: vocabNames,
} satisfies Json_Schema;
