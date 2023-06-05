<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide} from 'svelte/transition';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {actor} = getSpaceContext();

	const {
		ui: {contextmenu, actorById},
		actions,
	} = getApp();

	export let entity: Readable<Entity>;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	transition:slide|local
	style="--hue: {hue}"
	use:contextmenu.action={[
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
		toContextmenuParams(EntityContextmenu, {actor, entity}),
	]}
>
	<!-- TODO fix a11y -->
	<div class="entity">
		<div class="content prose">
			<EntityContent {entity} />
		</div>
		<div class="signature" style:padding="var(--spacing_sm)">
			<ActorAvatar actor={authorActor} showName={false} />
		</div>
		<button
			class="plain icon_button"
			on:click={() =>
				actions.DeleteEntities({actor: $actor.actor_id, entityIds: [$entity.entity_id]})}
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
		background-color: var(--fg_1);
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
		background-color: var(--fg_1);
	}
	.content {
		flex: 1;
		font-size: var(--size_xl);
		padding: 0 var(--spacing_md);
	}
</style>
