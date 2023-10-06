<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ListItem from '$lib/plugins/list/ListItem.svelte';

	export let entities: Array<Readable<Entity>>;
	export let parentList: Readable<Entity>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each entities as entity (entity)}
		<ListItem {entity} {parentList} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: var(--items_direction);
	}
</style>
