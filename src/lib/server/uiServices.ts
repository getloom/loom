import type {ServiceByName} from '$lib/app/eventTypes';
import {Ping, Ephemera} from '$lib/ui/uiEvents';
import {permissions} from '$lib/vocab/policy/permissions';
import {checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {unwrap} from '@feltjs/util';

export const PingService: ServiceByName['Ping'] = {
	event: Ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};

export const EphemeraService: ServiceByName['Ephemera'] = {
	event: Ephemera,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, space_id} = params;
			const space = unwrap(await repos.space.findById(space_id));
			if (!space) {
				return {ok: false, status: 404, message: 'no space found'};
			}
			await checkPolicy(permissions.Ephemera, actor, space.community_id, repos);
			return {ok: true, status: 200, value: params};
		}),
};
