import {writable} from '@feltcoop/svelte-gettable-stores';

import type {App} from '$lib/ui/app.js';
import {toUi} from '$lib/ui/ui.js';
import {toHttpApiClient} from '$lib/ui/HttpApiClient.js';
import type {ActionParamsByName, ActionResponseByName} from '$lib/vocab/action/actionTypes.js';
import {toActions} from '$lib/vocab/action/actions.js';
import {findHttpService} from '$lib/ui/services.js';
import {mutations} from '$lib/ui/mutations.js';
import {deserialize, deserializers} from '$lib/util/deserialize.js';
import {createQuery} from '$lib/util/query.js';

export interface TestAppContext {
	app: App;
}

export const setupApp = async (context: TestAppContext): Promise<void> => {
	const ui = toUi({guest: true}, false, {});
	const httpApiClient = toHttpApiClient<ActionParamsByName, ActionResponseByName>(
		findHttpService,
		deserialize(deserializers),
	);
	const actions = toActions(ui, mutations, () => httpApiClient);
	context.app = {
		ui,
		actions,
		devmode: writable(false),
		// TODO refactor this so the socket isn't an app dependency,
		// instead the socket should only exist for the websocket client
		socket: null as any,
		createQuery: createQuery.bind(null, ui, actions),
	};
};

export const teardownApp = async (context: TestAppContext): Promise<void> => {
	context.app = null!;
	// currently doesn't need any explicit teardown:
	// context.app.close();
};
