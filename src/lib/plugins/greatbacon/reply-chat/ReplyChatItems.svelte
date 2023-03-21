<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import ReplyChatItem from '$lib/plugins/greatbacon/reply-chat/ReplyChatItem.svelte';

	export let persona: Readable<AccountPersona>;
	export let entities: Readable<Array<Readable<Entity>>>;
	export let selectReply: (reply: Readable<Entity>) => void;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<ReplyChatItem {persona} {entity} {selectReply} />
	{/each}
</ul>
