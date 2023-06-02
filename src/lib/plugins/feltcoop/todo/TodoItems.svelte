<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import TodoItem from '$lib/plugins/feltcoop/todo/TodoItem.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	export let actor: Readable<AccountActor>;
	export let entities: Array<Readable<Entity>>;
	export let parentList: Readable<Entity>;
	export let space: Readable<Space>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity>) => void;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each entities as entity (entity)}
		<TodoItem {actor} {parentList} {entity} {space} {selectedList} {selectList} />
	{/each}
</ul>
