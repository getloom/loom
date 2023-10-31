<script lang="ts">
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';
	import {slide} from 'svelte/transition';

	import type {QueryStore} from '$lib/util/query.js';

	export let query: QueryStore;

	$: ({more, status} = $query);
</script>

{#if more}
	<div class="load_more_button" out:slide>
		<Pending_Button
			attrs={{class: 'plain'}}
			pending={status === 'pending'}
			on:click={query.loadMore}
		>
			load more
		</Pending_Button>
	</div>
{/if}
