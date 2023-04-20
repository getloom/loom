<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {tick} from 'svelte';
	import {slide} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import ListControls from './ListControls.svelte';
	import ClearCheckedButton from './ClearCheckedButton.svelte';
	import {getViewContext} from '$lib/vocab/view/view';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const viewContext = getViewContext();
	$: ({actor} = $viewContext);

	const {
		ui: {contextmenu, actorById, destTiesBySourceEntityId, entityById},
		actions,
	} = getApp();

	export let entity: Readable<Entity>;

	let pending = false;

	$: destTies = lookupTies(destTiesBySourceEntityId, $entity.entity_id);

	$: items = Array.from($destTies.value).reduce((acc, tie) => {
		if (tie.type === 'HasItem') {
			acc.push(entityById.get(tie.dest_id)!);
		}
		return acc;
	}, [] as Array<Readable<Entity>>);

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
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	transition:slide|local
	class:expandItems
	style="--hue: {hue}"
	use:contextmenu.action={[
		[ActorContextmenu, {persona: authorActor}],
		[EntityContextmenu, {persona: actor, entity}],
	]}
>
	<!-- TODO fix a11y -->
	<div class="entity">
		<button
			class="plain-button icon-button"
			on:click={toggleExpandControls}
			title="{expandControls ? 'hide' : 'show'} list controls"
			>{#if expandControls}&lt;{:else}>{/if}</button
		>
		{#if checked !== undefined}
			<!-- TODO checkbox not updated properly on event broadcast-->
			<!-- TODO maybe use Felt checkbox component when available-->
			<input type="checkbox" disabled={pending} bind:checked />
		{/if}
		<div class="content markup">
			<EntityContent {entity} />
		</div>
		{#if items?.length}
			<span style:padding="var(--spacing_sm)">{items.length}</span>
			<button class="plain-button icon-button" on:click={toggleExpandItems}>
				{#if expandItems}-{:else}+{/if}
			</button>
		{/if}
		<div class="signature" style:padding="var(--spacing_sm)">
			<ActorAvatar persona={authorActor} showName={false} />
		</div>
		{#if items?.length && (expandItems || expandControls)}
			<div class="floating-controls">
				<button class="plain-button icon-button" on:click={toggleExpandItems}>
					{#if expandItems}-{:else}+{/if}
				</button>
			</div>
		{/if}
	</div>
	{#if expandControls}
		<ListControls list={entity} bind:listInputEl />
	{/if}
	{#if expandItems && items?.length}
		<div class="items" transition:slide|local>
			<ul class="panel">
				{#each items as item (item)}
					<svelte:self entity={item} />
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
		background-color: var(--tint_dark_1);
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
		background-color: var(--tint_dark_1);
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
		font-size: var(--font_size_xl);
		padding: 0 var(--spacing_md);
	}
	.floating-controls {
		position: absolute;
		left: 0;
		top: 100%;
	}
</style>
