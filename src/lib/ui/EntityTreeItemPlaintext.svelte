<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';

	export let entity: Readable<Entity>;
</script>

<span class="name"
	>{#if $entity.data.name}{$entity.data.name}:{/if}
	{$entity.data.type}:</span
>
{#if $entity.data.content || $entity.data.type === 'Tombstone'}<pre class="content">
		{JSON.stringify($entity)}
	</pre>{/if}

<style>
	.name {
		font-weight: 600;
	}
	.content {
		padding: 0 var(--spacing_sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--font_size_sm);
	}
</style>
