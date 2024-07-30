<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	// TODO implement parent data API with user-approval: show request dialog to users so
	// they can accept/deny the iframe's connection/data/capability
	// (including arbitrary data and context like the `space_id` for loom)
	// more: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns

	type Tenant = {postMessage: Window['postMessage']} | ServiceWorker | MessagePort;

	export let tenant: Tenant | undefined | null;
	export let target_origin = '*'; // does not affect tenants of type `ServiceWorker` and `MessagePort`

	// These are named the inverse of the equivalents in `LoomWindowTenant`.
	type ReceivedMessage =
		| {type: 'loom.connect'; [key: string]: any}
		| {type: string; [key: string]: any};
	type SentMessage =
		| {type: 'loom.connected'; [key: string]: any}
		| {type: string; [key: string]: any};

	const dispatch = createEventDispatcher<{message: ReceivedMessage}>();

	// Exported for external usage.
	export const post_message = (message: SentMessage): void => {
		if (!tenant) return; // maybe log a warning
		if (tenant instanceof ServiceWorker || tenant instanceof MessagePort) {
			tenant.postMessage(message);
		} else {
			tenant.postMessage(message, target_origin);
		}
	};

	const on_window_message = (e: MessageEvent): void => {
		if (e.source !== tenant) return;
		const message = e.data;
		if (!message) return;
		if (message.type === 'loom.connect') {
			post_message({type: 'loom.connected'});
		}
		if (message.type) {
			dispatch('message', e.data);
		}
	};
</script>

<svelte:window on:message={on_window_message} />
