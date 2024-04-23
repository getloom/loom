<script lang="ts">
	import {browser} from '$app/environment';
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import NotesItems from '$lib/plugins/notes/NotesItems.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import type {SpaceId} from '$lib/vocab/space/space.js';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
	import type {ActorId} from '$lib/vocab/actor/actor.js';
	import {loadOrderedEntities} from '$lib/vocab/entity/entityHelpers.js';

	const {actor, space} = getSpaceContext();

	const {actions, socket, createQuery, ui} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
			})
		: null;
	$: entities = query?.entities;

	//TODO refactor once query by path is in place
	const listsPath = '/list';
	$: notesCollection = $entities?.value.find((e) => e.get().path === listsPath);

	$: ({space_id, directory_id} = $space);
	$: ({actor_id} = $actor);

	$: if ($query?.status === 'success' && !notesCollection) {
		void initListsCollection(space_id, directory_id, actor_id, listsPath);
	}
	const initListsCollection = async (
		space_id: SpaceId,
		directory_id: EntityId,
		actor: ActorId,
		path: string,
	) => {
		await actions.CreateEntity({
			space_id,
			actor,
			path,
			data: {type: 'OrderedCollection', orderedItems: []},
			ties: [{source_id: directory_id}],
		});
	};

	// TODO extract this pattern from 2 places, into the query system?
	let orderedEntities: Array<Readable<Entity>> | null = null;
	$: orderedItems = $notesCollection?.data.orderedItems;
	$: orderedItems && void assignOrderedEntities();
	const assignOrderedEntities = async (): Promise<void> => {
		orderedEntities = await loadOrderedEntities($notesCollection!, $actor.actor_id, ui, actions);
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content || !$notesCollection) return;
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {content},
			ties: [{source_id: $notesCollection.entity_id}],
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
		{#if query && orderedEntities && notesCollection}
			<NotesItems {actor} entities={orderedEntities} parentList={notesCollection} />
			<LoadMoreButton {query} />
		{:else}
			<Pending_Animation />
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
