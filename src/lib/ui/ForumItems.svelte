<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ForumItem from '$lib/ui/ForumItem.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let persona: Readable<Persona>;
	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<ForumItem {persona} {entity} />
	{/each}
</ul>
