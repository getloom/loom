<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
>
	<div class="signature">
		<ActorAvatar actor={authorActor} showName={false} />
	</div>
	<div class="content">
		<div class="signature">
			<ActorAvatar actor={authorActor} showIcon={false} />
			<small>{format($entity.created, 'MMM d, p')}</small>
		</div>
		<div class="prose formatted"><EntityContent {entity} /></div>
	</div>
</li>

<style>
	li {
		align-items: flex-start;
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--tint_saturation), 89%);
	}
	/* TODO hacky */
	:global(.dark) li {
		background-color: hsl(var(--hue), var(--tint_saturation), 11%);
	}
	.signature {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.content {
		padding-left: var(--spacing_md);
		flex: 1;
	}
	.formatted {
		/* the bottom padding prevents chars like y and g from being cut off */
		padding-bottom: var(--spacing_xs);
	}
</style>
