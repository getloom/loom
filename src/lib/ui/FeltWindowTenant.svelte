<script lang="ts">
	import {onMount, createEventDispatcher, onDestroy} from 'svelte';
	import type {Async_Status} from '@ryanatkn/belt/async.js';

	type Host = {postMessage: Window['postMessage']} | ServiceWorker | MessagePort;

	export let host: Host | null =
		typeof window !== 'undefined' && window.parent !== window ? window.parent : null;
	export let target_origin = '*'; // does not affect tenants of type `ServiceWorker` and `MessagePort`
	export let connect_on_mount = true;

	// These are named the inverse of the equivalents in `Host`.
	type SentMessage =
		| {type: 'felt.connect'; [key: string]: any}
		| {type: string; [key: string]: any};
	type ReceivedMessage =
		| {type: 'felt.connected'; [key: string]: any}
		| {type: string; [key: string]: any};

	const dispatch = createEventDispatcher<{message: ReceivedMessage}>();

	// Exported for external usage.
	export const post_message: (message: SentMessage) => void = (message) => {
		if (!host) return;
		if (host instanceof ServiceWorker || host instanceof MessagePort) {
			host.postMessage(message);
		} else {
			host.postMessage(message, target_origin);
		}
	};

	onMount(async () => {
		if (connect_on_mount) await connect();
	});
	onDestroy(() => {
		if (connect_timeout) clearTimeout(connect_timeout);
	});

	let connect_status: Async_Status = 'initial';
	let connecting: Promise<boolean> | undefined;
	let connecting_host: Host | undefined;
	let resolve_connection: ((connected: boolean) => void) | undefined = undefined;
	let connect_timeout: any;
	const CONNECT_TIMEOUT = 6000;

	// Exported so users can pass `connect_on_mount=false` and then `tenant.connect()` manually.
	export const connect = async (): Promise<boolean> => {
		if (!host) return false;
		if (connecting && connecting_host === host) {
			return connecting;
		}
		connecting_host = host;
		return (connecting = new Promise((resolve) => {
			resolve_connection = resolve;
			connect_status = 'pending';
			post_message({type: 'felt.connect'});
			connect_timeout = setTimeout(() => {
				// if we're in an iframe with a host that isn't responding,
				// this timeout keeps things from hanging
				connect_status = 'failure';
				connecting = undefined;
				connect_timeout = undefined;
				resolve_connection!(false);
				resolve_connection = undefined;
			}, CONNECT_TIMEOUT);
		}));
	};

	const on_window_message = (e: MessageEvent): void => {
		if (e.source !== host) return;
		const message = e.data;
		if (!message) return;
		if (message.type === 'felt.connected') {
			if (connect_status !== 'pending') return; // defensively ignore duplicates and uninvited messages
			connect_status = 'success';
			clearTimeout(connect_timeout);
			connect_timeout = undefined;
			resolve_connection!(true);
			resolve_connection = undefined;
		}
		if (message.type && connect_status === 'success') {
			dispatch('message', message);
		}
	};
</script>

<svelte:window on:message={on_window_message} />
