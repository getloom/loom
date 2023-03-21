<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import BoardItemDetail from '$lib/plugins/feltcoop/board/BoardItemDetail.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountPersona} from '$lib/vocab/actor/persona';

	export let entities: Readable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let persona: Readable<AccountPersona>;
</script>

<!-- TODO possibly remove the `ol` wrapper and change the `li`s to `div`s -->

<ol>
	{#each $entities as entity (entity)}
		<BoardItemDetail {persona} {entity} {space} />
	{/each}
</ol>

<style>
	ol {
		padding: var(--spacing_xs);
	}
</style>
