<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import {readable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import ReplyChatItems from '$lib/plugins/greatbacon/reply-chat/ReplyChatItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import TextInput from '$lib/ui/TextInput.svelte';
	import Mention from '$lib/plugins/feltcoop/mention/Mention.svelte';
	import {sortEntitiesByCreated} from '$lib/vocab/entity/entityHelpers';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {slide} from 'svelte/transition';
	import {lookupPersona} from '$lib/vocab/persona/personaHelpers';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {
		actions,
		socket,
		ui: {personaById},
	} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? actions.QueryEntities({
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
		const ties = [{source_id: $space.directory_id, type: 'HasItem'}];
		if (selectedReply) {
			ties.push({source_id: $selectedReply!.entity_id, type: 'HasReply'});
		}

		if (!content) return;
		await actions.CreateEntity({
			actor: $persona.persona_id,
			space_id: $space.space_id,
			data: {type: 'Note', content},
			ties,
		});
		selectedReply = null;
		text = '';
	};

	const onSubmit = async () => {
		await createEntity();
	};

	let selectedReply: Readable<Entity> | null = null as any;
	$: selectedReplyPersona = $selectedReply && lookupPersona(personaById, $selectedReply.persona_id);
	const selectReply = (reply: Readable<Entity>) => {
		if (selectedReply === reply) {
			selectedReply = null;
		} else {
			selectedReply = reply;
		}
		textInputEl?.focus();
	};

	let textInputEl: HTMLTextAreaElement | undefined;
</script>

<div class="chat">
	<div class="entities">
		{#if entities && $queryStatus === 'success'}
			<ReplyChatItems {persona} {entities} {selectReply} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	{#if selectedReply && $selectedReplyPersona && $queryStatus === 'success'}
		<div class="replying" transition:slide|local>
			replying to <Mention name={$selectedReplyPersona.name} />
		</div>
	{/if}
	<TextInput
		{persona}
		placeholder="> chat"
		on:submit={onSubmit}
		bind:value={text}
		bind:el={textInputEl}
	/>
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.replying {
		padding: var(--spacing_xs);
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
