<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	import ChatItems from '$lib/plugins/chat/ChatItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import TextInput from '$lib/ui/TextInput.svelte';
	import {createPaginatedQuery} from '$lib/util/query';

	const {actor, space} = getSpaceContext();

	const {ui, actions, socket} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket.open;

	$: query = shouldLoadEntities
		? createPaginatedQuery(ui, actions, {
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;

	$: status = $query?.status;
	$: more = $query?.more;
	$: entities = query?.entities;

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

<div class="chat">
	<div class="entities">
		{#if query && entities}
			<ChatItems {actor} {entities} />
			{#if more}
				<PendingButton class="plain" pending={status === 'pending'} on:click={query.loadMore}
					>load more</PendingButton
				>
			{/if}
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	<TextInput {actor} placeholder="> chat" on:submit={onSubmit} bind:value={text} />
</div>

<style>
	.chat {
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
		/* makes scrolling start at the bottom */
		flex-direction: column-reverse;
	}
</style>
