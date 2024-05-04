<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ListItem from './ListItem.svelte';

	export let entities: Array<Readable<Entity>>;
	export let parentList: Readable<Entity>;
</script>

<ul>
	{#each entities as entity (entity)}
		<ListItem {entity} {parentList} />
	{/each}
</ul>
