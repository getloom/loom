<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltcoop/felt/PendingAnimation.svelte';
	import {readable} from '@feltcoop/svelte-gettable-stores';

	import ListItems from './ListItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';
	import ListControls from './ListControls.svelte';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	// TODO make the item component/props generic (maybe `itemComponent` and `itemProps`?) or slots?
	// TODO select multiple, act on groups of selected items
	// TODO collapse button?

	const {
		dispatch,
		socket,
		ui: {entityById},
	} = getApp();

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
	$: directory = entityById.get($space.directory_id);
	$: entities = $queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)));

	let listInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate
</script>

<div class="room">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities && $queryStatus === 'success'}
			<ListItems {entities} />
			{#if directory}
				<ListControls list={directory} bind:listInputEl />
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
