<script lang="ts">
	import {browser} from '$app/environment';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';
	import {page} from '$app/stores';

	import ForumItems from '$lib/plugins/forum/ForumItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity, EntityId} from '$lib/vocab/entity/entity';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';
	import ForumDetail from './ForumDetail.svelte';
	import {parseSpacePageParams} from '$lib/util/url';

	const {actor, space, hub} = getSpaceContext();

	const {
		actions,
		socket,
		createQuery,
		ui: {entityById},
	} = getApp();

	// TODO use the "./threads" path from the directory, initialize as necessary
	$: shouldLoadEntities = browser && $socket.open;
	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: entities = query?.entities;

	//TODO this should be readable
	let selectedPost: Readable<Entity> | null = null as any;

	let selecting = false; // TODO refactor, is used to avoid flashing the wrong content
	const selectPostById = async (entity_id: EntityId): Promise<void> => {
		let found = entityById.get(entity_id);
		if (found) {
			selectedPost = found;
			return;
		}
		// TODO helper?
		selecting = true;
		selectedPost = null;
		await actions.ReadEntitiesById({actor: $actor.actor_id, entityIds: [entity_id]});
		found = entityById.get(entity_id);
		if (found) {
			selectedPost = found;
		}
		// TODO show error or handle
		selecting = false;
	};

	$: if (shouldLoadEntities) {
		const entity_id = parseSpacePageParams($page.params);
		if (entity_id) void selectPostById(entity_id);
	}
</script>

<div class="forum">
	{#if selectedPost}
		<ForumDetail {space} {hub} {actor} {selectedPost} />
	{:else if !selecting && query && entities}
		<ForumItems {entities} {space} {hub} {actor} />
		<LoadMoreButton {query} />
		{#if !selectedPost}
			<button
				on:click={() =>
					actions.OpenDialog(
						toDialogParams(CreateEntityForm, {
							done: () => actions.CloseDialog(),
							entityName: 'post',
							fields: {name: true, content: true},
							actor,
							hub,
							space,
						}),
					)}
			>
				Submit a new post
			</button>
		{/if}
		<!-- TODO handle query failures and add retry button, see https://github.com/feltjs/felt-server/pull/514#discussion_r998626893 -->
		<!-- {:else if status === 'failure'}
				<Message status="error">{$queryError.message}</Message> -->
	{:else}
		<PendingAnimation />
	{/if}
</div>

<style>
	.forum {
		display: flex;
		flex-direction: column;
	}
</style>
