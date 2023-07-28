<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import ListItems from './ListItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import ListControls from './ListControls.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {actor, space, directory} = getSpaceContext();

	export let layoutDirection = 'column'; // is a `flex-direction` property
	export let itemsDirection = 'column'; // is a `flex-direction` property

	// TODO make the item component/props generic (maybe `itemComponent` and `itemProps`?) or slots?
	// TODO select multiple, act on groups of selected items
	// TODO collapse button?

	const {socket, createQuery} = getApp();

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: entities = query?.entities;

	let listInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate
</script>

<div
	class="list"
	style:--layout_direction={layoutDirection}
	style:--items_direction={itemsDirection}
>
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if query && entities}
			<ListControls list={directory} bind:listInputEl />
			<ListItems {entities} />
			<LoadMoreButton {query} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		max-width: var(--width_md);
		overflow: auto;
		flex: 1;
		display: flex;
		flex-direction: var(--layout_direction);
	}
</style>
