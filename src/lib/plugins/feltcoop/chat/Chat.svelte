<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	import ChatItems from '$lib/plugins/feltcoop/chat/ChatItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import TextInput from '$lib/ui/TextInput.svelte';
	import {createPaginatedQuery} from '$lib/util/query';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {ui, actions, socket} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? createPaginatedQuery(ui, actions, {
				actor: $persona.persona_id,
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
			actor: $persona.persona_id,
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
			<ChatItems {persona} {entities} />
			{#if more}
				<PendingButton class="plain-button" pending={status === 'pending'} on:click={query.loadMore}
					>load more</PendingButton
				>
			{/if}
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	<TextInput {persona} placeholder="> chat" on:submit={onSubmit} bind:value={text} />
</div>

<style>
	.chat {
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
		/* makes scrolling start at the bottom */
		flex-direction: column-reverse;
	}
</style>
