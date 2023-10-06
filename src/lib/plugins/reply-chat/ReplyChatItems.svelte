<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import ReplyChatItem from '$lib/plugins/reply-chat/ReplyChatItem.svelte';

	export let actor: Readable<AccountActor>;
	export let entities: Mutable<Array<Readable<Entity>>>;
	export let selectReply: (reply: Readable<Entity>) => void;
	export let queryReply: (entity_id: number, cb: (entity: Readable<Entity>) => void) => void;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities.value as entity (entity)}
		<ReplyChatItem {actor} {entity} {selectReply} {queryReply} />
	{/each}
</ul>
