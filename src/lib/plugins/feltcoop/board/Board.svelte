<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable} from '@feltcoop/svelte-gettable-stores';

	import BoardItems from '$lib/plugins/feltcoop/board/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';

	const viewContext = getViewContext();
	$: ({persona, space, hub} = $viewContext);

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
	$: entities =
		$queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)).reverse());
</script>

<div class="board">
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<CreateEntityForm
				done={() => dispatch.CloseDialog()}
				entityName="post"
				{persona}
				{hub}
				{space}
			>
				<svelte:fragment slot="content_title">post</svelte:fragment>
				<svelte:fragment slot="error"><span style:display="none" /></svelte:fragment>
			</CreateEntityForm>
			<BoardItems {entities} {space} {persona} />
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
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column;
	}
</style>
