<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import {moveDown, moveUp} from '$lib/vocab/entity/entityHelpers';

	const {
		ui: {contextmenu, actorById},
		actions,
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let parentList: Readable<Entity>;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	$: first = $parentList.data.orderedItems![0] === $entity.entity_id;
	$: last =
		$parentList.data.orderedItems![$parentList.data.orderedItems!.length - 1] === $entity.entity_id;
	$: enableMoveUp = !last;
	$: enableMoveDown = !first;
</script>

<li
	use:contextmenu.action={[
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
	]}
>
	<div class="prose padded_1 formatted">
		<EntityContent {entity} />
	</div>
	<button
		class="plain icon_button"
		title="move up"
		on:click={() => moveDown(entity, parentList, $actor.actor_id, actions)}
		disabled={!enableMoveUp}>↑</button
	>
	<button
		class="plain icon_button"
		title="move down"
		on:click={() => moveUp(entity, parentList, $actor.actor_id, actions)}
		disabled={!enableMoveDown}>↓</button
	>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border_width) var(--border_style) var(--border_color);
		max-width: var(--width_sm);
		margin: 10px;
		background-color: var(--input_bg);
	}
</style>
