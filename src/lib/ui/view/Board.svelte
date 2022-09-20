<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import {type Readable, readable} from '@feltcoop/svelte-gettable-stores';

	import BoardItems from '$lib/ui/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import EntityInput from '$lib/ui/EntityInput.svelte';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';

	const viewContext = getViewContext();
	$: ({persona, space, community} = $viewContext);

	const {dispatch, socket} = getApp();

	//TODO once QueryEntities interface is in place this should initialize a "posts" collection
	$: shouldLoadEntities = browser && $socket.open;
	$: queried = shouldLoadEntities
		? dispatch.QueryEntities({
				actor: $persona.persona_id,
				source_id: $space.directory_id,
		  })
		: null;
	// TODO the `readable` is a temporary hack until we finalize cached query result patterns
	$: entities = $queried && readable(sortEntitiesByCreated(Array.from($queried.value)));

	//TODO this should be readable
	let selectedPost: Readable<Entity> | null = null as any;
	const selectPost = (post: Readable<Entity>) => {
		if (post.get().data.type !== 'Collection') return;
		if (selectedPost === post) {
			selectedPost = null;
		} else {
			selectedPost = post;
		}
	};
</script>

<div class="room">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities}
			<BoardItems {entities} {space} {persona} {selectedPost} {selectPost} />
			{#if !selectedPost}
				<button
					on:click={() =>
						dispatch.OpenDialog({
							Component: EntityInput,
							props: {
								done: () => dispatch.CloseDialog(),
								entityName: 'Post',
								persona,
								community,
								space,
							},
						})}>Submit a new post</button
				>
			{/if}
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.room {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column;
	}
</style>
