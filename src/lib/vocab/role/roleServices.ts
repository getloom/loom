import {blue, gray} from 'kleur/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateRole, ReadRoles, UpdateRole, DeleteRoles} from '$lib/vocab/role/roleEvents';
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

export const DeleteRolesService: ServiceByName['DeleteRoles'] = {
	event: DeleteRoles,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {roleIds} = params;
			log.trace('deleting roles', roleIds);
			const deleteRolesResult = await repos.role.deleteByIds(roleIds);
			if (!deleteRolesResult.ok) {
				return {ok: false, status: 500, message: 'failed to delete roles'};
			}
			return {ok: true, status: 200, value: null};
		}),
};
