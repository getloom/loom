import type {ServiceByName} from '$lib/app/eventTypes';
import {Ping, Ephemera} from '$lib/ui/uiEvents';

export const PingService: ServiceByName['Ping'] = {
	event: Ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};

export const EphemeraService: ServiceByName['Ephemera'] = {
	event: Ephemera,
	perform: async ({params}) => ({ok: true, status: 200, value: params}),
};
