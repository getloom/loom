<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import NotesItem from '$lib/plugins/notes/NotesItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let entities: Array<Readable<Entity>>;
	export let parentList: Readable<Entity>;

	$: notes = entities.slice().reverse(); // TODO customizable sorting
</script>

<ul>
	{#each notes as entity (entity)}
		<NotesItem {actor} {entity} {parentList} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
