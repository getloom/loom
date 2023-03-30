<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupPersona} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);
</script>

<li
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[ActorContextmenu, {persona: authorPersona}],
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
