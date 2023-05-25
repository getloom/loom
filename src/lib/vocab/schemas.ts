import type {VocabSchema} from '@feltjs/gro';

import {actionDatas} from '$lib/vocab/action/actionData';
import {parseSchemaName} from '$lib/util/schema';
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

export interface FeltVocabSchema extends VocabSchema {
	name: string;
	$anchor: string;
}
export const toFeltVocabSchema = (schema: VocabSchema): FeltVocabSchema => {
	schema.name = parseSchemaName(schema.$id);
	schema.$anchor = schema.name;
	return schema as FeltVocabSchema;
};

// Model schemas are distinct from the action schemas.
// They're the nouns compared to the action verbs.
export const modelSchemas: FeltVocabSchema[] = [
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
] as FeltVocabSchema[];

export const actionSchemas: FeltVocabSchema[] = actionDatas
	.flatMap((actionData) => [
		actionData.params,
		'response' in actionData ? actionData.response : (null as any),
	])
	.filter(Boolean);

export const schemas = modelSchemas.concat(actionSchemas);

// mutate the schemas with additional properties
for (const s of schemas) toFeltVocabSchema(s);
