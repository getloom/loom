<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';
	import {page} from '$app/stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color.js';
	import {getApp} from '$lib/ui/app.js';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';
	import {toHubUrl} from '$lib/util/url.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {Space} from '$lib/vocab/space/space.js';

	const {
		ui: {contextmenu, actorById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let entity: Readable<Entity>;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	// TODO helper with better change detection
	$: href = toHubUrl($hub.name, '/' + $space.name + '/' + $entity.entity_id, $page.url.search);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
	]}
>
	<!-- TODO remove this override after implementing links -->
	<a {href} class="prose formatted">
		<div class="content">
			{#if $entity.data.name}
				{$entity.data.name}
			{:else}
				<em>no name found</em>
			{/if}
		</div>
		<div class="signature">
			<ActorAvatar actor={authorActor} />
		</div>
	</a>
</li>

<style>
	li {
		align-items: flex-start;
		flex-direction: column;
	}
	.signature {
		display: flex;
		align-items: center;
		--icon_size: var(--icon_size_xs);
	}
	a {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--spacing_xs) var(--spacing_md);
	}
	a:hover {
		background-color: var(--fg_1);
	}
</style>
