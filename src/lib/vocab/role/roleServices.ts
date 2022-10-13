import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleEvents';
import {Logger} from '@feltcoop/felt/util/log.js';

const log = new Logger(gray('[') + blue('roleServices') + gray(']'));

export const CreateRoleService: ServiceByName['CreateRole'] = {
	event: CreateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {community_id, name} = params;
			log.trace('creating community role', community_id, name);
			const createRoleResult = await repos.role.createRole(community_id, name);
			if (!createRoleResult.ok) {
				return {ok: false, status: 500, message: 'failed to create role'};
			}
			return {ok: true, status: 200, value: {role: createRoleResult.value}};
		}),
};

export const ReadRolesService: ServiceByName['ReadRoles'] = {
	event: ReadRoles,
	perform: async ({repos, params}) => {
		const {community_id} = params;
		log.trace('retrieving roles for community', community_id);
		const readRolesResult = await repos.role.filterByCommunityId(community_id);
		if (!readRolesResult.ok) {
			return {ok: false, status: 500, message: 'failed to find roles'};
		}
		return {
			ok: true,
			status: 200,
			value: {roles: readRolesResult.value},
		};
	},
};

export const UpdateRoleService: ServiceByName['UpdateRole'] = {
	event: UpdateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {role_id, name} = params;
			log.trace('updating role', role_id, name);
			const updateRoleResult = await repos.role.updateRole(role_id, name);
			if (!updateRoleResult.ok) {
				return {ok: false, status: 500, message: 'failed to update role'};
			}
			return {ok: true, status: 200, value: {role: updateRoleResult.value}};
		}),
};

export const DeleteRoleService: ServiceByName['DeleteRole'] = {
	event: DeleteRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {role_id} = params;
			log.trace('deleting role', role_id);
			const roleCommunityResult = await repos.community.findByRoleId(role_id);
			if (!roleCommunityResult.ok) {
				return {ok: false, status: 500, message: 'failed to find community for role'};
			}

			if (roleCommunityResult.value.settings.defaultRoleId === role_id) {
				return {ok: false, status: 405, message: 'deleting default role has been disallowed'};
			}

			const deleteRolesResult = await repos.role.deleteById(role_id);
			if (!deleteRolesResult.ok) {
				return {ok: false, status: 500, message: 'failed to delete roles'};
			}
			return {ok: true, status: 200, value: null};
		}),
};
