import type {ServiceByName} from '$lib/vocab/action/actionTypes';
import {Ping, Ephemera} from '$lib/ui/uiActions';
import {permissions} from '$lib/vocab/policy/permissions';
import {checkPolicy} from '$lib/vocab/policy/policyHelpers.server';

export const PingService: ServiceByName['Ping'] = {
	action: Ping,
	transaction: false,
	perform: async () => ({ok: true, status: 200, value: null}),
};

export const EphemeraService: ServiceByName['Ephemera'] = {
	action: Ephemera,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, space_id} = params;
		const space = await repos.space.findById(space_id);
		if (!space) {
			return {ok: false, status: 404, message: 'no space found'};
		}
		await checkPolicy(permissions.Ephemera, actor, space.hub_id, repos);
		return {ok: true, status: 200, value: params};
	},
};
