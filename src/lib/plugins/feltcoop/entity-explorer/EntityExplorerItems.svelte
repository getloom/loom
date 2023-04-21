<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityExplorerItem from '$lib/plugins/feltcoop/entity-explorer/EntityExplorerItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	export let actor: Readable<AccountActor>;
	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<ul>
	{#each $entities as entity (entity)}
		<EntityExplorerItem {actor} {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
	}
</style>
