<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@fuz.dev/fuz_library/Pending_Animation.svelte';

	import EntityExplorerItems from '$lib/plugins/entity-explorer/EntityExplorerItems.svelte';
	import EntityTrees from '$lib/ui/EntityTrees.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {actor, space} = getSpaceContext();

	const {
		actions,
		socket,
		ui: {entityById},
		createQuery,
	} = getApp();

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: entities = query?.entities;

	// TODO persist this state, maybe in the queryparams/URL path or `viewBySpace`

	// TODO consider an "add view" button with a menu to select any view that then goes into a tab
	let selectedView: 'explorer' | 'tree' = 'tree';

	$: directory = entityById.get($space.directory_id);

	$: queries = query ? [query] : []; // TODO rethink this
</script>

<div class="entity_explorer">
	<button type="button" on:click={() => actions.ViewSpace({space_id: $space.space_id, view: null})}>
		Close EntityExplorer
	</button>
	<div class="buttons">
		<button
			class="deselectable"
			class:selected={selectedView === 'explorer'}
			on:click={() => (selectedView = 'explorer')}>explorer</button
		>
		<button
			class="deselectable"
			class:selected={selectedView === 'tree'}
			on:click={() => (selectedView = 'tree')}>tree</button
		>
	</div>
	<div class="content">
		{#if selectedView === 'explorer'}
			<div class="entities">
				{#if query && entities}
					<EntityExplorerItems {actor} {entities} />
					<LoadMoreButton {query} />
				{:else}
					<Pending_Animation />
				{/if}
			</div>
		{/if}
		{#if selectedView === 'tree'}
			{#if query && directory && entities}
				<EntityTrees {actor} entity={directory} bind:queries />
				<LoadMoreButton {query} />
			{:else}
				<Pending_Animation />
			{/if}
		{/if}
	</div>
</div>

<style>
	.entity_explorer {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.content {
		flex: 1;
		width: 100%;
		overflow: auto;
	}
	.entities {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
