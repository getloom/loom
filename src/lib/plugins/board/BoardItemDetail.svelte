<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide, scale} from 'svelte/transition';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';
	import {browser} from '$app/environment';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import LoadMoreButton from '$lib/ui/LoadMoreButton.svelte';

	const {
		ui: {contextmenu, actorById},
		actions,
		socket,
		createQuery,
	} = getApp();

	export let thread: Readable<Entity>;
	export let entity: Readable<Entity>;
	export let actor: Readable<AccountActor>;
	export let space: Readable<Space>;

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically
	$: query = shouldLoadEntities
		? createQuery(
				{
					actor: $actor.actor_id,
					source_id: $entity.entity_id,
				},
				true,
		  )
		: null;
	$: items = query?.entities;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	let replying = false;
	let text = '';

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;

		//TODO better error handling
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {content},
			ties: [{source_id: $entity.entity_id, type: 'HasReply'}],
		});
		text = '';
		replying = false;
	};
	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			await createEntity();
		}
	};

	let replyInputEl: HTMLTextAreaElement | undefined;
	$: replying && replyInputEl?.focus();
</script>

<li
	style="--hue: {hue}"
	in:slide
	out:scale
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
>
	<div class="item prose">
		<button
			class="icon_button plain inline deselectable"
			class:selected={replying}
			title="reply to @{$authorActor.name}"
			aria-label="reply to @{$authorActor.name}"
			on:click={() => (replying = !replying)}>↩</button
		><ActorAvatar actor={authorActor} inline={true} />
		<span class="content formatted">
			<EntityContent {entity} />
		</span>
	</div>
	{#if replying}
		<!-- TODO wrapping with a div makes the animation less janky, but still not great -->
		<div transition:slide class="reply-input panel">
			<ActorAvatar {actor} />
			<textarea
				placeholder="> replying to @{$authorActor.name}"
				on:keydown={onKeydown}
				bind:value={text}
				bind:this={replyInputEl}
			/>
		</div>
	{/if}
	{#if $items?.value.length}
		<div class="items">
			<ol class="panel">
				{#each $items.value as item (item)}
					<svelte:self entity={item} {space} {actor} {thread} />
				{/each}
			</ol>
			{#if query}
				<LoadMoreButton {query} />
			{/if}
		</div>
	{/if}
</li>

<style>
	.content {
		padding-left: var(--spacing_lg);
	}
	li {
		flex-direction: column;
		margin-bottom: var(--spacing_md);
	}
	li:last-child {
		margin-bottom: 0;
	}
	button {
		/* TODO this override shouldn't be needed, the problem is it's invisible on light backgrounds */
		--button_bg_active: var(--fg_1);
		--icon_size: var(--icon_size_sm);
		margin: 0;
		margin-right: var(--spacing_xs2);
	}
	ol {
		padding: var(--spacing_xs);
	}
	.item {
		--icon_size: var(--icon_size_xs);
		/* TODO this shouldn't be needed after upgrading Felt for .prose -> .flow  */
		display: block;
	}
	.items {
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
		padding-right: 0;
		padding-bottom: 0;
	}
	.reply-input {
		--icon_size: var(--icon_size_xs);
		/* TODO refactor these into Board-specific CSS vars on the top-level `Board` */
		margin-left: var(--spacing_xl3);
		padding: var(--spacing_xs);
		padding-left: calc(var(--icon_size_sm) + var(--spacing_xs2) + var(--spacing_xs));
		display: flex;
	}
	.reply-input textarea {
		margin-left: var(--icon_size);
	}
</style>
