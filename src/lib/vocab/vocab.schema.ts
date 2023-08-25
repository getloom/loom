import type {VocabSchema} from '@feltjs/gro';

import {schemaNames, vocabNames} from '$lib/vocab/metadata';

// TODO we may want this to be added to `schemas`, but it currently would cause cicularity
export const SchemaNameSchema = {
	$id: '/schemas/SchemaName',
	enum: schemaNames,
} satisfies VocabSchema;

export const VocabNameSchema = {
	$id: '/schemas/VocabName',
	enum: vocabNames,
} satisfies VocabSchema;
