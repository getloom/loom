<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toDialogData} from '@feltjs/felt-ui';

	import TextInput from '$lib/ui/TextInput.svelte';
	import TodoItems from '$lib/plugins/feltcoop/todo/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import {transformQueryDataToArray} from '$lib/util/query';
	import {lookupOrderedItems} from '$lib/vocab/entity/entityHelpers';

	const {actor, space, hub} = getSpaceContext();

	const {actions, socket, ui} = getApp();

	const {destTiesBySourceEntityId, entityById} = ui;

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? actions.QueryEntities({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: queryData = query?.data;
	$: queryStatus = query?.status;
	$: querySuccess = $queryStatus === 'success';
	// TODO the `readable` is a temporary hack until we finalize cached query result patterns
	$: entities = $queryData?.value && transformQueryDataToArray(queryData!);

	let listsCollection: Readable<Entity> | undefined;
	$: listsCollection = entities && $entities!.find((e) => e.get().data.name === 'lists');

	$: if ($entities && $queryStatus === 'success') {
		if (!$listsCollection) {
			//TODO initialize these with hub, not user actor
			void initListsCollection();
		}
	}

	$: lists = $listsCollection && lookupOrderedItems($listsCollection, ui);

	let text = '';

	let selectedList: Readable<Entity> | null = null as any;
	const selectList = (list: Readable<Entity>) => {
		if (list.get().data.type !== 'OrderedCollection') return;
		if (selectedList === list) {
			selectedList = null;
		} else {
			selectedList = list;
		}
	};

	const initListsCollection = async () => {
		//TODO init with hub actor not user actor
		await actions.CreateEntity({
			space_id: $space.space_id,
			actor: $actor.actor_id,
			data: {type: 'OrderedCollection', name: 'lists', orderedItems: []},
			ties: [{source_id: $space.directory_id}],
		});
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content || !selectedList) return;

		//TODO better error handling
		await actions.CreateEntity({
			space_id: $space.space_id,
			actor: $actor.actor_id,
			data: {type: 'Note', content, checked: false},
			ties: [{source_id: $selectedList!.entity_id}],
		});
		text = '';
	};
	const onSubmit = async () => {
		await createEntity();
	};

	const clearDone = async () => {
		if (!selectedList) return;
		const destTies = destTiesBySourceEntityId.get($selectedList!.entity_id);
		const items =
			destTies &&
			Array.from(destTies.get().value).reduce((acc, tie) => {
				if (tie.type === 'HasItem') {
					const entity = entityById.get(tie.dest_id)!;
					if (entity.get().data.checked) {
						acc.push(entity);
					}
				}
				return acc;
			}, [] as Array<Readable<Entity>>);
		if (!items?.length) return;
		const entityIds = items.map((i) => i.get().entity_id);
		await actions.DeleteEntities({
			actor: $actor.actor_id,
			entityIds,
		});
	};
</script>

<div class="todo">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if listsCollection && $listsCollection && querySuccess && lists}
			<TodoItems
				{actor}
				parentList={listsCollection}
				entities={lists}
				{space}
				{selectedList}
				{selectList}
			/>
			<button
				on:click={() =>
					$listsCollection &&
					actions.OpenDialog(
						toDialogData(CreateEntityForm, {
							done: () => actions.CloseDialog(),
							entityName: 'todo list',
							actor,
							hub,
							space,
							type: 'OrderedCollection',
							ties: [{source_id: $listsCollection.entity_id}],
						}),
					)}
			>
				+ Create List
			</button>
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	{#if selectedList}
		<div class="selected-tools">
			<TextInput {actor} placeholder="> new todo" on:submit={onSubmit} bind:value={text} />
			<button on:click={clearDone}>Clear Done</button>
		</div>
	{/if}
</div>

<style>
	.todo {
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
	.selected-tools {
		display: flex;
	}
	/* TODO remove this hack when the layout is more mature */
	.selected-tools > :global(*:first-child) {
		flex: 1;
	}
</style>
