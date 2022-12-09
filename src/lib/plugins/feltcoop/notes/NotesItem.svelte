<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {lookupPersona} from '$lib/vocab/persona/personaHelpers';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);
</script>

<li
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[PersonaContextmenu, {persona: authorPersona}],
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
