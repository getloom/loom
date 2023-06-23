<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ListItem from './ListItem.svelte';

	export let entities: Mutable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities.value as entity (entity)}
		<ListItem {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: var(--items_direction);
	}
</style>
