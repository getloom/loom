<script lang="ts">
	import type {Mutable, Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ForumItemSummary from '$lib/plugins/forum/ForumItemSummary.svelte';
	import ForumItemDetail from '$lib/plugins/forum/ForumItemDetail.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	export let entities: Mutable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let actor: Readable<AccountActor>;
	export let selectedPost: Readable<Entity> | null;
	export let selectPost: (post: Readable<Entity>) => void;

	const goBack = () => {
		selectPost(selectedPost!);
	};

	// TODO use the "./threads" collection from the directory
	$: collectionEntities = $entities.value.filter((e) => e.get().data.type === 'Collection');
</script>

{#if selectedPost}
	<button on:click={goBack}>Go Back</button>
	<div class="wrapper">
		<ForumItemDetail entity={selectedPost} {space} {actor} />
	</div>
{:else}
	<ul>
		{#each collectionEntities as entity (entity)}
			<ForumItemSummary {actor} {entity} {selectPost} />
		{/each}
	</ul>
{/if}

<style>
	.wrapper {
		padding: var(--spacing_md);
	}
</style>
