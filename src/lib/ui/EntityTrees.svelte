<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import EntityTreeItem from '$lib/ui/EntityTreeItem.svelte';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {QueryStore} from '$lib/util/query.js';
	import EntityTreeRoot from '$lib/ui/EntityTreeRoot.svelte';

	export let actor: Readable<AccountActor>;
	// TODO this is wrong, maybe pass query to `EntityTreeRoot`? maybe make a `QueryExplorer` instead?
	export let entity: Readable<Entity>;
	export let itemComponent = EntityTreeItem;
	export let queries: QueryStore[];
	// TODO show ties
</script>

<div>
	{#each queries as query (query)}
		<EntityTreeRoot {actor} {entity} {query} {itemComponent} />
	{/each}
</div>
