import type {Json_Schema} from '$lib/util/schema.js';

import {toSchemaName} from '$lib/util/schema.js';
import {actionDatas} from '$lib/vocab/action/actionData.js';
import {
	AccountSchema,
	AccountIdSchema,
	ClientAccountSchema,
	AccountSettingsSchema,
	ClientSessionSchema,
	ClientAccountSessionSchema,
	ClientGuestSessionSchema,
} from '$lib/vocab/account/accountSchema.js';
import {
	ActorSchema,
	ActorIdSchema,
	AccountActorSchema,
	HubActorSchema,
	GhostActorSchema,
	PublicActorSchema,
	ClientActorSchema,
} from '$lib/vocab/actor/actorSchema.js';
import {
	HubSchema,
	HubIdSchema,
	HubSettingsSchema,
	InitialHubSettingsSchema,
} from '$lib/vocab/hub/hubSchema.js';
import {AssignmentSchema, AssignmentIdSchema} from '$lib/vocab/assignment/assignmentSchema.js';
import {SpaceSchema, SpaceIdSchema} from '$lib/vocab/space/spaceSchema.js';
import {EntitySchema, EntityIdSchema} from '$lib/vocab/entity/entitySchema.js';
import {TieSchema, TieIdSchema} from '$lib/vocab/tie/tieSchema.js';
import {RoleSchema, RoleIdSchema} from '$lib/vocab/role/roleSchema.js';
import {PolicySchema, PolicyIdSchema, PolicyNameSchema} from '$lib/vocab/policy/policySchema.js';

// Model schemas are distinct from the action schemas.
// They're the nouns compared to the action verbs.
export const modelSchemas: Json_Schema[] = [
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
];

export const actionSchemas: Json_Schema[] = actionDatas.reduce((schemas, actionData) => {
	if (actionData.params) schemas.push(actionData.params);
	if ('response' in actionData) schemas.push(actionData.response);
	return schemas;
}, [] as Json_Schema[]);

export const schemas = modelSchemas.concat(actionSchemas);

export const schemasByName = new Map(schemas.map((s) => [toSchemaName(s.$id), s]));
