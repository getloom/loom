<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import BudgetItem from './BudgetItem.svelte';

	export let entities: Array<Readable<Entity>>;
	export let parentList: Readable<Entity>;
	export let updateBudgetNumber: () => void;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each entities as entity (entity)}
		<BudgetItem {entity} {parentList} {updateBudgetNumber} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: var(--items_direction);
	}
</style>
