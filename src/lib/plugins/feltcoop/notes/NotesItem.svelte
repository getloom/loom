<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: authorActor = lookupActor(actorById, $entity.actor_id);
</script>

<li
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[ActorContextmenu, {persona: authorActor}],
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
