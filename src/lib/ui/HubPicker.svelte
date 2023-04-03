<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {HubId} from '$lib/vocab/hub/hub';

	const {
		ui: {hubs},
	} = getApp();

	$: items = Array.from($hubs.value);

	export let done: (hub_id: HubId) => void;
</script>

<!-- TODO maybe don't resolve the store values and have sub-components read them? -->
<h2>Pick a Hub</h2>
<div>
	{#each items as hub (hub)}
		<button on:click={() => done(hub.get().hub_id)} class="menu-item">
			<HubAvatar {hub} />
		</button>
	{/each}
</div>

<style>
	h2 {
		padding: var(--spacing_sm) var(--spacing_lg);
	}
	div {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
</style>
