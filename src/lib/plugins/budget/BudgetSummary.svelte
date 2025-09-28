<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {BudgetItem} from './Budget.svelte';

	export let orderedEntities: Array<Readable<Entity>>;
	export let lastUpdated: number;
    
    //eslint-disable-next-line no-inner-declarations
    function calculateItems(budgetItems: Array<Readable<Entity>>, _lastUpdated: number): number {
		budgetCount = 0;
		for (const item of budgetItems) {
			const budgetItem = item.get().data.content as any as BudgetItem;
			if (budgetItem.itemType === 'INCOME') {
				budgetCount += budgetItem.value;
			} else {
				budgetCount -= budgetItem.value;
			}
		}
		return budgetCount;
	}

	$: budgetCount = calculateItems(orderedEntities, lastUpdated);
</script>

<div class="entity">
	{#if orderedEntities.length > 0}
		{#if budgetCount < 0}
			<div>❌ Your budget is out of line! You will lose ${budgetCount} per month.</div>
		{:else}
			<div>✅ Your budget is balanced! You will save ${budgetCount} per month.</div>
		{/if}
	{:else}
		<div>No budget items found, try adding one below!</div>
	{/if}
</div>

<style>
	.entity {
		padding: var(--spacing_sm);
		font-size: var(--size_1);
	}
</style>
