<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityItem from '$lib/ui/EntityItem.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	export let persona: Readable<AccountPersona>;
	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<ul>
	{#each $entities as entity (entity)}
		<EntityItem {persona} {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
	}
</style>
