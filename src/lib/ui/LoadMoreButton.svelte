<script lang="ts">
	import PendingButton from '@fuz.dev/fuz_library/PendingButton.svelte';
	import {slide} from 'svelte/transition';

	import type {QueryStore} from '$lib/util/query';

	export let query: QueryStore;

	$: ({more, status} = $query);
</script>

{#if more}
	<div class="load_more_button" out:slide>
		<PendingButton
			attrs={{class: 'plain'}}
			pending={status === 'pending'}
			on:click={query.loadMore}
		>
			load more
		</PendingButton>
	</div>
{/if}
