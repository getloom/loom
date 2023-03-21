import {writable} from '@feltcoop/svelte-gettable-stores';

import type {App} from '$lib/ui/app';
import {toUi} from '$lib/ui/ui';
import {toHttpApiClient} from '$lib/ui/HttpApiClient';
import type {EventParamsByName, EventResponseByName} from '$lib/app/actionTypes';
import {toActions} from '$lib/app/actions';
import {findHttpService} from '$lib/ui/services';
import {installSourceMaps} from '$lib/util/testHelpers';
import {mutations} from '$lib/app/mutations';
import {deserialize, deserializers} from '$lib/util/deserialize';

installSourceMaps();

export interface TestAppContext {
	app: App;
}

export const setupApp = async (context: TestAppContext): Promise<void> => {
	const ui = toUi({guest: true}, false, {}, (_) => _);
	const httpApiClient = toHttpApiClient<EventParamsByName, EventResponseByName>(
		findHttpService,
		deserialize(deserializers),
	);
	context.app = {
		ui,
		actions: toActions(ui, mutations, () => httpApiClient),
		devmode: writable(false),
		// TODO refactor this so the socket isn't an app dependency,
		// instead the socket should only exist for the websocket client
		socket: null as any,
	};
};

export const teardownApp = async (context: TestAppContext): Promise<void> => {
	context.app = null!;
	// currently doesn't need any explicit teardown:
	// context.app.close();
};
