<script lang="ts" context="module">
	if (import.meta.env.PROD) {
		if (!browser) {
			Logger.prefixes.unshift(() => format(new Date(), 'M/d H:mm:ss.SSS'));
		}
	}
</script>

<script lang="ts">
	import '@fuz.dev/fuz/style.css';
	import '@fuz.dev/fuz/theme.css';
	import '$lib/ui/style.css';
	import Themed from '@fuz.dev/fuz/Themed.svelte';
	import {set_devmode} from '@fuz.dev/fuz_library/devmode.js';
	import DevmodeControls from '@fuz.dev/fuz_library/DevmodeControls.svelte';
	import {page} from '$app/stores';
	import {browser} from '$app/environment';
	import Dialogs from '@fuz.dev/fuz_dialog/Dialogs.svelte';
	import {is_editable, swallow} from '@grogarden/util/dom.js';
	import {format} from 'date-fns';
	import Contextmenu from '@fuz.dev/fuz_contextmenu/Contextmenu.svelte';
	import {PUBLIC_WEBSOCKET_URL} from '$env/static/public';
	import {Logger} from '@grogarden/util/log.js';
	import {to_dialog_params} from '@fuz.dev/fuz_dialog/dialog.js';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import {toSocketStore} from '$lib/ui/socket.js';
	import Onboard from '$lib/ui/Onboard.svelte';
	import {setUi, toUi} from '$lib/ui/ui.js';
	import {syncUiToUrl} from '$lib/ui/syncUiToUrl.js';
	import {toActions, toActionsBroadcastMessage} from '$lib/vocab/action/actions.js';
	import {setApp} from '$lib/ui/app.js';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {toWebsocketApiClient} from '$lib/ui/WebsocketApiClient.js';
	import {toHttpApiClient} from '$lib/ui/HttpApiClient.js';
	import {findHttpService, findWebsocketService} from '$lib/ui/services.js';
	import {components} from '$lib/ui/components.js';
	import {mutations} from '$lib/ui/mutations.js';
	import AppContextmenu from '$lib/ui/AppContextmenu.svelte';
	import HubContextmenu from '$lib/ui/HubContextmenu.svelte';
	import ActingActorContextmenu from '$lib/ui/ActingActorContextmenu.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import ErrorMessage from '$lib/ui/ErrorMessage.svelte';
	import {deserialize, deserializers} from '$lib/util/deserialize.js';
	import type {ClientSession} from '$lib/vocab/account/account.js';
	import {createQuery} from '$lib/util/query.js';

	export let data: ClientSession; // TODO should be `LayoutServerLoad`, right? but doesn't typecheck if so

	const log = new Logger('[layout]');

	// Setup responsiveness for smaller touch devices (mobile).
	let initialMobileValue = false; // TODO this hardcoded value causes mobile view to change on load -- detect for SSR via User-Agent?
	const MOBILE_WIDTH = '50rem'; // treats anything less than 800px width as mobile
	if (browser) {
		// TODO to let the user override with their own preferred mobile setting,
		// which I could see wanting to do for various reasons including in `devmode`,
		// we need to either branch logic here, or have a different derived `media` value
		// that only reads this default value when the user has no override.
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_WIDTH})`);
		initialMobileValue = mediaQuery.matches;
		mediaQuery.onchange = (e) => actions.SetMobile(e.matches);
	}

	const devmode = set_devmode();
	const socket = toSocketStore(
		(message) => websocketClient.handle(message.data),
		() => actions.Ping(),
	);
	const ui = toUi(data, initialMobileValue, components);
	setUi(ui);

	// When the contextmenu has an error, display the message in a dialog.
	const contextmenuError = ui.contextmenu.error;
	$: if ($contextmenuError) {
		actions.OpenDialog(to_dialog_params(ErrorMessage, {text: $contextmenuError}));
	}

	const actions = toActions(ui, mutations, (e) =>
		websocketClient.find(e) ? websocketClient : httpClient.find(e) ? httpClient : null,
	);

	// The websocket client is the one we use as much as possible for efficiency.
	// The downside is it doesn't scale as well because the server holds a connection per client.
	// TODO make websockets optional to improve scalability
	const websocketClient = toWebsocketApiClient(
		findWebsocketService,
		socket.send,
		toActionsBroadcastMessage(ui, mutations, actions),
		async (message) => {
			if (message.status === 401) {
				// this condition occurs when the server fails to parse and validate session cookies
				// TODO maybe display an error on the sign in screen
				if ($session.guest) {
					await actions.SignOut();
				} else {
					actions.SetSession({session: {guest: true}});
				}
			} else {
				log.error('unhandled status message', message);
			}
		},
		deserialize(deserializers),
	);
	// The http client is needed for cookie-related calls like `SignIn` and `SignOut`.
	const httpClient = toHttpApiClient(findHttpService, deserialize(deserializers));

	const app = setApp({
		ui,
		actions,
		devmode,
		socket,
		createQuery: createQuery.bind(null, ui, actions),
	});
	if (browser) {
		(window as any).app = app;
		Object.assign(window, app);
		log.debug('app', app);
	}

	const {session} = ui;
	actions.SetSession({session: $session});
	$: syncUiToUrl(ui, $page.params, $page.url);

	const {mobile, layout, contextmenu, dialogs, sessionActors, actorSelection, hubSelection} = ui;

	$: guest = $session.guest;
	$: onboarding = !guest && !$sessionActors.value.length;
	$: actor = $actorSelection; // this line must be after `syncUiToUrl`
	$: hub = $hubSelection; // this line must be after `syncUiToUrl`

	let clientWidth: number;
	let clientHeight: number;
	$: $layout = {width: clientWidth, height: clientHeight}; // TODO event? `UpdateLayout`?

	// TODO `ShortcutKeys` or `Hotkeys` component with some interface
	const onWindowKeydown = async (e: KeyboardEvent) => {
		if (e.key === '`' && !e.ctrlKey && !is_editable(e.target)) {
			swallow(e);
			actions.ToggleMainNav();
		}
	};
</script>

<svelte:body
	use:contextmenu.action={[
		hub && actor ? to_contextmenu_params(HubContextmenu, {actor, hub}) : null,
		actor ? to_contextmenu_params(ActingActorContextmenu, {actor}) : null,
		to_contextmenu_params(AppContextmenu, {}),
	]}
/>

<svelte:window on:keydown|capture={onWindowKeydown} />

<SocketConnection {socket} url={PUBLIC_WEBSOCKET_URL} />

<Themed>
	<div class="layout" class:mobile={$mobile} bind:clientHeight bind:clientWidth>
		{#if guest}
			<main>
				<div class="main-content account prose">
					<AccountForm {guest} />
				</div>
			</main>
		{:else if onboarding}
			<main>
				<div class="main-content">
					<Onboard />
				</div>
			</main>
		{:else}
			<slot />
		{/if}
		<DevmodeControls {devmode} />
		<Dialogs {dialogs} on:close={() => actions.CloseDialog()} let:dialog>
			<div class="pane width_md">
				<svelte:component this={dialog.Component} {...dialog.props} />
			</div>
		</Dialogs>
		<Contextmenu {contextmenu} />
	</div>
</Themed>

<style>
	.layout {
		height: 100%;
		width: 100%;
		display: flex;
		position: relative;
	}

	main {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.main-content {
		width: var(--width_md);
		max-height: 100%; /* fix vertical scrolling */
		padding: var(--spacing_1);
	}
	.account {
		align-items: center;
	}
</style>
