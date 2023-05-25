import type {VocabSchema} from '@feltjs/gro';

import type {ServiceMethod} from '$lib/server/service';
import type {ClientActionName, ServiceActionName} from '$lib/vocab/action/actionTypes';

export type ActionData = ClientActionData | ServiceActionData;

export interface ClientActionData {
	type: 'ClientAction';
	name: ClientActionName;
	// TODO we want to enforce schemas so we can generate params forms and automatic randomizers
	params: VocabSchema | null;
	returns: string;
}

// Service actions are handled by a remote `Service` (`$lib/server/service.ts`).
// Their `route` property enables url route building for http methods.
export interface ServiceActionData {
	type: 'ServiceAction';
	name: ServiceActionName;
	authenticate?: boolean; // `true` by default -- does this service require login?
	authorize?: boolean; // `true` by default -- does this service require `params.actor`?
	websockets?: boolean; // `true` by default -- can this service be called via websockets?
	broadcast?: boolean; // `false` by default -- does this service action rebroadcast to other hub clients
	params: VocabSchema;
	response: VocabSchema;
	returns: string;
	// `ServiceAction`s have a `route` for http clients; websocket clients only need the action `name`
	route: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		method: ServiceMethod; // supports each `trouter` http method: https://github.com/lukeed/trouter#method
	};
}

export const parseServiceActionData = (
	actionData: ActionData | undefined,
): ServiceActionData | undefined => (actionData?.type === 'ServiceAction' ? actionData : undefined);
