<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltcoop/felt/PendingAnimation.svelte';
	import {type Readable, readable} from '@feltcoop/svelte-gettable-stores';

	import BoardItems from '$lib/plugins/feltcoop/board/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';

	const viewContext = getViewContext();
	$: ({persona, space, community} = $viewContext);

	const {dispatch, socket} = getApp();

	//TODO once QueryEntities interface is in place this should initialize a "posts" collection
	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? dispatch.QueryEntities({
				actor: $persona.persona_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: queryData = query?.data;
	$: queryStatus = query?.status;
	// TODO the `readable` is a temporary hack until we finalize cached query result patterns
	$: entities = $queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)));

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

<div class="board">
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<BoardItems {entities} {space} {persona} {selectedPost} {selectPost} />
			{#if !selectedPost}
				<button
					on:click={() =>
						dispatch.OpenDialog({
							Component: CreateEntityForm,
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
			<!-- TODO handle query failures and add retry button, see https://github.com/feltcoop/felt-server/pull/514#discussion_r998626893 -->
			<!-- {:else if $queryStatus === 'failure'}
				<Message status="error">{$queryError.message}</Message> -->
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.board {
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
