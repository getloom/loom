<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable} from '@feltcoop/svelte-gettable-stores';

	import ListItems from './ListItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';
	import AddListButton from './AddListButton.svelte';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	// TODO expand/collapse all buttons

	const {actions, socket} = getApp();

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? actions.QueryEntities({
				actor: $persona.persona_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: queryData = query?.data;
	$: queryStatus = query?.status;
	// TODO the `readable` is a temporary hack until we finalize cached query result patterns
	$: entities = $queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)));
</script>

<div class="lists">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities && $queryStatus === 'success'}
			{#if $entities?.length}
				<AddListButton />
			{/if}
			<ListItems {entities} />
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
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column;
	}
</style>
