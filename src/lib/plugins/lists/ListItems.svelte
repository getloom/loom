<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ListItem from './ListItem.svelte';

	export let entities: Readable<Array<Readable<Entity>>>;

	//TODO in directory structure, this would just grab the "lists" collection from the dir
	$: collectionEntities = $entities?.filter((e) => e.get().data.type === 'Collection');
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each collectionEntities as entity (entity)}
		<ListItem {entity} />
	{/each}
</ul>
