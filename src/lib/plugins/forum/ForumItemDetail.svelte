<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById, tiesBySourceId, entityById},
		actions,
	} = getApp();

	export let entity: Readable<Entity>;
	export let actor: Readable<AccountActor>;
	export let space: Readable<Space>;

	$: destTies = lookupTies(tiesBySourceId, $entity.entity_id);

	$: items = Array.from($destTies.value).reduce((acc, tie) => {
		if (tie.type === 'HasItem') {
			acc.push(entityById.get(tie.dest_id)!);
		}
		return acc;
	}, [] as Array<Readable<Entity>>);

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
			ties: [{source_id: $entity.entity_id}],
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
	$: replyInputEl?.focus();
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
>
	<div class="wrapper">
		<div class="signature">
			<ActorAvatar actor={authorActor} />
			{format($entity.created, 'MMM d, p')}
		</div>

		<div class="prose formatted">
			{#if $entity.data.type === 'Collection'}
				<div>{$entity.data.name}</div>
				<div><EntityContent {entity} /></div>
			{:else}
				<EntityContent {entity} />
			{/if}
		</div>

		<div>
			<button
				class="icon_button plain"
				title="reply to @{$authorActor.name}"
				aria-label="reply to @{$authorActor.name}"
				on:click={() => (replying = !replying)}>↩</button
			>
			{#if replying}
				<textarea
					placeholder="> replying to @{$authorActor.name}"
					on:keydown={onKeydown}
					bind:value={text}
					bind:this={replyInputEl}
				/>
			{/if}
		</div>
	</div>
	{#if items.length}
		<div class="items">
			<ul class="panel">
				{#each items as item (item)}
					<svelte:self entity={item} {space} {actor} />
				{/each}
			</ul>
		</div>
	{/if}
</li>

<style>
	.wrapper {
		width: 100%;
	}
	li {
		align-items: flex-start;
		flex-direction: column;
		margin-bottom: var(--spacing_xl3);
	}
	li:last-child {
		margin-bottom: 0;
	}
	ul {
		padding: var(--spacing_md);
		padding-right: var(--spacing_xs);
		padding-bottom: var(--spacing_xs);
	}
	.signature {
		display: flex;
		align-items: center;
		--icon_size: var(--icon_size_xs);
		justify-content: space-between;
	}
	.items {
		width: 100%;
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
		padding-right: 0;
		padding-bottom: 0;
	}
</style>
