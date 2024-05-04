<script lang="ts">
	import type {Mutable, Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import ChatItem from '$lib/plugins/chat/ChatItem.svelte';

	export let actor: Readable<AccountActor>;
	export let entities: Mutable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities.value as entity (entity)}
		<ChatItem {actor} {entity} />
	{/each}
</ul>
