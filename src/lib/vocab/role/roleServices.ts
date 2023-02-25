import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleEvents';
import {checkCommunityAccess, checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';

const log = new Logger(gray('[') + blue('roleServices') + gray(']'));

export const CreateRoleService: ServiceByName['CreateRole'] = {
	event: CreateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {community_id, name, actor} = params;
			await checkPolicy(permissions.CreateRole, actor, community_id, repos);
			log.trace('creating community role', community_id, name);
			const role = unwrap(await repos.role.create(community_id, name));
			return {ok: true, status: 200, value: {role}};
		}),
};

export const ReadRolesService: ServiceByName['ReadRoles'] = {
	event: ReadRoles,
	perform: async ({repos, params}) => {
		const {actor, community_id} = params;
		await checkCommunityAccess(actor, community_id, repos);
		log.trace('retrieving roles for community', community_id);
		const roles = unwrap(await repos.role.filterByCommunity(community_id));
		return {ok: true, status: 200, value: {roles}};
	},
};

export const UpdateRoleService: ServiceByName['UpdateRole'] = {
	event: UpdateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, role_id, name} = params;
			log.trace('updating role', role_id, name);
			const {community_id} = unwrap(await repos.community.findByRole(role_id));
			await checkPolicy(permissions.UpdateRole, actor, community_id, repos);
			const role = unwrap(await repos.role.update(role_id, name));
			return {ok: true, status: 200, value: {role}};
		}),
};

export const DeleteRoleService: ServiceByName['DeleteRole'] = {
	event: DeleteRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, role_id} = params;
			log.trace('deleting role', role_id);
			const community = unwrap(await repos.community.findByRole(role_id));
			await checkPolicy(permissions.DeleteRole, actor, community.community_id, repos);

			if (community.settings.defaultRoleId === role_id) {
				return {ok: false, status: 405, message: 'deleting the default role is not allowed'};
			}

			unwrap(await repos.role.deleteById(role_id));

			return {ok: true, status: 200, value: null};
		}),
};
