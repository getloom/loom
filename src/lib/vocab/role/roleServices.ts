import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/vocab/action/actionTypes';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleActions';
import {HUB_COLUMNS} from '$lib/vocab/hub/hubHelpers.server';

const log = new Logger(gray('[') + blue('roleServices') + gray(']'));

export const CreateRoleService: ServiceByName['CreateRole'] = {
	action: CreateRole,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {hub_id, name} = params;
		await checkPolicy('create_role', hub_id);
		log.debug('creating hub role', hub_id, name);
		const role = await repos.role.create(hub_id, name);
		return {ok: true, status: 200, value: {role}, broadcast: hub_id};
	},
};

export const ReadRolesService: ServiceByName['ReadRoles'] = {
	action: ReadRoles,
	transaction: false,
	perform: async ({repos, params, checkHubAccess}) => {
		const {hub_id} = params;
		await checkHubAccess(hub_id);
		log.debug('retrieving roles for hub', hub_id);
		const roles = await repos.role.filterByHub(hub_id);
		return {ok: true, status: 200, value: {roles}};
	},
};

export const UpdateRoleService: ServiceByName['UpdateRole'] = {
	action: UpdateRole,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {role_id, name} = params;
		log.debug('updating role', role_id, name);
		const hub = await repos.hub.findByRole(role_id, HUB_COLUMNS.hub_id);
		if (!hub) return {ok: false, status: 404, message: 'no hub found'};
		await checkPolicy('update_role', hub.hub_id);
		const role = await repos.role.update(role_id, name);
		return {ok: true, status: 200, value: {role}, broadcast: hub.hub_id};
	},
};

export const DeleteRoleService: ServiceByName['DeleteRole'] = {
	action: DeleteRole,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {role_id} = params;
		log.debug('deleting role', role_id);
		const hub = await repos.hub.findByRole(role_id, HUB_COLUMNS.hub_id_settings);
		if (!hub) return {ok: false, status: 404, message: 'no hub found'};
		await checkPolicy('delete_role', hub.hub_id);

		if (hub.settings.defaultRoleId === role_id) {
			return {ok: false, status: 405, message: 'deleting the default role is not allowed'};
		}

		await repos.role.deleteById(role_id);

		return {ok: true, status: 200, value: null, broadcast: hub.hub_id};
	},
};
