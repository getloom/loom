<script lang="ts">
	import type {Mutable, Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import BoardItemDetail from '$lib/plugins/board/BoardItemDetail.svelte';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let space: Readable<Space>;
	export let actor: Readable<AccountActor>;
	export let entities: Mutable<Array<Readable<Entity>>>;
	export let thread: Readable<Entity>;
</script>

<!-- TODO possibly remove the `ol` wrapper and change the `li`s to `div`s -->

<ol>
	{#each $entities.value as entity (entity)}
		<BoardItemDetail {actor} {entity} {space} {thread} />
	{/each}
</ol>

<style>
	ol {
		padding: var(--spacing_xs);
	}
</style>
