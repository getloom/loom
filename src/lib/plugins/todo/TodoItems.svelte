<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import TodoItem from '$lib/plugins/todo/TodoItem.svelte';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';

	export let actor: Readable<AccountActor>;
	export let entities: Array<Readable<Entity>>;
	export let parentList: Readable<Entity>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity> | null) => void;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each entities as entity (entity)}
		<TodoItem {actor} {parentList} {entity} {space} {hub} {selectedList} {selectList} />
	{/each}
</ul>

<style>
	ul {
		padding: var(--spacing_xs);
	}
</style>
