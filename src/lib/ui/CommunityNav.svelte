<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import CommunityNavGroup from '$lib/ui/CommunityNavGroup.svelte';

	const {
		ui: {sessionPersonas},
	} = getApp();
</script>

<nav class="community-nav">
	{#each $sessionPersonas as persona (persona)}
		<CommunityNavGroup {persona} />
	{/each}
</nav>

<style>
	.community-nav {
		width: auto;
		background-color: var(--tint_dark_1);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>
