<script context="module" lang="ts">
	export type BudgetItem = {
		category: string;
		value: number;
		itemType: 'INCOME' | 'EXPENSE';
	};
</script>

<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';

	import BudgetItems from './BudgetItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import BudgetItemControls from './BudgetItemControls.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import type {SpaceId} from '$lib/vocab/space/space.js';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
	import type {ActorId} from '$lib/vocab/actor/actor.js';
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {loadOrderedEntities} from '$lib/vocab/entity/entityHelpers.js';
	import BudgetSummary from '$lib/plugins/budget/BudgetSummary.svelte';

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

	//TODO refactor once query by path is in place
	const budgetItemsPath = '/budget-items';
	$: listsCollection = $entities?.value.find((e) => e.get().path === budgetItemsPath);

	$: ({space_id, directory_id} = $space);
	$: ({actor_id} = $actor);

	$: if ($query?.status === 'success' && !listsCollection) {
		void initListsCollection(space_id, directory_id, actor_id, budgetItemsPath);
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

	let categoryInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate
	let valueInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate

	//This value isn't really used for anything, it's just used to trigger a redraw inside BudgetSummary
	let budgetLastUpdated = Date.now();
	const updateBudgetNumber = (): void => {
		budgetLastUpdated = Date.now();
	};
</script>

<div
	class="list"
	style:--layout_direction={layoutDirection}
	style:--items_direction={itemsDirection}
>
	<div class="entities">
		<!-- Replace two discrete controls with single BudgetItem control-->
		<!-- expand on BudgetItem creation interface-->
		<!-- add display/business logic to sum all budget items based on type-->
		{#if query && listsCollection && orderedEntities}
			<BudgetSummary {orderedEntities} lastUpdated={budgetLastUpdated} />
			<BudgetItemControls list={listsCollection} bind:categoryInputEl bind:valueInputEl />
			<BudgetItems entities={orderedEntities} parentList={listsCollection} {updateBudgetNumber} />
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
