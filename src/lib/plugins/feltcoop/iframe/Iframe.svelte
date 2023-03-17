<script lang="ts">
	import FeltWindowHost from '@feltjs/felt-ui/FeltWindowHost.svelte';

	import PendingAnimationOverlay from '$lib/ui/PendingAnimationOverlay.svelte';
	import {getViewContext} from '$lib/vocab/view/view';
	import {getApp} from '$lib/ui/app';

	const viewContext = getViewContext();
	$: ({space, persona} = $viewContext);

	const {
		actions,
		ui: {ephemera},
	} = getApp();

	let postMessage: ((message: any) => void) | undefined;

	// Forward ephemera to the iframe:
	$: if (
		postMessage && // wait for init
		$ephemera && // there may be no ephemera
		$ephemera.space_id === $space.space_id && // scope to this space
		$ephemera.actor !== $persona.persona_id // don't forward ephemera created by the user
	) {
		// TODO forward `actor: $ephemera.actor` if user allows it
		postMessage({type: 'Ephemera', data: $ephemera.data}); // don't forward the space_id
	}

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
				void actions.Ephemera({actor: $persona.persona_id, space_id: $space.space_id, data});
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
