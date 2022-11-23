import {DialogDataSchema} from '@feltcoop/felt/dialog.schema.js';
import type {VocabSchema} from '@feltcoop/gro/dist/utils/schema.js';

import {eventInfos} from '$lib/app/events';
import {toSchemaName} from '$lib/util/schema';
import {AccountSchema, AccountSettingsSchema} from '$lib/vocab/account/account.schema';
import {
	PersonaSchema,
	AccountPersonaSchema,
	CommunityPersonaSchema,
	GhostPersonaSchema,
	PublicPersonaSchema,
	ClientPersonaSchema,
} from '$lib/vocab/persona/persona.schema';
import {
	CommunitySchema,
	CommunitySettingsSchema,
	InitialCommunitySettingsSchema,
} from '$lib/vocab/community/community.schema';
import {AssignmentSchema} from '$lib/vocab/assignment/assignment.schema';
import {SpaceSchema} from '$lib/vocab/space/space.schema';
import {EntitySchema} from '$lib/vocab/entity/entity.schema';
import {TieSchema} from '$lib/vocab/tie/tie.schema';
import {RoleSchema} from '$lib/vocab/role/role.schema';
import {PolicySchema} from '$lib/vocab/policy/policy.schema';

// TODO The casts to `as VocabSchema` in this file
// are needed because the `json-schema` types are very strict,
// and `as const` fails due to `readonly` properties.
// It could be fixed by declaring schemas with their type,
// e.g. `export const AccountSchema: VocabSchema = {`
// but this has the downside of losing the inferred default types,
// which are handy when the schemas are used directly.

export interface FeltVocabSchema extends VocabSchema {
	name: string;
}
export const toFeltVocabSchema = (schema: VocabSchema): FeltVocabSchema => {
	schema.name = toSchemaName(schema.$id);
	return schema as FeltVocabSchema;
};

export const vocabSchemas = [
	AccountSchema,
	AccountSettingsSchema,
	PersonaSchema,
	AccountPersonaSchema,
	CommunityPersonaSchema,
	GhostPersonaSchema,
	PublicPersonaSchema,
	ClientPersonaSchema,
	CommunitySchema,
	CommunitySettingsSchema,
	InitialCommunitySettingsSchema,
	AssignmentSchema,
	SpaceSchema,
	EntitySchema,
	TieSchema,
	RoleSchema,
	PolicySchema,
].map((s) => toFeltVocabSchema(s as VocabSchema));

export const schemas = vocabSchemas.concat(
	eventInfos
		.flatMap((eventInfo) => [
			eventInfo.params,
			'response' in eventInfo ? eventInfo.response : (null as any),
		])
		.filter(Boolean)
		.map(toFeltVocabSchema),
	// Include external schema dependencies.
	toFeltVocabSchema(DialogDataSchema as VocabSchema),
);
