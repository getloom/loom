<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: authorActor = lookupActor(personaById, $entity.persona_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorActor.name);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* personas? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[ActorContextmenu, {persona: authorActor}],
	]}
>
	<div class="signature">
		<ActorAvatar persona={authorActor} showName={false} />
	</div>
	<div class="content">
		<div class="signature">
			<ActorAvatar persona={authorActor} showIcon={false} />
			<small>{format($entity.created, 'MMM d, p')}</small>
		</div>
		<div class="markup formatted"><EntityContent {entity} /></div>
	</div>
</li>

<style>
	li {
		align-items: flex-start;
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--tint_lightness_8)));
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
