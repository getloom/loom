<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import BoardItems from '$lib/plugins/board/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {actor, space, hub} = getSpaceContext();

	const {
		actions,
		socket,
		ui: {entityById},
		createQuery,
	} = getApp();

	// export let thread = '/thread'; // TODO use instead of directory_id

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	// TODO create `./thread` - $directory.path collection
	$: threadEntity = entityById.get($space.directory_id)!;
	$: query = shouldLoadEntities
		? createQuery(
				{
					actor: $actor.actor_id,
					source_id: $space.directory_id,
					// TODO implement query by path
					// path: $directory.path + '/thread',
				},
				true,
		  )
		: null;
	$: entities = query?.entities;
</script>

<div class="board">
	<div class="entities">
		{#if query && entities}
			<CreateEntityForm
				done={() => actions.CloseDialog()}
				entityName="post"
				type="Note"
				{actor}
				{hub}
				{space}
			>
				<svelte:fragment slot="content_title"
					><div />
					<!-- empty --></svelte:fragment
				>
				<svelte:fragment slot="error"><span style:display="none" /></svelte:fragment>
			</CreateEntityForm>
			<BoardItems {entities} {space} {actor} thread={threadEntity} />
			<LoadMoreButton {query} />
			<!-- TODO handle query failures and add retry button, see https://github.com/feltjs/felt/pull/514#discussion_r998626893 -->
			<!-- {:else if status === 'failure'}
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
		max-width: var(--width_md);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column;
	}
</style>
