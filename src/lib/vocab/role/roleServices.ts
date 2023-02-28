import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleEvents';
import {checkHubAccess, checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';

const log = new Logger(gray('[') + blue('roleServices') + gray(']'));

export const CreateRoleService: ServiceByName['CreateRole'] = {
	event: CreateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {hub_id, name, actor} = params;
			await checkPolicy(permissions.CreateRole, actor, hub_id, repos);
			log.trace('creating hub role', hub_id, name);
			const role = unwrap(await repos.role.create(hub_id, name));
			return {ok: true, status: 200, value: {role}};
		}),
};

export const ReadRolesService: ServiceByName['ReadRoles'] = {
	event: ReadRoles,
	perform: async ({repos, params}) => {
		const {actor, hub_id} = params;
		await checkHubAccess(actor, hub_id, repos);
		log.trace('retrieving roles for hub', hub_id);
		const roles = unwrap(await repos.role.filterByHub(hub_id));
		return {ok: true, status: 200, value: {roles}};
	},
};

export const UpdateRoleService: ServiceByName['UpdateRole'] = {
	event: UpdateRole,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, role_id, name} = params;
			log.trace('updating role', role_id, name);
			const {hub_id} = unwrap(await repos.hub.findByRole(role_id));
			await checkPolicy(permissions.UpdateRole, actor, hub_id, repos);
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
			const hub = unwrap(await repos.hub.findByRole(role_id));
			await checkPolicy(permissions.DeleteRole, actor, hub.hub_id, repos);

			if (hub.settings.defaultRoleId === role_id) {
				return {ok: false, status: 405, message: 'deleting the default role is not allowed'};
			}

			unwrap(await repos.role.deleteById(role_id));

			return {ok: true, status: 200, value: null};
		}),
};
