<script lang="ts">
	import type {Mutable, Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import EntityExplorerItem from '$lib/plugins/entity-explorer/EntityExplorerItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let entities: Mutable<Array<Readable<Entity>>>;
</script>

<ul>
	{#each $entities.value as entity (entity)}
		<EntityExplorerItem {actor} {entity} />
	{/each}
</ul>
