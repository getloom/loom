<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let selectPost: (post: Readable<Entity>) => void;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	//TODO is this still needed?
	const renderEntity = (entity: Entity): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'Collection' || type === 'Note')) return false;
		return true;
	};
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
{#if renderEntity($entity)}
	<li
		style="--hue: {hue}"
		use:contextmenu.action={[
			toContextmenuParams(EntityContextmenu, {actor, entity}),
			toContextmenuParams(ActorContextmenu, {actor: authorActor}),
		]}
	>
		<!-- TODO remove this override after implementing links -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => selectPost(entity)} class="entity prose formatted">
			<div>
				{#if $entity.data.name}
					{$entity.data.name}
				{:else}
					<em>no name found</em>
				{/if}
			</div>
			<div class="signature">
				<ActorAvatar actor={authorActor} />
			</div>
		</div>
	</li>
{/if}

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
	.entity {
		display: flex;
		width: 100%;
	}
	.entity:hover {
		background-color: var(--fg_1);
	}
	.prose {
		/* the bottom padding prevents chars like y and g from being cut off */
		padding: 0 0 var(--spacing_xs) var(--spacing_md);
	}
</style>
