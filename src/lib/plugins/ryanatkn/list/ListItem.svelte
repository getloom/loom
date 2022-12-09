<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({persona} = $viewContext);

	const {
		ui: {contextmenu, personaById},
		dispatch,
	} = getApp();

	export let entity: Readable<Entity>;

	$: authorPersona = personaById.get($entity.persona_id)!;

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);
</script>

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	transition:slide|local
	style="--hue: {hue}"
	use:contextmenu.action={[
		[PersonaContextmenu, {persona: authorPersona}],
		[EntityContextmenu, {persona, entity}],
	]}
>
	<!-- TODO fix a11y -->
	<div class="entity">
		<div class="content markup">
			{#if $entity.data.type === 'Collection'}
				{$entity.data.name}
			{:else}
				<EntityContent {entity} />
			{/if}
		</div>
		<div class="signature" style:padding="var(--spacing_sm)">
			<PersonaAvatar persona={authorPersona} showName={false} />
		</div>
		<button
			class="plain-button icon-button"
			on:click={() =>
				dispatch.DeleteEntities({actor: $persona.persona_id, entityIds: [$entity.entity_id]})}
			title="remove item">✕</button
		>
	</div>
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
	.content {
		flex: 1;
		font-size: var(--font_size_xl);
		padding: 0 var(--spacing_md);
	}
</style>
