<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;

	$: authorPersona = personaById.get($entity.persona_id)!;

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);
</script>

<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[PersonaContextmenu, {persona: authorPersona}],
	]}
>
	<div class="markup padded-xl formatted">
		<EntityContent {entity} />
	</div>
	<PersonaAvatar persona={authorPersona} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--tint_lightness_8)));
		flex-direction: column;
	}

	.markup {
		font-size: var(--font_size_lg);
		/* the bottom padding prevents chars like y and g from being cut off */
		padding: 0 0 var(--spacing_xs) var(--spacing_md);
	}
</style>
