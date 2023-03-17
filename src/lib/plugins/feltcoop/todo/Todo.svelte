<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import TodoItems from '$lib/plugins/feltcoop/todo/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';

	const viewContext = getViewContext();
	$: ({persona, space, hub} = $viewContext);

	const {
		actions,
		socket,
		ui: {destTiesBySourceEntityId, entityById},
	} = getApp();

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

	let text = '';

	let selectedList: Readable<Entity> | null = null as any;
	const selectList = (list: Readable<Entity>) => {
		if (list.get().data.type !== 'Collection') return;
		if (selectedList === list) {
			selectedList = null;
		} else {
			selectedList = list;
		}
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content || !selectedList) return;

		//TODO better error handling
		await actions.CreateEntity({
			space_id: $space.space_id,
			actor: $persona.persona_id,
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
			actor: $persona.persona_id,
			entityIds,
		});
	};
</script>

<div class="todo">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities && $queryStatus === 'success'}
			<TodoItems {persona} {entities} {space} {selectedList} {selectList} />
			<button
				on:click={() =>
					actions.OpenDialog({
						Component: CreateEntityForm,
						props: {
							done: () => actions.CloseDialog(),
							entityName: 'todo',
							persona,
							hub,
							space,
							fields: {content: true},
						},
					})}>+ Create List</button
			>
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	{#if selectedList}
		<div class="selected-tools">
			<TextInput {persona} placeholder="> new todo" on:submit={onSubmit} bind:value={text} />
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
