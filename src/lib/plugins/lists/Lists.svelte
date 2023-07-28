<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import ListItems from './ListItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import AddListButton from './AddListButton.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {actor, space} = getSpaceContext();

	// TODO expand/collapse all buttons

	const {socket, createQuery} = getApp();

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: entities = query?.entities;
</script>

<div class="lists">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if query && entities}
			{#if $entities?.value.length}
				<AddListButton />
			{/if}
			<ListItems {entities} />
			<LoadMoreButton {query} />
			<AddListButton />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.lists {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		max-width: var(--width_md);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column;
	}
</style>
