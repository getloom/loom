import {parseServiceActionData, type ServiceActionData} from '$lib/vocab/action/action';
import {eventInfoByName} from '$lib/app/actionData';

export const findHttpService = (name: string): ServiceActionData | undefined =>
	parseServiceActionData(eventInfoByName.get(name));

// Websocket services include all of the http services except those that require authorization,
// because our server currently disallows unauthenticated websocket connections.
export const findWebsocketService = (name: string): ServiceActionData | undefined => {
	const serviceActionData = parseServiceActionData(eventInfoByName.get(name));
	if (!serviceActionData) return undefined;
	return serviceActionData.authenticate === false || serviceActionData.websockets === false
		? undefined
		: serviceActionData;
};
