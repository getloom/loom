<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide} from 'svelte/transition';

	import ReplyChatItems from '$lib/plugins/reply-chat/ReplyChatItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import TextInput from '$lib/ui/TextInput.svelte';
	import Mention from '$lib/plugins/mention/Mention.svelte';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {actor, space} = getSpaceContext();

	const {
		actions,
		socket,
		ui: {actorById, entityById},
		createQuery,
	} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically

	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				// TODO array of query descriptors? e.g. `source_id: $space.directory_id,`
				// path: '/thread',
				source_id: $space.directory_id,
				related: 'dest',
			})
		: null;
	$: entities = query?.entities;

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		const ties = [{source_id: $space.directory_id, type: 'HasItem'}];
		if (selectedReply) {
			ties.push({source_id: $selectedReply!.entity_id, type: 'HasReply'});
		}

		if (!content) return;
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {content},
			ties,
		});
		selectedReply = null;
		text = '';
	};

	const onSubmit = async () => {
		await createEntity();
	};

	let selectedReply: Readable<Entity> | null = null as any;
	$: selectedReplyActor = $selectedReply && lookupActor(actorById, $selectedReply.actor_id);
	const selectReply = (reply: Readable<Entity>) => {
		if (selectedReply === reply) {
			selectedReply = null;
		} else {
			selectedReply = reply;
		}
		textInputEl?.focus();
	};

	//TODO this is a hack, need a proper query system for secondary entities
	let entityIdsToQuery: Array<{entity_id: number; cb: (entity: Readable<Entity>) => void}> | null =
		null;
	const queryReply = (entity_id: number, cb: (entity: Readable<Entity>) => void): void => {
		entityIdsToQuery = (entityIdsToQuery || []).concat({entity_id, cb});
	};
	$: void flushEntityIdsToQuery(entityIdsToQuery);
	const flushEntityIdsToQuery = async (last: any) => {
		if (!entityIdsToQuery) return;
		const localEntityIdsToQuery = entityIdsToQuery.slice();
		await actions.ReadEntitiesById({
			actor: $actor.actor_id,
			entityIds: localEntityIdsToQuery.map((e) => e.entity_id),
		});
		for (const {entity_id, cb} of localEntityIdsToQuery) {
			const entity = entityById.get(entity_id);
			if (entity) cb(entity);
		}
		if (last !== entityIdsToQuery) entityIdsToQuery = null;
	};

	let textInputEl: HTMLTextAreaElement | undefined;
</script>

<div class="chat">
	<div class="entities">
		{#if query && entities}
			<ReplyChatItems {actor} {entities} {selectReply} {queryReply} />
			<LoadMoreButton {query} />
		{:else}
			<Pending_Animation />
		{/if}
	</div>
	{#if selectedReply && $selectedReplyActor}
		<div class="replying" transition:slide>
			replying to <Mention name={$selectedReplyActor.name} />
		</div>
	{/if}
	<TextInput
		{actor}
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
		max-width: var(--width_md);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column-reverse;
	}
</style>
