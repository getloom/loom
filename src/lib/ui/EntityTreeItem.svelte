<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityContent from '$lib/ui/EntityContent.svelte';

	export let entity: Readable<Entity>;
</script>

<span
	>{#if $entity.data.name}{$entity.data.name}:{/if}
	{$entity.data.type}:</span
>
{#if $entity.data.content || $entity.data.type === 'Tombstone'}<div class="content ellipsis">
		<EntityContent {entity} />
	</div>{/if}

<style>
	.content {
		padding: 0 var(--spacing_sm);
	}
</style>
