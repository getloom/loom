<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;

	$: authorPersona = personaById.get($entity.persona_id)!;
</script>

<li
	use:contextmenu.action={[
		[PersonaContextmenu, {persona: authorPersona}],
		[EntityContextmenu, {persona, entity}],
	]}
>
	<pre>{JSON.stringify($entity, null, 2)}</pre>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border_width) var(--border_style) var(--border_color);
		margin: 10px;
		padding: 10px;
		background-color: var(--input_bg_color);
		overflow: auto;
	}
</style>
