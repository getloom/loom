<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import HubNavGroup from '$lib/ui/HubNavGroup.svelte';

	const {
		ui: {sessionActors},
	} = getApp();
</script>

<nav class="hub-nav">
	{#each $sessionActors.value as persona (persona)}
		<HubNavGroup {persona} />
	{/each}
</nav>

<style>
	.hub-nav {
		width: auto;
		background-color: var(--tint_dark_1);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>
