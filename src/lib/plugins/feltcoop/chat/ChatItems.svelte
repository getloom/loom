<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ChatItem from '$lib/plugins/feltcoop/chat/ChatItem.svelte';

	export let persona: Readable<AccountPersona>;
	export let entities: Mutable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities.value as entity (entity)}
		<ChatItem {persona} {entity} />
	{/each}
</ul>
