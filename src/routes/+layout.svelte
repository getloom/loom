<script lang="ts" context="module">
	import {PUBLIC_WEBSOCKET_URL} from '$env/static/public';
	import {Logger} from '@feltjs/util/log.js';

	if (!dev) {
		if (!browser) {
			Logger.prefixes.unshift(() => format(new Date(), 'M/d H:mm:ss.SSS'));
		}
	}
</script>

<script lang="ts">
	import '@feltjs/felt-ui/style.css';
	import '$lib/ui/style.css';
	import {setDevmode} from '@feltjs/felt-ui/devmode.js';
	import DevmodeControls from '@feltjs/felt-ui/DevmodeControls.svelte';
	import {page} from '$app/stores';
	import {browser, dev} from '$app/environment';
	import Dialogs from '@feltjs/felt-ui/Dialogs.svelte';
	import {isEditable, swallow} from '@feltjs/util/dom.js';
	import {format} from 'date-fns';
	import {toDialogData} from '@feltjs/felt-ui/dialog.js';

	import {toSocketStore} from '$lib/ui/socket';
	import Onboard from '$lib/ui/Onboard.svelte';
	import {setUi, toUi} from '$lib/ui/ui';
	import {syncUiToUrl} from '$lib/ui/syncUiToUrl';
	import {toActions, toActionsBroadcastMessage} from '$lib/app/actions';
	import {setApp} from '$lib/ui/app';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {toWebsocketApiClient} from '$lib/ui/WebsocketApiClient';
	import {toHttpApiClient} from '$lib/ui/HttpApiClient';
	import {findHttpService, findWebsocketService} from '$lib/ui/services';
	import Contextmenu from '$lib/ui/contextmenu/Contextmenu.svelte';
	import {components} from '$lib/app/components';
	import {mutations} from '$lib/app/mutations';
	import AppContextmenu from '$lib/app/contextmenu/AppContextmenu.svelte';
	import HubContextmenu from '$lib/app/contextmenu/HubContextmenu.svelte';
	import ActingActorContextmenu from '$lib/app/contextmenu/ActingActorContextmenu.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import LinkContextmenu from '$lib/app/contextmenu/LinkContextmenu.svelte';
	import ErrorMessage from '$lib/ui/ErrorMessage.svelte';
	import {deserialize, deserializers} from '$lib/util/deserialize';
	import type {ClientSession} from '$lib/vocab/account/account';

	export let data: ClientSession; // TODO should be `LayoutServerLoad`, right? but doesn't typecheck if so

	const log = new Logger('[layout]');

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

	const devmode = setDevmode();
	const socket = toSocketStore(
		(message) => websocketClient.handle(message.data),
		() => actions.Ping(),
	);
	const ui = toUi(data, initialMobileValue, components, (errorMessage) => {
		actions.OpenDialog(toDialogData(ErrorMessage, {text: errorMessage}));
	});
	setUi(ui);

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

	const app = setApp({ui, actions, devmode, socket});
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
		if (e.key === '`' && !e.ctrlKey && !isEditable(e.target)) {
			swallow(e);
			actions.ToggleMainNav();
		}
	};
</script>

<svelte:body
	use:contextmenu.action={[
		[HubContextmenu, hub && actor ? {hub, actor} : undefined],
		[ActingActorContextmenu, actor ? {actor} : undefined],
		[AppContextmenu, null],
	]}
/>

<svelte:head>
	<link rel="shortcut icon" href="/favicon.png" />
</svelte:head>

<svelte:window on:keydown|capture={onWindowKeydown} />

<SocketConnection {socket} url={PUBLIC_WEBSOCKET_URL} />

<div class="layout" class:mobile={$mobile} bind:clientHeight bind:clientWidth>
	{#if guest}
		<main>
			<div class="main-content account column markup">
				<AccountForm {guest} />
			</div>
		</main>
	{:else if onboarding}
		<main>
			<div class="main-content column">
				<Onboard />
			</div>
		</main>
	{:else}
		<slot />
	{/if}
	<DevmodeControls {devmode} />
	<Dialogs {dialogs} on:close={() => actions.CloseDialog()} />
	<Contextmenu {contextmenu} {LinkContextmenu} />
</div>

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
		max-height: 100%; /* fix vertical scrolling */
		padding: var(--spacing_xl);
	}
	.account {
		align-items: center;
	}
</style>
