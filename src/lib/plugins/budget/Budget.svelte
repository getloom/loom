<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';

	import ListItems from './BudgetItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import CategoryControls from './CategoryControls.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import type {SpaceId} from '$lib/vocab/space/space.js';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
	import type {ActorId} from '$lib/vocab/actor/actor.js';
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {loadOrderedEntities} from '$lib/vocab/entity/entityHelpers.js';	
	import IncomeControl from './IncomeControl.svelte';	

	const {actor, space} = getSpaceContext();

	export let layoutDirection = 'column'; // is a `flex-direction` property
	export let itemsDirection = 'column'; // is a `flex-direction` property	

	// TODO make the item component/props generic (maybe `itemComponent` and `itemProps`?) or slots?
	// TODO select multiple, act on groups of selected items
	// TODO collapse button?

	const {socket, createQuery, actions, ui} = getApp();

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
			})
		: null;
	$: entities = query?.entities;
	
	$: console.log(entities?.get());
	$: console.log(entities?.get().value[0]?.get());
	$: console.log(entities?.get().value[1]?.get());

	//TODO refactor once query by path is in place
	const categoriesPath = '/categories';
	$: listsCollection = $entities?.value.find((e) => e.get().path === categoriesPath);

	const incomePath = '/income';
	$: income = $entities?.value.find((e) => e.get().path === incomePath);
	

	$: ({space_id, directory_id} = $space);
	$: ({actor_id} = $actor);

	$: if ($query?.status === 'success' && !listsCollection) {
		void initListsCollection(space_id, directory_id, actor_id, categoriesPath);
	}
	const initListsCollection = async (
		space_id: SpaceId,
		directory_id: EntityId,
		actor: ActorId,
		path: string,
	) => {
		await actions.CreateEntity({
			space_id,
			actor,
			path,
			data: {type: 'OrderedCollection', orderedItems: []},
			ties: [{source_id: directory_id}],
		});
	};

	// TODO extract this pattern from 2 places, into the query system?
	let orderedEntities: Array<Readable<Entity>> | null = null;
	$: orderedItems = $listsCollection?.data.orderedItems;
	$: orderedItems && void assignOrderedEntities();
	const assignOrderedEntities = async (): Promise<void> => {
		orderedEntities = await loadOrderedEntities($listsCollection!, $actor.actor_id, ui, actions);
	};

	let listInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate
	let incomeInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate
</script>

<div
	class="list"
	style:--layout_direction={layoutDirection}
	style:--items_direction={itemsDirection}
>
	<div class="entities">
		<!-- TODO handle failures here-->
		<!-- TODO not show "lists" if there's no income-->
		{#if query && listsCollection && $listsCollection && orderedEntities}
			<IncomeControl {incomePath} {income} bind:incomeInputEl/>
			<CategoryControls list={listsCollection} bind:listInputEl />
			<ListItems entities={orderedEntities} parentList={listsCollection} />
			<LoadMoreButton {query} />
		{:else}
			<Pending_Animation />
		{/if}
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		max-width: var(--width_md);
		overflow: auto;
		flex: 1;
		display: flex;
		flex-direction: var(--layout_direction);
	}
</style>
