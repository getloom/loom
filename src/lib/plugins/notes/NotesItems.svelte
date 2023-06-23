<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import NotesItem from '$lib/plugins/notes/NotesItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	export let actor: Readable<AccountActor>;
	export let entities: Mutable<Array<Readable<Entity>>>;

	$: notes = $entities.value.slice().reverse(); // TODO customizable sorting
</script>

<ul>
	{#each notes as entity (entity)}
		<NotesItem {actor} {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
