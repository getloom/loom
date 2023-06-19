import type {EntityData} from '$lib/vocab/entity/entityData';
import type {
	CreatePolicyParams,
	CreateRoleParams,
	CreateSpaceParams,
} from '$lib/vocab/action/actionTypes';
import type {Policy} from '$lib/vocab/policy/policy';
import type {PermissionName} from '$lib/vocab/permission/permission';
import {permissionNames} from '$lib/vocab/permission/permissionHelpers';
import type {RoleId} from '$lib/vocab/role/role';
import type {HubId, InitialHubSettings} from '$lib/vocab/hub/hub';
import type {ActorId} from '$lib/vocab/actor/actor';

// TODO where does this belong? vocab?

export interface HubTemplate {
	name: string;
	settings?: InitialHubSettings;
	spaces?: SpaceTemplate[];
	roles?: RoleTemplate[];
}
export interface SpaceTemplate {
	name: string;
	path?: string;
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
	permission: PermissionName;
	data?: Policy['data'];
}
export type EntityTemplate = EntityData | string; // strings are inferred as `{type: 'Note', content: value}`

export const spaceTemplateToCreateSpaceParams = (
	template: SpaceTemplate,
	actor: ActorId,
	hub_id: HubId,
): CreateSpaceParams => ({
	actor,
	hub_id,
	name: template.name,
	path: template.path ?? '/' + template.name,
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
	permission: template.permission,
});

// TODO integrate with default space data, `$lib/vocab/space/defaultSpaces.ts`, will also clean up typecast
const allPolicies: PolicyTemplate[] = (permissionNames as PermissionName[]).map((permission) => ({
	permission,
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
			{permission: 'Ephemera'},
			{permission: 'InviteToHub'},
			{permission: 'CreateSpace'},
			{permission: 'UpdateSpace'},
			{permission: 'CreateEntity'},
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
