<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import NotesItem from '$lib/plugins/feltcoop/notes/NotesItem.svelte';
	import type {AccountPersona} from '$lib/vocab/actor/persona';

	export let persona: Readable<AccountPersona>;
	export let entities: Readable<Array<Readable<Entity>>>;

	$: notes = $entities.slice().reverse(); // TODO definitely not this
</script>

<ul>
	{#each notes as entity (entity)}
		<NotesItem {persona} {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
