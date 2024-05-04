<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import EntityChip from '$lib/ui/EntityChip.svelte';

	export let entity: Readable<Entity>;
</script>

<EntityChip {entity} />
{#if $entity.data}<pre class="content ellipsis">{JSON.stringify($entity.data)}</pre>{/if}

<style>
	.content {
		padding: 0 var(--spacing_sm);
		font-size: var(--size_sm);
	}
</style>
