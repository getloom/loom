<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import HubNavGroup from '$lib/ui/HubNavGroup.svelte';

	const {
		ui: {sessionActors},
	} = getApp();
</script>

<nav class="hub-nav">
	{#each $sessionActors.value as actor (actor)}
		<HubNavGroup {actor} />
	{/each}
</nav>

<style>
	.hub-nav {
		width: auto;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>
