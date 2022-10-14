import {Logger} from '@feltcoop/felt/util/log.js';
import {unwrap} from '@feltcoop/felt';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleEvents';

const log = new Logger(gray('[') + blue('roleServices') + gray(']'));

export const CreateRoleService: ServiceByName['CreateRole'] = {
	event: CreateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {community_id, name} = params;
			log.trace('creating community role', community_id, name);
			const role = unwrap(await repos.role.createRole(community_id, name));
			return {ok: true, status: 200, value: {role}};
		}),
};

export const ReadRolesService: ServiceByName['ReadRoles'] = {
	event: ReadRoles,
	perform: async ({repos, params}) => {
		const {community_id} = params;
		log.trace('retrieving roles for community', community_id);
		const roles = unwrap(await repos.role.filterByCommunityId(community_id));
		return {ok: true, status: 200, value: {roles}};
	},
};

export const UpdateRoleService: ServiceByName['UpdateRole'] = {
	event: UpdateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {role_id, name} = params;
			log.trace('updating role', role_id, name);
			const role = unwrap(await repos.role.updateRole(role_id, name));
			return {ok: true, status: 200, value: {role}};
		}),
};

export const DeleteRoleService: ServiceByName['DeleteRole'] = {
	event: DeleteRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {role_id} = params;
			log.trace('deleting role', role_id);
			const community = unwrap(await repos.community.findByRoleId(role_id));

			if (community.settings.defaultRoleId === role_id) {
				return {ok: false, status: 405, message: 'deleting the default role is not allowed'};
			}

			unwrap(await repos.role.deleteById(role_id));

			return {ok: true, status: 200, value: null};
		}),
};
