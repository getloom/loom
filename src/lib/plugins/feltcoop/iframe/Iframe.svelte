<script lang="ts">
	import FeltWindowHost from '@feltjs/felt-ui/FeltWindowHost.svelte';
	import {onDestroy} from 'svelte';

	import PendingAnimationOverlay from '$lib/ui/PendingAnimationOverlay.svelte';
	import {getViewContext} from '$lib/vocab/view/view';
	import {getApp} from '$lib/ui/app';

	const viewContext = getViewContext();
	$: ({space, actor} = $viewContext);

	const {
		actions,
		ui: {ephemera},
	} = getApp();

	let postMessage: ((message: any) => void) | undefined;

	// Forward ephemera to the iframe, subscribing manually to avoid the component-level batching.
	// Demo of the problem: https://svelte.dev/repl/69e1c9327ce847b0af642ed3163201da?version=3.57.0
	onDestroy(
		ephemera.subscribe((v) => {
			if (
				postMessage && // wait for init
				v && // there may be no ephemera
				v.space_id === $space.space_id && // scope to this space
				v.actor !== $actor.actor_id // don't forward ephemera created by the user
			) {
				// TODO forward `actor: v.actor` if user allows it
				postMessage({type: 'Ephemera', data: v.data}); // don't forward the space_id
			}
		}),
	);

	export let src: string;

	let loaded = false;

	let el: HTMLIFrameElement;
</script>

<!-- TODO figure out sandboxing -- allow-same-origin? -->

<div class="iframe-wrapper">
	<iframe
		bind:this={el}
		frameborder="0"
		title={$space.name}
		{src}
		on:load={() => (loaded = true)}
	/>
	{#if !loaded}
		<PendingAnimationOverlay />
	{/if}
	<FeltWindowHost
		tenant={el?.contentWindow}
		bind:postMessage
		on:message={(e) => {
			if (e.detail?.type === 'Ephemera') {
				// TODO validate automatically
				const data = e.detail.params;
				if (!data) return;
				void actions.Ephemera({actor: $actor.actor_id, space_id: $space.space_id, data});
			}
		}}
	/>
</div>

<style>
	.iframe-wrapper {
		flex: 1;
		display: flex;
		position: relative; /* for the absolute positioned pending animation */
	}
	iframe {
		flex: 1;
	}
</style>
