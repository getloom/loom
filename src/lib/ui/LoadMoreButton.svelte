<script lang="ts">
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {slide} from 'svelte/transition';

	import type {QueryStore} from '$lib/util/query';

	export let query: QueryStore;

	$: ({more, status} = $query);
</script>

{#if more}
	<div class="load_more_button" out:slide|local>
		<PendingButton class="plain" pending={status === 'pending'} on:click={query.loadMore}>
			load more
		</PendingButton>
	</div>
{/if}
