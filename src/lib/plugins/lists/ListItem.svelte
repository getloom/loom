<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {tick} from 'svelte';
	import {slide} from 'svelte/transition';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color.js';
	import {getApp} from '$lib/ui/app.js';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import ListControls from './ListControls.svelte';
	import ClearCheckedButton from './ClearCheckedButton.svelte';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';
	import {loadOrderedEntities, moveDown, moveUp} from '$lib/vocab/entity/entityHelpers.js';

	const {actor} = getSpaceContext();

	const {ui, actions} = getApp();
	const {contextmenu, actorById} = ui;

	export let entity: Readable<Entity>;
	export let parentList: Readable<Entity>;

	let pending = false;

	$: ({checked} = $entity.data);

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	$: if (checked !== undefined) void updateEntity(checked); // TODO change to a fn?

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: {...$entity.data, checked}}],
		});
		pending = false;
	};

	// TODO expand/collapse all buttons

	let listInputEl: HTMLTextAreaElement | undefined;
	let expandControls = false;
	const toggleExpandControls = async () => {
		expandControls = !expandControls;
		if (expandControls) {
			await tick();
			listInputEl?.focus();
		}
	};

	let expandItems = true;
	const toggleExpandItems = () => {
		expandItems = !expandItems;
	};

	// TODO extract this pattern from 2 places, into the query system?
	let orderedEntities: Array<Readable<Entity>> | null = null;
	$: orderedItems = $entity?.data.orderedItems;
	$: orderedItems && void assignOrderedEntities();
	const assignOrderedEntities = async (): Promise<void> => {
		orderedEntities = await loadOrderedEntities($entity!, $actor.actor_id, ui, actions);
	};

	$: first = $parentList.data.orderedItems![0] === $entity.entity_id;
	$: last =
		$parentList.data.orderedItems![$parentList.data.orderedItems!.length - 1] === $entity.entity_id;
	$: enableMoveUp = !first || !pending;
	$: enableMoveDown = !last || !pending;
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	transition:slide
	class:expandItems
	style:--hue={hue}
	use:contextmenu.action={[
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
	]}
>
	<!-- TODO fix a11y -->
	<div class="entity">
		<button
			class="plain icon_button"
			on:click={toggleExpandControls}
			title="{expandControls ? 'hide' : 'show'} list controls"
			>{#if expandControls}&lt;{:else}>{/if}</button
		>
		{#if checked !== undefined}
			<!-- TODO checkbox not updated properly on event broadcast-->
			<!-- TODO maybe use Felt checkbox component when available-->
			<input type="checkbox" disabled={pending} bind:checked />
		{/if}
		<div class="content prose">
			<EntityContent {entity} />
		</div>
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
		{#if orderedEntities}
			<span style:padding="var(--spacing_sm)">{orderedEntities.length}</span>
			<button class="plain icon_button" on:click={toggleExpandItems}>
				{#if expandItems}-{:else}+{/if}
			</button>
		{/if}
		<div class="signature" style:padding="var(--spacing_sm)">
			<ActorAvatar actor={authorActor} showName={false} />
		</div>
		{#if orderedEntities?.length && (expandItems || expandControls)}
			<div class="floating-controls">
				<button class="plain icon_button" on:click={toggleExpandItems}>
					{#if expandItems}-{:else}+{/if}
				</button>
			</div>
		{/if}
	</div>
	{#if expandControls}
		<ListControls list={entity} bind:listInputEl />
	{/if}
	{#if expandItems && orderedEntities?.length}
		<div class="items" transition:slide>
			<ul class="panel">
				{#each orderedEntities as item (item)}
					<svelte:self entity={item} parentList={entity} />
				{/each}
			</ul>
		</div>
		<ClearCheckedButton list={entity} />
	{/if}
</li>

<style>
	li {
		align-items: flex-start;
		flex-direction: column;
	}
	li:hover {
		background-color: var(--fg_1);
	}
	.signature {
		--icon_size: var(--icon_size_sm);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.entity {
		position: relative;
		display: flex;
		align-items: center;
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
		padding: var(--spacing_xs);
		padding-left: var(--icon_size_md);
	}
	input[type='checkbox'] {
		margin-left: var(--spacing_md);
	}
	.content {
		flex: 1;
		font-size: var(--size_1);
		padding: 0 var(--spacing_md);
	}
	.floating-controls {
		position: absolute;
		left: 0;
		top: 100%;
	}
</style>
