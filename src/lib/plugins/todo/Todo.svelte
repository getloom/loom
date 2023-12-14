<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@fuz.dev/fuz_library/Pending_Animation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';
	import {page} from '$app/stores';

	import TodoItems from '$lib/plugins/todo/TodoItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {loadOrderedEntities} from '$lib/vocab/entity/entityHelpers.js';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import type {ActorId} from '$lib/vocab/actor/actor.js';
	import type {SpaceId} from '$lib/vocab/space/space.js';
	import TextInput from '$lib/ui/TextInput.svelte';
	import {parseSpacePageParams} from '$lib/util/url.js';

	const {actor, space, hub} = getSpaceContext();

	const {actions, socket, ui, createQuery} = getApp();
	const {entityById} = ui;

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

	let selectedList: Readable<Entity> | null = null;
	const selectList = (list: Readable<Entity> | null) => {
		selectedList = list;
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

	// TODO refactor this after the next query system iteration
	const selectListById = async (entity_id: EntityId): Promise<void> => {
		let found = entityById.get(entity_id);
		if (found) {
			selectedList = found;
			return;
		}
		selectedList = null;
		await actions.ReadEntitiesById({actor: $actor.actor_id, entityIds: [entity_id]});
		found = entityById.get(entity_id);
		if (found) {
			selectedList = found;
		}
		// TODO show error or handle
	};

	$: if (shouldLoadEntities) {
		const entity_id = parseSpacePageParams($page.params);
		if (entity_id) void selectListById(entity_id);
	}
</script>

<div class="todo">
	<!-- TODO handle failures here-->
	{#if query && listsCollection && $listsCollection && orderedEntities}
		<TodoItems
			{actor}
			parentList={listsCollection}
			entities={orderedEntities}
			{space}
			{hub}
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
			<Pending_Button pending={creating} on:click={createList}>create new list</Pending_Button>
		</div>
	{:else}
		<Pending_Animation />
	{/if}
</div>

<style>
	.todo {
		display: flex;
		flex-direction: column;
	}
</style>
