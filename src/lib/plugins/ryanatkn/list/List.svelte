<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable} from '@feltcoop/svelte-gettable-stores';

	import ListItems from './ListItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';
	import ListControls from './ListControls.svelte';

	const {actor, space} = getSpaceContext();

	export let layoutDirection = 'column'; // is a `flex-direction` property
	export let itemsDirection = 'column'; // is a `flex-direction` property

	// TODO make the item component/props generic (maybe `itemComponent` and `itemProps`?) or slots?
	// TODO select multiple, act on groups of selected items
	// TODO collapse button?

	const {
		actions,
		socket,
		ui: {entityById},
	} = getApp();

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? actions.QueryEntities({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: queryData = query?.data;
	$: queryStatus = query?.status;
	// TODO the `readable` is a temporary hack until we finalize cached query result patterns
	$: directory = entityById.get($space.directory_id);
	$: entities = $queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)));

	let listInputEl: HTMLTextAreaElement | undefined = undefined; // TODO use this to focus the input when appropriate
</script>

<div
	class="list"
	style:--layout_direction={layoutDirection}
	style:--items_direction={itemsDirection}
>
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities && $queryStatus === 'success'}
			{#if directory}
				<ListControls list={directory} bind:listInputEl />
			{/if}
			<ListItems {entities} />
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
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		flex-direction: var(--layout_direction);
	}
</style>
