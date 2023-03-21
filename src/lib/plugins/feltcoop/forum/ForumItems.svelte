<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ForumItemSummary from '$lib/plugins/feltcoop/forum/ForumItemSummary.svelte';
	import ForumItemDetail from '$lib/plugins/feltcoop/forum/ForumItemDetail.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountPersona} from '$lib/vocab/actor/persona';

	export let entities: Readable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let persona: Readable<AccountPersona>;
	export let selectedPost: Readable<Entity> | null;
	export let selectPost: (post: Readable<Entity>) => void;

	const goBack = () => {
		selectPost(selectedPost!);
	};

	//TODO in directory structure, this would just grab the "lists" collection from the dir
	$: collectionEntities = $entities?.filter((e) => e.get().data.type === 'Collection');
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->

{#if selectedPost}
	<button on:click={goBack}>Go Back</button>
	<div class="wrapper">
		<ForumItemDetail entity={selectedPost} {space} {persona} />
	</div>
{:else}
	<ul>
		{#each collectionEntities as entity (entity)}
			<ForumItemSummary {persona} {entity} {selectPost} />
		{/each}
	</ul>
{/if}

<style>
	.wrapper {
		padding: var(--spacing_md);
	}
</style>
