<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';
	import {slide} from 'svelte/transition';

	import type {Entity, EntityId} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor, ActorId} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import {lookupOrderedItems} from '$lib/vocab/entity/entityHelpers';
	import TextInput from '$lib/ui/TextInput.svelte';

	const {ui, actions} = getApp();
	const {contextmenu, actorById, entityById} = ui;

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let parentList: Readable<Entity>;
	export let space: Readable<Space>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity>) => void;

	$: selected = selectedList ? selectedList === entity : false;
	let pending = false;

	// TODO extract this pattern from 2 places, into the query system?
	let orderedEntities: Array<Readable<Entity>> | null = null;
	$: orderedItems = $entity.data.orderedItems;
	$: selected && orderedItems && void loadOrderedEntities(orderedItems, $actor.actor_id);
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
		orderedEntities = lookupOrderedItems($entity, ui);
	};

	$: ({checked} = $entity.data);

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	$: if (checked !== undefined) void updateEntity(checked);

	// TODO refactor - check for OrderedCollection type? or change so the check isn't needed?
	$: hasChecked =
		checked !== undefined || $entity.data.type === 'Note' || $entity.data.type === undefined;

	let text = '';
	let textEl: HTMLTextAreaElement | undefined;

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: {...$entity.data, checked}}],
		});
		pending = false;
	};

	const moveUp = async (item: Readable<Entity>) => {
		const itemId = item.get().entity_id;
		const index = $parentList.data.orderedItems!.findIndex((f) => f === itemId);
		if (index === 0) return;
		$parentList.data.orderedItems!.splice(
			index - 1,
			0,
			$parentList.data.orderedItems!.splice(index, 1)[0],
		);
		pending = true;
		await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $parentList.entity_id, data: {...$parentList.data}}],
		});
		pending = false;
	};

	const moveDown = async (item: Readable<Entity>) => {
		const itemId = item.get().entity_id;
		const index = $parentList.data.orderedItems!.findIndex((f) => f === itemId);
		if (index === $parentList.data.orderedItems!.length - 1) return;
		$parentList.data.orderedItems!.splice(
			index + 1,
			0,
			$parentList.data.orderedItems!.splice(index, 1)[0],
		);
		pending = true;
		await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $parentList.entity_id, data: {...$parentList.data}}],
		});
		pending = false;
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content || !$selectedList) {
			textEl?.focus();
			return;
		}

		//TODO better error handling
		await actions.CreateEntity({
			space_id: $space.space_id,
			actor: $actor.actor_id,
			data: {content, checked: false},
			ties: [{source_id: $selectedList.entity_id}],
		});
		text = '';
	};

	const clearDone = async () => {
		if (!orderedEntities) return;
		const entityIds = orderedEntities?.reduce((arr, _e) => {
			const e = _e.get();
			if (e.data.checked) arr.push(e.entity_id);
			return arr;
		}, [] as EntityId[]);
		await actions.DeleteEntities({
			actor: $actor.actor_id,
			entityIds,
		});
	};

	$: ordered = !!orderedItems;
	$: first = $parentList.data.orderedItems![0] === $entity.entity_id;
	$: last = $parentList.data.orderedItems!.at(-1) === $entity.entity_id;
	$: enableMoveUp = !first;
	$: enableMoveDown = !last;
</script>

<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
	class:selected
	role="treeitem"
	aria-selected={ordered ? selected : undefined}
	aria-expanded={ordered ? selected : undefined}
	transition:slide|local
>
	<div class="entity">
		<div class="row">
			<button
				class="plain icon_button"
				title="move up"
				on:click={() => moveUp(entity)}
				disabled={!enableMoveUp}>↑</button
			>
			<button
				class="plain icon_button"
				title="move down"
				on:click={() => moveDown(entity)}
				disabled={!enableMoveDown}>↓</button
			>
		</div>
		<div class="content">
			{#if hasChecked}
				<!-- TODO checkbox not updated properly on event broadcast-->
				<input type="checkbox" disabled={pending} bind:checked />
			{/if}
			{#if ordered}
				<button
					class="plain text formatted prose deselectable"
					class:selected
					on:click={ordered ? () => selectList(entity) : undefined}
				>
					<EntityContent {entity} />
				</button>
			{:else}
				<div class="text formtted prse">
					<EntityContent {entity} />
				</div>
			{/if}
			<div class="author">
				<ActorAvatar actor={authorActor} showName={false} />
			</div>
		</div>
	</div>
	{#if orderedEntities && selected}
		<div class="items" transition:slide|local>
			<ul class="panel">
				{#each orderedEntities as item (item)}
					<svelte:self
						{actor}
						parentList={entity}
						entity={item}
						{space}
						{selectedList}
						{selectList}
					/>
				{/each}
			</ul>
			<div class="controls">
				<TextInput
					{actor}
					placeholder="> new todo"
					on:submit={createEntity}
					bind:value={text}
					bind:el={textEl}
				/>
				<button type="button" on:click={createEntity}>create todo</button>
				<button type="button" on:click={clearDone}>clear done</button>
			</div>
		</div>
	{/if}
</li>

<style>
	li {
		flex-direction: column;
		padding: var(--spacing_xs);
		border-radius: var(--border_radius_sm);
	}
	li.selected {
		background: var(--fg_1);
	}
	.author {
		--icon_size: var(--icon_size_sm);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.entity {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
		border-radius: var(--border_radius_sm);
	}
	.content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	.items {
		padding-left: var(--spacing_xl);
		width: 100%;
	}
	.icon_button {
		font-size: var(--icon_size_sm);
	}
	.text {
		padding-left: var(--spacing_lg);
		flex: 1;
	}
	button.text {
		justify-content: flex-start;
		font-weight: 400;
	}
	.controls {
		display: flex;
		align-items: center;
	}
	/* TODO remove this hack when the layout is more mature */
	.controls > :global(*:first-child) {
		flex: 1;
	}
</style>
