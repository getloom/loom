<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@fuz.dev/fuz_library/Pending_Animation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ListItems from './ListItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import AddListButton from './AddListButton.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import type {SpaceId} from '$lib/vocab/space/space.js';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
	import type {ActorId} from '$lib/vocab/actor/actor.js';
	import {loadOrderedEntities} from '$lib/vocab/entity/entityHelpers.js';

	const {actor, space} = getSpaceContext();

	// TODO expand/collapse all buttons
	const {socket, createQuery, actions, ui} = getApp();

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
			})
		: null;
	$: entities = query?.entities;

	//TODO refactor once query by path is in place
	const listsPath = '/lists';
	$: listsCollection = $entities?.value.find((e) => e.get().path === listsPath);

	$: ({space_id, directory_id} = $space);
	$: ({actor_id} = $actor);

	$: if ($query?.status === 'success' && !listsCollection) {
		void initListsCollection(space_id, directory_id, actor_id, listsPath);
	}
	const initListsCollection = async (
		space_id: SpaceId,
		directory_id: EntityId,
		actor: ActorId,
		path: string,
	) => {
		await actions.CreateEntity({
			space_id,
			actor,
			path,
			data: {type: 'OrderedCollection', orderedItems: []},
			ties: [{source_id: directory_id}],
		});
	};

	// TODO extract this pattern from 2 places, into the query system?
	let orderedEntities: Array<Readable<Entity>> | null = null;
	$: orderedItems = $listsCollection?.data.orderedItems;
	$: orderedItems && void assignOrderedEntities();
	const assignOrderedEntities = async (): Promise<void> => {
		orderedEntities = await loadOrderedEntities($listsCollection!, $actor.actor_id, ui, actions);
	};
</script>

<div class="lists">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if query && listsCollection && $listsCollection && orderedEntities}
			{#if $entities?.value.length}
				<AddListButton source_id={$listsCollection.entity_id} />
			{/if}
			<ListItems entities={orderedEntities} parentList={listsCollection} />
			<LoadMoreButton {query} />
			<AddListButton source_id={$listsCollection.entity_id} />
		{:else}
			<Pending_Animation />
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
