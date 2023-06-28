<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';

	export let entity: Readable<Entity>;

	// TODO contextmenu?
</script>

<code class="entity_chip">{$entity.data.type || 'Note'} {$entity.path || $entity.entity_id}</code>

<style>
	.entity_chip {
		font-weight: 600;
		font-size: var(--size_sm);
		padding: var(--spacing_xs4) var(--spacing_xs);
	}
</style>
