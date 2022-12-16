<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {tick} from 'svelte';
	import {slide} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import ListControls from './ListControls.svelte';
	import ClearCheckedButton from './ClearCheckedButton.svelte';
	import {getViewContext} from '$lib/vocab/view/view';
	import {lookupPersona} from '$lib/vocab/persona/personaHelpers';

	const viewContext = getViewContext();
	$: ({persona} = $viewContext);

	const {
		ui: {contextmenu, personaById, destTiesBySourceEntityId, entityById},
		dispatch,
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

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);

	$: checked !== undefined && updateEntity(checked); // TODO change to a fn?

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		await dispatch.UpdateEntity({
			actor: $persona.persona_id,
			entity_id: $entity.entity_id,
			data: {...$entity.data, checked},
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

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	transition:slide|local
	class:expandItems
	style="--hue: {hue}"
	use:contextmenu.action={[
		[PersonaContextmenu, {persona: authorPersona}],
		[EntityContextmenu, {persona, entity}],
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
			{#if $entity.data.type === 'Collection'}
				{$entity.data.name}
			{:else}
				<EntityContent {entity} />
			{/if}
		</div>
		{#if items?.length}
			<span style:padding="var(--spacing_sm)">{items.length}</span>
			<button class="plain-button icon-button" on:click={toggleExpandItems}>
				{#if expandItems}-{:else}+{/if}
			</button>
		{/if}
		<div class="signature" style:padding="var(--spacing_sm)">
			<PersonaAvatar persona={authorPersona} showName={false} />
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
