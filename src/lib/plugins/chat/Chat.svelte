<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';

	import ChatItems from '$lib/plugins/chat/ChatItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import TextInput from '$lib/ui/TextInput.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {actor, space} = getSpaceContext();

	const {actions, socket, createQuery} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically

	$: query = shouldLoadEntities
		? createQuery(
				{
					actor: $actor.actor_id,
					source_id: $space.directory_id,
					orderBy: 'newest',
				},
				false,
			)
		: null;
	$: entities = query?.entities;

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {content},
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
			<LoadMoreButton {query} />
		{:else}
			<Pending_Animation />
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
