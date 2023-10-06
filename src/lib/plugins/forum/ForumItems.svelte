<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ForumItemSummary from '$lib/plugins/forum/ForumItemSummary.svelte';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';

	export let entities: Mutable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let actor: Readable<AccountActor>;
</script>

<ul>
	{#each $entities.value as entity (entity)}
		<ForumItemSummary {actor} {space} {hub} {entity} />
	{/each}
</ul>
