import type {EntityData} from '$lib/vocab/entity/entityData.js';
import type {
	CreatePolicyParams,
	CreateRoleParams,
	CreateSpaceParams,
} from '$lib/vocab/action/actionTypes.js';
import type {Policy, PolicyName} from '$lib/vocab/policy/policy.js';
import {policyNames} from '$lib/vocab/policy/policyHelpers.js';
import type {RoleId} from '$lib/vocab/role/role.js';
import type {HubId, InitialHubSettings} from '$lib/vocab/hub/hub.js';
import type {ActorId} from '$lib/vocab/actor/actor.js';

// TODO where does this belong? vocab?

export interface HubTemplate {
	name: string;
	settings?: InitialHubSettings;
	spaces?: SpaceTemplate[];
	roles?: RoleTemplate[];
}
export interface SpaceTemplate {
	name: string;
	view: string;
	icon?: string;
	entities?: EntityTemplate[];
}
export interface RoleTemplate {
	name: string;
	creator?: boolean;
	default?: boolean;
	policies?: PolicyTemplate[];
}
export interface PolicyTemplate {
	name: PolicyName;
	data?: Policy['data'];
}
// TODO maybe this should include ties/path/etc
export type EntityTemplate = EntityData | string; // strings are inferred as `{content: value}`

export const spaceTemplateToCreateSpaceParams = (
	template: SpaceTemplate,
	actor: ActorId,
	hub_id: HubId,
): CreateSpaceParams => ({
	actor,
	hub_id,
	name: template.name,
	icon: template.icon ?? '?',
	view: template.view,
});

export const roleTemplateToCreateRoleParams = (
	template: RoleTemplate,
	actor: ActorId,
	hub_id: HubId,
): CreateRoleParams => ({
	actor,
	hub_id,
	name: template.name,
});

export const policyTemplateToCreatePolicyParams = (
	template: PolicyTemplate,
	actor: ActorId,
	role_id: RoleId,
): CreatePolicyParams => ({
	actor,
	role_id,
	name: template.name,
});

// TODO integrate with default space data, `$lib/vocab/space/defaultSpaces.ts`, will also clean up typecast
const allPolicies: PolicyTemplate[] = policyNames.map((name) => ({
	name,
}));

export const defaultAdminHubRoles: RoleTemplate[] = [
	{
		name: 'Admin',
		creator: true,
		default: true,
		policies: allPolicies,
	},
];

export const defaultCommunityHubRoles: RoleTemplate[] = [
	{
		name: 'Steward',
		creator: true,
		policies: allPolicies,
	},
	{
		name: 'Member',
		default: true,
		policies: [
			{name: 'ephemera'},
			{name: 'invite_to_hub'},
			{name: 'create_space'},
			{name: 'update_space'},
			{name: 'create_entity'},
		],
	},
];

export const defaultPersonalHubRoles: RoleTemplate[] = [
	{
		name: 'Owner',
		creator: true,
		default: true,
		policies: allPolicies,
	},
];
