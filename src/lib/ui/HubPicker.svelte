<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {HubId} from '$lib/vocab/hub/hub.js';

	const {
		ui: {hubs},
	} = getApp();

	$: items = Array.from($hubs.value);

	export let actor: Readable<AccountActor>;
	export let done: (hub_id: HubId) => void;
</script>

<!-- TODO maybe don't resolve the store values and have sub-components read them? -->
<h2>Pick a Hub</h2>
<div>
	{#each items as hub (hub)}
		<button on:click={() => done(hub.get().hub_id)} class="menu_item">
			<HubAvatar {actor} {hub} />
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
