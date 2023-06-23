<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ListItem from './ListItem.svelte';

	export let entities: Mutable<Array<Readable<Entity>>>;
</script>

<ul>
	{#each $entities.value as entity (entity)}
		<ListItem {entity} />
	{/each}
</ul>
