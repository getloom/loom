<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';
	import {slide} from 'svelte/transition';
	import {page} from '$app/stores';
	import {swallow} from '@ryanatkn/belt/dom.js';
	import {goto} from '$app/navigation';

	import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color.js';
	import {getApp} from '$lib/ui/app.js';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';
	import {loadOrderedEntities, moveDown, moveUp} from '$lib/vocab/entity/entityHelpers.js';
	import TextInput from '$lib/ui/TextInput.svelte';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {toHubUrl} from '$lib/util/url.js';

	const {ui, actions} = getApp();
	const {contextmenu, actorById} = ui;

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let parentList: Readable<Entity>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity> | null) => void;

	$: selected = selectedList ? selectedList === entity : false;
	let pending = false;

	// TODO extract this pattern from 2 places, into the query system?
	let orderedEntities: Array<Readable<Entity>> | null = null;
	$: orderedItems = $entity.data.orderedItems;
	$: selected && orderedItems && void assignOrderedEntities();
	const assignOrderedEntities = async (): Promise<void> => {
		orderedEntities = await loadOrderedEntities($entity!, $actor.actor_id, ui, actions);
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

	$: hasOrderedItems = !!orderedItems;
	$: first = $parentList.data.orderedItems![0] === $entity.entity_id;
	$: last =
		$parentList.data.orderedItems![$parentList.data.orderedItems!.length - 1] === $entity.entity_id;
	$: enableMoveUp = !first;
	$: enableMoveDown = !last;

	$: href = hasOrderedItems
		? toHubUrl($hub.name, '/' + $space.name + '/' + $entity.entity_id, $page.url.search)
		: undefined;
</script>

<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
	]}
	class:selected
	role="treeitem"
	aria-selected={hasOrderedItems ? selected : undefined}
	aria-expanded={hasOrderedItems ? selected : undefined}
	transition:slide
>
	<div class="entity">
		<div class="row">
			<button
				class="plain icon_button"
				title="move up"
				on:click={() => moveUp(entity, parentList, $actor.actor_id, actions)}
				disabled={!enableMoveUp}>↑</button
			>
			<button
				class="plain icon_button"
				title="move down"
				on:click={() => moveDown(entity, parentList, $actor.actor_id, actions)}
				disabled={!enableMoveDown}>↓</button
			>
		</div>
		<div class="content">
			{#if hasChecked}
				<!-- TODO checkbox not updated properly on event broadcast-->
				<input type="checkbox" disabled={pending} bind:checked />
			{/if}
			{#if hasOrderedItems}
				<a
					{href}
					class="text formatted prose plain buttonlike selectable deselectable"
					class:selected
					on:click={selected
						? (e) => {
								swallow(e);
								void goto(toHubUrl($hub.name, '/' + $space.name, $page.url.search));
							}
						: undefined}
				>
					<EntityContent {entity} />
				</a>
			{:else}
				<div class="text formtted prose">
					<EntityContent {entity} />
				</div>
			{/if}
			<div class="author">
				<ActorAvatar actor={authorActor} showName={false} />
			</div>
		</div>
	</div>
	{#if orderedEntities && selected}
		<div class="items" transition:slide>
			<ul class="panel">
				{#each orderedEntities as item (item)}
					<svelte:self
						{actor}
						parentList={entity}
						entity={item}
						{space}
						{hub}
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
		align-items: stretch;
		width: 100%;
	}
	.items {
		padding-left: var(--spacing_1);
		width: 100%;
	}
	.icon_button {
		font-size: var(--icon_size_sm);
	}
	.text {
		padding-left: var(--spacing_lg);
		flex: 1;
		align-items: center;
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
