<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';

	const {
		ui: {communities},
	} = getApp();

	$: items = Array.from($communities.value);

	export let done: (community_id: number) => void;
</script>

<!-- TODO maybe don't resolve the store values and have sub-components read them? -->
<h2>Pick a Community</h2>
<div>
	{#each items as community (community)}
		<button on:click={() => done(community.get().community_id)} class="menu-item">
			<CommunityAvatar {community} />
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
