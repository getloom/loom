<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ChatItem from '$lib/plugins/feltcoop/chat/ChatItem.svelte';

	export let persona: Readable<AccountPersona>;
	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<ChatItem {persona} {entity} />
	{/each}
</ul>
