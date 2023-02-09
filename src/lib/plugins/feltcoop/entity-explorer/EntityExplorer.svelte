<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable, writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import EntityExplorerItems from '$lib/plugins/feltcoop/entity-explorer/EntityExplorerItems.svelte';
	import EntityTree from '$lib/ui/EntityTree.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';
	import EntityTreeItemPlaintext from '$lib/ui/EntityTreeItemPlaintext.svelte';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {
		dispatch,
		socket,
		ui: {entityById},
	} = getApp();

	// TODO use pageKey
	let entities2: Readable<Array<Readable<Entity>>>;
	let ties2: Readable<Array<Readable<Tie>>>;

	$: shouldLoadEntities && loadEntities2();
	const loadEntities2 = async () => {
		const result = await dispatch.ReadEntitiesPaginated({
			actor: $persona.persona_id,
			source_id: $space.directory_id,
		});
		if (result.ok) {
			// TODO refactor using a query interface (with data, status)
			entities2 = writable(result.value.entities.map((e) => entityById.get(e.entity_id)!));
			ties2 = writable(result.value.ties.map((t) => writable(t)));
		}
	};

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
</script>

<div class="entity-explorer">
	<button
		type="button"
		on:click={() => dispatch.ViewSpace({space_id: $space.space_id, view: null})}
	>
		Close EntityExplorer
	</button>
	<div class="tree">
		{#if entities2}
			<ul>
				{#each $entities2 as entity (entity)}
					<EntityTree {persona} {entity} ties={ties2} itemComponent={EntityTreeItemPlaintext} />
				{/each}
			</ul>
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<EntityExplorerItems {persona} {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.entity-explorer {
		display: flex;
		flex-direction: column;
	}
	.entities {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	.tree ul {
		display: flex;
	}
</style>
