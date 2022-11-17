<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltcoop/felt/PendingAnimation.svelte';
	import {readable} from '@feltcoop/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import ForumItems from '$lib/ui/ForumItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {dispatch, socket} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? dispatch.QueryEntities({
				actor: $persona.persona_id,
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
		await dispatch.CreateEntity({
			actor: $persona.persona_id,
			data: {type: 'Note', content},
			ties: [{source_id: $space.directory_id}],
		});
		await dispatch.UpdateEntity({
			actor: $persona.persona_id,
			data: null,
			entity_id: $space.directory_id,
		});
		text = '';
	};

	const onSubmit = async () => {
		await createEntity();
	};
</script>

<div class="forum">
	<TextInput {persona} placeholder="> new topic" on:submit={onSubmit} bind:value={text} />
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<ForumItems {persona} {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.forum {
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
		flex-direction: column;
	}
</style>
