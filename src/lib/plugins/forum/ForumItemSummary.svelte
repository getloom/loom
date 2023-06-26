<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';
	import {page} from '$app/stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import {toHubUrl} from '$lib/util/url';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {Space} from '$lib/vocab/space/space';

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
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
>
	<!-- TODO remove this override after implementing links -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
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
