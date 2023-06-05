<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import {lookupOrderedItems} from '$lib/vocab/entity/entityHelpers';

	const {ui, actions} = getApp();
	const {contextmenu, actorById} = ui;

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let parentList: Readable<Entity>;
	export let space: Readable<Space>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity>) => void;

	$: selected = selectedList ? selectedList === entity : false;
	let pending = false;

	$: items = lookupOrderedItems($entity, ui);

	$: ({checked} = $entity.data);

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	$: if (checked !== undefined) void updateEntity(checked);

	$: hasChecked = checked !== undefined || $entity.data.type === 'Note';

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: {...$entity.data, checked}}],
		});
		pending = false;
	};

	const renderEntity = (entity: Entity): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'OrderedCollection' || type === 'Note')) return false;
		return true;
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
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
{#if renderEntity($entity)}
	<li
		style="--hue: {hue}"
		use:contextmenu.action={[
			toContextmenuParams(EntityContextmenu, {actor, entity}),
			toContextmenuParams(ActorContextmenu, {actor: authorActor}),
		]}
	>
		<div class="entity markup formatted">
			<div class="order_buttons">
				<button
					class="plain_button icon_button reply"
					title="move up"
					on:click={() => moveUp(entity)}>🔼</button
				>
				<button
					class="plain_button icon_button reply"
					title="move down"
					on:click={() => moveDown(entity)}>🔽</button
				>
			</div>
			<!-- TODO fix a11y -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div on:click={() => selectList(entity)} class="entity markup formatted">
				{#if hasChecked}
					<!-- TODO checkbox not updated properly on event broadcast-->
					<!-- TODO maybe use Felt checkbox component when available-->
					<input type="checkbox" disabled={pending} bind:checked />
				{/if}
				<div class="text">
					<EntityContent {entity} />
				</div>
				<div class="signature">
					<ActorAvatar actor={authorActor} showName={false} />
				</div>
			</div>
		</div>
		{#if items && selected}
			<div class="items panel">
				<ul>
					{#each items as item (item)}
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
			</div>
		{/if}
	</li>
{/if}

<style>
	li {
		align-items: flex-start;
		flex-direction: column;
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
	}
	.signature {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.entity {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
	}
	.entity:hover {
		background-color: var(--fg_1);
	}
	.entity form input {
		width: 50px;
		min-width: auto;
	}
	.items {
		width: 100%;
	}
	.order_buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}
	.icon_button {
		font-size: var(--size_xl);
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}
	.text {
		text-align: center;
		flex-grow: 2;
	}
</style>
