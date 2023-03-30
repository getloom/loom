<script lang="ts">
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';
	import {browser} from '$app/environment';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import EntityTreeItem from '$lib/ui/EntityTreeItem.svelte';

	const {
		actions,
		socket,
		ui: {contextmenu, entityById},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let ties: Readable<Array<Readable<Tie>>>; // TODO maybe don't pass these and do lookups instead
	export let depth = 0;
	export let itemComponent = EntityTreeItem;

	let expanded = false;

	$: hasDestEntities = !!(destEntities && $destEntities.length);

	// TODO use pageKey
	let destEntities: Readable<Array<Readable<Entity>>>;
	// let destTies: Readable<Array<Readable<Tie>>>;
	$: shouldLoadEntities && loadEntities2();
	const loadEntities2 = async () => {
		const result = await actions.ReadEntitiesPaginated({
			actor: $persona.persona_id,
			source_id: $entity.entity_id,
		});
		if (result.ok) {
			// TODO refactor using a query interface (with data, status)
			destEntities = writable(result.value.entities.map((e) => entityById.get(e.entity_id)!));
			// destTies = writable(result.value.ties.map((t) => writable(t)));
		}
	};

	$: shouldLoadEntities = browser && $socket.open;
</script>

<li style:--depth={depth}>
	<div class="item" use:contextmenu.action={[[EntityContextmenu, {persona, entity}]]}>
		{#if hasDestEntities}
			<button class="icon-button" on:click={() => (expanded = !expanded)}>
				{#if expanded}–{:else}+{/if}
			</button>
		{:else}
			<div class="icon-button" />
		{/if}
		<svelte:component this={itemComponent} {entity} />
	</div>
	<!-- TODO key? -->
	{#if expanded && hasDestEntities}
		<ul>
			{#each $destEntities as destEntity (destEntity)}
				<svelte:self entity={destEntity} {ties} depth={depth + 1} {itemComponent} />
			{/each}
		</ul>
	{/if}
</li>

<style>
	li {
		padding-left: calc(var(--depth) * var(--icon_size));
	}
	.item {
		flex: 1;
		display: flex;
		align-items: center;
	}
	.icon-button {
		margin-right: var(--spacing_sm);
	}
	li {
		display: flex;
		flex-direction: column;
	}
</style>
