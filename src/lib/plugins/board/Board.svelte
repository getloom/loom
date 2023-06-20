<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import BoardItems from '$lib/plugins/board/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import type {Entity} from '$lib/vocab/entity/entity';

	const {actor, space, hub} = getSpaceContext();

	const {actions, socket, ui} = getApp();

	const {entityById, sourceTiesByDestEntityId} = ui;

	$: shouldLoadEntities = browser && $socket.open;
	//TODO once QueryEntities interface is in place this should load & initialize a "thread" collection
	$: thread = entityById.get($space.directory_id)!;
	$: query = shouldLoadEntities
		? actions.QueryEntities({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: queryData = query?.data;
	$: queryStatus = query?.status;
	// TODO the `readable` is a temporary hack until we finalize cached query result patterns
	$queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)).reverse());

	$: entities =
		$queryData &&
		readable(
			sortEntitiesByCreated(
				Array.from($queryData.value).reduce((acc, ent) => {
					const sourceTies = lookupTies(sourceTiesByDestEntityId, ent.get().entity_id);
					const isReply = Array.from(sourceTies.get().value).find((tie) => tie.type === 'HasReply');
					if (!isReply) {
						acc.unshift(ent);
					}
					return acc;
				}, [] as Array<Readable<Entity>>),
			).reverse(),
		);
</script>

<div class="board">
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<CreateEntityForm
				done={() => actions.CloseDialog()}
				entityName="post"
				type="Note"
				{actor}
				{hub}
				{space}
			>
				<svelte:fragment slot="content_title">post</svelte:fragment>
				<svelte:fragment slot="error"><span style:display="none" /></svelte:fragment>
			</CreateEntityForm>
			<BoardItems {entities} {space} {actor} {thread} />
			<!-- TODO handle query failures and add retry button, see https://github.com/feltjs/felt-server/pull/514#discussion_r998626893 -->
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
		max-width: var(--width_md);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column;
	}
</style>
