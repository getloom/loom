<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';
	import {browser} from '$app/environment';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import {getApp} from '$lib/ui/app.js';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import EntityTreeItem from '$lib/ui/EntityTreeItem.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {
		ui: {contextmenu},
		socket,
		createQuery,
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let depth = 0;
	export let last = false; // could derive from `entities` instead of this, if we add that prop
	export let itemComponent = EntityTreeItem;

	let expanded = true;

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $entity.entity_id,
			})
		: null;
	$: destEntities = query?.entities;
	$: more = $query?.more;
	$: hasDestEntities = !!$destEntities?.value.length;

	// TODO add a button to add another query, make them editable
	// TODO view tree from dests to sources

	$: destEntitiesCountMinusOne = $destEntities ? $destEntities.value.length - 1 : -1;
</script>

<li
	style:--depth={depth}
	use:contextmenu.action={to_contextmenu_params(EntityContextmenu, {actor, entity})}
>
	<div class="item">
		<span class="select_none"
			>{#if last}┗╍{:else}┣╍{/if}</span
		>
		{#if hasDestEntities}
			<button
				class="icon_button plain"
				on:click={() => (expanded = !expanded)}
				aria-label={expanded ? 'collapse' : 'expand'}
			>
				{#if expanded}–{:else}+{/if}
			</button>
		{:else}
			<div class="icon_button" aria-hidden="true" />
		{/if}
		<svelte:component this={itemComponent} {entity} />
	</div>
	<!-- TODO key? -->
	{#if expanded && hasDestEntities && query && $destEntities}
		<ul>
			{#each $destEntities.value as destEntity, i (destEntity)}
				<svelte:self
					{actor}
					entity={destEntity}
					depth={depth + 1}
					last={more ? false : i === destEntitiesCountMinusOne}
					{itemComponent}
				/>
			{/each}
		</ul>
		<div class="load_more">
			<LoadMoreButton {query} />
		</div>
	{/if}
</li>

<style>
	li {
		flex-direction: column;
	}
	ul {
		padding-left: var(--icon_size);
	}
	.load_more {
		align-self: flex-start;
		padding-left: var(--icon_size);
	}
	.item {
		flex: 1;
		display: flex;
		align-items: center;
	}
	.icon_button {
		/* TODO css class for this? */
		--icon_size: var(--icon_size_sm);
		margin-right: var(--spacing_sm);
	}
</style>
