import {DialogDataSchema} from '@feltjs/felt-ui/dialog.schema.js';
import type {VocabSchema} from '@feltjs/gro/dist/utils/schema.js';

import {actionDatas} from '$lib/app/actionData';
import {toSchemaName} from '$lib/util/schema';
import {
	AccountSchema,
	AccountIdSchema,
	ClientAccountSchema,
	AccountSettingsSchema,
	ClientSessionSchema,
	ClientAccountSessionSchema,
	ClientGuestSessionSchema,
} from '$lib/vocab/account/account.schema';
import {
	ActorSchema,
	ActorIdSchema,
	AccountActorSchema,
	CommunityActorSchema,
	GhostActorSchema,
	PublicActorSchema,
	ClientActorSchema,
} from '$lib/vocab/actor/actor.schema';
import {
	HubSchema,
	HubIdSchema,
	HubSettingsSchema,
	InitialHubSettingsSchema,
} from '$lib/vocab/hub/hub.schema';
import {AssignmentSchema, AssignmentIdSchema} from '$lib/vocab/assignment/assignment.schema';
import {SpaceSchema, SpaceIdSchema} from '$lib/vocab/space/space.schema';
import {EntitySchema, EntityIdSchema} from '$lib/vocab/entity/entity.schema';
import {TieSchema, TieIdSchema} from '$lib/vocab/tie/tie.schema';
import {RoleSchema, RoleIdSchema} from '$lib/vocab/role/role.schema';
import {PolicySchema, PolicyIdSchema} from '$lib/vocab/policy/policy.schema';

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
	AccountIdSchema,
	ClientAccountSchema,
	AccountSettingsSchema,
	ClientSessionSchema,
	ClientAccountSessionSchema,
	ClientGuestSessionSchema,
	ActorSchema,
	ActorIdSchema,
	AccountActorSchema,
	CommunityActorSchema,
	GhostActorSchema,
	PublicActorSchema,
	ClientActorSchema,
	HubSchema,
	HubIdSchema,
	HubSettingsSchema,
	InitialHubSettingsSchema,
	AssignmentSchema,
	AssignmentIdSchema,
	SpaceSchema,
	SpaceIdSchema,
	EntitySchema,
	EntityIdSchema,
	TieSchema,
	TieIdSchema,
	RoleSchema,
	RoleIdSchema,
	PolicySchema,
	PolicyIdSchema,
].map((s) => toFeltVocabSchema(s as VocabSchema));

export const schemas = vocabSchemas.concat(
	actionDatas
		.flatMap((actionData) => [
			actionData.params,
			'response' in actionData ? actionData.response : (null as any),
		])
		.filter(Boolean)
		.map(toFeltVocabSchema),
	// Include external schema dependencies.
	toFeltVocabSchema(DialogDataSchema as VocabSchema),
);
