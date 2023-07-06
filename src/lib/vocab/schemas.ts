import type {VocabSchema} from '@feltjs/gro';

import {toSchemaName} from '$lib/util/schema';
import {actionDatas} from '$lib/vocab/action/actionData';
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
import {PolicySchema, PolicyIdSchema, PolicyNameSchema} from '$lib/vocab/policy/policy.schema';

// Model schemas are distinct from the action schemas.
// They're the nouns compared to the action verbs.
export const modelSchemas: VocabSchema[] = [
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
	PolicyNameSchema,
];

export const actionSchemas: VocabSchema[] = actionDatas.reduce((schemas, actionData) => {
	if (actionData.params) schemas.push(actionData.params);
	if ('response' in actionData) schemas.push(actionData.response);
	return schemas;
}, [] as VocabSchema[]);

export const schemas = modelSchemas.concat(actionSchemas);

export const schemasByName = new Map(schemas.map((s) => [toSchemaName(s.$id), s]));
