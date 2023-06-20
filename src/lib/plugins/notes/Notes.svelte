<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable} from '@feltcoop/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import NotesItems from '$lib/plugins/notes/NotesItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';

	const {actor, space} = getSpaceContext();

	const {actions, socket} = getApp();

	let text = '';

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
	$: entities = $queryData && readable(sortEntitiesByCreated(Array.from($queryData.value)));

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {type: 'Note', content},
			ties: [{source_id: $space.directory_id}],
		});
		text = '';
	};

	const onSubmit = async () => {
		await createEntity();
	};
</script>

<div class="notes">
	<TextInput {actor} on:submit={onSubmit} bind:value={text} placeholder="> note" />
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<NotesItems {actor} {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.notes {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
