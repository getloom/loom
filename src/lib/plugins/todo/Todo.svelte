<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	import TodoItems from '$lib/plugins/todo/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import {lookupOrderedItems} from '$lib/vocab/entity/entityHelpers';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import type {ActorId} from '$lib/vocab/actor/actor';
	import type {SpaceId} from '$lib/vocab/space/space';
	import TextInput from '$lib/ui/TextInput.svelte';

	const {actor, space, directory} = getSpaceContext();

	const {actions, socket, ui, createQuery} = getApp();
	const {entityById} = ui;

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: entities = query?.entities;

	$: listsPath = $directory.path + '/lists';
	$: listsCollection = $entities?.value.find((e) => e.get().path === listsPath);

	$: ({space_id, directory_id} = $space);
	$: ({actor_id} = $actor);

	$: if ($entities?.value.length && !listsCollection) {
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
	$: orderedItems && void loadOrderedEntities(orderedItems, $actor.actor_id);
	const loadOrderedEntities = async (
		orderedItems: EntityId[],
		actor_id: ActorId,
	): Promise<void> => {
		let entityIdsToLoad: EntityId[] | null = null;
		for (const entity_id of orderedItems) {
			if (!entityById.has(entity_id)) {
				(entityIdsToLoad || (entityIdsToLoad = [])).push(entity_id);
			}
		}
		if (entityIdsToLoad) {
			await actions.ReadEntitiesById({actor: actor_id, entityIds: entityIdsToLoad});
		}
		if ($listsCollection) {
			orderedEntities = lookupOrderedItems($listsCollection, ui);
		}
	};

	let selectedList: Readable<Entity> | null = null as any;
	const selectList = (list: Readable<Entity>) => {
		if (list.get().data.type !== 'OrderedCollection') return;
		if (selectedList === list) {
			selectedList = null;
		} else {
			selectedList = list;
		}
	};

	let newTodoContent = '';
	let newTodoContentEl: HTMLTextAreaElement | undefined;
	let creating = false;
	const createList = async () => {
		if (!$listsCollection) return;
		if (!newTodoContent) {
			newTodoContentEl?.focus();
			return;
		}
		creating = true;
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {type: 'OrderedCollection', orderedItems: [], content: newTodoContent},
			ties: [{source_id: $listsCollection.entity_id}],
		});
		creating = false;
	};
</script>

<div class="todo">
	<!-- TODO handle failures here-->
	{#if query && listsCollection && $listsCollection && orderedEntities}
		<TodoItems
			{actor}
			parentList={listsCollection}
			entities={orderedEntities}
			{space}
			{selectedList}
			{selectList}
		/>
		<LoadMoreButton {query} />
		<div class="row">
			<TextInput
				{actor}
				bind:value={newTodoContent}
				bind:el={newTodoContentEl}
				autofocus={true}
				placeholder="> new todo list"
			/>
			<PendingButton pending={creating} on:click={createList}>create new list</PendingButton>
		</div>
	{:else}
		<PendingAnimation />
	{/if}
</div>

<style>
	.todo {
		display: flex;
		flex-direction: column;
	}
</style>
