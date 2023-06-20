<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: authorActor = lookupActor(actorById, $entity.actor_id);
</script>

<li
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
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
		background-color: var(--input_bg);
		overflow: auto;
	}
</style>
