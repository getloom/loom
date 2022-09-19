<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<Persona>;
	export let entity: Readable<Entity>;

	$: authorPersona = personaById.get($entity.persona_id)!;
</script>

<li
	use:contextmenu.action={[
		[PersonaContextmenu, {persona: authorPersona}],
		[EntityContextmenu, {persona, entity}],
	]}
>
	<div class="markup padded-xl formatted">
		<EntityContent {entity} />
	</div>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border_width) var(--border_style) var(--border_color);
		max-width: var(--column_width_sm);
		margin: 10px;
		background-color: var(--input_bg_color);
	}
</style>
