<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityExplorerItem from '$lib/plugins/feltcoop/entity-explorer/EntityExplorerItem.svelte';
	import type {AccountPersona} from '$lib/vocab/actor/persona';

	export let persona: Readable<AccountPersona>;
	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<ul>
	{#each $entities as entity (entity)}
		<EntityExplorerItem {persona} {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
	}
</style>
