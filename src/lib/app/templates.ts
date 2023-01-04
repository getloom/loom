import type {EntityData} from '$lib/vocab/entity/entityData';
import type {CreatePolicyParams, CreateRoleParams, CreateSpaceParams} from '$lib/app/eventTypes';
import type {Policy} from '$lib/vocab/policy/policy';
import {permissionNames, type PermissionName} from '$lib/vocab/policy/permissions';
import type {InitialCommunitySettings} from '$lib/vocab/community/community';

// TODO where does this belong? vocab?

export interface CommunityTemplate {
	name: string;
	settings?: InitialCommunitySettings;
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
	actor: number,
	community_id: number,
): CreateSpaceParams => ({
	actor,
	community_id,
	name: template.name,
	path: template.path ?? '/' + template.name,
	icon: template.icon ?? '?',
	view: template.view,
});

export const roleTemplateToCreateRoleParams = (
	template: RoleTemplate,
	actor: number,
	community_id: number,
): CreateRoleParams => ({
	actor,
	community_id,
	name: template.name,
});

export const policyTemplateToCreatePolicyParams = (
	template: PolicyTemplate,
	actor: number,
	role_id: number,
): CreatePolicyParams => ({
	actor,
	role_id,
	permission: template.permission,
});

// TODO integrate with default space data, `$lib/vocab/space/defaultSpaces.ts`
const allPolicies: PolicyTemplate[] = permissionNames.map((permission) => ({permission}));

export const defaultAdminCommunityRoles: RoleTemplate[] = [
	{
		name: 'Admin',
		creator: true,
		default: true,
		policies: allPolicies,
	},
];

export const defaultStandardCommunityRoles: RoleTemplate[] = [
	{
		name: 'Steward',
		creator: true,
		policies: allPolicies,
	},
	{
		name: 'Member',
		default: true,
		policies: [{permission: 'InviteToCommunity'}],
	},
];

export const defaultPersonalCommunityRoles: RoleTemplate[] = [
	{
		name: 'Owner',
		creator: true,
		default: true,
		policies: allPolicies,
	},
];
