import type {VocabSchema} from '@feltjs/gro';

import {toSchemaName} from '$lib/util/schema';
import {actionDatas} from '$lib/vocab/action/actionData';
import {VocabNameSchema} from '$lib/vocab/vocab.schema';
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
	HubActorSchema,
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
import {PolicySchema, PolicyIdSchema, PolicyNameSchema} from '$lib/vocab/policy/policy.schema';

// Model schemas are distinct from the action schemas.
// They're the nouns compared to the action verbs.
export const modelSchemas: VocabSchema[] = [
	AccountActorSchema,
	AccountIdSchema,
	AccountSchema,
	AccountSettingsSchema,
	ActorIdSchema,
	ActorSchema,
	AssignmentIdSchema,
	AssignmentSchema,
	ClientAccountSchema,
	ClientAccountSessionSchema,
	ClientActorSchema,
	ClientGuestSessionSchema,
	ClientSessionSchema,
	EntityIdSchema,
	EntitySchema,
	GhostActorSchema,
	HubActorSchema,
	HubIdSchema,
	HubSchema,
	HubSettingsSchema,
	InitialHubSettingsSchema,
	PolicyIdSchema,
	PolicyNameSchema,
	PolicySchema,
	PublicActorSchema,
	RoleIdSchema,
	RoleSchema,
	SpaceIdSchema,
	SpaceSchema,
	TieIdSchema,
	TieSchema,
	VocabNameSchema,
];

export const actionSchemas: VocabSchema[] = actionDatas.reduce((schemas, actionData) => {
	if (actionData.params) schemas.push(actionData.params);
	if ('response' in actionData) schemas.push(actionData.response);
	return schemas;
}, [] as VocabSchema[]);

export const schemas = modelSchemas.concat(actionSchemas);

export const schemasByName = new Map(schemas.map((s) => [toSchemaName(s.$id), s]));
